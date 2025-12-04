#!/bin/bash

# Exit on error
set -e

# Run migrations
echo "Running database migrations..."
php artisan migrate --force

# Create storage link
echo "Creating storage link..."
php artisan storage:link || true

# Start Queue Worker
echo "Starting Queue Worker..."
php artisan queue:work --verbose --tries=3 --timeout=90 &

# Start Apache
echo "Starting Apache..."
exec apache2-foreground
