from flask import Blueprint, request, jsonify
from ..db import get_db
import sqlite3

bp = Blueprint("orders", __name__)


def bad_request(message: str, status_code: int = 400):
    return jsonify({"error": message}), status_code


# -------------------------------------------------
# POST /api/orders/checkout
# Body: { customer_id, store_id }
# Converts cart (status='in_cart') to completed order (status='complete')
# Reduces stock in Store_Inventory
# Returns: { order_id, total_price, status }
# -------------------------------------------------

@bp.post("/checkout")
def checkout_order():
    data = request.get_json(silent=True) or {}

    customer_id = data.get("customer_id")
    store_id = data.get("store_id")

    if customer_id is None or store_id is None:
        return bad_request("customer_id and store_id are required")

    try:
        customer_id = int(customer_id)
        store_id = int(store_id)
    except (TypeError, ValueError):
        return bad_request("customer_id and store_id must be integers")

    try:
        conn = get_db()
        cur = conn.cursor()

        # Find the active cart
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
            return bad_request("no active cart for this customer and store", status_code=404)

        order_id = row["order_id"]

        # Load items in the cart (non-returned items)
        cur.execute(
            """
            SELECT 
                oi.product_id,
                oi.quantity,
                p.price,
                COALESCE(si.stock, 0) AS stock
            FROM order_item AS oi
            JOIN products AS p
              ON oi.product_id = p.product_id
            LEFT JOIN store_inventory AS si
              ON si.product_id = oi.product_id
             AND si.store_id = ?
            WHERE oi.order_id = ?
              AND oi.is_return = 0;
            """,
            (store_id, order_id),
        )

        items = cur.fetchall()

        if not items:
            return bad_request("cart is empty", status_code=400)

        # Check stock availability
        for item in items:
            if item["stock"] < item["quantity"]:
                return bad_request("insufficient stock for one or more items")

        # Compute total price
        total_price = sum(float(item["price"]) * int(item["quantity"]) for item in items)

        # Deduct stock + complete the order
        try:
            for item in items:
                cur.execute(
                    """
                    UPDATE store_inventory
                    SET stock = stock - ?
                    WHERE store_id = ?
                      AND product_id = ?;
                    """,
                    (item["quantity"], store_id, item["product_id"]),
                )

            cur.execute(
                """
                UPDATE "order"
                SET status = 'complete',
                    total_price = ?,
                    order_datetime = CURRENT_TIMESTAMP
                WHERE order_id = ?;
                """,
                (total_price, order_id),
            )

            conn.commit()

        except sqlite3.Error as e:
            conn.rollback()
            return bad_request(f"database error during checkout: {e}")

        return jsonify(
            {
                "order_id": order_id,
                "total_price": total_price,
                "status": "complete",
            }
        ), 200

    except sqlite3.Error as e:
        return bad_request(f"database error: {e}")


# -------------------------------------------------
# GET /api/orders/past_orders?customer_id=X
# Excludes in_cart
# Returns summary list of completed orders
# -------------------------------------------------

