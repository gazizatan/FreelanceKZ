#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if [ ! -d ".venv" ]; then
  echo "Missing .venv. Create it with: python3 -m venv .venv"
  exit 1
fi

if [ -f ".venv/bin/activate" ]; then
  # shellcheck disable=SC1091
  source ".venv/bin/activate"
else
  echo "Activation script not found at .venv/bin/activate"
  exit 1
fi

export FLASK_DEBUG="${FLASK_DEBUG:-0}"
python Backend/app.py
