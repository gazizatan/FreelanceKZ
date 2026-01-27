# FreelanceKZ

Full‑stack marketplace for freelancers and clients. The frontend is a React SPA (Vite + TypeScript + Tailwind). The backend is a Flask API with MongoDB. During development the frontend runs separately from the API; in production the React app can be built and served as static files.

## Project structure

- `Front/` — React SPA + Vite dev server, shared UI, and build output
- `Backend/` — Flask API server
- `database/` — database-related assets (if present)

## Prerequisites (all OS)

- Node.js 18+ (recommended)
- pnpm 10+ (`npm i -g pnpm`)
- Python 3.10+
- MongoDB running locally or a cloud URI

## Environment variables

Create a `.env` in the project root (or set env vars in your shell) with at least:

```
MONGO_URI=mongodb://localhost:27017
DB_NAME=freelancekz
FLASK_DEBUG=1
# Optional for encryption features
IIN_ENCRYPTION_KEY=...  # 32‑byte base64 key
IIN_HASH_KEY=...
```

## Run (macOS)

Backend (Flask):

```
cd /Users/gaziza_tanirbergen/Documents/FreelanceKZ
python3 -m venv .venv
source .venv/bin/activate
pip install -r Backend/requirements.txt
./run.sh
```

Frontend (Vite):

```
cd /Users/gaziza_tanirbergen/Documents/FreelanceKZ/Front
pnpm install
pnpm dev
```

Open: `http://localhost:8080`
API: `http://localhost:8000/api/*`

## Run (Linux)

Backend (Flask):

```
cd /Users/gaziza_tanirbergen/Documents/FreelanceKZ
python3 -m venv .venv
source .venv/bin/activate
pip install -r Backend/requirements.txt
./run.sh
```

Frontend (Vite):

```
cd /Users/gaziza_tanirbergen/Documents/FreelanceKZ/Front
pnpm install
pnpm dev
```

Open: `http://localhost:8080`
API: `http://localhost:8000/api/*`

## Run (Windows)

Backend (Flask) — PowerShell:

```
cd C:\Users\<you>\Documents\FreelanceKZ
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r Backend\requirements.txt
python Backend\app.py
```

Frontend (Vite) — PowerShell:

```
cd C:\Users\<you>\Documents\FreelanceKZ\Front
pnpm install
pnpm dev
```

Open: `http://localhost:8080`
API: `http://localhost:8000/api/*`

## Production build (frontend)

```
cd /Users/gaziza_tanirbergen/Documents/FreelanceKZ/Front
pnpm build
```

The built SPA will be in `Front/dist/spa`.

## Notes

- The React app is a SPA; all non‑API routes should be handled by the frontend.
- If API calls fail from the frontend, ensure the frontend dev proxy points to the Flask port (`8000`).
