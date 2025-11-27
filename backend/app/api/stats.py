from flask import Blueprint, request, jsonify
from ..db import get_db
import sqlite3

bp = Blueprint("stats", __name__)


def bad_request(message: str, status_code: int = 400):
    return jsonify({"error": message}), status_code


# -------------------------------------------------
# GET /api/stats/top-sellers?limit=10
# Returns top N products by units sold
# -------------------------------------------------

@bp.get("/top-sellers")
def top_sellers():
    """
    GET /api/stats/top-sellers?limit=10
    
    Returns top N products by total units sold across all stores.
    Query params:
      - limit: number of products to return (default 10)
    
    Returns: [{ product_id, product_name, total_sold }]
    """
    limit = request.args.get("limit", 10)
    
    try:
        limit = int(limit)
        if limit <= 0:
            limit = 10
    except ValueError:
        limit = 10
    
    try:
        conn = get_db()
        cur = conn.cursor()
        
        cur.execute(
            """
            SELECT 
                p.product_id,
                p.product_name,
                p.category,
                p.price,
                p.img_url,
                SUM(oi.quantity) as total_sold
            FROM order_item AS oi
            JOIN products AS p
              ON oi.product_id = p.product_id
            JOIN "order" AS o
              ON oi.order_id = o.order_id
            WHERE o.status = 'complete'
              AND oi.is_return = 0
            GROUP BY p.product_id, p.product_name, p.category, p.price, p.img_url
            ORDER BY total_sold DESC
            LIMIT ?;
            """,
            (limit,),
        )
        
        rows = cur.fetchall()
        
        if not rows:
            # No sales data yet - return empty array
            return jsonify([]), 200
        
        products = [
            {
                "product_id": row["product_id"],
                "product_name": row["product_name"],
                "category": row["category"],
                "price": row["price"],
                "img_url": row["img_url"],
                "total_sold": row["total_sold"] or 0,
            }
            for row in rows
        ]
        
        return jsonify(products), 200
        
    except sqlite3.Error as e:
        return bad_request(f"database error: {e}")


# -------------------------------------------------
# GET /api/stats/best-region
# Returns region/state with highest sales
# -------------------------------------------------

@bp.get("/best-region")
def best_region():
    """
    GET /api/stats/best-region
    
    Returns performance stats for all stores.
    
    Returns: [{ store_id, state, city, total_revenue, order_count }]
    """
    try:
        conn = get_db()
        cur = conn.cursor()
        
        cur.execute(
            """
            SELECT 
                s.store_id,
                s.state,
                s.city,
                COUNT(DISTINCT o.order_id) as order_count,
                SUM(o.total_price) as total_revenue
            FROM store AS s
            LEFT JOIN "order" AS o
              ON o.store_id = s.store_id
             AND o.status = 'complete'
            GROUP BY s.store_id, s.state, s.city
            ORDER BY total_revenue DESC;
            """
        )
        
        rows = cur.fetchall()
        
        if not rows:
            return jsonify([]), 200
        
        results = [
            {
                "store_id": row["store_id"],
                "state": row["state"],
                "city": row["city"],
                "order_count": row["order_count"],
                "total_revenue": float(row["total_revenue"]) if row["total_revenue"] else 0,
            }
            for row in rows
        ]
        
        return jsonify(results), 200
        
    except sqlite3.Error as e:
        return bad_request(f"database error: {e}")


# -------------------------------------------------
# GET /api/stats/revenue/daily?date_start=YYYY-MM-DD&date_end=YYYY-MM-DD
# Returns daily revenue between dates
# -------------------------------------------------

@bp.get("/overview")
def overview():
    """
    GET /api/stats/overview
    
    Returns overall sales statistics.
    
    Returns: { total_revenue, total_orders, total_products_sold }
    """
    try:
        conn = get_db()
        cur = conn.cursor()
        
        cur.execute(
            """
            SELECT 
                COUNT(DISTINCT o.order_id) as total_orders,
                COALESCE(SUM(o.total_price), 0) as total_revenue,
                COALESCE(SUM(oi.quantity), 0) as total_products_sold
            FROM "order" AS o
            LEFT JOIN order_item AS oi
              ON o.order_id = oi.order_id
             AND oi.is_return = 0
            WHERE o.status = 'complete';
            """
        )
        
        row = cur.fetchone()
        
        result = {
            "total_revenue": float(row["total_revenue"]) if row["total_revenue"] else 0.0,
            "total_orders": row["total_orders"] or 0,
            "total_products_sold": row["total_products_sold"] or 0,
        }
        
        return jsonify(result), 200
        
    except sqlite3.Error as e:
        return bad_request(f"database error: {e}")


# -------------------------------------------------
# GET /api/stats/revenue/daily?date_start=YYYY-MM-DD&date_end=YYYY-MM-DD
# Returns daily revenue between dates
# -------------------------------------------------

@bp.get("/revenue/daily")
def revenue_daily():
    """
    GET /api/stats/revenue/daily?date_start=2024-01-01&date_end=2024-01-31
    
    Returns daily revenue between date_start and date_end (inclusive).
    
    Returns: [{ date, revenue, order_count }]
    """
    date_start = request.args.get("date_start")
    date_end = request.args.get("date_end")
    
    if not date_start or not date_end:
        return bad_request("date_start and date_end are required (format: YYYY-MM-DD)")
    
    try:
        conn = get_db()
        cur = conn.cursor()
        
        cur.execute(
            """
            SELECT 
                DATE(o.order_datetime) as date,
                COUNT(o.order_id) as order_count,
                SUM(o.total_price) as revenue
            FROM "order" AS o
            WHERE o.status = 'complete'
              AND DATE(o.order_datetime) BETWEEN ? AND ?
            GROUP BY DATE(o.order_datetime)
            ORDER BY date ASC;
            """,
            (date_start, date_end),
        )
        
        rows = cur.fetchall()
        
        daily_stats = [
            {
                "date": row["date"],
                "order_count": row["order_count"],
                "revenue": float(row["revenue"]) if row["revenue"] else 0,
            }
            for row in rows
        ]
        
        return jsonify(daily_stats), 200
        
    except sqlite3.Error as e:
        return bad_request(f"database error: {e}")