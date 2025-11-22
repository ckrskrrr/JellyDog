from flask import Blueprint, request, jsonify
from ..db import get_db
import sqlite3

bp = Blueprint("cart", __name__)


def bad_request(message: str, status_code: int = 400):
    return jsonify({"error": message}), status_code


# -------------------------------------------------
# GET /api/cart
# Query: ?customer_id=X&store_id=Y
# Gets order with status='in_cart' for specific store
# Returns:
#   {
#     order_id,
#     items: [
#       { order_item_id, product_id, product_name, unit_price, quantity, img_url }
#     ],
#     total_price
#   }
# -------------------------------------------------

@bp.get("")
def get_cart():
    customer_id = request.args.get("customer_id")
    store_id = request.args.get("store_id")

    if customer_id is None or store_id is None:
        return bad_request("customer_id and store_id are required")

    try:
        customer_id = int(customer_id)
        store_id = int(store_id)
    except ValueError:
        return bad_request("customer_id and store_id must be integers")

    try:
        conn = get_db()
        cur = conn.cursor()

        # Find active cart for this customer + store
        cur.execute(
            """
            SELECT order_id
            FROM "order"
            WHERE customer_id = ?
              AND store_id = ?
              AND status = 'in_cart';
            """,
            (customer_id, store_id),
        )
        order_row = cur.fetchone()

        if order_row is None:
            # No cart yet → return empty cart
            return jsonify(
                {
                    "order_id": None,
                    "items": [],
                    "total_price": 0.0,
                }
            ), 200

        order_id = order_row["order_id"]

        # Load items in the cart
        cur.execute(
            """
            SELECT
                oi.order_item_id,
                oi.product_id,
                oi.unit_price,
                oi.quantity,
                p.product_name,
                p.img_url
            FROM order_item AS oi
            JOIN products AS p
              ON oi.product_id = p.product_id
            WHERE oi.order_id = ?
              AND oi.is_return = 0;
            """,
            (order_id,),
        )

        rows = cur.fetchall()

        items = []
        total_price = 0.0
        for row in rows:
            quantity = row["quantity"] or 0
            unit_price = float(row["unit_price"])
            items.append(
                {
                    "order_item_id": row["order_item_id"],
                    "product_id": row["product_id"],
                    "product_name": row["product_name"],
                    "unit_price": unit_price,
                    "quantity": quantity,
                    "img_url": row["img_url"],
                }
            )
            total_price += unit_price * quantity

        return jsonify(
            {
                "order_id": order_id,
                "items": items,
                "total_price": total_price,
            }
        ), 200

    except sqlite3.Error as e:
        return bad_request(f"database error: {e}")


# -------------------------------------------------
# POST /api/cart/add_to_cart
# Body: { customer_id, product_id, quantity, store_id }
# Adds item to cart (creates order with status='in_cart' if needed)
# Returns: { order_item_id, product_id, quantity }
# -------------------------------------------------

@bp.post("/add_to_cart")
def add_to_cart():
    data = request.get_json(silent=True) or {}

    customer_id = data.get("customer_id")
    product_id = data.get("product_id")
    quantity = data.get("quantity")
    store_id = data.get("store_id")

    if customer_id is None or product_id is None or quantity is None or store_id is None:
        return bad_request("customer_id, product_id, quantity, and store_id are required")

    try:
        customer_id = int(customer_id)
        product_id = int(product_id)
        quantity = int(quantity)
        store_id = int(store_id)
    except (TypeError, ValueError):
        return bad_request("customer_id, product_id, quantity, and store_id must be integers")

    if quantity <= 0:
        return bad_request("quantity must be a positive integer")

    try:
        conn = get_db()
        cur = conn.cursor()

        # 1. Find or create in_cart order for this customer + store
        cur.execute(
            """
            SELECT order_id
            FROM "order"
            WHERE customer_id = ?
              AND store_id = ?
              AND status = 'in_cart';
            """,
            (customer_id, store_id),
        )
        row = cur.fetchone()

        if row is None:
            cur.execute(
                """
                INSERT INTO "order" (customer_id, store_id, status, total_price, order_datetime)
                VALUES (?, ?, 'in_cart', 0, CURRENT_TIMESTAMP);
                """,
                (customer_id, store_id),
            )
            order_id = cur.lastrowid
        else:
            order_id = row["order_id"]

        # 2. Check if this product already exists for this order (non-returned)
        cur.execute(
            """
            SELECT order_item_id, quantity
            FROM order_item
            WHERE order_id = ?
              AND product_id = ?
              AND is_return = 0;
            """,
            (order_id, product_id),
        )
        item_row = cur.fetchone()

        if item_row is not None:
            # Already in cart → increase quantity
            existing_qty = item_row["quantity"] or 0
            new_qty = existing_qty + quantity

            cur.execute(
                """
                UPDATE order_item
                SET quantity = ?
                WHERE order_item_id = ?;
                """,
                (new_qty, item_row["order_item_id"]),
            )
            order_item_id = item_row["order_item_id"]
            final_quantity = new_qty

        else:
            # Need product price for unit_price
            cur.execute(
                """
                SELECT price
                FROM products
                WHERE product_id = ?;
                """,
                (product_id,),
            )
            price_row = cur.fetchone()
            if price_row is None:
                return bad_request("product not found")

            unit_price = float(price_row["price"])

            cur.execute(
                """
                INSERT INTO order_item (order_id, product_id, unit_price, quantity, is_return)
                VALUES (?, ?, ?, ?, 0);
                """,
                (order_id, product_id, unit_price, quantity),
            )
            order_item_id = cur.lastrowid
            final_quantity = quantity

        conn.commit()

        return jsonify(
            {
                "order_item_id": order_item_id,
                "product_id": product_id,
                "quantity": final_quantity,
            }
        ), 200

    except sqlite3.IntegrityError as e:
        return bad_request(f"integrity error: {e}")
    except sqlite3.Error as e:
        return bad_request(f"database error: {e}")


