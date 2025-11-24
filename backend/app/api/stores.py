from flask import Blueprint, request, jsonify
from ..db import get_db
import sqlite3
'''
List all stores:
curl -X GET "http://127.0.0.1:5000/api/stores"

List products in store 5:
curl -X GET "http://127.0.0.1:5000/api/stores/products?store_id=5"
'''

bp = Blueprint("stores", __name__)


def bad_request(message: str, status_code: int = 400):
    return jsonify({"error": message}), status_code


# -------------------------------------------------
# GET /api/stores
# -------------------------------------------------

@bp.get("")
def list_stores():
    """
    Returns:
      [
        { store_id, street, city, state, zip }
      ]
    """
    try:
        conn = get_db()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT store_id, street, city, state, zip
            FROM Store;
            """
        )

        rows = cur.fetchall()

        stores = [
            {
                "store_id": row["store_id"],
                "street": row["street"],
                "city": row["city"],
                "state": row["state"],
                "zip": row["zip"],
            }
            for row in rows
        ]

        return jsonify(stores), 200

    except sqlite3.Error as e:
        return bad_request(f"database error: {e}")
    

# -------------------------------------------------
# GET /api/stores/products?store_id=X
# -------------------------------------------------

@bp.get("/products")
def list_store_products():
    """
    GET /api/stores/products?store_id=X

    Returns:
      [
        {
            product_id,
            product_name,
            category,
            price,
            img_url,
            stock
        }
      ]
    """

    store_id = request.args.get("store_id", None)

    if store_id is None:
        return bad_request("store_id is required")

    try:
        store_id_int = int(store_id)
    except ValueError:
        return bad_request("store_id must be an integer")

    try:
        conn = get_db()
        cur = conn.cursor()

        # JOIN Products + Store_Inventory
        cur.execute(
            """
            SELECT 
                Products.product_id,
                Products.product_name,
                Products.category,
                Products.price,
                Products.img_url,
                Store_Inventory.stock
            FROM Store_Inventory
            JOIN Products
              ON Store_Inventory.product_id = Products.product_id
            WHERE Store_Inventory.store_id = ?;
            """,
            (store_id_int,),
        )

        rows = cur.fetchall()

        products = [
            {
                "product_id": row["product_id"],
                "product_name": row["product_name"],
                "category": row["category"],
                "price": row["price"],
                "img_url": row["img_url"],
                "stock": row["stock"],
            }
            for row in rows
        ]

        return jsonify(products), 200

    except sqlite3.Error as e:
        return bad_request(f"database error: {e}")

