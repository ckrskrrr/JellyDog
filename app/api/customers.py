from flask import Blueprint, request, jsonify
from ..db import get_db
import sqlite3
'''
GET customer info：
curl -X GET "http://127.0.0.1:5000/api/customer/customer-info?uid=1"

POST create customer info：
curl -X POST "http://127.0.0.1:5000/api/customer/customer-info" ^
  -H "Content-Type: application/json" ^
  -d "{\"uid\": 1, \"customer_name\": \"Alice Brown\", \"phone_number\": \"555-1234\", \"street\": \"123 Elm St\", \"city\": \"Davis\", \"state\": \"CA\", \"zip_code\": \"95616\", \"country\": \"USA\"}"

PUT update customer info：
curl -X PUT "http://127.0.0.1:5000/api/customer/customer-info" ^
  -H "Content-Type: application/json" ^
  -d "{\"uid\": 1, \"customer_name\": \"Alice Updated\", \"phone_number\": \"555-9999\", \"street\": \"999 New St\", \"city\": \"Davis\", \"state\": \"CA\", \"zip_code\": \"95618\", \"country\": \"USA\"}"

'''

bp = Blueprint("customer", __name__)


def bad_request(message: str, status_code: int = 400):
    return jsonify({"error": message}), status_code


def normalize_str(value):
    if value is None:
        return ""
    return str(value).strip()


def parse_customer_payload(require_uid: bool = True):
    """
    Parse and validate JSON body for customer info.
    Expected fields:
      uid, customer_name, phone_number, street, city, state, zip_code, country
    Returns (data_dict, error_message or None).
    """
    data = request.get_json(silent=True) or {}

    uid = data.get("uid")
    if require_uid and uid is None:
        return None, "uid is required"

    payload = {
        "uid": uid,
        "customer_name": normalize_str(data.get("customer_name")),
        "phone_number": normalize_str(data.get("phone_number")),
        "street": normalize_str(data.get("street")),
        "city": normalize_str(data.get("city")),
        "state": normalize_str(data.get("state")),
        "zip_code": normalize_str(data.get("zip_code")),
        "country": normalize_str(data.get("country")),
    }

    missing = [
        key for key, value in payload.items()
        if key != "uid" and not value
    ]
    if missing:
        return None, f"missing or empty fields: {', '.join(missing)}"

    return payload, None


# -------------------------------------------------
# GET /api/customer/customer-info?uid=X
# -------------------------------------------------

@bp.get("/customer-info")
def get_customer_info():
    """
    GET /api/user/customer-info?uid=X
    Returns:
      { customer_id, customer_name, phone_number, street, city, state, zip_code, country }
    """
    uid = request.args.get("uid", None)
    if uid is None:
        return bad_request("uid query parameter is required")

    try:
        # uid should be an integer in your schema
        uid_int = int(uid)
    except ValueError:
        return bad_request("uid must be an integer")

    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT customer_id,
                   customer_name,
                   phone_number,
                   street,
                   city,
                   state,
                   zip_code,
                   country
            FROM Customers
            WHERE uid = ?;
            """,
            (uid_int,),
        )
        row = cur.fetchone()

        if row is None:
            return bad_request("customer not found", status_code=404)

        result = {
            "customer_id": row["customer_id"],
            "customer_name": row["customer_name"],
            "phone_number": row["phone_number"],
            "street": row["street"],
            "city": row["city"],
            "state": row["state"],
            "zip_code": row["zip_code"],
            "country": row["country"],
        }
        return jsonify(result), 200

    except sqlite3.Error as e:
        return bad_request(f"database error: {e}")
    

# -------------------------------------------------
# POST /api/customer/customer-info
# -------------------------------------------------

@bp.post("/customer-info")
def create_customer_info():
    """
    POST /api/customer/customer-info
    Body:
      { uid, customer_name, phone_number, street, city, state, zip_code, country }
    Creates a customer record linked to User.uid.
    Returns:
      { customer_id, customer_name, phone_number, street, city, state, zip_code, country }
    """
    payload, error = parse_customer_payload(require_uid=True)
    if error:
        return bad_request(error)

    uid = payload["uid"]
    try:
        uid_int = int(uid)
    except (TypeError, ValueError):
        return bad_request("uid must be an integer")

    try:
        conn = get_db()
        cur = conn.cursor()

        # Ensure this uid doesn't already have a customer record
        cur.execute(
            "SELECT customer_id FROM Customers WHERE uid = ?;",
            (uid_int,),
        )
        existing = cur.fetchone()
        if existing is not None:
            return bad_request("customer info already exists for this user")

        # Insert new customer row
        cur.execute(
            """
            INSERT INTO Customers
              (customer_name, phone_number, street, city, state, zip_code, country, uid)
            VALUES
              (?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                payload["customer_name"],
                payload["phone_number"],
                payload["street"],
                payload["city"],
                payload["state"],
                payload["zip_code"],
                payload["country"],
                uid_int,
            ),
        )
        conn.commit()
        customer_id = cur.lastrowid

        result = {
            "customer_id": customer_id,
            "customer_name": payload["customer_name"],
            "phone_number": payload["phone_number"],
            "street": payload["street"],
            "city": payload["city"],
            "state": payload["state"],
            "zip_code": payload["zip_code"],
            "country": payload["country"],
        }
        return jsonify(result), 200

    except sqlite3.IntegrityError as e:
        return bad_request(f"integrity error: {e}")
    except sqlite3.Error as e:
        return bad_request(f"database error: {e}")


# -------------------------------------------------
# PUT /api/customer/customer-info
# -------------------------------------------------

@bp.put("/customer-info")
def update_customer_info():
    """
    PUT /api/customer/customer-info
    Body:
      { uid, customer_name, phone_number, street, city, state, zip_code, country }
    Updates the existing customer record for this uid.
    Returns:
      { customer_id, ...updated_info }
    """
    payload, error = parse_customer_payload(require_uid=True)
    if error:
        return bad_request(error)

    uid = payload["uid"]
    try:
        uid_int = int(uid)
    except (TypeError, ValueError):
        return bad_request("uid must be an integer")

    try:
        conn = get_db()
        cur = conn.cursor()

        # Check if record exists
        cur.execute(
            """
            SELECT customer_id
            FROM Customers
            WHERE uid = ?;
            """,
            (uid_int,),
        )
        row = cur.fetchone()
        if row is None:
            return bad_request("customer not found", status_code=404)

        customer_id = row["customer_id"]

        # Update record
        cur.execute(
            """
            UPDATE Customers
            SET customer_name = ?,
                phone_number = ?,
                street = ?,
                city = ?,
                state = ?,
                zip_code = ?,
                country = ?
            WHERE uid = ?;
            """,
            (
                payload["customer_name"],
                payload["phone_number"],
                payload["street"],
                payload["city"],
                payload["state"],
                payload["zip_code"],
                payload["country"],
                uid_int,
            ),
        )
        conn.commit()

        result = {
            "customer_id": customer_id,
            "customer_name": payload["customer_name"],
            "phone_number": payload["phone_number"],
            "street": payload["street"],
            "city": payload["city"],
            "state": payload["state"],
            "zip_code": payload["zip_code"],
            "country": payload["country"],
        }
        return jsonify(result), 200

    except sqlite3.Error as e:
        return bad_request(f"database error: {e}")
