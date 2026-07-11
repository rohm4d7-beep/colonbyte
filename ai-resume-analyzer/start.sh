#!/bin/bash
ROOT="$(cd "$(dirname "$0")" && pwd)"

# Kill any leftover processes
echo "Clearing ports..."
fuser -k 3001/tcp 2>/dev/null
fuser -k 5173/tcp 2>/dev/null
sleep 1

# Backend
echo "Starting backend..."
cd "$ROOT/backend"
node server.js &
BACKEND_PID=$!
sleep 2

if ! kill -0 $BACKEND_PID 2>/dev/null; then
  echo "ERROR: Backend failed to start. Check your .env file."
  exit 1
fi
echo "Backend running → http://localhost:3001"

# Frontend
echo "Starting frontend..."
cd "$ROOT/frontend"
~/.bun/bin/bun dev --host &
FRONTEND_PID=$!
sleep 3
echo "Frontend running → http://localhost:5173"

echo ""
echo "========================================"
echo "  App ready at http://localhost:5173"
echo "  Press Ctrl+C to stop"
echo "========================================"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