@bp.get("/past_orders")
def get_past_orders():
    customer_id = request.args.get("customer_id")

    if customer_id is None:
        return bad_request("customer_id is required")

    try:
        customer_id = int(customer_id)
    except ValueError:
        return bad_request("customer_id must be an integer")

    try:
        conn = get_db()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT 
                o.order_id,
                o.order_datetime,
                o.total_price,
                o.status,
                o.store_id,
                s.street,
                s.city,
                s.state,
                s.zip
            FROM "order" AS o
            JOIN store AS s
              ON o.store_id = s.store_id
            WHERE o.customer_id = ?
              AND o.status != 'in_cart'
            ORDER BY o.order_datetime DESC, o.order_id DESC;
            """,
            (customer_id,),
        )

        rows = cur.fetchall()

        orders = [
            {
                "order_id": row["order_id"],
                "order_number": row["order_id"],
                "order_datetime": row["order_datetime"],
                "total_price": row["total_price"],
                "status": row["status"],
                "store_id": row["store_id"],
                "street": row["street"],
                "city": row["city"],
                "state": row["state"],
                "zip": row["zip"],
            }
            for row in rows
        ]

        return jsonify(orders), 200

    except sqlite3.Error as e:
        return bad_request(f"database error: {e}")


# -------------------------------------------------
# GET /api/orders/<order_id>?customer_id=X
# Detailed order info
# -------------------------------------------------

@bp.get("/<int:order_id>")
def get_order_detail(order_id: int):
    customer_id = request.args.get("customer_id")

    if customer_id is None:
        return bad_request("customer_id query parameter is required")

    try:
        customer_id = int(customer_id)
    except ValueError:
        return bad_request("customer_id must be an integer")

    try:
        conn = get_db()
        cur = conn.cursor()

        # Order info (ensure it belongs to customer)
        cur.execute(
            """
            SELECT 
                o.order_id,
                o.order_datetime,
                o.total_price,
                o.status,
                o.store_id,
                s.street,
                s.city,
                s.state,
                s.zip
            FROM "order" AS o
            JOIN store AS s
              ON o.store_id = s.store_id
            WHERE o.order_id = ?
              AND o.customer_id = ?;
            """,
            (order_id, customer_id),
        )

        order_row = cur.fetchone()
        if order_row is None:
            return bad_request("order not found", status_code=404)

        # Load items
        cur.execute(
            """
            SELECT 
                oi.order_item_id,
                oi.product_id,
                oi.unit_price,
                oi.quantity,
                oi.is_return,
                p.product_name,
                p.img_url
            FROM order_item AS oi
            JOIN products AS p
              ON oi.product_id = p.product_id
            WHERE oi.order_id = ?;
            """,
            (order_id,),
        )

        item_rows = cur.fetchall()

        items = [
            {
                "order_item_id": row["order_item_id"],
                "product_id": row["product_id"],
                "product_name": row["product_name"],
                "unit_price": row["unit_price"],
                "quantity": row["quantity"],
                "img_url": row["img_url"],
                "is_return": row["is_return"],
            }
            for row in item_rows
        ]

        result = {
            "order_id": order_row["order_id"],
            "order_number": order_row["order_id"],
            "order_datetime": order_row["order_datetime"],
            "total_price": order_row["total_price"],
            "status": order_row["status"],
            "store": {
                "store_id": order_row["store_id"],
                "street": order_row["street"],
                "city": order_row["city"],
                "state": order_row["state"],
                "zip": order_row["zip"],
            },
            "items": items,
        }

        return jsonify(result), 200

    except sqlite3.Error as e:
        return bad_request(f"database error: {e}")


# -------------------------------------------------
# POST /api/orders/<order_id>/return
# Body: { customer_id, order_item_ids: [1, 2, 3] }
# Marks specified items as returned (is_return=1)
# Adds stock back to Store_Inventory
# Returns: { success: true, returned_items: [...] }
# -------------------------------------------------

@bp.post("/<int:order_id>/return")
def return_order_items(order_id: int):
    data = request.get_json(silent=True) or {}

    customer_id = data.get("customer_id")
    order_item_ids = data.get("order_item_ids")

    if customer_id is None:
        return bad_request("customer_id is required")
    if not isinstance(order_item_ids, list) or not order_item_ids:
        return bad_request("order_item_ids must be a non-empty list")

    # Convert IDs to ints and validate
    try:
        customer_id = int(customer_id)
        order_item_ids_int = [int(x) for x in order_item_ids]
    except (TypeError, ValueError):
        return bad_request("customer_id and order_item_ids must be integers")

    try:
        conn = get_db()
        cur = conn.cursor()

        # 1. Verify order belongs to customer and get store_id
        cur.execute(
            """
            SELECT store_id, status
            FROM "order"
            WHERE order_id = ?
              AND customer_id = ?;
            """,
            (order_id, customer_id),
        )
        order_row = cur.fetchone()
        if order_row is None:
            return bad_request("order not found for this customer", status_code=404)

        store_id = order_row["store_id"]

        # Optional: Only allow returns for completed orders
        # if order_row["status"] != "complete":
        #     return bad_request("can only return items for completed orders")

        # 2. Load the requested order items for this order
        placeholders = ",".join(["?"] * len(order_item_ids_int))
        params = [order_id] + order_item_ids_int

        cur.execute(
            f"""
            SELECT order_item_id, product_id, quantity, is_return
            FROM order_item
            WHERE order_id = ?
              AND order_item_id IN ({placeholders});
            """,
            params,
        )
        rows = cur.fetchall()

        if not rows:
            return bad_request("no matching order items found for this order")

        # Ensure all requested IDs are present
        found_ids = {row["order_item_id"] for row in rows}
        missing_ids = [oid for oid in order_item_ids_int if oid not in found_ids]
        if missing_ids:
            return bad_request("some order_item_ids do not belong to this order")

        # Filter out items already returned
        items_to_return = [row for row in rows if row["is_return"] == 0]

        if not items_to_return:
            # Nothing new to return
            return jsonify({"success": True, "returned_items": []}), 200

        try:
            # 3. Mark items as returned
            cur.execute(
                f"""
                UPDATE order_item
                SET is_return = 1
                WHERE order_id = ?
                  AND order_item_id IN ({placeholders});
                """,
                params,
            )

            # 4. Add stock back in Store_Inventory for each item
            for row in items_to_return:
                cur.execute(
                    """
                    UPDATE store_inventory
                    SET stock = stock + ?
                    WHERE store_id = ?
                      AND product_id = ?;
                    """,
                    (row["quantity"], store_id, row["product_id"]),
                )

            conn.commit()

        except sqlite3.Error as e:
            conn.rollback()
            return bad_request(f"database error during return: {e}")

        returned_items_payload = [
            {
                "order_item_id": row["order_item_id"],
                "product_id": row["product_id"],
                "quantity": row["quantity"],
            }
            for row in items_to_return
        ]

        return jsonify(
            {
                "success": True,
                "returned_items": returned_items_payload,
            }
        ), 200

    except sqlite3.Error as e:
        return bad_request(f"database error: {e}")
