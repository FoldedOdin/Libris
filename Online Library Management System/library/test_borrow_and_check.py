import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library.settings')
django.setup()

from catalog.models import Book, Transaction, CustomUser
from datetime import datetime, timedelta

print("=" * 60)
print("TESTING BORROW AND STOCK UPDATE")
print("=" * 60)

# Get admin user
user = CustomUser.objects.get(username='admin')
print(f"\n✓ User: {user.username}")

# Get a book
book = Book.objects.get(id=1)
print(f"\n📚 BEFORE BORROW:")
print(f"   Book: {book.title}")
print(f"   Available: {book.available_copies}")
print(f"   Total: {book.total_copies}")

# Check if already borrowed
existing = Transaction.objects.filter(
    user=user,
    book=book,
    transaction_type='borrow',
    returned=False
).first()

if existing:
    print(f"\n⚠️  User already has this book borrowed!")
    print(f"   Transaction ID: {existing.id}")
    print(f"   Borrowed: {existing.date}")
    print(f"   Due: {existing.due_date}")
    
    # Return it first
    print(f"\n🔄 Returning the book first...")
    existing.returned = True
    existing.return_date = datetime.now().date()
    existing.save()
    
    book.available_copies += 1
    book.save()
    print(f"   ✓ Book returned")
    print(f"   Available now: {book.available_copies}")

# Refresh book from database
book.refresh_from_db()

print(f"\n📚 CURRENT STATE:")
print(f"   Available: {book.available_copies}")
print(f"   Total: {book.total_copies}")

# Now borrow it
print(f"\n📖 BORROWING BOOK...")

if book.available_copies <= 0:
    print(f"   ✗ Cannot borrow - no copies available!")
else:
    # Create transaction
    due_date = datetime.now().date() + timedelta(days=14)
    transaction = Transaction.objects.create(
        user=user,
        book=book,
        transaction_type='borrow',
        due_date=due_date
    )
    
    # Update book
    book.available_copies -= 1
    book.save()
    
    print(f"   ✓ Transaction created (ID: {transaction.id})")
    print(f"   ✓ Book borrowed successfully!")

# Refresh and check
book.refresh_from_db()

print(f"\n📚 AFTER BORROW:")
print(f"   Available: {book.available_copies}")
print(f"   Total: {book.total_copies}")
print(f"   is_available: {book.is_available}")

# Verify transaction exists
transaction_count = Transaction.objects.filter(
    user=user,
    book=book,
    transaction_type='borrow',
    returned=False
).count()

print(f"\n📋 Unreturned transactions for this book: {transaction_count}")

# Check what API would return
from catalog.serializers import BookSerializer
serializer = BookSerializer(book)
data = serializer.data

print(f"\n📡 API Response would show:")
print(f"   available_copies: {data['available_copies']}")
print(f"   total_copies: {data['total_copies']}")
print(f"   is_available: {data['is_available']}")

print("\n" + "=" * 60)
print("✓ TEST COMPLETE")
print("=" * 60)
