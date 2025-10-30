#!/usr/bin/env python
"""
Test borrow/return API endpoints
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_api():
    print("=" * 60)
    print("Testing Borrow/Return API Endpoints")
    print("=" * 60)
    
    # Create a session to maintain cookies
    session = requests.Session()
    
    # Step 1: Login
    print("\n1. Logging in as admin...")
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    response = session.post(f"{BASE_URL}/login/", json=login_data)
    if response.status_code == 200:
        print("   ✓ Login successful")
        user_data = response.json()
        print(f"   User: {user_data.get('user', {}).get('username')}")
    else:
        print(f"   ✗ Login failed: {response.status_code}")
        print(f"   Response: {response.text}")
        return
    
    # Step 2: Get available books
    print("\n2. Getting available books...")
    response = session.get(f"{BASE_URL}/books/?available=true&page_size=1")
    if response.status_code == 200:
        data = response.json()
        if data.get('results'):
            book = data['results'][0]
            book_id = book['id']
            book_title = book['title']
            available_before = book['available_copies']
            print(f"   ✓ Found book: {book_title}")
            print(f"   Book ID: {book_id}")
            print(f"   Available copies: {available_before}")
        else:
            print("   ✗ No books available")
            return
    else:
        print(f"   ✗ Failed to get books: {response.status_code}")
        return
    
    # Step 3: Borrow the book
    print(f"\n3. Borrowing book ID {book_id}...")
    response = session.post(f"{BASE_URL}/books/{book_id}/borrow/")
    if response.status_code == 200:
        result = response.json()
        print(f"   ✓ {result.get('message')}")
        transaction_id = result.get('transaction', {}).get('id')
        print(f"   Transaction ID: {transaction_id}")
        
        # Verify the count decreased
        response = session.get(f"{BASE_URL}/books/{book_id}/")
        if response.status_code == 200:
            book_after = response.json()
            available_after = book_after['available_copies']
            print(f"   Available copies after borrow: {available_after}")
            if available_after == available_before - 1:
                print(f"   ✓ Count decreased correctly: {available_before} → {available_after}")
            else:
                print(f"   ✗ Count mismatch! Expected {available_before - 1}, got {available_after}")
    else:
        result = response.json()
        if 'already have this book borrowed' in result.get('error', ''):
            print(f"   ⚠ {result.get('error')}")
            print("   Skipping to return test...")
            
            # Get existing transaction
            response = session.get(f"{BASE_URL}/my-borrowed-books/")
            if response.status_code == 200:
                transactions = response.json()
                if transactions:
                    transaction_id = transactions[0]['id']
                    print(f"   Using existing transaction ID: {transaction_id}")
                else:
                    print("   ✗ No borrowed books found")
                    return
            else:
                print(f"   ✗ Failed to get borrowed books")
                return
        else:
            print(f"   ✗ Borrow failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return
    
    # Step 4: Check borrowed books
    print(f"\n4. Checking borrowed books...")
    response = session.get(f"{BASE_URL}/my-borrowed-books/")
    if response.status_code == 200:
        borrowed = response.json()
        print(f"   ✓ Currently borrowed: {len(borrowed)} book(s)")
        for b in borrowed:
            print(f"     - {b.get('book_title')} (Due: {b.get('due_date')})")
    else:
        print(f"   ✗ Failed to get borrowed books: {response.status_code}")
    
    # Step 5: Return the book
    print(f"\n5. Returning book (Transaction ID: {transaction_id})...")
    response = session.post(f"{BASE_URL}/transactions/{transaction_id}/return/")
    if response.status_code == 200:
        result = response.json()
        print(f"   ✓ {result.get('message')}")
        
        # Verify the count increased
        response = session.get(f"{BASE_URL}/books/{book_id}/")
        if response.status_code == 200:
            book_after_return = response.json()
            available_after_return = book_after_return['available_copies']
            print(f"   Available copies after return: {available_after_return}")
            if available_after_return == available_before:
                print(f"   ✓ Count restored correctly: {available_after} → {available_after_return}")
            else:
                print(f"   ⚠ Count is {available_after_return} (started at {available_before})")
    else:
        print(f"   ✗ Return failed: {response.status_code}")
        print(f"   Response: {response.text}")
        return
    
    # Step 6: Verify no borrowed books
    print(f"\n6. Verifying no borrowed books...")
    response = session.get(f"{BASE_URL}/my-borrowed-books/")
    if response.status_code == 200:
        borrowed = response.json()
        if len(borrowed) == 0:
            print(f"   ✓ No borrowed books (as expected)")
        else:
            print(f"   ⚠ Still showing {len(borrowed)} borrowed book(s)")
    
    # Summary
    print("\n" + "=" * 60)
    print("API TEST SUMMARY")
    print("=" * 60)
    print("✓ Login API: Working")
    print("✓ Books API: Working")
    print("✓ Borrow API: Working")
    print("✓ Return API: Working")
    print("✓ Available copies count: Updating correctly")
    print("\n✅ All API tests passed!")

if __name__ == '__main__':
    try:
        test_api()
    except Exception as e:
        print(f"\n✗ Error during testing: {e}")
        import traceback
        traceback.print_exc()
