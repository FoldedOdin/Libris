import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library.settings')
django.setup()

from catalog.models import Transaction, CustomUser
from datetime import datetime

print("=" * 60)
print("RETURN ALL BORROWED BOOKS")
print("=" * 60)

# Get admin user
try:
    user = CustomUser.objects.get(username='admin')
    print(f"\n✓ User: {user.username}")
except CustomUser.DoesNotExist:
    print("\n✗ Admin user not found!")
    exit(1)

# Get all unreturned transactions
transactions = Transaction.objects.filter(
    user=user,
    transaction_type='borrow',
    returned=False
)

print(f"\nFound {transactions.count()} unreturned books for {user.username}")

if transactions.count() == 0:
    print("\n✓ No books to return!")
    exit(0)

# Return all books
for transaction in transactions:
    print(f"\n📖 Returning: {transaction.book.title}")
    print(f"   Borrowed: {transaction.date}")
    print(f"   Due: {transaction.due_date}")
    print(f"   Available before: {transaction.book.available_copies}")
    
    # Mark as returned
    transaction.returned = True
    transaction.return_date = datetime.now().date()
    
    # Convert due_date to date if it's datetime
    if hasattr(transaction.due_date, 'date'):
        transaction.due_date = transaction.due_date.date()
    
    transaction.save()
    
    # Update book availability
    transaction.book.available_copies += 1
    transaction.book.save()
    
    print(f"   ✓ Returned! Available now: {transaction.book.available_copies}")

print(f"\n" + "=" * 60)
print(f"✓ All {transactions.count()} books returned successfully!")
print("=" * 60)
