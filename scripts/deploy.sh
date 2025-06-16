#!/bin/bash

set -e

PROJECT_DIR="$HOME/ECE-CLI/generated-app"

echo "🚀 ECE-CLI Autonomous App Deployment"
echo "======================================"

# Check if project exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Generated app not found. Run the autonomous builder first."
    exit 1
fi

cd "$PROJECT_DIR"

echo "🏗️  Building application..."
npm run build

echo "📦 Committing changes..."
if [ -d ".git" ]; then
    git add .
    git commit -m "🚀 Autonomous app production build - $(date)"
    git push origin main
else
    echo "⚠️  No git repository found. Initializing..."
    git init
    git add .
    git commit -m "🚀 Initial autonomous app build"
    
    # This would typically push to a remote repository
    echo "💡 Add a remote repository and push:"
    echo "    git remote add origin <your-repo-url>"
    echo "    git push -u origin main"
fi

echo "🌐 Deploying to Vercel..."
if command -v vercel &> /dev/null; then
    vercel deploy --prod --confirm --yes
    echo "✅ Deployed successfully!"
else
    echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
    echo "💡 Alternative: Push to GitHub and connect to Vercel dashboard"
fi

echo ""
echo "🎉 Deployment Complete!"
echo "📱 Your autonomous app is live!"
