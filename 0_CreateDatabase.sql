-- Create Datebase --
DROP DATABASE IF EXISTS JellyDog;
CREATE DATABASE JellyDog
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
USE JellyDog;

-- Create Tables --
SET SESSION sql_require_primary_key = 0;

CREATE TABLE `User` (
  uid BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_name VARCHAR(255),
  password_salt VARCHAR(255),
  password_hash VARCHAR(255),
  role ENUM('admin','customer') NOT NULL
) ENGINE=InnoDB;

CREATE TABLE Customers (
  customer_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_name VARCHAR(255),
  phone_number VARCHAR(30),
  street VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100),
  uid BIGINT NOT NULL,
  INDEX idx_customers_uid (uid),
  CONSTRAINT fk_customers_user
    FOREIGN KEY (uid) REFERENCES `User`(uid)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Store (
  store_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  store_name VARCHAR(255),
  street VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  zip VARCHAR(20)
) ENGINE=InnoDB;

CREATE TABLE Products (
  product_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_name VARCHAR(255),
  category VARCHAR(100),
  price DECIMAL(10,2),
  img_url VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE Store_Inventory (
  store_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  stock BIGINT,
  PRIMARY KEY (store_id, product_id),
  INDEX idx_inv_store (store_id),
  INDEX idx_inv_product (product_id),
  CONSTRAINT fk_inv_store
    FOREIGN KEY (store_id) REFERENCES Store(store_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_inv_product
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `Order` (
  order_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT,
  order_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_price DECIMAL(10,2),
  status ENUM('in cart', 'complete'),
  store_id BIGINT,
  FOREIGN KEY (customer_id) REFERENCES Customers(customer_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (store_id) REFERENCES Store(store_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Order_Item (
  order_item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  unit_price DECIMAL(10,2),
  quantity BIGINT,
  is_return BOOLEAN,
  INDEX idx_item_order (order_id),
  INDEX idx_item_product (product_id),
  CONSTRAINT fk_item_order
    FOREIGN KEY (order_id) REFERENCES `Order`(order_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_item_product
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
