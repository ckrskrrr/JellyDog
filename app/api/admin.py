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
