#!/usr/bin/env python
"""
Test login API endpoint
"""

import requests
import json

def test_login():
    print("Testing Login API")
    print("=" * 60)
    
    # Test 1: Get CSRF token
    print("\n1. Getting CSRF token...")
    session = requests.Session()
    
    try:
        response = session.get("http://localhost:8000/api/csrf/")
        if response.status_code == 200:
            csrf_data = response.json()
            csrf_token = csrf_data.get('csrfToken')
            print(f"   ✓ CSRF token obtained: {csrf_token[:20]}...")
        else:
            print(f"   ✗ Failed to get CSRF token: {response.status_code}")
            csrf_token = None
    except Exception as e:
        print(f"   ✗ Error getting CSRF token: {e}")
        csrf_token = None
    
    # Test 2: Login with admin credentials
    print("\n2. Testing login with admin credentials...")
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    headers = {
        "Content-Type": "application/json",
    }
    
    if csrf_token:
        headers["X-CSRFToken"] = csrf_token
    
    try:
        response = session.post(
            "http://localhost:8000/api/login/",
            json=login_data,
            headers=headers
        )
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text[:200]}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Login successful!")
            print(f"   User: {data.get('user', {}).get('username')}")
            print(f"   Is Staff: {data.get('user', {}).get('is_staff')}")
            
            # Test 3: Get current user
            print("\n3. Testing current user endpoint...")
            response = session.get("http://localhost:8000/api/user/")
            if response.status_code == 200:
                user_data = response.json()
                print(f"   ✓ Current user: {user_data.get('username')}")
            else:
                print(f"   ✗ Failed to get current user: {response.status_code}")
        else:
            print(f"   ✗ Login failed!")
            try:
                error_data = response.json()
                print(f"   Error: {error_data}")
            except:
                pass
                
    except Exception as e:
        print(f"   ✗ Error during login: {e}")
    
    # Test 4: Test with wrong credentials
    print("\n4. Testing with wrong credentials...")
    wrong_data = {
        "username": "admin",
        "password": "wrongpassword"
    }
    
    try:
        response = session.post(
            "http://localhost:8000/api/login/",
            json=wrong_data,
            headers=headers
        )
        
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 400:
            print(f"   ✓ Correctly rejected wrong password")
            error_data = response.json()
            print(f"   Error message: {error_data}")
        else:
            print(f"   ⚠ Unexpected status code")
            
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    print("\n" + "=" * 60)
    print("Test Complete")

if __name__ == '__main__':
    test_login()
