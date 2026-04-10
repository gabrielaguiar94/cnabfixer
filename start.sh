#!/usr/bin/env bash

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

BACKEND_PORT=8765
FRONTEND_PORT=5173

echo "========================================"
echo "CNAB Fixer - Inicialização"
echo "Root: $ROOT_DIR"
echo "Backend: $BACKEND_DIR"
echo "Frontend: $FRONTEND_DIR"
echo "========================================"

if [ ! -d "$BACKEND_DIR" ]; then
  echo "Erro: pasta backend não encontrada em $BACKEND_DIR"
  exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
  echo "Erro: pasta frontend não encontrada em $FRONTEND_DIR"
  exit 1
fi

if [ ! -f "$BACKEND_DIR/run.py" ]; then
  echo "Erro: run.py não encontrado em $BACKEND_DIR"
  exit 1
fi

if [ ! -f "$BACKEND_DIR/requirements.txt" ]; then
  echo "Erro: requirements.txt não encontrado em $BACKEND_DIR"
  exit 1
fi

if [ ! -f "$FRONTEND_DIR/package.json" ]; then
  echo "Erro: package.json não encontrado em $FRONTEND_DIR"
  exit 1
fi

echo ""
echo "Preparando backend..."

if [ ! -d "$BACKEND_DIR/.venv" ]; then
  echo "Virtualenv não encontrada. Criando..."
  (
    cd "$BACKEND_DIR"
    python3 -m venv .venv
  )
fi

echo "Instalando/validando dependências do backend..."
(
  cd "$BACKEND_DIR"
  source .venv/bin/activate
  python -m pip install --upgrade pip
  pip install -r requirements.txt
)

echo ""
echo "Preparando frontend..."

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "node_modules não encontrado. Instalando dependências do frontend..."
  (
    cd "$FRONTEND_DIR"
    npm install
  )
fi

open_terminal() {
  local title="$1"
  local command="$2"

  if command -v gnome-terminal >/dev/null 2>&1; then
    gnome-terminal --title="$title" -- bash -lc "$command; exec bash"
    return 0
  fi

  if command -v x-terminal-emulator >/dev/null 2>&1; then
    x-terminal-emulator -e bash -lc "$command; exec bash" &
    return 0
  fi

  if command -v konsole >/dev/null 2>&1; then
    konsole --new-tab -p tabtitle="$title" -e bash -lc "$command; exec bash" &
    return 0
  fi

  if command -v xfce4-terminal >/dev/null 2>&1; then
    xfce4-terminal --title="$title" --command="bash -lc '$command; exec bash'" &
    return 0
  fi

  return 1
}

BACKEND_CMD="cd '$BACKEND_DIR' && source .venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port $BACKEND_PORT --reload"
FRONTEND_CMD="cd '$FRONTEND_DIR' && npm run dev -- --host 0.0.0.0"

echo ""
echo "Subindo backend com reload..."
if ! open_terminal "CNAB Fixer Backend" "$BACKEND_CMD"; then
  echo "Não foi possível abrir terminal gráfico para o backend."
  echo "Execute manualmente:"
  echo "cd '$BACKEND_DIR' && source .venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port $BACKEND_PORT --reload"
fi

sleep 2

echo "Subindo frontend..."
if ! open_terminal "CNAB Fixer Frontend" "$FRONTEND_CMD"; then
  echo "Não foi possível abrir terminal gráfico para o frontend."
  echo "Execute manualmente:"
  echo "cd '$FRONTEND_DIR' && npm run dev -- --host 0.0.0.0"
fi

echo ""
echo "Serviços iniciados."
echo "Backend esperado em:  http://localhost:$BACKEND_PORT"
echo "Frontend esperado em: http://localhost:$FRONTEND_PORT"
echo ""
echo "Backend agora está com reload automático."