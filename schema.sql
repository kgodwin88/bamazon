DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;
USE bamazon;

CREATE TABLE products
(
    item_id int not null,
    product_name varchar(100) not null,
    department_name varchar(100) not null,
    price decimal(11,2) not null,
    stock_quantity int(11) not null,
    product_sales int(11) not null
);

INSERT INTO products (item_id, product_name, department_name, price, stock_quantity, product_sales)
VALUES("96123", "Channellocks", "Tools", "13.99", "5", "3567.45"),
("98476", "Metric Socket Set", "Tools", "19.99", "13", "3118.44"),
("43256", "Blender", "Small Appliances", "25.99", "0", "3248.75"),
("90876", "50 inch Television", "Electronics", "499.99", "10", "17999.64"),
("67542", "XBOX ONE", "Electronics", "299.99", "5", "7199.76"),
("48938", "Fishing Pole", "Sporting Goods", "31.99", "10", "2399.25"),
("57849", "8 Man Tent", "Sporting Goods", "99.99", "12", "12698.73"),
("75940", "Toaster", "Small Appliances", "27.99", "7", "2854.98"),
("23456", "300 Piece Lego Set", "Toys", "149.99", "13", "11099.26"),
("47859", "F150 Power Wheels", "Toys", "399.99", "1", "9999.75");

CREATE TABLE departments(
    id int AUTO_INCREMENT,
    department_name varchar(100) not null,
    overhead_cost decimal(11,2) not null,
    PRIMARY KEY (id)
);

INSERT INTO departments(department_name, overhead_cost)
VALUES("Tools", "5000"),
("Small Appliances", "6000"),
("Electronics", "12000"),
("Sporting Goods", "3500"),
("Toys", "10500");