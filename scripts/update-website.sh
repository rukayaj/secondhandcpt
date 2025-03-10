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

# Check if the data directories exist and create them if needed
echo "Checking data directories..."
directories=(
  "src/data"
  "src/data/nifty-thrifty-0-1-years"
  "src/data/nifty-thrifty-1-3-years"
  "src/data/nifty-thrifty-modern-cloth-nappies"
  "src/data/nifty-thrifty-bumps-and-boobs"
  "src/data/nifty-thrifty-kids-3-8-years"
)

for dir in "${directories[@]}"; do
  if [ ! -d "$dir" ]; then
    echo "Creating directory: $dir"
    mkdir -p "$dir"
  fi
done

# Function to check for WhatsApp export files with various possible names
check_export_file() {
  local dir="$1"
  local group_name="$2"
  local suffix="$3"
  
  # Check for different possible file name patterns
  if [ -f "${dir}/WhatsApp Chat with ${group_name}${suffix}.txt" ]; then
    return 0
  elif [ -f "${dir}/WhatsApp Chat with ${group_name} ${suffix}.txt" ]; then
    return 0
  elif [ -f "${dir}/_chat.txt" ]; then
    return 0
  fi
  
  return 1
}

# Check if at least one export file exists for each group
has_files=false

# Check for 0-1 years (1) files
if check_export_file "src/data/nifty-thrifty-0-1-years" "Nifty Thrifty 0-1 year" " (1)" || \
   check_export_file "src/data/nifty-thrifty-0-1-years" "Nifty Thrifty 0-1 year" ""; then
  has_files=true
else
  echo "Warning: No export file found for Nifty Thrifty 0-1 year (1) group."
  echo "Expected files like: src/data/nifty-thrifty-0-1-years/WhatsApp Chat with Nifty Thrifty 0-1 year (1).txt"
fi

# Check for 0-1 years (2) files
if check_export_file "src/data/nifty-thrifty-0-1-years" "Nifty Thrifty 0-1 year" " (2)"; then
  has_files=true
else
  echo "Warning: No export file found for Nifty Thrifty 0-1 year (2) group."
  echo "Expected: src/data/nifty-thrifty-0-1-years/WhatsApp Chat with Nifty Thrifty 0-1 year (2).txt"
fi

# Check for 1-3 years files
if check_export_file "src/data/nifty-thrifty-1-3-years" "Nifty Thrifty 1-3 years" ""; then
  has_files=true
else
  echo "Warning: No export file found for Nifty Thrifty 1-3 years group."
  echo "Expected: src/data/nifty-thrifty-1-3-years/WhatsApp Chat with Nifty Thrifty 1-3 years.txt"
fi

# Check for cloth nappies files
if check_export_file "src/data/nifty-thrifty-modern-cloth-nappies" "Nifty Thrifty Modern Cloth Nappies" ""; then
  has_files=true
else
  echo "Warning: No export file found for Nifty Thrifty Modern Cloth Nappies group."
  echo "Expected: src/data/nifty-thrifty-modern-cloth-nappies/WhatsApp Chat with Nifty Thrifty Modern Cloth Nappies.txt"
fi

# Check for bumps & boobs files
if check_export_file "src/data/nifty-thrifty-bumps-and-boobs" "Nifty Thrifty Bumps & Boobs" ""; then
  has_files=true
else
  echo "Warning: No export file found for Nifty Thrifty Bumps & Boobs group."
  echo "Expected: src/data/nifty-thrifty-bumps-and-boobs/WhatsApp Chat with Nifty Thrifty Bumps & Boobs.txt"
fi

# Check for kids 3-8 years files
if check_export_file "src/data/nifty-thrifty-kids-3-8-years" "Nifty Thrifty Kids (3-8 years) 2" ""; then
  has_files=true
else
  echo "Warning: No export file found for Nifty Thrifty Kids (3-8 years) 2 group."
  echo "Expected: src/data/nifty-thrifty-kids-3-8-years/WhatsApp Chat with Nifty Thrifty Kids (3-8 years) 2.txt"
fi

# If no files were found, give the user a choice to continue
if [ "$has_files" = false ]; then
  echo ""
  echo "No WhatsApp export files found in any of the expected locations."
  read -p "Do you want to continue anyway? (y/n): " continue_without_files
  if [ "$continue_without_files" != "y" ]; then
    exit 1
  fi
else
  echo "Found at least one WhatsApp export file. Continuing..."
fi

# Step 1: Run the import script
echo ""
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