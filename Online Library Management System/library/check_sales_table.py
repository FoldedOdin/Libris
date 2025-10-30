import os
import django
import sqlite3

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library.settings')
django.setup()

from django.conf import settings

# Connect to the database
db_path = settings.DATABASES['default']['NAME']
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check if catalog_sale table exists
cursor.execute("""
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='catalog_sale';
""")

result = cursor.fetchone()

if result:
    print("✓ catalog_sale table EXISTS")
    
    # Get table structure
    cursor.execute("PRAGMA table_info(catalog_sale);")
    columns = cursor.fetchall()
    print("\nTable structure:")
    for col in columns:
        print(f"  - {col[1]} ({col[2]})")
    
    # Count records
    cursor.execute("SELECT COUNT(*) FROM catalog_sale;")
    count = cursor.fetchone()[0]
    print(f"\nTotal sales records: {count}")
    
    if count > 0:
        cursor.execute("SELECT * FROM catalog_sale LIMIT 3;")
        sales = cursor.fetchall()
        print("\nSample records:")
        for sale in sales:
            print(f"  {sale}")
else:
    print("✗ catalog_sale table DOES NOT EXIST")
    print("\nThis is why you're getting 500 errors!")
    print("The Sale model exists in the code but the database table hasn't been created.")

conn.close()
