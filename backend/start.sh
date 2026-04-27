#!/bin/bash

# Install Playwright browsers if not already installed
if [ ! -d "/root/.cache/ms-playwright" ]; then
  echo "Installing Playwright browsers..."
  npx playwright install chromium
fi

# Start the application
node index.js
