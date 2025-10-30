import sqlite3
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library.settings')
django.setup()

from django.conf import settings

db_path = settings.DATABASES['default']['NAME']
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(catalog_sale);")
columns = cursor.fetchall()

print("Current catalog_sale table structure:")
for col in columns:
    print(f"  {col[0]}: {col[1]} ({col[2]}) - NULL: {col[3]}, Default: {col[4]}")

# Check sample data
cursor.execute("SELECT * FROM catalog_sale LIMIT 1;")
sample = cursor.fetchone()
if sample:
    print(f"\nSample record: {sample}")

conn.close()
