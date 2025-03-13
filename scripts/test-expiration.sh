#!/bin/bash

# Script to run the expiration tests

echo "Running WhatsApp message expiration tests..."

# Go to project root
cd "$(dirname "$0")/.."

# Run the tests with Jest
npx jest src/__tests__/import/waha-expiration.test.ts src/__tests__/import/date-handling.test.ts src/__tests__/import/expiration-policy.test.ts --verbose

echo "Tests completed." 