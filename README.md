# MLingo

MLingo is an interactive machine-learning learning platform: **Machine Learning, Frame by Frame.** This repository currently contains the project foundation only.

## Run locally

1. Start PostgreSQL from the repository root:

   ```powershell
   docker compose -f infra/docker-compose.yml up -d
   ```

2. In one terminal, run the API:

   ```powershell
   cd apps/api
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements-dev.txt
   uvicorn app.main:app --reload
   ```

   Verify it at `http://localhost:8000/api/v1/health`.

3. In another terminal, run the web app:

   ```powershell
   cd apps/web
   Copy-Item .env.example .env.local
   npm install
   npm run dev
   ```

   Open `http://localhost:3000`. Set `NEXT_PUBLIC_API_URL` in `.env.local` when the API URL changes.

## Checks

```powershell
cd apps/api
pytest

cd ../web
npm run lint
npm run build
```

See [the architecture overview](docs/architecture/overview.md) for package boundaries and the intended TrainingRun domain.
