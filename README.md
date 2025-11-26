# Online Library Management System (OLMS)

A comprehensive web-based library management system built with Django REST Framework (backend) and React (frontend).

## Features

### For Users

- Browse and search book catalog
- Borrow and return books
- View borrowed books and history
- Donate books to the library
- Sell books through the platform
- Track overdue books and fines

### For Administrators

- Manage books (Add, Edit, Delete)
- Manage users (Create, Edit, Activate/Deactivate)
- Track borrowed books
- Review and approve/reject donations
- Review and approve/reject book sales
- View dashboard with statistics

## Technology Stack

### Backend

- Python 3.13
- Django 5.2.6
- Django REST Framework
- SQLite Database

### Frontend

- React 18
- React Router v6
- Axios for API calls
- CSS3 for styling

## System Requirements

- Python 3.13 or higher
- Node.js 16 or higher
- npm or yarn

## Installation & Setup

### Automated Installation (Recommended)

#### For Windows:
```bash
.\install.bat
```

#### For Linux/Mac:
```bash
chmod +x install.sh
./install.sh
```

The installation script will:
1. Install root dependencies (concurrently)
2. Install frontend dependencies
3. Install backend dependencies
4. Run database migrations

After installation, run:
```bash
cd .\react-frontend-olms\
```
```bash
npm run dev
```

This will start:
- Backend API at: `http://localhost:8000`
- Frontend at: `http://localhost:3000`

### Manual Installation (Alternative)

1. Install root dependencies:

```bash
npm install
```

2. Install frontend dependencies:

```bash
npm run install-all
```

3. Setup backend (first time only):

```bash
cd "Online Library Management System/library"
pip install -r requirements.txt
python manage.py migrate
cd ../..
```

4. Run both servers with one command:

```bash
npm run dev
```

This will start:

- Backend API at: `http://localhost:8000`
- Frontend at: `http://localhost:3000`

### Manual Setup (Alternative)

#### Backend Setup

1. Navigate to the backend directory:

```bash
cd "Online Library Management System/library"
```

2. Create and activate virtual environment (optional but recommended):

```bash
python -m venv venv
venv\Scripts\activate  # On Windows
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Run migrations:

```bash
python manage.py migrate
```

5. Start the Django development server:

```bash
python manage.py runserver
```

The backend API will be available at: `http://localhost:8000`

#### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd react-frontend-olms
```

2. Install dependencies:

```bash
npm install
```

3. Start the React development server:

```bash
npm start
```

The frontend will be available at: `http://localhost:3000`

## Default Login Credentials

### Administrator Account

- **Username:** `admin`
- **Password:** `admin123`
- **Email:** `admin@library.com`
- **Role:** Admin

### User Accounts

#### User 1

- **Username:** `user1`
- **Password:** `User@123`
- **Email:** `user1@library.com`
- **Name:** John Doe
- **Role:** User

#### User 2

- **Username:** `user2`
- **Password:** `User@123`
- **Email:** `user2@library.com`
- **Name:** Jane Smith
- **Role:** User

## Available Scripts

From the root directory:

- `npm run dev` - Run both backend and frontend servers concurrently
- `npm run backend` - Run only the Django backend server
- `npm run frontend` - Run only the React frontend server
- `npm run install-all` - Install frontend dependencies

## User Registration

New users can register through the signup page:

1. Go to `http://localhost:3000`
2. Click on "Sign Up"
3. Fill in the registration form
4. After registration, login with your credentials

## Usage Guide

### For Users

1. **Browse Books**

   - Navigate to "Browse Books" from the dashboard
   - Search and filter books by title, author, or category
   - View book details

2. **Borrow Books**

   - Click "Borrow" on any available book
   - Books are automatically due in 14 days
   - View borrowed books in "My Borrowed Books"

3. **Return Books**

   - Go to "My Borrowed Books"
   - Click "Return" on the book you want to return
   - Late returns incur a fine of ₹5 per day

