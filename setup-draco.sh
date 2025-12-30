#!/bin/bash

# Draco Decoder Setup Script
# This script downloads the necessary Draco decoder files from Three.js repository

echo "🚀 Setting up Draco decoder files..."

# Create draco directory
DRACO_DIR="public/draco/gltf"
mkdir -p "$DRACO_DIR"

# Three.js Draco decoder URL (using a stable version)
BASE_URL="https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/jsm/libs/draco/gltf"

# Download decoder files
echo "📥 Downloading draco_decoder.js..."
curl -L "$BASE_URL/draco_decoder.js" -o "$DRACO_DIR/draco_decoder.js"

echo "📥 Downloading draco_decoder.wasm..."
curl -L "$BASE_URL/draco_decoder.wasm" -o "$DRACO_DIR/draco_decoder.wasm"

echo "📥 Downloading draco_wasm_wrapper.js..."
curl -L "$BASE_URL/draco_wasm_wrapper.js" -o "$DRACO_DIR/draco_wasm_wrapper.js"

# Verify downloads
if [ -f "$DRACO_DIR/draco_decoder.js" ] && [ -f "$DRACO_DIR/draco_decoder.wasm" ] && [ -f "$DRACO_DIR/draco_wasm_wrapper.js" ]; then
    echo "✅ Draco decoder files downloaded successfully!"
    echo ""
    echo "Files installed in: $DRACO_DIR/"
    ls -lh "$DRACO_DIR/"
else
    echo "❌ Failed to download some files. Please check your internet connection."
    exit 1
fi

echo ""
echo "🎉 Setup complete! You can now use Draco-compressed models."
echo "💡 Tip: Make sure your GLB models are exported with Draco compression enabled."
