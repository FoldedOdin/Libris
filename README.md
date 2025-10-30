# Online Library Management System

A full-stack web application for managing library operations including book borrowing, donations, and sales.

## Tech Stack

### Backend
- Django 5.2.6
- Django REST Framework 3.15.2
- SQLite Database
- Python 3.x

### Frontend
- React 19.2.0
- React Router v6
- Axios for API calls
- Modern CSS with dark mode support

## Features

### User Features
- Browse and search books
- Borrow books with due date tracking
- Donate books to the library
- Sell books through the platform
- View borrowing history
- User dashboard with statistics

### Admin Features
- Manage books (CRUD operations)
- Manage users
- Approve/reject donations
- Approve/reject sales
- Track borrowed books
- View overdue books
- Dashboard with comprehensive statistics

## Quick Start (Easiest Way)

### Start Both Servers with One Command:

```bash
cd react-frontend-olms
npm install  # First time only
npm run dev
```

This starts both Django backend and React frontend simultaneously!

Then open http://localhost:3000 and login with:
- Username: `admin`
- Password: `admin123`

See [START_SERVERS.md](START_SERVERS.md) for more options.

---

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd "Online Library Management System/library"
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
- Windows: `venv\Scripts\activate`
- Mac/Linux: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run the setup script (creates migrations, superuser, and sample data):
```bash
python setup.py
```

6. Start the Django development server:
```bash
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd react-frontend-olms
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Default Credentials

After running the setup script, you can login with:
- **Username:** admin
- **Password:** admin123
- **Email:** admin@library.com

## API Endpoints

### Authentication
- `POST /api/register/` - Register new user
- `POST /api/login/` - Login
- `POST /api/logout/` - Logout
- `GET /api/user/` - Get current user

### Books
- `GET /api/books/` - List all books
- `POST /api/books/` - Create book (admin)
- `GET /api/books/{id}/` - Get book details
- `PUT /api/books/{id}/` - Update book (admin)
- `DELETE /api/books/{id}/` - Delete book (admin)
- `GET /api/books/available/` - List available books
- `POST /api/books/{id}/borrow/` - Borrow a book

### Donations
- `GET /api/donations/` - List donations
- `POST /api/donations/` - Create donation
- `GET /api/my-donations/` - User's donations
- `POST /api/donations/{id}/approve/` - Approve donation (admin)
- `POST /api/donations/{id}/reject/` - Reject donation (admin)

### Sales
- `GET /api/sales/` - List sales
- `POST /api/sales/` - Create sale
- `GET /api/my-sales/` - User's sales
- `POST /api/sales/{id}/approve/` - Approve sale (admin)
- `POST /api/sales/{id}/reject/` - Reject sale (admin)

### Transactions
- `GET /api/transactions/` - List all transactions
- `GET /api/my-borrowed-books/` - User's borrowed books
- `GET /api/borrowed-books/` - All borrowed books (admin)
- `POST /api/transactions/{id}/return/` - Return a book

### Dashboard
- `GET /api/dashboard/stats/` - Get dashboard statistics

## Environment Variables

### Backend (.env)
```
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development
GENERATE_SOURCEMAP=true
```

## Project Structure

```
Online Library Management System/
├── library/                    # Django backend
│   ├── catalog/               # Main app
│   │   ├── models.py         # Database models
│   │   ├── serializers.py    # DRF serializers
│   │   ├── api_views.py      # API views
│   │   └── api_urls.py       # API routes
│   ├── library/              # Project settings
│   │   ├── settings.py       # Django settings
│   │   └── urls.py           # URL configuration
│   ├── manage.py             # Django management
│   ├── setup.py              # Setup script
│   └── requirements.txt      # Python dependencies
│
└── react-frontend-olms/       # React frontend
    ├── src/
    │   ├── api/              # API integration
    │   ├── components/       # React components
    │   ├── contexts/         # React contexts
    │   ├── hooks/            # Custom hooks
    │   ├── pages/            # Page components
    │   ├── styles/           # CSS files
    │   └── utils/            # Utility functions
    ├── public/               # Static files
    └── package.json          # Node dependencies
```

## Development

### Running Tests

Backend:
```bash
cd "Online Library Management System/library"
python manage.py test
```

Frontend:
```bash
cd react-frontend-olms
npm test
```

### Creating Migrations

After modifying models:
```bash
python manage.py makemigrations
python manage.py migrate
```

### Building for Production

Frontend:
```bash
npm run build:prod
```

## Performance Optimizations

The frontend includes several performance optimizations:
- Code splitting and lazy loading
- Virtual scrolling for large lists
- Image optimization
- Web Vitals monitoring
- Dark mode support
- Reduced motion support

See `react-frontend-olms/PERFORMANCE.md` for details.

## Security Notes

- Change the SECRET_KEY in production
- Set DEBUG=False in production
- Use environment variables for sensitive data
- Configure proper CORS settings
- Use HTTPS in production
- Implement rate limiting for API endpoints

## License

This project is for educational purposes.

## Support

For issues or questions, please check the documentation or create an issue in the repository.
