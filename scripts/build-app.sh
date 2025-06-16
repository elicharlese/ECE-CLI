#!/bin/bash

set -e

PROJECT_DIR="$HOME/ECE-CLI/generated-app"
AGENTS_DIR="$HOME/ECE-CLI/agents"

echo "🚀 ECE-CLI Autonomous App Builder"
echo "================================="

# Clean previous build
if [ -d "$PROJECT_DIR" ]; then
    echo "🧹 Cleaning previous build..."
    rm -rf "$PROJECT_DIR"
fi

echo "📦 Creating Next.js application..."
npx create-next-app@latest generated-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-git

cd "$PROJECT_DIR"

echo "🎨 Installing UI dependencies..."
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react
npm install -D @types/node

echo "🧩 Setting up shadcn/ui..."
npx shadcn-ui@latest init --defaults

echo "📁 Creating project structure..."
mkdir -p src/components/ui
mkdir -p src/lib
mkdir -p src/app/api/auth
mkdir -p src/app/api/user
mkdir -p src/app/auth

echo "✅ Base application created!"
echo "📍 Location: $PROJECT_DIR"
echo ""
echo "Next steps:"
echo "1. cd $PROJECT_DIR"
echo "2. npm run dev"
echo "3. Open http://localhost:3000"
