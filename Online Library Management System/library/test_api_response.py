import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library.settings')
django.setup()

from catalog.models import Book, Transaction, CustomUser
from catalog.serializers import BookSerializer

print("=" * 60)
print("TESTING API RESPONSE DATA")
print("=" * 60)

# Get a book
book = Book.objects.first()
if not book:
    print("\n✗ No books found!")
    exit(1)

print(f"\n📚 Book from Database:")
print(f"   Title: {book.title}")
print(f"   Available: {book.available_copies}")
print(f"   Total: {book.total_copies}")
print(f"   is_available: {book.is_available}")

# Serialize it (like the API does)
serializer = BookSerializer(book)
data = serializer.data

print(f"\n📡 Book from API Serializer:")
print(json.dumps(data, indent=2, default=str))

print(f"\n🔍 Key Fields:")
print(f"   available_copies: {data.get('available_copies')}")
print(f"   total_copies: {data.get('total_copies')}")
print(f"   is_available: {data.get('is_available')}")

# Test all books
print(f"\n📚 All Books (first 5):")
books = Book.objects.all()[:5]
for b in books:
    print(f"   {b.title}: {b.available_copies}/{b.total_copies} (is_available: {b.is_available})")

print("\n" + "=" * 60)
