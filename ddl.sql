PRAGMA foreign_keys=OFF;
--
-- ------------------------------------------------------


--
-- Table structure for table customers
--

DROP TABLE IF EXISTS customers;
CREATE TABLE customers (
  customer_id INTEGER NOT NULL ,
  customer_name varchar(255)  DEFAULT NULL,
  phone_number varchar(30)  DEFAULT NULL,
  street varchar(255)  DEFAULT NULL,
  city varchar(100)  DEFAULT NULL,
  state varchar(100)  DEFAULT NULL,
  zip_code varchar(20)  DEFAULT NULL,
  country varchar(100)  DEFAULT NULL,
  uid INTEGER NOT NULL,
  PRIMARY KEY (customer_id),
  CONSTRAINT fk_customers_user FOREIGN KEY (uid) REFERENCES user (uid) ON DELETE CASCADE ON UPDATE CASCADE
);

--
-- Dumping data for table customers
--

INSERT INTO customers VALUES (1,'Lulin Yang','8786709610','3955 Bigelow Boulevard','Pittsburgh','PA','15213','US',2),(2,'Emma Johnson','4125381123','1200 Forbes Avenue','Pittsburgh','PA','15219','US',3),(3,'Noah Smith','4128879033','3700 O''Hara Street','Pittsburgh','PA','15213','US',4),(4,'Ava Parker','4126657711','4400 Bigelow Blvd','Pittsburgh','PA','15213','US',5),(5,'Olivia Brown','6469935882','119 West Broadway','New York','NY','10013','US',6),(6,'Liam Davis','9175502211','88 Lexington Avenue','New York','NY','10016','US',7),(7,'Mason Taylor','9173307744','200 5th Avenue','New York','NY','10010','US',8),(8,'Sophia Wilson','2069934481','417 15th Ave E','Seattle','WA','98112','US',9),(9,'Ethan Lee','2069174411','500 Pike Street','Seattle','WA','98101','US',10),(10,'Mia Thompson','2067728711','600 E Pine Street','Seattle','WA','98122','US',11),(11,'Harper Miller','6172207811','127 Newbury Street','Boston','MA','02116','US',12),(12,'Logan Clark','6175509122','800 Boylston Street','Boston','MA','02199','US',13),(13,'Chloe Anderson','6173387700','4 Copley Place','Boston','MA','02116','US',14),(14,'Grace Hall','2029175522','3322 Wisconsin Ave NW','Washington','DC','20016','US',15),(15,'Jacob Wright','2027768899','700 Pennsylvania Ave NW','Washington','DC','20408','US',16),(16,'Lucas King','2026654433','1600 Pennsylvania Ave NW','Washington','DC','20500','US',17);

--
-- Table structure for table order
--

