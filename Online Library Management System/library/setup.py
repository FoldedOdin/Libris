#!/usr/bin/env python
"""
Setup script for Online Library Management System
This script will:
1. Create new migrations for model changes
2. Apply migrations to database
3. Create a superuser (if needed)
"""

import os
import sys
import django

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library.settings')
    django.setup()

def run_migrations():
    """Create and run migrations"""
    from django.core.management import call_command
    
    print("Creating new migrations...")
    try:
        call_command('makemigrations', 'catalog')
        print("✓ Migrations created successfully")
    except Exception as e:
        print(f"✗ Error creating migrations: {e}")
        return False
    
    print("\nApplying migrations...")
    try:
        call_command('migrate')
        print("✓ Migrations applied successfully")
    except Exception as e:
        print(f"✗ Error applying migrations: {e}")
        return False
    
    return True

def create_superuser():
    """Create superuser if it doesn't exist"""
    from catalog.models import CustomUser
    
    username = 'admin'
    email = 'admin@library.com'
    password = 'admin123'
    
    if not CustomUser.objects.filter(username=username).exists():
        print(f"\nCreating superuser '{username}'...")
        try:
            user = CustomUser.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                role='admin'
            )
            user.is_staff = True
            user.save()
            print(f"✓ Superuser created successfully")
            print(f"  Username: {username}")
            print(f"  Password: {password}")
            print(f"  Email: {email}")
        except Exception as e:
            print(f"✗ Error creating superuser: {e}")
    else:
        print(f"\nSuperuser '{username}' already exists")

def create_sample_data():
    """Create sample categories and books"""
    from catalog.models import Category, Book
    
    print("\nCreating sample data...")
    
    # Create categories
    categories = ['Science', 'Fiction', 'Mathematics', 'History', 'DataScience']
    for cat_name in categories:
        Category.objects.get_or_create(name=cat_name)
    
    # Create sample books if none exist
    if Book.objects.count() == 0:
        sample_books = [
            {
                'title': 'Introduction to Python',
                'author': 'John Doe',
                'isbn': '978-0-123456-78-9',
                'category': 'DataScience',
                'description': 'A comprehensive guide to Python programming',
                'pages': 450,
                'language': 'English',
                'total_copies': 5,
                'available_copies': 5,
                'price': 29.99
            },
            {
                'title': 'The Science of Everything',
                'author': 'Jane Smith',
                'isbn': '978-0-987654-32-1',
                'category': 'Science',
                'description': 'Exploring the wonders of science',
                'pages': 320,
                'language': 'English',
                'total_copies': 3,
                'available_copies': 3,
                'price': 24.99
            },
            {
                'title': 'Advanced Mathematics',
                'author': 'Robert Johnson',
                'isbn': '978-0-111222-33-4',
                'category': 'Mathematics',
                'description': 'Deep dive into advanced mathematical concepts',
                'pages': 580,
                'language': 'English',
                'total_copies': 4,
                'available_copies': 4,
                'price': 39.99
            }
        ]
        
        for book_data in sample_books:
            Book.objects.create(**book_data)
        
        print(f"✓ Created {len(sample_books)} sample books")
    else:
        print(f"✓ Database already has {Book.objects.count()} books")

def main():
    """Main setup function"""
    print("=" * 60)
    print("Online Library Management System - Setup")
    print("=" * 60)
    
    setup_django()
    
    if not run_migrations():
        print("\n✗ Setup failed during migrations")
        sys.exit(1)
    
    create_superuser()
    create_sample_data()
    
    print("\n" + "=" * 60)
    print("✓ Setup completed successfully!")
    print("=" * 60)
    print("\nYou can now run the server with:")
    print("  python manage.py runserver")
    print("\nAccess the admin panel at:")
    print("  http://localhost:8000/admin/")
    print("\nAPI documentation at:")
    print("  http://localhost:8000/api/")

if __name__ == '__main__':
    main()
