import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library.settings')
django.setup()

from catalog.models import Donation, Book, Category
from django.contrib.auth import get_user_model

User = get_user_model()

# Get the first donation
try:
    donation = Donation.objects.first()
    if donation:
        print(f"Found donation: {donation.book_title} by {donation.author}")
        print(f"Category: {donation.category}")
        print(f"Category name: {donation.category.name if donation.category else 'None'}")
        print(f"Status: {donation.status}")
        
        # Try to get category name
        category_name = donation.category.name if donation.category else 'Fiction'
        print(f"Category name to use: {category_name}")
        
        # Check if it's in valid categories
        valid_categories = ['Science', 'Fiction', 'Mathematics', 'History', 'DataScience']
        if category_name not in valid_categories:
            category_name = 'Fiction'
            print(f"Category not valid, using: {category_name}")
        
        # Try to create a book
        print("\nAttempting to create book...")
        book = Book.objects.create(
            title=donation.book_title,
            author=donation.author,
            category=category_name,
            description=donation.description or f"Donated by {donation.user.username}",
            available_copies=1,
            total_copies=1,
            price=0.00,
            publication_date=None,
            pages=None,
            language='English',
            isbn=''
        )
        print(f"Book created successfully: {book.id} - {book.title}")
    else:
        print("No donations found")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
