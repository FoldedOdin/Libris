import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library.settings')
django.setup()

from catalog.models import Sale
from catalog.serializers import SaleSerializer

# Get all sales
sales = Sale.objects.all()
print(f"Total sales: {sales.count()}")

for sale in sales:
    print(f"\nSale ID: {sale.id}")
    print(f"  Book: {sale.book_title} by {sale.author}")
    print(f"  User: {sale.user.username}")
    print(f"  Price: ${sale.price}")
    print(f"  Status: {sale.status}")
    
    # Test serializer
    serializer = SaleSerializer(sale)
    print(f"  Serialized: {serializer.data}")
