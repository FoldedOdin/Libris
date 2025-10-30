import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library.settings')
django.setup()

from catalog.models import Transaction, Book
from django.contrib.auth import get_user_model

User = get_user_model()

# Check transactions
transactions = Transaction.objects.all()[:5]
print(f"Total transactions: {Transaction.objects.count()}")
print("\nRecent transactions:")
for t in transactions:
    print(f"\nTransaction ID: {t.id}")
    print(f"  User: {t.user if t.user else 'NULL'}")
    print(f"  User ID: {t.user_id if hasattr(t, 'user_id') else 'N/A'}")
    print(f"  Book: {t.book if t.book else 'NULL'}")
    print(f"  Book ID: {t.book_id if hasattr(t, 'book_id') else 'N/A'}")
    print(f"  Type: {t.transaction_type}")
    print(f"  Date: {t.date}")
    
    # Check if user exists
    if t.user_id:
        try:
            user = User.objects.get(id=t.user_id)
            print(f"  User exists: {user.username}")
        except User.DoesNotExist:
            print(f"  User DELETED (ID: {t.user_id})")
    
    # Check if book exists
    if t.book_id:
        try:
            book = Book.objects.get(id=t.book_id)
            print(f"  Book exists: {book.title}")
        except Book.DoesNotExist:
            print(f"  Book DELETED (ID: {t.book_id})")
