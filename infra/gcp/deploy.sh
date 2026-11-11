#!/usr/bin/env bash
# Deploy MLingo (API + web) to Cloud Run.
# Usage: PROJECT_ID=my-project ./infra/gcp/deploy.sh [api|web|all]
set -euo pipefail

PROJECT_ID="${PROJECT_ID:?Set PROJECT_ID}"
REGION="${REGION:-asia-south1}"
TARGET="${1:-all}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

gcloud config set project "$PROJECT_ID" >/dev/null
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com >/dev/null

deploy_api() {
  local extra=()
  # Use Postgres when the secret exists; otherwise fall back to SQLite on a single instance.
  if gcloud secrets describe mlingo-database-url >/dev/null 2>&1; then
    extra+=(--set-secrets "MLINGO_DATABASE_URL=mlingo-database-url:latest" --max-instances 3)
  else
    extra+=(--max-instances 1)
  fi
  gcloud run deploy mlingo-api \
    --source "$ROOT/apps/api" \
    --region "$REGION" \
    --allow-unauthenticated \
    --memory 512Mi \
    --set-env-vars "MLINGO_ENVIRONMENT=production,MLINGO_FRONTEND_ORIGIN=${FRONTEND_ORIGIN:-http://localhost:3000}" \
    "${extra[@]}"
}

deploy_web() {
  local api_url
  api_url="$(gcloud run services describe mlingo-api --region "$REGION" --format 'value(status.url)')/api/v1"
  gcloud builds submit "$ROOT/apps/web" \
    --region "$REGION" \
    --config "$ROOT/apps/web/cloudbuild.yaml" \
    --substitutions "_API_URL=${api_url},_IMAGE=${REGION}-docker.pkg.dev/${PROJECT_ID}/cloud-run-source-deploy/mlingo-web"
  gcloud run deploy mlingo-web \
    --image "${REGION}-docker.pkg.dev/${PROJECT_ID}/cloud-run-source-deploy/mlingo-web" \
    --region "$REGION" \
    --allow-unauthenticated \
    --memory 512Mi
}

case "$TARGET" in
  api) deploy_api ;;
  web) deploy_web ;;
  all)
    deploy_api
    deploy_web
    # Now that the web URL exists, let the API accept requests from it.
    WEB_URL="$(gcloud run services describe mlingo-web --region "$REGION" --format 'value(status.url)')"
    FRONTEND_ORIGIN="$WEB_URL" deploy_api
    echo "Web: $WEB_URL"
    ;;
esac
