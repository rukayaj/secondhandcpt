#!/bin/bash

# update-website.sh
# 
# This script automates the entire process of updating the website with new WhatsApp listings.
# It runs the import process, checks for duplicates, and optionally deploys the updates.
#
# Usage: ./scripts/update-website.sh [options]
#
# Options:
#   --deploy         Deploy the updates to Vercel after importing
#   --scroll         Run the WhatsApp scrolling script first before importing
#   --scroll-only    Only run the WhatsApp scrolling script (don't import)

# Set script to exit on error
set -e

# Parse command line arguments
DEPLOY=false
SCROLL=false
SCROLL_ONLY=false

for arg in "$@"
do
  case $arg in
    --deploy)
      DEPLOY=true
      shift
      ;;
    --scroll)
      SCROLL=true
      shift
      ;;
    --scroll-only)
      SCROLL_ONLY=true
      shift
      ;;
  esac
done

# Display banner
echo "========================================================"
echo "  Second-Hand Cape Town - Website Update Script"
echo "========================================================"
echo ""

# Step 0: Run the WhatsApp scrolling script if requested
if [ "$SCROLL" = true ] || [ "$SCROLL_ONLY" = true ]; then
  echo "Step 0: Scrolling through WhatsApp groups to load message history..."
  npm run scroll-whatsapp
  
  if [ "$SCROLL_ONLY" = true ]; then
    echo ""
    echo "Scrolling complete. Exiting as --scroll-only was specified."
    echo "========================================================"
    echo "Next steps:"
    echo "1. Manually export each WhatsApp chat (WITHOUT MEDIA)"
    echo "2. Save the exported files to the appropriate directories"
    echo "3. Run this script again without the --scroll-only option to import the data"
    echo "========================================================"
    exit 0
  fi
  
  echo ""
  echo "Scrolling complete. Continuing with import process..."
  echo ""
  
  # Ask user if they've exported the chats
  read -p "Have you exported all WhatsApp chats? (y/n): " chats_exported
  if [ "$chats_exported" != "y" ]; then
    echo "Please export the chats before continuing. Exiting..."
    exit 1
  fi
fi

# Check if the data directories exist
if [ ! -d "src/data/nifty-thrifty-0-1-years" ] || [ ! -d "src/data/nifty-thrifty-1-3-years" ]; then
  echo "Error: Data directories not found."
  echo "Please create the following directories:"
  echo "  - src/data/nifty-thrifty-0-1-years"
  echo "  - src/data/nifty-thrifty-1-3-years"
  exit 1
fi

# Check if the WhatsApp export files exist
if [ ! -f "src/data/nifty-thrifty-0-1-years/WhatsApp Chat with Nifty Thrifty 0-1 year (1).txt" ] && [ ! -f "src/data/nifty-thrifty-0-1-years/WhatsApp Chat with Nifty Thrifty 0-1 year.txt" ]; then
  echo "Warning: WhatsApp export file for 0-1 year group (1) not found."
  echo "Expected location: src/data/nifty-thrifty-0-1-years/WhatsApp Chat with Nifty Thrifty 0-1 year (1).txt"
  echo ""
  read -p "Continue anyway? (y/n): " continue_without_file
  if [ "$continue_without_file" != "y" ]; then
    exit 1
  fi
fi

if [ ! -f "src/data/nifty-thrifty-0-1-years/WhatsApp Chat with Nifty Thrifty 0-1 year (2).txt" ]; then
  echo "Warning: WhatsApp export file for 0-1 year group (2) not found."
  echo "Expected location: src/data/nifty-thrifty-0-1-years/WhatsApp Chat with Nifty Thrifty 0-1 year (2).txt"
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
if [ "$DEPLOY" = true ]; then
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