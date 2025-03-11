#!/bin/bash

# waha-update.sh
# 
# This script automates the entire process of updating the website using WAHA API.
# It runs the WAHA import process, handles images, checks for duplicates, and optionally deploys the updates.
#
# Usage: ./scripts/waha-update.sh [options]
#
# Options:
#   --deploy         Deploy the updates to Vercel after importing
#   --days=N         Number of days of history to fetch (default: 30)
#   --restart-waha   Restart the WAHA container before running (requires Docker)

# Set script to exit on error
set -e

# Parse command line arguments
DEPLOY=false
DAYS=30
RESTART_WAHA=false

for arg in "$@"
do
  if [[ "$arg" == "--deploy" ]]; then
    DEPLOY=true
  elif [[ "$arg" =~ --days=([0-9]+) ]]; then
    DAYS="${BASH_REMATCH[1]}"
  elif [[ "$arg" == "--restart-waha" ]]; then
    RESTART_WAHA=true
  fi
done

# Display banner
echo "========================================================"
echo "  Second-Hand Cape Town - WAHA Update Script"
echo "========================================================"
echo ""

# Function to check if WAHA is running
check_waha_status() {
  curl -s "http://localhost:3001/api/sessions" > /dev/null
  return $?
}

# First, check if Docker is available if we're restarting WAHA
if [ "$RESTART_WAHA" = true ]; then
  if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required to restart WAHA, but it's not installed or not in PATH."
    exit 1
  fi
fi

# Restart WAHA if requested
if [ "$RESTART_WAHA" = true ]; then
  echo "Restarting WAHA container..."
  
  # Stop any existing WAHA container
  WAHA_CONTAINER=$(docker ps -q --filter "ancestor=devlikeapro/waha" --filter "publish=3001")
  if [ -n "$WAHA_CONTAINER" ]; then
    echo "Stopping existing WAHA container: $WAHA_CONTAINER"
    docker stop $WAHA_CONTAINER
  fi
  
  # Start a new WAHA container
  echo "Starting new WAHA container..."
  docker run -d -p 3001:3000 devlikeapro/waha
  
  # Wait for it to start
  echo "Waiting for WAHA to start..."
  for i in {1..30}; do
    if check_waha_status; then
      echo "✅ WAHA started successfully."
      break
    fi
    if [ "$i" -eq 30 ]; then
      echo "❌ Timed out waiting for WAHA to start."
      exit 1
    fi
    sleep 1
    echo -n "."
  done
  echo ""
fi

# Check if WAHA is running
if ! check_waha_status; then
  echo "❌ WAHA API is not running at http://localhost:3001"
  echo ""
  echo "You have two options:"
  echo "1. Start WAHA manually:"
  echo "   docker run -d -p 3001:3000 devlikeapro/waha"
  echo ""
  echo "2. Run this script with the --restart-waha flag:"
  echo "   npm run update-waha -- --restart-waha"
  exit 1
fi

echo "✅ WAHA API is running."

# Step 1: Import listings from WAHA
echo ""
echo "Step 1: Importing listings from WAHA API..."
echo ""
echo "NOTE: If this is your first time running with WAHA, you will need to scan a QR code"
echo "      to authenticate. After the first authentication, the session will persist."
echo ""
echo "If you encounter errors about 'session already started' but not authenticated, you may need to:"
echo "1. Stop all WAHA containers: docker stop \$(docker ps -q --filter 'ancestor=devlikeapro/waha')"
echo "2. Run this script with the --restart-waha flag to start a fresh container"
echo ""

npm run import-waha-verbose -- --days $DAYS

# Step 2: Process images
echo ""
echo "Step 2: Processing images from WAHA..."
npm run waha-images-upload

# Step 3: Check for duplicates
echo ""
echo "Step 3: Checking for duplicate listings..."
npm run find-duplicates

# Ask if user wants to remove duplicates
echo ""
read -p "Do you want to remove high-confidence duplicates? (y/n): " remove_duplicates
if [ "$remove_duplicates" = "y" ]; then
  npm run remove-duplicates
fi

# Step 4: Deploy if requested
if [ "$DEPLOY" = true ]; then
  echo ""
  echo "Step 4: Deploying updates to Vercel..."
  
  # Check if Vercel CLI is installed
  if ! command -v vercel &> /dev/null; then
    echo "Error: Vercel CLI not found. Please install it with:"
    echo "  npm install -g vercel"
    exit 1
  fi
  
  vercel --prod
fi

echo ""
echo "========================================================"
echo "  WAHA Update process complete!"
echo "========================================================"
echo ""
echo "To view the website, run: npm run dev"
echo "To check Supabase for the imported data, go to your Supabase dashboard."
echo ""
echo "When done with WAHA, you can stop the container with:"
echo "  docker stop \$(docker ps -q --filter 'ancestor=devlikeapro/waha')"
echo ""
echo "TIP: If you encounter issues with WAHA authentication in the future,"
echo "     try running this script with the --restart-waha flag:"
echo "     npm run update-waha -- --restart-waha" 