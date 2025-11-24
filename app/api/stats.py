from flask import Blueprint, request, jsonify

bp = Blueprint("stats", __name__)

@bp.get("/top-sellers")
def top_sellers():
    """Return top N products by units sold; query param: limit (default 10)."""
    ...

@bp.get("/best-region")
def best_region():
    """Return region/state with highest sales (simple aggregation)."""
    ...

@bp.get("/revenue/daily")
def revenue_daily():
    """Return daily revenue between date_start and date_end (inclusive)."""
    ...
