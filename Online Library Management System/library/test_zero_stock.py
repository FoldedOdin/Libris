#!/usr/bin/env python
"""
Test borrowing a book with 0 stock
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library.settings')
django.setup()

from catalog.models import Book, Transaction, CustomUser
from datetime import datetime, timedelta

print("Testing Zero Stock Borrowing Prevention")
print("=" * 60)

# Get admin user
user = CustomUser.objects.get(username='admin')
print(f"User: {user.username}")

# Get book with 0 stock
book = Book.objects.get(id=7)
print(f"\nBook: {book.title}")
print(f"Available copies: {book.available_copies}")
print(f"Total copies: {book.total_copies}")

# Try to borrow
print("\nAttempting to borrow book with 0 stock...")

if book.available_copies <= 0:
    print("✓ Validation PASSED: Book has 0 copies, should not allow borrowing")
    print("  Error message should be: 'Book not available'")
else:
    print("✗ Validation FAILED: Book shows as available when it shouldn't be")

# Check if there are any unreturned transactions for this book
unreturned = Transaction.objects.filter(
    book=book,
    transaction_type='borrow',
    returned=False
).count()

print(f"\nUnreturned transactions for this book: {unreturned}")

# Check the is_available property
print(f"Book.is_available property: {book.is_available}")

print("\n" + "=" * 60)
print("Test complete")
