#!/bin/bash

# update-website.sh
# 
# This script automates the entire process of updating the website with new WhatsApp listings.
# It runs the import process, checks for duplicates, and optionally deploys the updates.
#
# Usage: ./scripts/update-website.sh [--deploy]
#
# Options:
#   --deploy: Deploy the updates to Vercel after importing

# Set script to exit on error
set -e

# Display banner
echo "========================================================"
echo "  Second-Hand Cape Town - Website Update Script"
echo "========================================================"
echo ""

# Check if the data directories exist
if [ ! -d "src/data/nifty-thrifty-0-1-years" ] || [ ! -d "src/data/nifty-thrifty-1-3-years" ]; then
  echo "Error: Data directories not found."
  echo "Please create the following directories:"
  echo "  - src/data/nifty-thrifty-0-1-years"
  echo "  - src/data/nifty-thrifty-1-3-years"
  exit 1
fi

# Check if the WhatsApp export files exist
if [ ! -f "src/data/nifty-thrifty-0-1-years/WhatsApp Chat with Nifty Thrifty 0-1 year.txt" ]; then
  echo "Warning: WhatsApp export file for 0-1 year group not found."
  echo "Expected location: src/data/nifty-thrifty-0-1-years/WhatsApp Chat with Nifty Thrifty 0-1 year.txt"
  echo ""
  read -p "Continue anyway? (y/n): " continue_without_file
  if [ "$continue_without_file" != "y" ]; then
    exit 1
  fi
fi

if [ ! -f "src/data/nifty-thrifty-1-3-years/WhatsApp Chat with Nifty Thrifty 1-3 years.txt" ]; then
  echo "Warning: WhatsApp export file for 1-3 years group not found."
  echo "Expected location: src/data/nifty-thrifty-1-3-years/WhatsApp Chat with Nifty Thrifty 1-3 years.txt"
  echo ""
  read -p "Continue anyway? (y/n): " continue_without_file
  if [ "$continue_without_file" != "y" ]; then
    exit 1
  fi
fi

# Step 1: Run the import script
echo "Step 1: Importing listings from WhatsApp exports..."
npm run import-whatsapp-full

# Step 2: Check for duplicates
echo ""
echo "Step 2: Checking for duplicate listings..."
npm run find-duplicates

# Ask if user wants to remove duplicates
echo ""
read -p "Do you want to remove high-confidence duplicates? (y/n): " remove_duplicates
if [ "$remove_duplicates" = "y" ]; then
  npm run remove-duplicates
fi

# Step 3: Deploy if requested
if [ "$1" = "--deploy" ]; then
  echo ""
  echo "Step 3: Deploying updates to Vercel..."
  
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
echo "  Website update process complete!"
echo "========================================================" 