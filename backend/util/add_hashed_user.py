#!/usr/bin/env python3
"""
Script to add an admin user with hashed password using PBKDF2
Run this from the backend directory:
    python add_admin_user.py
"""

import sqlite3
import os
import hashlib

def hash_password(plain_password: str) -> tuple[str, str]:
    """
    Hash a password using PBKDF2-HMAC-SHA256.
    Returns (hash_hex, salt_hex).
    """
    # 16 bytes of random salt
    salt = os.urandom(16)
    salt_hex = salt.hex()

    hash_bytes = hashlib.pbkdf2_hmac(
        "sha256",
        plain_password.encode("utf-8"),
        salt,
        100_000,
    )
    hash_hex = hash_bytes.hex()
    return hash_hex, salt_hex


# Connect to database (adjust path if needed)
conn = sqlite3.connect('database.db')  # Adjust path if your db is elsewhere
cur = conn.cursor()

# Admin user details
username = "admin"  
password = "admin" 

# Check if user already exists
cur.execute("SELECT uid FROM user WHERE user_name = ?;", (username,))
existing = cur.fetchone()

if existing:
    print(f"❌ User '{username}' already exists (uid={existing[0]})")
    print(f"Updating password and role to admin for '{username}'...")
    
    # Hash the new password
    password_hash, password_salt = hash_password(password)
    
    # Update existing user with admin role
    cur.execute(
        "UPDATE user SET password_hash = ?, password_salt = ?, role = 'admin' WHERE user_name = ?;",
        (password_hash, password_salt, username)
    )
    conn.commit()
    print("✅ Password updated and role set to admin!")
else:
    print(f"Creating new admin user '{username}'...")
    
    # Hash the password
    password_hash, password_salt = hash_password(password)
    
    # Insert new user with 'admin' role
    cur.execute(
        """
        INSERT INTO user (user_name, password_hash, password_salt, role)
        VALUES (?, ?, ?, 'admin');
        """,
        (username, password_hash, password_salt)  # Changed role to 'admin'
    )
    conn.commit()
    uid = cur.lastrowid
    print(f"✅ Admin user created with uid={uid}")

# Verify
cur.execute("SELECT uid, user_name, role, password_hash, password_salt FROM user WHERE user_name = ?;", (username,))
row = cur.fetchone()

print(f"\n📋 Admin User Details:")
print(f"   UID: {row[0]}")
print(f"   Username: {row[1]}")
print(f"   Role: {row[2]}")  # Should show 'admin'
print(f"   Password Hash: {row[3][:32]}... (truncated)")
print(f"   Password Salt: {row[4][:32]}... (truncated)")

conn.close()

print("\n✅ Done! You can now login with:")
print(f"   Username: {username}")
print(f"   Password: {password}")
print(f"   Role: admin")
print("\nTest with curl:")
print(f'curl -X POST http://127.0.0.1:5000/api/auth/login \\')
print(f'  -H "Content-Type: application/json" \\')
print(f'  -d \'{{"user_name": "{username}", "password": "{password}"}}\'')