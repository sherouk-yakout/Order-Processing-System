
INSERT INTO Publishers (pub_name, pub_address, pub_phone) VALUES
('Pearson', 'New York, USA', '1111111111'),
('Oxford Press', 'Oxford, UK', '2222222222'),
('Dar Al Shorouk', 'Cairo, Egypt', '3333333333');

INSERT INTO Authors (author_name) VALUES
('Thomas H. Cormen'),
('Andrew S. Tanenbaum'),
('Naguib Mahfouz'),
('Ibn Khaldun');

INSERT INTO Books
(isbn, title, publish_year, price, stock, threshold, category, pub_id)
VALUES
('1111111111111', 'Introduction to Algorithms', 2009, 450.00, 20, 5, 'Science', 1),
('2222222222222', 'Computer Networks', 2011, 380.00, 15, 5, 'Science', 2),
('3333333333333', 'Palace Walk', 1956, 200.00, 10, 3, 'Art', 3),
('4444444444444', 'Muqaddimah', 1377, 300.00, 8, 3, 'History', 3);

INSERT INTO Book_authors (isbn, author_id) VALUES
('1111111111111', 1),
('2222222222222', 2),
('3333333333333', 3),
('4444444444444', 4);

INSERT INTO Users
(username, `password`, fname, lname, email, phone, shipping_address, `role`)
VALUES
('admin1', 'admin123', 'Admin', 'One', 'admin@store.com', '0100000000', 'Admin Office', 'admin'),
('user1', 'user123', 'Sara', 'Ali', 'sara@mail.com', '0101111111', 'Alexandria', 'customer'),
('user2', 'user123', 'Omar', 'Hassan', 'omar@mail.com', '0102222222', 'Cairo', 'customer');

INSERT INTO Carts (customer_username, status) VALUES
('user1', 'active'),
('user2', 'active');

INSERT INTO Cart_items (cart_id, isbn, qty, price) VALUES
(1, '1111111111111', 2, 450.00),
(1, '3333333333333', 1, 200.00),
(2, '2222222222222', 1, 380.00);

INSERT INTO Customer_orders (customer_username, total_amount) VALUES
('user1', 1100.00),
('user2', 380.00);

INSERT INTO Order_items (order_id, isbn, qty, unit_price) VALUES
(1, '1111111111111', 2, 450.00),
(1, '3333333333333', 1, 200.00),
(2, '2222222222222', 1, 380.00);
