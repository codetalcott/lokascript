#!/bin/bash
# Serve the language editor
# Usage: ./serve.sh [port]

PORT=${1:-3000}
cd "$(dirname "$0")/../../.."
echo "Starting server at http://127.0.0.1:$PORT"
echo "Editor: http://127.0.0.1:$PORT/packages/semantic/editor/"
npx http-server . -p $PORT -c-1