DROP TABLE IF EXISTS "order";
CREATE TABLE "order" (
  order_id INTEGER NOT NULL ,
  customer_id INTEGER DEFAULT NULL,
  order_datetime datetime DEFAULT CURRENT_TIMESTAMP,
  total_price REAL(10,2) DEFAULT NULL,
  status TEXT  DEFAULT NULL,
  store_id INTEGER DEFAULT NULL,
  PRIMARY KEY (order_id),
  CONSTRAINT order_ibfk_1 FOREIGN KEY (customer_id) REFERENCES customers (customer_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT order_ibfk_2 FOREIGN KEY (store_id) REFERENCES store (store_id) ON DELETE CASCADE ON UPDATE CASCADE
);

--
-- Dumping data for table order
--

INSERT INTO "order" VALUES (1,1,'2024-11-01 11:00:00',33.30,'complete',1),(2,2,'2024-11-01 12:00:00',37.90,'complete',1),(3,3,'2024-11-01 13:00:00',31.90,'complete',1),(4,4,'2024-11-01 14:00:00',27.24,'complete',1),(5,5,'2024-11-01 15:00:00',39.70,'complete',2),(6,6,'2024-11-01 16:00:00',30.55,'complete',2),(7,7,'2024-11-01 17:00:00',50.10,'complete',2),(8,8,'2024-11-01 18:00:00',22.10,'complete',3),(9,9,'2024-11-01 19:00:00',35.10,'complete',3),(10,10,'2024-11-01 20:00:00',29.20,'complete',3),(11,11,'2024-11-01 21:00:00',46.35,'complete',4),(12,12,'2024-11-01 22:00:00',18.50,'complete',4),(13,13,'2024-11-01 23:00:00',40.23,'complete',4),(14,14,'2024-11-02 00:00:00',22.55,'complete',5),(15,15,'2024-11-02 01:00:00',59.90,'complete',5),(16,16,'2024-11-02 02:00:00',24.60,'complete',5),(17,1,'2024-11-02 07:00:00',11.80,'in cart',1),(18,10,'2024-11-02 16:00:00',16.80,'in cart',3);

--
-- Table structure for table order_item
--

DROP TABLE IF EXISTS order_item;
CREATE TABLE order_item (
  order_item_id INTEGER NOT NULL ,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  unit_price REAL(10,2) DEFAULT NULL,
  quantity INTEGER DEFAULT NULL,
  is_return INTEGER DEFAULT NULL,
  PRIMARY KEY (order_item_id),
  CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES "order" (order_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products (product_id) ON DELETE CASCADE ON UPDATE CASCADE
);

--
-- Dumping data for table order_item
--

INSERT INTO order_item VALUES (1,1,3,10.75,2,0),(2,1,6,11.80,1,0),(3,2,5,22.00,1,0),(4,2,8,15.90,1,0),(5,3,2,18.50,1,0),(6,3,7,13.40,2,0),(7,3,7,13.40,1,1),(8,4,1,12.99,1,0),(9,4,4,14.25,1,0),(10,5,10,11.20,2,0),(11,5,13,17.30,1,0),(12,6,12,14.75,1,0),(13,6,15,15.80,1,0),(14,7,14,18.60,2,0),(15,7,17,12.90,1,0),(16,8,19,10.80,1,0),(17,8,25,11.30,1,0),(18,9,18,10.80,2,0),(19,9,21,13.50,1,0),(20,10,20,12.40,1,0),(21,10,23,16.80,1,0),(22,11,23,16.80,2,0),(23,11,26,12.75,1,0),(24,12,2,18.50,1,0),(25,12,25,11.30,1,0),(26,12,25,11.30,1,1),(27,13,1,12.99,2,0),(28,13,4,14.25,1,0),(29,14,3,10.75,1,0),(30,14,6,11.80,1,0),(31,15,5,22.00,2,0),(32,15,8,15.90,1,0),(33,16,7,13.40,1,0),(34,16,10,11.20,1,0),(35,17,6,11.80,1,0),(36,18,23,16.80,1,0);

--
-- Table structure for table products
--

DROP TABLE IF EXISTS products;
CREATE TABLE products (
  product_id INTEGER NOT NULL ,
  product_name varchar(255)  DEFAULT NULL,
  category varchar(100)  DEFAULT NULL,
  price REAL(10,2) DEFAULT NULL,
  img_url varchar(255)  DEFAULT NULL,
  PRIMARY KEY (product_id)
);

--
-- Dumping data for table products
--

INSERT INTO products VALUES (1,'Birding Swallow','Birds',12.99,'images/Birds/Birding_Swallow.jpg'),(2,'Bodacious Beak Toucan','Birds',18.50,'images/Birds/Bodacious_Beak_Toucan.jpg'),(3,'Chip Seagull','Birds',10.75,'images/Birds/Chip_Seagull.jpg'),(4,'Evelyn Swan','Birds',14.25,'images/Birds/Evelyn_Swan.jpg'),(5,'Fou Fou Ostrich','Birds',22.00,'images/Birds/Fou_Fou_Ostrich.jpg'),(6,'Plum Robin','Birds',11.80,'images/Birds/Plum_Robin.jpg'),(7,'Snoozling Owl','Birds',13.40,'images/Birds/Snoozling_Owl.jpg'),(8,'Theo Turkey','Birds',15.90,'images/Birds/Theo_Turkey.jpg'),(9,'Fluffy Octopus','Ocean',16.50,'images/Ocean/Fluffy_Octopus.jpg'),(10,'Fluffy Starfish','Ocean',11.20,'images/Ocean/Fluffy_Starfish.jpg'),(11,'Fluffy Turtle','Ocean',13.90,'images/Ocean/Fluffy_Turtle.jpg'),(12,'Lois Lionfish','Ocean',14.75,'images/Ocean/Lois_Lionfish.jpg'),(13,'Obbie Octopus','Ocean',17.30,'images/Ocean/Obbie_Octopus.jpg'),(14,'Odell Octopus','Ocean',18.60,'images/Ocean/Odell_Octopus.jpg'),(15,'Silvie Shark','Ocean',15.80,'images/Ocean/Silvie_Shark.jpg'),(16,'Timmy Turtle','Ocean',12.50,'images/Ocean/Timmy_Turtle.jpg'),(17,'Tully Turtle','Ocean',12.90,'images/Ocean/Tully_Turtle.jpg'),(18,'Bashful Beige Bunny','Pets',10.80,'images/Pets/Bashful_Beige_Bunny.jpg'),(19,'Bashful Cream Bunny','Pets',10.80,'images/Pets/Bashful_Cream_Bunny.jpg'),(20,'Bashful Kitten Original','Pets',12.40,'images/Pets/Bashful_Kitten_Original.jpg'),(21,'Derreck Dog','Pets',13.50,'images/Pets/Derreck_Dog.jpg'),(22,'Ewert Sheepdog','Pets',15.20,'images/Pets/Ewert_Sheepdog.jpg'),(23,'Jellycat Jack','Pets',16.80,'images/Pets/Jellycat_Jack.jpg'),(24,'Otto Sausage Dog','Pets',14.90,'images/Pets/Otto_Sausage_Dog.jpg'),(25,'Smudge Rabbit','Pets',11.30,'images/Pets/Smudge_Rabbit.jpg'),(26,'Spookipaws Cat','Pets',12.75,'images/Pets/Spookipaws_Cat.jpg');

--
-- Table structure for table store
--

DROP TABLE IF EXISTS store;
CREATE TABLE store (
  store_id INTEGER NOT NULL ,
  store_name varchar(255)  DEFAULT NULL,
  street varchar(255)  DEFAULT NULL,
  city varchar(100)  DEFAULT NULL,
  state varchar(100)  DEFAULT NULL,
  zip varchar(20)  DEFAULT NULL,
  PRIMARY KEY (store_id)
);

--
-- Dumping data for table store
--

INSERT INTO store VALUES (1,'Carnegie Museum Store','4400 Forbes Ave, Attn Stores','Pittsburgh','PA','15213'),(2,'Boomerang Toys','119 West Broadway','New York','NY','10013'),(3,'The Red Balloon Company','417 15th Ave E.','Seattle','WA','98112'),(4,'POSMAN','127 Newbury St.','Boston','MA','2116'),(5,'Proper Topper','3322 Wisconsin Ave NW','Washington','DC','20016');

--
-- Table structure for table store_inventory
--

DROP TABLE IF EXISTS store_inventory;
CREATE TABLE store_inventory (
  store_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  stock INTEGER DEFAULT NULL,
  PRIMARY KEY (store_id,product_id),
  CONSTRAINT fk_inv_product FOREIGN KEY (product_id) REFERENCES products (product_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_inv_store FOREIGN KEY (store_id) REFERENCES store (store_id) ON DELETE CASCADE ON UPDATE CASCADE
);

--
-- Dumping data for table store_inventory
--

INSERT INTO store_inventory VALUES (1,1,20),(1,2,20),(1,3,20),(1,4,20),(1,5,20),(1,6,20),(1,7,20),(1,8,20),(2,9,20),(2,10,20),(2,11,20),(2,12,20),(2,13,20),(2,14,20),(2,15,20),(2,16,20),(2,17,20),(3,18,20),(3,19,20),(3,20,20),(3,21,20),(3,22,20),(3,23,20),(3,24,20),(3,25,20),(3,26,20),(4,1,15),(4,2,15),(4,3,15),(4,4,15),(4,5,15),(4,6,15),(4,7,15),(4,8,15),(4,9,15),(4,10,15),(4,11,15),(4,12,15),(4,13,15),(4,14,15),(4,15,15),(4,16,15),(4,17,15),(4,18,15),(4,19,15),(4,20,15),(4,21,15),(4,22,15),(4,23,15),(4,24,15),(4,25,15),(4,26,15),(5,1,15),(5,2,15),(5,3,15),(5,4,15),(5,5,15),(5,6,15),(5,7,15),(5,8,15),(5,9,15),(5,10,15),(5,11,15),(5,12,15),(5,13,15),(5,14,15),(5,15,15),(5,16,15),(5,17,15),(5,18,15),(5,19,15),(5,20,15),(5,21,15),(5,22,15),(5,23,15),(5,24,15),(5,25,15),(5,26,15);

--
-- Table structure for table user
--

DROP TABLE IF EXISTS user;
CREATE TABLE user (
  uid INTEGER NOT NULL ,
  user_name varchar(255)  DEFAULT NULL,
  password_salt varchar(255)  DEFAULT NULL,
  password_hash varchar(255)  DEFAULT NULL,
  role TEXT  NOT NULL,
  PRIMARY KEY (uid)
);

--
-- Dumping data for table user
--

INSERT INTO user VALUES (1,'admin','admin_salt','admin123','admin'),(2,'Anomie','','Anomie0813*','customer'),(3,'EmmaJ','','Emma123!','customer'),(4,'NoahS','','Noah2024!','customer'),(5,'AvaP','','AvaPgh!','customer'),(6,'OliviaNY','','OliviaToy!','customer'),(7,'LiamNY','','LiamGift!','customer'),(8,'MasonNY','','MasonBook!','customer'),(9,'SophiaSEA','','SophiaSea!','customer'),(10,'EthanSEA','','Ethan981!','customer'),(11,'MiaSEA','','MiaCafe!','customer'),(12,'HarperBOS','','Harper021!','customer'),(13,'LoganBOS','','LoganBoy!','customer'),(14,'ChloeBOS','','ChloeTea!','customer'),(15,'GraceDC','','GraceDC!','customer'),(16,'JacobDC','','JacobNW!','customer'),(17,'LucasDC','','LucasToy!','customer');


-- Dump completed on 2025-11-18  1:18:56
PRAGMA foreign_keys=ON;
