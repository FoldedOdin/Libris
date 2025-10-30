#!/usr/bin/env python
"""
Reset database script - WARNING: This will delete all data!
"""

import os
import sys
import shutil

def reset_database():
    """Delete database and migrations, then recreate"""
    
    print("=" * 60)
    print("DATABASE RESET SCRIPT")
    print("=" * 60)
    print("\nWARNING: This will delete all data!")
    
    # Paths
    db_path = 'db.sqlite3'
    migrations_dir = 'catalog/migrations'
    
    # Delete database
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
            print(f"✓ Deleted {db_path}")
        except Exception as e:
            print(f"✗ Could not delete {db_path}: {e}")
            print("  Please close any programs using the database and try again")
            return False
    
    # Delete migration files (except __init__.py)
    if os.path.exists(migrations_dir):
        for file in os.listdir(migrations_dir):
            if file.endswith('.py') and file != '__init__.py':
                file_path = os.path.join(migrations_dir, file)
                try:
                    os.remove(file_path)
                    print(f"✓ Deleted {file_path}")
                except Exception as e:
                    print(f"✗ Could not delete {file_path}: {e}")
    
    # Delete __pycache__
    pycache_dir = os.path.join(migrations_dir, '__pycache__')
    if os.path.exists(pycache_dir):
        try:
            shutil.rmtree(pycache_dir)
            print(f"✓ Deleted {pycache_dir}")
        except Exception as e:
            print(f"✗ Could not delete {pycache_dir}: {e}")
    
    print("\n" + "=" * 60)
    print("✓ Database reset complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Run: python manage.py makemigrations")
    print("2. Run: python manage.py migrate")
    print("3. Run: python setup.py")
    
    return True

if __name__ == '__main__':
    reset_database()
