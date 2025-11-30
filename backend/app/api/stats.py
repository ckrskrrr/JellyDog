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
                COALESCE(SUM(oi.quantity * oi.unit_price), 0) as total_revenue
            FROM store AS s
            LEFT JOIN "order" AS o
              ON o.store_id = s.store_id
             AND o.status = 'complete'
            LEFT JOIN order_item AS oi
              ON o.order_id = oi.order_id
             AND oi.is_return = 0
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
                COALESCE(SUM(oi.quantity * oi.unit_price), 0) as total_revenue,
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


# -------------------------------------------------
# GET /api/stats/return-rate
# Returns return statistics
# -------------------------------------------------

@bp.get("/return-rate")
def return_rate():
    """
    GET /api/stats/return-rate
    
    Returns return statistics including overall return rate and products with highest returns.
    
    Returns: { 
        total_items_sold, 
        total_items_returned, 
        return_rate_percent,
        revenue_lost,
        top_returned_products: [{ product_id, product_name, total_sold, total_returned, return_rate, img_url }]
    }
    """
    try:
        conn = get_db()
        cur = conn.cursor()
        
        # Overall return statistics
        cur.execute(
            """
            SELECT 
                COUNT(*) FILTER (WHERE is_return = 0) as items_sold,
                COUNT(*) FILTER (WHERE is_return = 1) as items_returned,
                SUM(quantity * unit_price) FILTER (WHERE is_return = 1) as revenue_lost
            FROM order_item AS oi
            JOIN "order" AS o ON oi.order_id = o.order_id
            WHERE o.status = 'complete';
            """
        )
        
        overall = cur.fetchone()
        
        total_sold = overall["items_sold"] or 0
        total_returned = overall["items_returned"] or 0
        revenue_lost = float(overall["revenue_lost"]) if overall["revenue_lost"] else 0.0
        return_rate = (total_returned / total_sold * 100) if total_sold > 0 else 0
        
        # Products with highest return rates
        cur.execute(
            """
            SELECT 
                p.product_id,
                p.product_name,
                p.img_url,
                COUNT(*) FILTER (WHERE oi.is_return = 0) as total_sold,
                COUNT(*) FILTER (WHERE oi.is_return = 1) as total_returned,
                CASE 
                    WHEN COUNT(*) FILTER (WHERE oi.is_return = 0) > 0 
                    THEN CAST(COUNT(*) FILTER (WHERE oi.is_return = 1) AS FLOAT) / COUNT(*) FILTER (WHERE oi.is_return = 0) * 100
                    ELSE 0
                END as return_rate
            FROM order_item AS oi
            JOIN products AS p ON oi.product_id = p.product_id
            JOIN "order" AS o ON oi.order_id = o.order_id
            WHERE o.status = 'complete'
            GROUP BY p.product_id, p.product_name, p.img_url
            HAVING COUNT(*) FILTER (WHERE oi.is_return = 1) > 0
            ORDER BY return_rate DESC
            LIMIT 5;
            """
        )
        
        top_returned = cur.fetchall()
        
        result = {
            "total_items_sold": total_sold,
            "total_items_returned": total_returned,
            "return_rate_percent": round(return_rate, 2),
            "revenue_lost": revenue_lost,
            "top_returned_products": [
                {
                    "product_id": row["product_id"],
                    "product_name": row["product_name"],
                    "img_url": row["img_url"],
                    "total_sold": row["total_sold"],
                    "total_returned": row["total_returned"],
                    "return_rate": round(float(row["return_rate"]), 2),
                }
                for row in top_returned
            ]
        }
        
        return jsonify(result), 200
        
    except sqlite3.Error as e:
        return bad_request(f"database error: {e}")


# -------------------------------------------------
# GET /api/stats/inventory-health
# Returns inventory health statistics
# -------------------------------------------------

