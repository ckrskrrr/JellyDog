from flask import Blueprint, jsonify

bp = Blueprint("stores", __name__)

@bp.get("")
def list_stores():
    """List all stores (name, address)."""
    ...
