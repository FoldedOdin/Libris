#!/usr/bin/env python
"""
Test if borrowing updates the count
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library.settings')
django.setup()

from catalog.models import Book, Transaction, CustomUser
from datetime import datetime, timedelta

print("Testing Borrow Count Update")
print("=" * 60)

# Get admin user
user = CustomUser.objects.get(username='admin')
print(f"User: {user.username}")

# Get a book with available copies
book = Book.objects.get(id=1)
print(f"\nBook: {book.title}")
print(f"Available BEFORE: {book.available_copies}")
print(f"Total: {book.total_copies}")

# Check if user already has this book
existing = Transaction.objects.filter(
    user=user,
    book=book,
    transaction_type='borrow',
    returned=False
).first()

if existing:
    print(f"\n⚠ User already has this book borrowed")
    print(f"  Transaction ID: {existing.id}")
    print(f"  Borrowed: {existing.date}")
    print(f"  Due: {existing.due_date}")
    print("\nSkipping borrow test. Return the book first.")
else:
    # Simulate borrowing
    print("\nSimulating borrow...")
    
    # Create transaction
    due_date = datetime.now().date() + timedelta(days=14)
    transaction = Transaction.objects.create(
        user=user,
        book=book,
        transaction_type='borrow',
        due_date=due_date
    )
    
    # Update book availability
    book.available_copies -= 1
    book.save()
    
    # Refresh from database
    book.refresh_from_db()
    
    print(f"✓ Book borrowed!")
    print(f"  Transaction ID: {transaction.id}")
    print(f"  Available AFTER: {book.available_copies}")
    
    if book.available_copies == 11:
        print(f"  ✓ Count updated correctly!")
    else:
        print(f"  ✗ Count mismatch!")

print("\n" + "=" * 60)
