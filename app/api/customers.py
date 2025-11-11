from flask import Blueprint, request, jsonify

bp = Blueprint("customers", __name__)

@bp.get("/me")
def get_profile():
    """Return current customer's profile."""
    ...

@bp.patch("/me")
def update_profile():
    """Update current customer's profile fields."""
    ...

@bp.post("/me/password")
def change_password():
    """Change password for current customer."""
    ...
