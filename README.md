# JellyDog Backend — Developer Guide

This document describes the backend architecture, APIs, database usage, and development workflow for the **JellyDog E-Commerce System**.  
The backend is built with **Flask + SQLite** and exposes REST APIs used by the frontend.

---

# 1. Backend Structure

jellydog/
  app/
    init.py # App factory, blueprint registration
    config.py # Global settings
    db.py # SQLite connection helper
    api/
      auth.py # Register/Login
      customers.py # Customer profile endpoints
      stores.py # Store & store-product endpoints
      products.py # Product endpoints
      cart.py # (Optional) Cart logic
      orders.py # Order + checkout logic
      admin.py # Admin-only functions
      stats.py # Reporting analytics
  run.py # Backend entry point
  database.db # SQLite database file

---

# 2. Backend Technology Stack

- **Language:** Python
- **Framework:** Flask
- **Database:** SQLite (single-file database for easy demo & portability)
- **API Format:** RESTful JSON
- **Deployment:** Local development via `python run.py`

We follow a **per-request DB connection pattern**:

- `get_db()` opens a SQLite connection the first time it is needed during a request.
- `close_db()` closes it at the end of the request.
- This prevents shared-connection threading issues and matches Flask best practices.

---

# 3. Running the Backend

## Start the server
```bash
python run.py

Server runs at:
http://127.0.0.1:5000/
