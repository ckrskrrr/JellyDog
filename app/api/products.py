from flask import Blueprint, request, jsonify
from ..db import get_db
import sqlite3

bp = Blueprint("products", __name__)


def bad_request(message: str, status_code: int = 400):
    return jsonify({"error": message}), status_code


# -------------------------------------------------
# GET /api/products/?store_id=X&product_id=Y
# -------------------------------------------------

@bp.get("/")
def get_product_for_store():
    """
    GET /api/products/?store_id=X&product_id=Y

    Returns a single product (for that store) with stock:
      {
        product_id,
        product_name,
        category,
        price,
        img_url,
        stock
      }

    Stock is from Store_Inventory for the specified store.
    """
    store_id = request.args.get("store_id")
    # accept both correct and typo'd key to be robust
    product_id = request.args.get("product_id") or request.args.get("poduct_id")

    if store_id is None or product_id is None:
        return bad_request("store_id and product_id are required")

    try:
        store_id_int = int(store_id)
        product_id_int = int(product_id)
    except ValueError:
        return bad_request("store_id and product_id must be integers")

    try:
        conn = get_db()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT 
                p.product_id,
                p.product_name,
                p.category,
                p.price,
                p.img_url,
                si.stock
            FROM Products AS p
            JOIN Store_Inventory AS si
              ON si.product_id = p.product_id
            WHERE si.store_id = ?
              AND p.product_id = ?;
            """,
            (store_id_int, product_id_int),
        )

        row = cur.fetchone()
        if row is None:
            # No matching product for this store
            return bad_request("product not found for this store", status_code=404)

        result = {
            "product_id": row["product_id"],
            "product_name": row["product_name"],
            "category": row["category"],
            "price": row["price"],
            "img_url": row["img_url"],
            "stock": row["stock"],
        }

        return jsonify(result), 200

    except sqlite3.Error as e:
        return bad_request(f"database error: {e}")
    

# -------------------------------------------------
# GET /api/products/search?q=search_term&store_id=X
# -------------------------------------------------

@bp.get("/search")
def search_products_for_store():
    """
    GET /api/products/search?q=search_term&store_id=X

    Returns a list of products whose names contain the search term
    (case-insensitive, depending on SQLite collation) and their stock
    at the specified store:

      [
        {
          product_id,
          product_name,
          category,
          price,
          img_url,
          stock
        },
        ...
      ]
    """
    q = request.args.get("q", "")
    store_id = request.args.get("store_id")

    if store_id is None:
        return bad_request("store_id is required")

    # Require non-empty search term (matches your requirement text)
    q = q.strip()
    if not q:
        return bad_request("q (search term) is required")

    try:
        store_id_int = int(store_id)
    except ValueError:
        return bad_request("store_id must be an integer")

    try:
        conn = get_db()
        cur = conn.cursor()

        # Use LIKE with wildcards for substring match
        like_pattern = f"%{q}%"

        cur.execute(
            """
            SELECT 
                p.product_id,
                p.product_name,
                p.category,
                p.price,
                p.img_url,
                si.stock
            FROM Store_Inventory AS si
            JOIN Products AS p
              ON si.product_id = p.product_id
            WHERE si.store_id = ?
              AND p.product_name LIKE ?;
            """,
            (store_id_int, like_pattern),
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