# -------------------------------------------------
# PUT /api/cart/items/<order_item_id>
# Body: { customer_id, quantity }   (No zero allowed)
# Updates cart item quantity
# Returns: { order_item_id, quantity }
# -------------------------------------------------

@bp.put("/items/<int:order_item_id>")
def update_cart_item(order_item_id: int):
    data = request.get_json(silent=True) or {}

    customer_id = data.get("customer_id")
    quantity = data.get("quantity")

    if customer_id is None or quantity is None:
        return bad_request("customer_id and quantity are required")

    try:
        customer_id = int(customer_id)
        quantity = int(quantity)
    except (TypeError, ValueError):
        return bad_request("customer_id and quantity must be integers")

    if quantity <= 0:
        return bad_request("quantity must be at least 1")

    try:
        conn = get_db()
        cur = conn.cursor()

        # Verify that this order_item belongs to an in_cart order for this customer
        cur.execute(
            """
            SELECT oi.order_item_id
            FROM order_item AS oi
            JOIN "order" AS o
              ON oi.order_id = o.order_id
            WHERE oi.order_item_id = ?
              AND o.customer_id = ?
              AND o.status = 'in_cart';
            """,
            (order_item_id, customer_id),
        )
        row = cur.fetchone()

        if row is None:
            return bad_request("cart item not found for this customer", status_code=404)

        cur.execute(
            """
            UPDATE order_item
            SET quantity = ?
            WHERE order_item_id = ?;
            """,
            (quantity, order_item_id),
        )

        conn.commit()

        return jsonify(
            {
                "order_item_id": order_item_id,
                "quantity": quantity,
            }
        ), 200

    except sqlite3.Error as e:
        return bad_request(f"database error: {e}")


# -------------------------------------------------
# DELETE /api/cart/items/<order_item_id>
# Body: { customer_id }
# Removes item from cart
# Returns: { success: true }
# -------------------------------------------------

@bp.delete("/items/<int:order_item_id>")
def remove_cart_item(order_item_id: int):
    data = request.get_json(silent=True) or {}

    customer_id = data.get("customer_id")

    if customer_id is None:
        return bad_request("customer_id is required")

    try:
        customer_id = int(customer_id)
    except (TypeError, ValueError):
        return bad_request("customer_id must be an integer")

    try:
        conn = get_db()
        cur = conn.cursor()

        # Verify that this order_item belongs to an in_cart order for this customer
        cur.execute(
            """
            SELECT oi.order_id
            FROM order_item AS oi
            JOIN "order" AS o
              ON oi.order_id = o.order_id
            WHERE oi.order_item_id = ?
              AND o.customer_id = ?
              AND o.status = 'in_cart';
            """,
            (order_item_id, customer_id),
        )
        row = cur.fetchone()

        if row is None:
            return bad_request("cart item not found for this customer", status_code=404)

        order_id = row["order_id"]

        # Delete the item
        cur.execute(
            """
            DELETE FROM order_item
            WHERE order_item_id = ?;
            """,
            (order_item_id,),
        )

        # Optionally, you could also delete the order if it has no more items.
        # For this project, leaving an empty in_cart order is acceptable.
        # If you want to clean it up:
        # cur.execute(
        #     "SELECT 1 FROM order_item WHERE order_id = ? LIMIT 1;",
        #     (order_id,),
        # )
        # if cur.fetchone() is None:
        #     cur.execute(
        #         'DELETE FROM "order" WHERE order_id = ?;',
        #         (order_id,),
        #     )

        conn.commit()

        return jsonify({"success": True}), 200

    except sqlite3.Error as e:
        return bad_request(f"database error: {e}")
