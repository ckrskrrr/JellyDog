from flask import Blueprint, request, jsonify

bp = Blueprint("orders", __name__)

@bp.post("")
def create_order():
    """Create a PENDING order from current cart or from payload items."""
    ...

@bp.get("/<int:order_id>")
def get_order(order_id):
    """Retrieve an order (header + items)."""
    ...

@bp.post("/<int:order_id>/items")
def add_order_item(order_id):
    """Add an item to a PENDING order (product_id, unit_price, quantity)."""
    ...

@bp.patch("/<int:order_id>/items/<int:product_id>")
def update_order_item(order_id, product_id):
    """Update item quantity or unit_price in a PENDING order."""
    ...

@bp.delete("/<int:order_id>/items/<int:product_id>")
def delete_order_item(order_id, product_id):
    """Remove an item from a PENDING order."""
    ...

@bp.post("/<int:order_id>/checkout")
def checkout_order(order_id):
    """
    Complete the order immediately (demo assumption):
    - verify stock & any required fields
    - mark order complete
    - update inventory
    """
    ...

@bp.post("/<int:order_id>/return")
def return_order(order_id):
    """
    Return an order immediately (demo assumption):
    - restock items
    - update order status to returned/cancelled
    """
    ...
