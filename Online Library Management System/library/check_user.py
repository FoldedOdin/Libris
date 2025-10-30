#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library.settings')
django.setup()

from catalog.models import CustomUser
from django.contrib.auth import authenticate

print("Checking admin user...")
print("=" * 60)

try:
    user = CustomUser.objects.get(username='admin')
    print(f"✓ User found: {user.username}")
    print(f"  Email: {user.email}")
    print(f"  Is staff: {user.is_staff}")
    print(f"  Is superuser: {user.is_superuser}")
    print(f"  Is active: {user.is_active}")
    print(f"  Role: {user.role}")
    
    # Test authentication
    print("\nTesting authentication...")
    auth_user = authenticate(username='admin', password='admin123')
    if auth_user:
        print(f"✓ Authentication successful!")
    else:
        print(f"✗ Authentication failed!")
        print("\nTrying to reset password...")
        user.set_password('admin123')
        user.save()
        print("✓ Password reset to 'admin123'")
        
        # Test again
        auth_user = authenticate(username='admin', password='admin123')
        if auth_user:
            print(f"✓ Authentication now works!")
        else:
            print(f"✗ Still failing")
            
except CustomUser.DoesNotExist:
    print("✗ Admin user not found!")
    print("\nCreating admin user...")
    user = CustomUser.objects.create_superuser(
        username='admin',
        email='admin@library.com',
        password='admin123',
        role='admin'
    )
    user.is_staff = True
    user.save()
    print(f"✓ Admin user created!")
    print(f"  Username: admin")
    print(f"  Password: admin123")
