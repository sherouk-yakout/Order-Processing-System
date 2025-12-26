CREATE DATABASE Order_Processing_System;
USE Order_Processing_System;

CREATE TABLE Publishers(
    pub_id INT AUTO_INCREMENT PRIMARY KEY, 
    pub_name VARCHAR(100) NOT NULL UNIQUE,
    pub_address VARCHAR(255) NOT NULL,
    pub_phone VARCHAR(20) NOT NULL
);
CREATE TABLE Books (
    isbn VARCHAR(13) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category ENUM('Science','Art','Religion','History','Geography') NOT NULL,
    publish_year YEAR,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    threshold INT NOT NULL,
    pub_id INT NOT NULL,
    FOREIGN KEY (pub_id) REFERENCES Publishers(pub_id)
);
CREATE TABLE Authors(
    author_id INT AUTO_INCREMENT PRIMARY KEY,
    author_name VARCHAR(100) NOT NULL
);
CREATE TABLE Book_authors( --a book can have one or more authors
    isbn VARCHAR(13),
    author_id INT,
    PRIMARY KEY (isbn, author_id),
    FOREIGN KEY (author_id) REFERENCES Authors(author_id),
    FOREIGN KEY (isbn) REFERENCES Books(isbn)
);
CREATE TABLE Users(
    username VARCHAR(50) PRIMARY KEY,
    `password` VARCHAR(255) NOT NULL,
    fname VARCHAR(50) NOT NULL,
    lname VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    shipping_address VARCHAR(255) NOT NULL,
    `role` ENUM('Admin','Customer') NOT NULL
);
CREATE TABLE Carts(
    cart_id INT AUTO_INCREMENT PRIMARY KEY, 
    customer_username VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active','checked_out','abandoned') NOT NULL,
    FOREIGN KEY (customer_username) REFERENCES Users(username) ON UPDATE CASCADE
);
CREATE TABLE Cart_items(
    cart_id INT,
    isbn VARCHAR(13),
    qty INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY(cart_id, isbn),
    FOREIGN KEY (cart_id) REFERENCES Carts(cart_id),
    FOREIGN KEY (isbn) REFERENCES Books(isbn)
);
CREATE TABLE Customer_orders(
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_username VARCHAR(50) NOT NULL,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending','paid','cancelled') NOT NULL DEFAULT 'paid',
    FOREIGN KEY (customer_username) REFERENCES Users(username) ON UPDATE CASCADE
);
CREATE TABLE Order_items(
    order_id INT,
    isbn VARCHAR(13),
    qty INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (order_id, isbn),
    FOREIGN KEY (order_id) REFERENCES Customer_orders(order_id),
    FOREIGN KEY (isbn) REFERENCES Books(isbn)
);
CREATE TABLE Publisher_orders(
    rep_order_id INT AUTO_INCREMENT PRIMARY KEY,
    isbn VARCHAR(13) NOT NULL,
    pub_id INT NOT NULL,
    qty INT NOT NULL,
    status ENUM('pending','confirmed','received','cancelled') NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    confirmed_at DATETIME,
    FOREIGN KEY (isbn) REFERENCES Books(isbn),
    FOREIGN KEY (pub_id) REFERENCES Publishers(pub_id)
);
