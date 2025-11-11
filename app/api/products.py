from flask import Blueprint, request, jsonify

bp = Blueprint("products", __name__)

@bp.get("")
def list_products():
    """List products; query params: q, category, sort (date|price|name), limit, offset."""
    ...

@bp.get("/<int:product_id>")
def get_product(product_id):
    """Retrieve one product by id."""
    ...

@bp.post("")
def create_product():
    """(Admin) Create a product: name, category, price, img_url, inventory, etc."""
    ...

@bp.patch("/<int:product_id>")
def update_product(product_id):
    """(Admin) Update product fields (price, inventory, name, image)."""
    ...

@bp.delete("/<int:product_id>")
def delete_product(product_id):
    """(Admin) Delete a product."""
    ...