@bp.get("/inventory-health")
def inventory_health():
    """
    GET /api/stats/inventory-health
    
    Returns inventory health statistics.
    
    Returns: {
        out_of_stock: [{ product_id, product_name, store_id, city, state }],
        low_stock: [{ product_id, product_name, store_id, city, state, stock }],
        overstocked: [{ product_id, product_name, store_id, city, state, stock }]
    }
    """
    try:
        conn = get_db()
        cur = conn.cursor()
        
        # Out of stock products
        cur.execute(
            """
            SELECT 
                p.product_id,
                p.product_name,
                p.img_url,
                si.store_id,
                s.city,
                s.state,
                si.stock
            FROM Store_Inventory AS si
            JOIN products AS p ON si.product_id = p.product_id
            JOIN store AS s ON si.store_id = s.store_id
            WHERE si.stock = 0
            ORDER BY p.product_name;
            """
        )
        
        out_of_stock = [
            {
                "product_id": row["product_id"],
                "product_name": row["product_name"],
                "img_url": row["img_url"],
                "store_id": row["store_id"],
                "city": row["city"],
                "state": row["state"],
                "stock": row["stock"],
            }
            for row in cur.fetchall()
        ]
        
        # Low stock products (< 5 units)
        cur.execute(
            """
            SELECT 
                p.product_id,
                p.product_name,
                p.img_url,
                si.store_id,
                s.city,
                s.state,
                si.stock
            FROM Store_Inventory AS si
            JOIN products AS p ON si.product_id = p.product_id
            JOIN store AS s ON si.store_id = s.store_id
            WHERE si.stock > 0 AND si.stock < 5
            ORDER BY si.stock ASC, p.product_name;
            """
        )
        
        low_stock = [
            {
                "product_id": row["product_id"],
                "product_name": row["product_name"],
                "img_url": row["img_url"],
                "store_id": row["store_id"],
                "city": row["city"],
                "state": row["state"],
                "stock": row["stock"],
            }
            for row in cur.fetchall()
        ]
        
        # Overstocked products (> 50 units)
        cur.execute(
            """
            SELECT 
                p.product_id,
                p.product_name,
                p.img_url,
                si.store_id,
                s.city,
                s.state,
                si.stock
            FROM Store_Inventory AS si
            JOIN products AS p ON si.product_id = p.product_id
            JOIN store AS s ON si.store_id = s.store_id
            WHERE si.stock > 50
            ORDER BY si.stock DESC, p.product_name;
            """
        )
        
        overstocked = [
            {
                "product_id": row["product_id"],
                "product_name": row["product_name"],
                "img_url": row["img_url"],
                "store_id": row["store_id"],
                "city": row["city"],
                "state": row["state"],
                "stock": row["stock"],
            }
            for row in cur.fetchall()
        ]
        
        result = {
            "out_of_stock": out_of_stock,
            "low_stock": low_stock,
            "overstocked": overstocked,
        }
        
        return jsonify(result), 200
        
    except sqlite3.Error as e:
        return bad_request(f"database error: {e}")


# -------------------------------------------------
# GET /api/stats/all-orders
# Returns all orders for admin view
# -------------------------------------------------

@bp.get("/all-orders")
def all_orders():
    """
    GET /api/stats/all-orders
    
    Returns all orders with customer and store information for admin.
    
    Returns: [{
        order_id, order_number, order_datetime, total_price, status,
        customer_name, user_name,
        store_id, city, state
    }]
    """
    try:
        conn = get_db()
        cur = conn.cursor()
        
        cur.execute(
            """
            SELECT 
                o.order_id,
                o.order_id as order_number,
                o.order_datetime,
                o.total_price,
                o.status,
                c.customer_name,
                u.user_name,
                s.store_id,
                s.city,
                s.state
            FROM "order" AS o
            JOIN customers AS c ON o.customer_id = c.customer_id
            JOIN user AS u ON c.uid = u.uid
            JOIN store AS s ON o.store_id = s.store_id
            ORDER BY o.order_datetime DESC;
            """
        )
        
        rows = cur.fetchall()
        
        orders = [
            {
                "order_id": row["order_id"],
                "order_number": row["order_number"],
                "order_datetime": row["order_datetime"],
                "total_price": float(row["total_price"]) if row["total_price"] else 0.0,
                "status": row["status"],
                "customer_name": row["customer_name"],
                "user_name": row["user_name"],
                "store_id": row["store_id"],
                "city": row["city"],
                "state": row["state"],
            }
            for row in rows
        ]
        
        return jsonify(orders), 200
        
    except sqlite3.Error as e:
        return bad_request(f"database error: {e}")