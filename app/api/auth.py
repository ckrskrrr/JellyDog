from flask import Blueprint, request, jsonify
from ..db import get_db
import sqlite3
import os
import hashlib
import hmac
'''
Api tests:
register:
curl -X POST http://127.0.0.1:5000/api/auth/register ^
     -H "Content-Type: application/json" ^
     -d "{\"user_name\": \"alice\", \"password\": \"secret123\"}"

login:
curl -X POST http://127.0.0.1:5000/api/auth/login ^
     -H "Content-Type: application/json" ^
     -d "{\"user_name\": \"alice\", \"password\": \"secret123\"}"
'''

bp = Blueprint("auth", __name__)

# ------------------------
# Helpers
# ------------------------

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


def verify_password(plain_password: str, stored_hash_hex: str, stored_salt_hex: str) -> bool:
    """
    Recompute PBKDF2 hash and compare with stored value.
    Uses constant-time comparison.
    """
    try:
        salt = bytes.fromhex(stored_salt_hex)
    except ValueError:
        # malformed salt in DB
        return False

    new_hash_bytes = hashlib.pbkdf2_hmac(
        "sha256",
        plain_password.encode("utf-8"),
        salt,
        100_000,
    )
    new_hash_hex = new_hash_bytes.hex()
    return hmac.compare_digest(new_hash_hex, stored_hash_hex)


def bad_request(message: str, status_code: int = 400):
    return jsonify({"error": message}), status_code


# ------------------------
# Routes
# ------------------------

@bp.post("/register")
def register():
    """
    POST /api/auth/register
    Body: { "user_name": "...", "password": "..." }

    Behavior:
    - Validate input
    - Check if user_name already exists
    - Hash password and insert new row into User (role = 'customer')
    - Return: 200 { uid, user_name, role } on success
             400 { error: ... } on failure
    """
    data = request.get_json(silent=True) or {}

    user_name = (data.get("user_name") or "").strip()
    password = data.get("password") or ""

    # Basic validation
    if not user_name or not password:
        return bad_request("user_name and password are required")

    if len(user_name) > 255:
        return bad_request("user_name is too long")
    if len(password) < 6:
        return bad_request("password must be at least 6 characters")

    try:
        conn = get_db()
        cur = conn.cursor()

        # Check if user_name already exists
        cur.execute("SELECT uid FROM User WHERE user_name = ?;", (user_name,))
        existing = cur.fetchone()
        if existing is not None:
            return bad_request("user_name already exists")

        # Hash password
        password_hash, password_salt = hash_password(password)

        # Insert new user (role = 'customer')
        cur.execute(
            """
            INSERT INTO User (user_name, password_hash, password_salt, role)
            VALUES (?, ?, ?, 'customer');
            """,
            (user_name, password_hash, password_salt),
        )
        conn.commit()

        uid = cur.lastrowid

        return jsonify(
            {
                "uid": uid,
                "user_name": user_name,
                "role": "customer",
            }
        ), 200

    except sqlite3.Error as e:
        return bad_request(f"database error: {e}")


@bp.post("/login")
def login():
    """
    POST /api/auth/login
    Body: { "user_name": "...", "password": "..." }

    Behavior:
    - Validate input
    - Load user by user_name
    - Verify password
    - Return: 200 { uid, user_name, role } on success
             400 { error: "invalid credentials" } on failure
    """
    data = request.get_json(silent=True) or {}

    user_name = (data.get("user_name") or "").strip()
    password = data.get("password") or ""

    if not user_name or not password:
        return bad_request("user_name and password are required")

    try:
        conn = get_db()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT uid, user_name, role, password_hash, password_salt
            FROM User
            WHERE user_name = ?;
            """,
            (user_name,),
        )
        row = cur.fetchone()

        if row is None:
            # Do not reveal whether user_name exists
            return bad_request("invalid credentials")

        stored_hash = row["password_hash"]
        stored_salt = row["password_salt"]

        if not verify_password(password, stored_hash, stored_salt):
            return bad_request("invalid credentials")

        # Successful login
        return jsonify(
            {
                "uid": row["uid"],
                "user_name": row["user_name"],
                "role": row["role"],
            }
        ), 200

    except sqlite3.Error as e:
        return bad_request(f"database error: {e}")
