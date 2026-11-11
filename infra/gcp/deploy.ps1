# Deploy MLingo (API + web) to Cloud Run from Windows PowerShell.
# Run from the repo root:
#   .\infra\gcp\deploy.ps1 -ProjectId my-project              # deploy both
#   .\infra\gcp\deploy.ps1 -ProjectId my-project -Target api  # API only
#   .\infra\gcp\deploy.ps1 -ProjectId my-project -Target web  # web only
param(
  [Parameter(Mandatory = $true)][string]$ProjectId,
  [string]$Region = "asia-south1",
  [ValidateSet("all", "api", "web")][string]$Target = "all"
)
# gcloud writes progress to stderr; PowerShell would treat that as fatal under "Stop".
# Failures are detected through $LASTEXITCODE instead.
$ErrorActionPreference = "Continue"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$Image = "$Region-docker.pkg.dev/$ProjectId/cloud-run-source-deploy/mlingo-web"

function Invoke-Gcloud([string[]]$CmdArgs) {
  & gcloud @CmdArgs
  if ($LASTEXITCODE -ne 0) { throw "gcloud $($CmdArgs -join ' ') failed" }
}

function Get-ServiceUrl([string]$Name) {
  # list (not describe) returns nothing instead of an error when the service doesn't exist yet
  $url = & gcloud run services list --region $Region --filter "metadata.name=$Name" --format "value(status.url)" 2>$null
  if (-not $url) { return $null }
  return ($url | Select-Object -First 1).Trim()
}

Invoke-Gcloud @("config", "set", "project", $ProjectId)
Invoke-Gcloud @("services", "enable", "run.googleapis.com", "cloudbuild.googleapis.com",
  "artifactregistry.googleapis.com", "secretmanager.googleapis.com")

function Deploy-Api([string]$FrontendOrigin) {
  if (-not $FrontendOrigin) { $FrontendOrigin = "http://localhost:3000" }
  $cmd = @("run", "deploy", "mlingo-api", "--source", "$Root\apps\api", "--region", $Region,
    "--allow-unauthenticated", "--memory", "512Mi",
    "--set-env-vars", "MLINGO_ENVIRONMENT=production,MLINGO_FRONTEND_ORIGIN=$FrontendOrigin")
  $secret = & gcloud secrets list --filter "name~mlingo-database-url" --format "value(name)" 2>$null
  if ($secret) {
    $cmd += @("--set-secrets", "MLINGO_DATABASE_URL=mlingo-database-url:latest", "--max-instances", "3")
  } else {
    # No database secret yet: SQLite lives on the instance, so run exactly one.
    $cmd += @("--max-instances", "1")
  }
  Invoke-Gcloud $cmd
}

function Deploy-Web {
  $api = Get-ServiceUrl "mlingo-api"
  if (-not $api) { throw "Deploy the API first: -Target api" }
  Invoke-Gcloud @("builds", "submit", "$Root\apps\web", "--region", $Region,
    "--config", "$Root\apps\web\cloudbuild.yaml",
    "--substitutions", "_API_URL=$api/api/v1,_IMAGE=$Image")
  Invoke-Gcloud @("run", "deploy", "mlingo-web", "--image", $Image, "--region", $Region,
    "--allow-unauthenticated", "--memory", "512Mi")
}

switch ($Target) {
  "api" { Deploy-Api (Get-ServiceUrl "mlingo-web") }
  "web" { Deploy-Web }
  "all" {
    Deploy-Api (Get-ServiceUrl "mlingo-web")
    Deploy-Web
    $web = Get-ServiceUrl "mlingo-web"
    Deploy-Api $web   # let the live frontend through CORS
    Write-Host ""
    Write-Host "Web: $web" -ForegroundColor Green
    Write-Host "API docs: $(Get-ServiceUrl 'mlingo-api')/docs" -ForegroundColor Green
  }
}
