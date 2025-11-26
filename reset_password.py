import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library.settings')
sys.path.insert(0, 'Online Library Management System/library')
django.setup()

from catalog.models import CustomUser

username = input("Enter username: ")
new_password = input("Enter new password: ")

try:
    user = CustomUser.objects.get(username=username)
    user.set_password(new_password)
    user.save()
    print(f"✓ Password reset successfully for user: {username}")
    print(f"  You can now login with:")
    print(f"  Username: {username}")
    print(f"  Password: {new_password}")
except CustomUser.DoesNotExist:
    print(f"✗ User '{username}' not found")
except Exception as e:
    print(f"✗ Error: {e}")
