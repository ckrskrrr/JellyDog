from flask import Blueprint, request, jsonify

bp = Blueprint("auth", __name__)

@bp.post("/register")
def register():
    """Create a new customer account."""
    # expects: email, password, firstName, lastName, address fields, phone, customer_kind, ...
    ...

@bp.post("/login")
def login():
    """Login customer; sets session or returns token."""
    ...

@bp.post("/logout")
def logout():
    """Logout current user."""
    ...