4. **Donate Books**

   - Navigate to "Donate Books"
   - Enter book details (title, author, category, condition, quantity)
   - Specify how many copies you're donating
   - Submit for admin approval
   - Approved donations are added to the library catalog as free books

5. **Sell Books**
   - Navigate to "Sell Books"
   - Enter your own book details and set your price
   - Submit for admin approval
   - Approved sales are added to the catalog with your specified price
   - If the book already exists, only the price is updated

### For Administrators

1. **Manage Books**

   - Add new books to the catalog
   - Edit existing book information
   - Delete books from the system
   - Track book availability and stock

2. **Manage Users**

   - View all registered users
   - Edit user information
   - Activate/Deactivate user accounts
   - Delete users if needed

3. **Review Donations**

   - View pending donations in tabs (Pending/Approved/Rejected)
   - Approve donations to add books to catalog
   - Reject donations with reason

4. **Review Sales**

   - View pending sales in tabs (Pending/Approved/Rejected/Sold)
   - Approve sales listings
   - Mark approved sales as sold
   - Reject inappropriate listings

5. **Track Borrowed Books**
   - View all currently borrowed books
   - See overdue books
   - View borrowing history

## API Endpoints

### Authentication

- `POST /api/register/` - User registration
- `POST /api/login/` - User login
- `POST /api/logout/` - User logout
- `GET /api/user/` - Get current user

### Books

- `GET /api/books/` - List all books
- `POST /api/books/` - Create new book (Admin)
- `GET /api/books/{id}/` - Get book details
- `PUT /api/books/{id}/` - Update book (Admin)
- `DELETE /api/books/{id}/` - Delete book (Admin)

### Transactions

- `GET /api/borrowed-books/` - Get borrowed books
- `POST /api/books/{id}/borrow/` - Borrow a book
- `POST /api/transactions/{id}/return/` - Return a book

### Donations

- `GET /api/donations/` - List donations
- `POST /api/donations/` - Create donation
- `POST /api/donations/{id}/approve/` - Approve donation (Admin)
- `POST /api/donations/{id}/reject/` - Reject donation (Admin)

### Sales

- `GET /api/sales/` - List sales
- `POST /api/sales/` - Create sale listing
- `POST /api/sales/{id}/approve/` - Approve sale (Admin)
- `POST /api/sales/{id}/reject/` - Reject sale (Admin)

### Users (Admin only)

- `GET /api/users/` - List all users
- `PUT /api/users/{id}/` - Update user
- `DELETE /api/users/{id}/` - Delete user

## Currency

The system uses Indian Rupees (₹) as the currency for:

- Book prices
- Sale listings
- Late return fines (₹5 per day)

## Project Structure

```
Online Library Management System/
├── library/                    # Django backend
│   ├── catalog/               # Main app
│   │   ├── models.py         # Database models
│   │   ├── serializers.py    # DRF serializers
│   │   ├── api_views.py      # API views
│   │   └── urls.py           # URL routing
│   ├── library/              # Project settings
│   └── manage.py             # Django management script
│
react-frontend-olms/           # React frontend
├── src/
│   ├── api/                  # API service files
│   ├── components/           # Reusable components
│   ├── contexts/             # React contexts
│   ├── pages/               # Page components
│   │   ├── Admin/           # Admin pages
│   │   ├── Auth/            # Login/Register
│   │   └── User/            # User pages
│   ├── styles/              # CSS files
│   └── utils/               # Utility functions
└── public/                   # Static files
```

## Troubleshooting

### Backend Issues

**Port already in use:**

```bash
# Kill the process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Database errors:**

```bash
# Reset database
python manage.py flush
python manage.py migrate
```

### Frontend Issues

**Port 3000 already in use:**

```bash
# Kill the process or use a different port
set PORT=3001 && npm start
```

**Module not found errors:**

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```
