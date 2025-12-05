#!/bin/bash
# Frontend Build & Deploy Script

# Build frontend only (Vite)
npm run build:client

# This creates an optimized "dist/client" folder ready for hosting
# Upload dist/client folder to your hosting platform

echo "Frontend build complete!"
echo "Upload the 'dist/client' folder to your hosting provider"
