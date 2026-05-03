#!/bin/bash
# ═══════════════════════════════════════════════════════
# Nagarik AI — Cloud Run Deploy Script
# Usage: bash deploy.sh [PROJECT_ID] [REGION]
# ═══════════════════════════════════════════════════════

set -e

PROJECT_ID="${1:-your-gcp-project-id}"
REGION="${2:-asia-south1}"
IMAGE="gcr.io/$PROJECT_ID/nagarik-ai"
SERVICE="nagarik-ai"

echo ""
echo "🪬 Nagarik AI — Deploying to Cloud Run"
echo "   Project : $PROJECT_ID"
echo "   Region  : $REGION"
echo "   Image   : $IMAGE"
echo ""

# 1. Build and push
echo "📦 Building and pushing Docker image..."
gcloud builds submit \
  --tag "$IMAGE" \
  --project "$PROJECT_ID"

# 2. Deploy
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --project "$PROJECT_ID"

echo ""
echo "✅ Deployment complete!"
echo "   URL: $(gcloud run services describe $SERVICE --region $REGION --project $PROJECT_ID --format='value(status.url)')"
echo ""
