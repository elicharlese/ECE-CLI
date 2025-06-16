#!/bin/bash

set -e

AGENTS_DIR="$HOME/ECE-CLI/agents"
FRONTEND_PROMPT="$AGENTS_DIR/continue-frontend-agent.prompt.md"
BACKEND_PROMPT="$AGENTS_DIR/copilot-backend-agent.prompt.md"

echo "🚀 Running ECE-CLI autonomous AI dev system..."

echo "🧩 Running frontend agent (Continue)..."
continue run --prompt "$FRONTEND_PROMPT"

echo "🔧 Running backend agent (Copilot)..."
copilot chat --instruction "$BACKEND_PROMPT"

echo "✅ All agents complete. Would you like to deploy?"

read -p "Deploy to production? (y/n): " confirm
if [[ "$confirm" == "y" ]]; then
  bash "$HOME/ECE-CLI/scripts/deploy.sh"
fi
