#!/usr/bin/env bash
set -euo pipefail

AGENTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../agents" && pwd)"
FRONTEND_PROMPT="$AGENTS_DIR/continue-frontend-agent.prompt.md"
BACKEND_PROMPT="$AGENTS_DIR/copilot-backend-agent.prompt.md"

DOCKER_MODE="${1:-}"

echo "🧠 Starting ECE-CLI Autonomous Build Flow"

if [[ "$DOCKER_MODE" == "--docker" ]]; then
  echo "🐳 Launching Docker Compose services..."
  docker-compose -f "$(dirname "${BASH_SOURCE[0]}")/../docker/docker-compose.yml" up --build -d
fi

echo "🧩 Running Frontend Agent (v0 / Continue CLI)..."
continue run --prompt "$FRONTEND_PROMPT"

echo "🔧 Running Backend Agent (OpenHands / Copilot CLI)..."
copilot chat --instruction "$BACKEND_PROMPT"

echo "✅ Both agents completed their phases."

read -n1 -p "🚀 Ready to deploy? (y/n): " CONFIRM
echo
if [[ "${CONFIRM,,}" == "y" ]]; then
  bash "$(dirname "${BASH_SOURCE[0]}")/deploy.sh"
else
  echo "💤 Skipping deployment."
fi