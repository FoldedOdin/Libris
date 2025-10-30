import os
import django
import sqlite3

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library.settings')
django.setup()

from django.conf import settings
from catalog.models import Book

# Close any Django connections
from django.db import connection
connection.close()

# Use raw sqlite3
db_path = settings.DATABASES['default']['NAME']
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Fixing catalog_sale table...")

# Get existing data
cursor.execute("SELECT id, price, status, created_at, book_id, user_id FROM catalog_sale;")
existing_sales = cursor.fetchall()
print(f"Found {len(existing_sales)} existing sales")

# Get book data
book_data = {}
for book in Book.objects.all():
    book_data[book.id] = (book.title, book.author)

# Drop old table
cursor.execute("DROP TABLE IF EXISTS catalog_sale;")
print("Dropped old table")

# Create new table
cursor.execute("""
    CREATE TABLE catalog_sale (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id BIGINT NOT NULL,
        book_title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        category_id BIGINT NULL,
        condition VARCHAR(100) NOT NULL DEFAULT 'Good',
        description TEXT NULL,
        price DECIMAL(8, 2) NOT NULL,
        status VARCHAR(10) NOT NULL DEFAULT 'pending',
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES catalog_customuser(id),
        FOREIGN KEY (category_id) REFERENCES catalog_category(id)
    );
""")
print("Created new table")

# Migrate data
for sale in existing_sales:
    sale_id, price, status, created_at, book_id, user_id = sale
    book_title = 'Unknown Book'
    author = 'Unknown Author'
    
    if book_id and book_id in book_data:
        book_title, author = book_data[book_id]
    
    cursor.execute("""
        INSERT INTO catalog_sale 
        (id, user_id, book_title, author, category_id, condition, description, price, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (sale_id, user_id, book_title, author, None, 'Good', None, price, status, created_at, created_at))

conn.commit()
print(f"Migrated {len(existing_sales)} sales")

# Verify
cursor.execute("SELECT * FROM catalog_sale;")
sales = cursor.fetchall()
print(f"\nVerification: {len(sales)} sales in new table")
if sales:
    print(f"Sample: {sales[0]}")

conn.close()
print("\n✓ Done! Now run: python manage.py migrate --fake catalog 0003")
