'''
from flask import Blueprint, request, jsonify

bp = Blueprint("manager", __name__)


@bp.post("/login")
def manager_login():
    """Manager login."""
    ...

@bp.post("/logout")
def manager_logout():
    """Manager logout."""
    ...

@bp.post("/products")
def admin_create_product():
    """Create product (manager)."""
    ...

@bp.patch("/products/<int:product_id>")
def admin_update_product(product_id):
    """Update product (manager)."""
    ...

@bp.delete("/products/<int:product_id>")
def admin_delete_product(product_id):
    """Delete product (manager)."""
    ...

@bp.post("/inventory/adjust")
def admin_adjust_inventory():
    """Adjust stock by product id and delta quantity."""
    ...
'''


from flask import Blueprint, request, jsonify
from ..db import get_db
import sqlite3

bp = Blueprint("admin", __name__)

def bad_request(message: str, status_code: int = 400):
    return jsonify({"error": message}), status_code

# -------------------------------------------------
# POST /api/admin/inventory/adjust
# Body: { store_id, product_id, adjustment }
# Adjusts stock by adding/subtracting the adjustment value
# Returns: { success, new_stock }
# -------------------------------------------------

@bp.post("/inventory/adjust")
def admin_adjust_inventory():
    """
    POST /api/admin/inventory/adjust
    Body: { store_id, product_id, adjustment }
    
    Adjusts stock for a product at a specific store.
    adjustment can be positive (add stock) or negative (remove stock)
    
    Returns: { success: true, new_stock: <value> }
    """
    data = request.get_json(silent=True) or {}
    
    store_id = data.get("store_id")
    product_id = data.get("product_id")
    adjustment = data.get("adjustment")
    
    if store_id is None or product_id is None or adjustment is None:
        return bad_request("store_id, product_id, and adjustment are required")
    
    try:
        store_id = int(store_id)
        product_id = int(product_id)
        adjustment = int(adjustment)
    except (TypeError, ValueError):
        return bad_request("store_id, product_id, and adjustment must be integers")
    
    try:
        conn = get_db()
        cur = conn.cursor()
        
        # Check if inventory record exists
        cur.execute(
            """
            SELECT stock
            FROM Store_Inventory
            WHERE store_id = ? AND product_id = ?;
            """,
            (store_id, product_id),
        )
        row = cur.fetchone()
        
        if row is None:
            return bad_request("inventory record not found for this store and product", status_code=404)
        
        current_stock = row["stock"]
        new_stock = current_stock + adjustment
        
        # Don't allow negative stock
        if new_stock < 0:
            return bad_request(f"adjustment would result in negative stock (current: {current_stock}, adjustment: {adjustment})")
        
        # Update the stock
        cur.execute(
            """
            UPDATE Store_Inventory
            SET stock = ?
            WHERE store_id = ? AND product_id = ?;
            """,
            (new_stock, store_id, product_id),
        )
        conn.commit()
        
        return jsonify({
            "success": True,
            "new_stock": new_stock,
            "previous_stock": current_stock,
            "adjustment": adjustment,
        }), 200
        
    except sqlite3.Error as e:
        return bad_request(f"database error: {e}")