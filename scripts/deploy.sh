#!/bin/bash

set -e

echo "📦 Committing changes..."
git add .
git commit -m "🚀 Full-stack app production build"
git push origin main

echo "🌐 Deploying to Vercel..."
vercel deploy --prod --confirm --yes

echo "✅ Deployed!"
