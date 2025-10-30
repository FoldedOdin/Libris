#!/usr/bin/env python
"""
Update database schema to match new models
"""

import sqlite3
import os

def update_database():
    db_path = 'db.sqlite3'
    
    if not os.path.exists(db_path):
        print("Database not found!")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("Updating Book table...")
        
        # Check if columns exist
        cursor.execute("PRAGMA table_info(catalog_book)")
        columns = [col[1] for col in cursor.fetchall()]
        print(f"Current columns: {columns}")
        
        # Add missing columns to Book table
        if 'publication_date' not in columns:
            cursor.execute("ALTER TABLE catalog_book ADD COLUMN publication_date DATE NULL")
            print("✓ Added publication_date")
        
        if 'pages' not in columns:
            cursor.execute("ALTER TABLE catalog_book ADD COLUMN pages INTEGER NULL")
            print("✓ Added pages")
        
        if 'language' not in columns:
            cursor.execute("ALTER TABLE catalog_book ADD COLUMN language VARCHAR(50) DEFAULT 'English'")
            print("✓ Added language")
        
        if 'image' not in columns:
            cursor.execute("ALTER TABLE catalog_book ADD COLUMN image VARCHAR(100) NULL")
            print("✓ Added image")
        
        if 'total_copies' not in columns and 'stock' in columns:
            cursor.execute("ALTER TABLE catalog_book RENAME COLUMN stock TO total_copies")
            print("✓ Renamed stock to total_copies")
        
        if 'available_copies' not in columns:
            cursor.execute("ALTER TABLE catalog_book ADD COLUMN available_copies INTEGER DEFAULT 1")
            # Copy total_copies to available_copies
            cursor.execute("UPDATE catalog_book SET available_copies = total_copies")
            print("✓ Added available_copies")
        
        # Remove is_available if it exists (it's now a property)
        if 'is_available' in columns:
            # SQLite doesn't support DROP COLUMN directly, so we'll leave it
            print("⚠ is_available column exists but is now a property")
        
        print("\nUpdating Donation table...")
        cursor.execute("PRAGMA table_info(catalog_donation)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'book_title' not in columns and 'title' in columns:
            cursor.execute("ALTER TABLE catalog_donation RENAME COLUMN title TO book_title")
            print("✓ Renamed title to book_title")
        
        if 'description' not in columns:
            cursor.execute("ALTER TABLE catalog_donation ADD COLUMN description TEXT NULL")
            print("✓ Added description")
        
        if 'updated_at' not in columns:
            cursor.execute("ALTER TABLE catalog_donation ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP")
            print("✓ Added updated_at")
        
        print("\nUpdating Sale table...")
        cursor.execute("PRAGMA table_info(catalog_sale)")
        columns = [col[1] for col in cursor.fetchall()]
        
        # Sale table needs major restructuring - easier to recreate
        if 'book_id' in columns:
            print("⚠ Sale table has old structure, needs manual migration")
            print("  Run: python reset_db.py and python setup.py")
        else:
            if 'author' not in columns:
                cursor.execute("ALTER TABLE catalog_sale ADD COLUMN author VARCHAR(255) DEFAULT ''")
                print("✓ Added author")
            
            if 'condition' not in columns:
                cursor.execute("ALTER TABLE catalog_sale ADD COLUMN condition VARCHAR(100) DEFAULT 'Good'")
                print("✓ Added condition")
            
            if 'description' not in columns:
                cursor.execute("ALTER TABLE catalog_sale ADD COLUMN description TEXT NULL")
                print("✓ Added description")
            
            if 'updated_at' not in columns:
                cursor.execute("ALTER TABLE catalog_sale ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP")
                print("✓ Added updated_at")
        
        print("\nUpdating Transaction table...")
        cursor.execute("PRAGMA table_info(catalog_transaction)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'returned' not in columns:
            cursor.execute("ALTER TABLE catalog_transaction ADD COLUMN returned BOOLEAN DEFAULT 0")
            print("✓ Added returned")
        
        if 'return_date' not in columns:
            cursor.execute("ALTER TABLE catalog_transaction ADD COLUMN return_date DATE NULL")
            print("✓ Added return_date")
        
        conn.commit()
        print("\n✓ Database updated successfully!")
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    update_database()
