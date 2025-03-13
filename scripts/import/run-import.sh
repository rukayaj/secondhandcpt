#!/bin/bash

# Script to run the WhatsApp import process
# This script will:
# 1. Check if the WhatsApp API server is running
# 2. Run the import process with the improved expiration mechanism

echo "Starting WhatsApp import process..."

# Check if the WhatsApp API server is running
echo "Checking if WhatsApp API server is running..."
if curl -s http://localhost:3001/api/default/status > /dev/null; then
  echo "WhatsApp API server is running."
  
  # Run the import process
  echo "Running import process with improved expiration mechanism..."
  node waha-gemini-import.js "$@"
else
  echo "WhatsApp API server is not running at http://localhost:3001."
  echo "Please start the WhatsApp API server first."
  echo "You can start it with: cd /path/to/waha && npm start"
  exit 1
fi

echo "Process completed." 