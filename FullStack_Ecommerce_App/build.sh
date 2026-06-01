#!/usr/bin/env bash
set -o errexit

echo "Installing Python dependencies..."
pip install -r backend/requirements.txt

echo "Building React frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Copying frontend build into backend..."
rm -rf backend/frontend_build
cp -r frontend/build backend/frontend_build

echo "Collecting static files and running migrations..."
cd backend
python manage.py collectstatic --noinput
python manage.py migrate --noinput
python manage.py loaddata products 2>/dev/null || true
