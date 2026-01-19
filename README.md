# 📚 Online Library Management System (OLMS)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/downloads/)
[![Django](https://img.shields.io/badge/Django-5.2.6-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)

A modern, comprehensive web-based library management system built with Django REST Framework (backend) and React (frontend). Features a professional landing page, role-based access control, and complete library operations including borrowing, donations, and sales.

## 🌟 Features Overview

### 🎨 **Modern Landing Page**
- Professional gradient design with smooth animations
- Responsive layout optimized for all devices
- Feature showcase with interactive cards
- Clear call-to-action buttons
- Statistics display and branding

### 👥 **User Management**
- Role-based access control (Admin/User)
- Secure authentication with session management
- User registration and profile management
- Account activation/deactivation

### 📖 **Book Management**
- Complete CRUD operations for books
- Advanced search and filtering
- Category-based organization
- Stock tracking and availability
- ISBN support

### 🔄 **Borrowing System**
- 14-day automatic borrow period
- Overdue detection and fine calculation (₹5/day)
- Return processing with fine settlement
- Borrowing history tracking

### 💝 **Donation System**
- User-friendly donation form
- Quantity tracking for multiple copies
- Admin approval workflow
- Approved donations added as free books

### 💰 **Sales System**
- User book listing with custom pricing
- Admin approval process
- Mark as sold functionality
- Price updates for existing books

### 📊 **Admin Dashboard**
- Comprehensive statistics
- User management tools
- Transaction monitoring
- Approval workflows for donations/sales

## 🚀 Quick Start

### Prerequisites

- **Python 3.13+**
- **Node.js 16+**
- **npm or yarn**

### 🔧 Automated Installation (Recommended)

#### Windows:
```bash
.\install.bat
```

#### Linux/Mac:
```bash
chmod +x install.sh
./install.sh
```

#### Start Development Servers:
```bash
cd react-frontend-olms
npm run dev
```

This will start:
- **Backend API**: http://localhost:8000
- **Frontend**: http://localhost:3000

### 🛠️ Manual Installation

<details>
<summary>Click to expand manual installation steps</summary>

#### 1. Clone the Repository
```bash
git clone https://github.com/Foldedodin/online-library-management-system.git
cd online-library-management-system
```

#### 2. Install Root Dependencies
```bash
npm install
```

#### 3. Backend Setup
```bash
cd "Online Library Management System/library"
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

#### 4. Frontend Setup (New Terminal)
```bash
cd react-frontend-olms
npm install
npm start
```

</details>

## 🔐 Default Credentials

### Administrator
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@library.com`

### Test Users
- **Username**: `user1` / `user2`
- **Password**: `User@123`
- **Emails**: `user1@library.com` / `user2@library.com`

## 📱 Usage Guide

### For Users

1. **📚 Browse Books**
   - Search by title, author, or category
   - View detailed book information
   - Check availability status

2. **📖 Borrow Books**
   - One-click borrowing
   - Automatic 14-day due date
   - View borrowed books dashboard

3. **🔄 Return Books**
   - Easy return process
   - Automatic fine calculation
   - Payment tracking

4. **💝 Donate Books**
   - Submit donation requests
   - Track approval status
   - Contribute to library collection

5. **💰 Sell Books**
   - List books for sale
   - Set custom prices
   - Admin approval process

### For Administrators

1. **📊 Dashboard Management**
   - View system statistics
   - Monitor user activity
   - Track transactions

2. **👥 User Management**
   - Create/edit user accounts
   - Manage permissions
   - Account activation/deactivation

3. **📚 Book Management**
   - Add/edit/delete books
   - Manage categories
   - Track inventory

4. **✅ Approval Workflows**
   - Review donations
   - Approve sales listings
   - Manage transactions

## 🏗️ Architecture

### Backend (Django)
```
Online Library Management System/library/
├── catalog/                 # Main application
│   ├── models.py           # Database models
│   ├── serializers.py      # API serializers
│   ├── api_views.py        # API endpoints
│   ├── api_urls.py         # API routing
│   └── admin.py            # Admin interface
├── library/                # Project settings
│   ├── settings.py         # Configuration
│   ├── urls.py             # URL routing
│   └── wsgi.py             # WSGI config
└── manage.py               # Django CLI
```

### Frontend (React)
```
react-frontend-olms/
├── src/
│   ├── api/                # API service layer
│   ├── components/         # Reusable components
│   │   ├── common/         # Shared components
│   │   └── forms/          # Form components
│   ├── contexts/           # React contexts
│   ├── pages/              # Page components
│   │   ├── Admin/          # Admin pages
│   │   ├── Auth/           # Authentication
│   │   └── User/           # User pages
│   ├── styles/             # CSS stylesheets
│   ├── hooks/              # Custom hooks
│   └── utils/              # Utility functions
└── public/                 # Static assets
```

## 🔌 API Documentation

### Authentication Endpoints
```
POST /api/register/         # User registration
POST /api/login/            # User login
POST /api/logout/           # User logout
GET  /api/user/             # Current user info
GET  /api/csrf/             # CSRF token
```

### Book Management
```
GET    /api/books/          # List books
POST   /api/books/          # Create book (Admin)
GET    /api/books/{id}/     # Book details
PUT    /api/books/{id}/     # Update book (Admin)
DELETE /api/books/{id}/     # Delete book (Admin)
GET    /api/categories/     # List categories
```

### Transaction Management
```
GET  /api/transactions/           # List transactions
GET  /api/my-borrowed-books/      # User's borrowed books
GET  /api/borrowed-books/         # All borrowed books (Admin)
POST /api/books/{id}/borrow/      # Borrow book
POST /api/transactions/{id}/return/ # Return book
```

### Donation System
```
GET  /api/donations/              # List donations
POST /api/donations/              # Create donation
GET  /api/my-donations/           # User's donations
POST /api/donations/{id}/approve/ # Approve (Admin)
POST /api/donations/{id}/reject/  # Reject (Admin)
```

### Sales System
```
GET  /api/sales/                  # List sales
POST /api/sales/                  # Create sale
GET  /api/my-sales/               # User's sales
POST /api/sales/{id}/approve/     # Approve (Admin)
POST /api/sales/{id}/reject/      # Reject (Admin)
```

### User Management (Admin)
```
GET    /api/users/          # List users
GET    /api/users/{id}/     # User details
PUT    /api/users/{id}/     # Update user
DELETE /api/users/{id}/     # Delete user
```

### Dashboard
```
GET /api/dashboard/stats/   # System statistics
```

## 🛠️ Available Scripts

### Root Directory
```bash
npm run dev          # Start both servers
npm run backend      # Django server only
npm run frontend     # React server only
npm run install-all  # Install all dependencies
```

### Frontend Directory
```bash
npm start           # Development server
npm run build       # Production build
npm test            # Run tests
npm run eject       # Eject from Create React App
```

### Backend Directory
```bash
python manage.py runserver      # Start server
python manage.py migrate        # Run migrations
python manage.py createsuperuser # Create admin
python manage.py collectstatic  # Collect static files
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_NAME=db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development
GENERATE_SOURCEMAP=true
REACT_APP_ENABLE_ANALYTICS=false
```

## 🚀 Deployment

### Production Checklist

1. **Backend**
   - Set `DEBUG=False`
   - Configure production database
   - Set up static file serving
   - Configure CORS for production domain
   - Set secure session cookies

2. **Frontend**
   - Build production bundle: `npm run build`
   - Configure API URL for production
   - Set up CDN for static assets
   - Enable HTTPS

3. **Security**
   - Use environment variables for secrets
   - Enable CSRF protection
   - Configure secure headers
   - Set up SSL/TLS certificates

## 🧪 Testing

### Backend Tests
```bash
cd "Online Library Management System/library"
python manage.py test
```

### Frontend Tests
```bash
cd react-frontend-olms
npm test
```

## 🐛 Troubleshooting

### Common Issues

<details>
<summary>Port Already in Use</summary>

**Backend (Port 8000):**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

**Frontend (Port 3000):**
```bash
# Use different port
set PORT=3001 && npm start  # Windows
PORT=3001 npm start         # Linux/Mac
```
</details>

<details>
<summary>Database Issues</summary>

```bash
# Reset database
python manage.py flush
python manage.py migrate
```
</details>

<details>
<summary>Module Not Found</summary>

```bash
# Backend
pip install -r requirements.txt

# Frontend
rm -rf node_modules package-lock.json
npm install
```
</details>

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint/Prettier for JavaScript
- Write tests for new features
- Update documentation
- Follow semantic versioning

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security

For security concerns, please review our [SECURITY.md](SECURITY.md) file and report vulnerabilities responsibly.

## 🙏 Acknowledgments

- Django REST Framework team
- React development team
- Open source community
- Contributors and testers

---

**Made with ❤️ for the library community**
