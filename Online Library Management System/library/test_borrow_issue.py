import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library.settings')
django.setup()

from catalog.models import Book, Transaction, CustomUser

print("=" * 60)
print("TESTING BORROW ISSUE")
print("=" * 60)

# Get admin user
try:
    user = CustomUser.objects.get(username='admin')
    print(f"\n✓ User found: {user.username}")
except CustomUser.DoesNotExist:
    print("\n✗ Admin user not found!")
    exit(1)

# Get a book
book = Book.objects.first()
if not book:
    print("\n✗ No books found in database!")
    exit(1)

print(f"\n📚 Book: {book.title}")
print(f"   Available: {book.available_copies}")
print(f"   Total: {book.total_copies}")

# Check existing transactions
existing = Transaction.objects.filter(
    user=user,
    book=book,
    transaction_type='borrow',
    returned=False
).count()

print(f"\n📋 Existing unreturned transactions for this book: {existing}")

# Check all unreturned transactions for user
all_unreturned = Transaction.objects.filter(
    user=user,
    transaction_type='borrow',
    returned=False
)

print(f"\n📋 All unreturned books for user:")
for t in all_unreturned:
    print(f"   - {t.book.title} (borrowed: {t.date}, due: {t.due_date})")

# Check all books
print(f"\n📚 All books in database:")
for b in Book.objects.all()[:10]:
    print(f"   - {b.title}: {b.available_copies}/{b.total_copies}")

print("\n" + "=" * 60)
