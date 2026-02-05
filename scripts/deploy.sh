#!/bin/bash

# Get build info
COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "dev")
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Update buildInfo.ts
cat > src/lib/buildInfo.ts << EOF
// This file is auto-generated during deployment
// Do not edit manually

export const buildInfo = {
  commitHash: '${COMMIT_HASH}',
  buildDate: '${BUILD_DATE}',
};
EOF

echo "Updated buildInfo.ts with commit: $COMMIT_HASH, date: $BUILD_DATE"

# Build and deploy
npm run build && vercel --prod
