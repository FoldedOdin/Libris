#!/bin/bash

echo "========================================"
echo "Online Library Management System"
echo "Installation Script for Unix/Linux/Mac"
echo "========================================"
echo ""

echo "[1/5] Installing root dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install root dependencies"
    exit 1
fi
echo ""

echo "[2/5] Installing frontend dependencies..."
cd react-frontend-olms
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies"
    cd ..
    exit 1
fi
cd ..
echo ""

echo "[3/5] Installing backend dependencies..."
cd "Online Library Management System/library"
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    cd ../..
    exit 1
fi
echo ""

echo "[4/5] Running database migrations..."
python manage.py migrate
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to run migrations"
    cd ../..
    exit 1
fi
cd ../..
echo ""

echo "[5/5] Installation complete!"
echo ""
echo "========================================"
echo "Next Steps:"
echo "========================================"
echo "1. Run 'npm run dev' to start both servers"
echo "2. Backend will be at: http://localhost:8000"
echo "3. Frontend will be at: http://localhost:3000"
echo ""
echo "Default Login Credentials:"
echo "- Admin: username=admin, password=admin123"
echo "- User1: username=user1, password=User@123"
echo "- User2: username=user2, password=User@123"
echo "========================================"
echo ""
