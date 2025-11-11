from flask import Blueprint, request, jsonify

bp = Blueprint("cart", __name__)

@bp.get("")
def get_cart():
    """Return current user's cart items (derived from a simple cart table or in-memory)."""
    ...

@bp.post("/items")
def add_to_cart():
    """Add product to cart; body: product_id, quantity (default 1)."""
    ...

@bp.delete("/items/<int:product_id>")
def remove_from_cart(product_id):
    """Remove a product from cart."""
    ...

@bp.post("/clear")
def clear_cart():
    """Clear cart for current user."""
    ...
