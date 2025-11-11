-- =====================================================
--  JellyDog Database Schema (SQLite version)
-- =====================================================

-- SQLite doesn’t support CREATE DATABASE or USE —
-- it just opens/creates the .db file when connecting.
-- Example: sqlite3 jellydog.db

PRAGMA foreign_keys = ON;

-- =====================================================
-- 1) User
-- =====================================================
CREATE TABLE User (
  uid INTEGER PRIMARY KEY AUTOINCREMENT,
  user_name TEXT,
  password_salt TEXT,
  password_hash TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin','customer'))
);

-- =====================================================
-- 2) Customers
-- =====================================================
CREATE TABLE Customers (
  customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT,
  phone_number TEXT,
  street TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  uid INTEGER NOT NULL,
  FOREIGN KEY (uid) REFERENCES User(uid) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Optional helpful index
CREATE INDEX idx_customers_uid ON Customers(uid);

-- =====================================================
-- 3) Store
-- =====================================================
CREATE TABLE Store (
  store_id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_name TEXT,
  street TEXT,
  city TEXT,
  state TEXT,
  zip TEXT
);

-- =====================================================
-- 4) Products
-- =====================================================
CREATE TABLE Products (
  product_id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_name TEXT,
  category TEXT,
  price REAL CHECK (price >= 0),
  img_url TEXT
);

-- =====================================================
-- 5) Store_Inventory
-- =====================================================
CREATE TABLE Store_Inventory (
  store_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  stock INTEGER CHECK (stock >= 0),
  PRIMARY KEY (store_id, product_id),
  FOREIGN KEY (store_id) REFERENCES Store(store_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_inv_store ON Store_Inventory(store_id);
CREATE INDEX idx_inv_product ON Store_Inventory(product_id);

-- =====================================================
-- 6) Order
-- =====================================================
CREATE TABLE "Order" (
  order_id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER,
  order_datetime TEXT DEFAULT (datetime('now')),
  total_price REAL CHECK (total_price >= 0),
  status TEXT CHECK (status IN ('in cart','complete')),
  store_id INTEGER,
  FOREIGN KEY (customer_id) REFERENCES Customers(customer_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (store_id) REFERENCES Store(store_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =====================================================
-- 7) Order_Item
-- =====================================================
CREATE TABLE Order_Item (
  order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  unit_price REAL CHECK (unit_price >= 0),
  quantity INTEGER CHECK (quantity > 0),
  is_return INTEGER CHECK (is_return IN (0,1)),
  FOREIGN KEY (order_id) REFERENCES "Order"(order_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_item_order ON Order_Item(order_id);
CREATE INDEX idx_item_product ON Order_Item(product_id);

-- =====================================================
-- End of Schema
-- =====================================================
