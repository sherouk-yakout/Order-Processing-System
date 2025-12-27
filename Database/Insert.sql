INSERT INTO Publishers (pub_name, pub_address, pub_phone) VALUES
('Pearson', 'New York, USA', '1111111111'),
('Oxford University Press', 'Oxford, UK', '2222222222'),
('MIT Press', 'Cambridge, USA', '3333333333'),
('McGraw-Hill', 'New York, USA', '4444444444'),
('Penguin Books', 'London, UK', '5555555555'),
('HarperCollins', 'New York, USA', '6666666666'),
('Dar Al Shorouk', 'Cairo, Egypt', '7777777777');
INSERT INTO Authors (author_name) VALUES
('Thomas H. Cormen'),
('Charles E. Leiserson'),
('Ronald L. Rivest'),
('Clifford Stein'),
('Andrew S. Tanenbaum'),
('Yuval Noah Harari'),
('Jared Diamond'),
('DK'),
('National Geographic'),
('Naguib Mahfouz'),
('Ibn Khaldun'),
('George Orwell'),
('Karen Armstrong'),
('John L. Esposito'),
('Benoit Mandelbrot'),
('James Gleick'),
('Stephen Hawking'),
('Carl Sagan'),
('Leonardo da Vinci'),
('Vincent van Gogh'),
('Pablo Picasso'),
('Homer'),
('Sun Tzu'),
('Edward Said'),
('Taha Hussein');
INSERT INTO Books
(isbn, title, publish_year, price, stock, threshold, category, pub_id)
VALUES
-- Science books
('9780262033848', 'Introduction to Algorithms', 2009, 450, 25, 5, 'Science', 3),
('9780132126953', 'Computer Networks', 2011, 380, 18, 5, 'Science', 2),
('9780465026562', 'The Information', 2011, 320, 20, 5, 'Science', 6),
('9780671027032', 'Chaos', 1987, 260, 14, 4, 'Science', 6),
('9781846148334', 'The Selfish Gene', 2006, 280, 16, 4, 'Science', 5),
('9780553380163', 'A Brief History of Time', 1988, 250, 12, 3, 'Science', 5),
('9780345331357', 'Cosmos', 1980, 220, 15, 4, 'Science', 5),
('9780061234002', 'The Elegant Universe', 1999, 270, 10, 3, 'Science', 6),

-- History books
('9780099590088', 'Sapiens', 2015, 300, 30, 6, 'History', 5),
('9780393317558', 'Guns, Germs, and Steel', 1997, 290, 22, 5, 'History', 6),
('9780140449198', 'The Muqaddimah', 2005, 280, 14, 4, 'History', 5),
('9780140443622', 'The Iliad', 1950, 180, 20, 5, 'History', 5),
('9780140444230', 'The Odyssey', 1946, 180, 18, 4, 'History', 5),

-- Geography books
('9781426203385', 'National Geographic Atlas of the World', 2008, 520, 8, 2, 'Geography', 6),
('9780241226148', 'The Geography Book', 2016, 240, 18, 4, 'Geography', 6),
('9781465444027', 'DK Geography of the World', 2017, 260, 15, 4, 'Geography', 6),
('9780195180053', 'The World Atlas', 2010, 480, 6, 2, 'Geography', 2),

-- Religion books
('9780345384560', 'A History of God', 1994, 240, 20, 5, 'Religion', 5),
('9780195144031', 'What Everyone Needs to Know About Islam', 2011, 230, 17, 4, 'Religion', 2),
('9780060674734', 'The Case for God', 2009, 260, 14, 4, 'Religion', 6),

-- Art books
('9789770916738', 'Palace Walk', 1956, 200, 22, 5, 'Art', 7),
('9789770916745', 'Palace of Desire', 1957, 210, 18, 5, 'Art', 7),
('9780140449266', 'The Art of War', 2005, 160, 25, 6, 'Art', 5),
('9780140449267', 'Leonardo da Vinci: Notebooks', 2008, 350, 11, 3, 'Art', 5),
('9780500238678', 'Van Gogh: The Complete Paintings', 2012, 420, 9, 2, 'Art', 5),
('9780500238685', 'Picasso: The Complete Works', 2010, 450, 7, 2, 'Art', 5);

INSERT INTO Book_authors (isbn, author_id) VALUES
('9780262033848', 1),
('9780262033848', 2),
('9780262033848', 3),
('9780262033848', 4),
('9780132126953', 5),
('9780465026562', 16),
('9780671027032', 16),
('9780099590088', 6),
('9780393317558', 7),
('9780140449198', 11),
('9781426203385', 9),
('9780241226148', 8),
('9781465444027', 8),
('9780345384560', 13),
('9780195144031', 14),
('9789770916738', 10),
('9789770916745', 10),
('9780140449266', 12),
('9780553380163', 17),
('9780345331357', 18),
('9780061234002', 18),
('9780140443622', 22),
('9780140444230', 22),
('9780195180053', 9),
('9780060674734', 13),
('9780140449267', 19),
('9780500238678', 20),
('9780500238685', 21);

INSERT INTO Users (username, password, fname, lname, email, phone, shipping_address, role) VALUES
('admin1', 'admin123', 'Admin', 'One', 'admin@store.com', '0100000000', 'Admin Office', 'Admin'),
('user1', 'user123', 'Sara', 'Ali', 'sara@mail.com', '0101111111', 'Alexandria', 'Customer'),
('user2', 'user123', 'Omar', 'Hassan', 'omar@mail.com', '0102222222', 'Cairo', 'Customer');
('user3', 'user123', 'Ahmed', 'Mohamed', 'ahmed@mail.com', '0103333333', 'Giza', 'Customer'),
('user4', 'user123', 'Fatima', 'Ibrahim', 'fatima@mail.com', '0104444444', 'Mansoura', 'Customer'),
('user5', 'user123', 'Khaled', 'Ali', 'khaled@mail.com', '0105555555', 'Aswan', 'Customer');

INSERT INTO Carts (customer_username, status) VALUES
('user1', 'active'),
('user2', 'active');

INSERT INTO Cart_items (cart_id, isbn, qty, price) VALUES
(1, '9780262033848', 1, 450),
(1, '9780099590088', 1, 300),
(2, '9789770916738', 1, 200);

-- Customer orders with various dates for testing reports
-- Orders from previous month (for testing previous month sales report)
INSERT INTO Customer_orders (customer_username, total_amount, order_date) VALUES
('user1', 750.00, DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) + INTERVAL 5 DAY),   
('user2', 200.00, DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) + INTERVAL 10 DAY),   
('user1', 380.00, DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) + INTERVAL 15 DAY),
('user3', 520.00, DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) + INTERVAL 20 DAY),
('user2', 290.00, DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) + INTERVAL 25 DAY);

-- Orders from last 3 months (for testing top customers and top books)
INSERT INTO Customer_orders (customer_username, total_amount, order_date) VALUES
('user1', 450.00, DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH) + INTERVAL 3 DAY),
('user4', 300.00, DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH) + INTERVAL 8 DAY),
('user1', 280.00, DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH) + INTERVAL 12 DAY),
('user5', 180.00, DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH) + INTERVAL 18 DAY),
('user2', 240.00, DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH) + INTERVAL 22 DAY),
('user3', 350.00, DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH) + INTERVAL 28 DAY),
('user1', 420.00, DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH) + INTERVAL 2 DAY),
('user4', 230.00, DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH) + INTERVAL 7 DAY),
('user2', 260.00, DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH) + INTERVAL 14 DAY),
('user1', 180.00, DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH) + INTERVAL 21 DAY);

-- Orders from a specific day (for testing daily sales report)
-- Using a date from last month
INSERT INTO Customer_orders (customer_username, total_amount, order_date) VALUES
('user3', 320.00, DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) + INTERVAL 12 DAY),
('user4', 240.00, DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) + INTERVAL 12 DAY),
('user5', 180.00, DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) + INTERVAL 12 DAY);

-- Recent orders (this month)
INSERT INTO Customer_orders (customer_username, total_amount, order_date) VALUES
('user2', 300.00, DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY)),
('user3', 450.00, DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY)),
('user1', 220.00, DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY));

-- Order items for all orders
INSERT INTO Order_items (order_id, isbn, qty, unit_price) VALUES
-- Previous month orders
(1, '9780262033848', 1, 450.00),  
(1, '9780099590088', 1, 300.00),  
(2, '9789770916738', 1, 200.00),  
(3, '9780132126953', 1, 380.00),
(4, '9781426203385', 1, 520.00),
(5, '9780393317558', 1, 290.00),

-- Last 3 months orders
(6, '9780262033848', 1, 450.00),
(7, '9780099590088', 1, 300.00),
(8, '9781846148334', 1, 280.00),
(9, '9780140443622', 1, 180.00),
(10, '9780345384560', 1, 240.00),
(11, '9780140449267', 1, 350.00),
(12, '9780500238678', 1, 420.00),
(13, '9780195144031', 1, 230.00),
(14, '9781465444027', 1, 260.00),
(15, '9780140444230', 1, 180.00),

-- Specific day orders (same day)
(16, '9780465026562', 1, 320.00),
(17, '9780345384560', 1, 240.00),
(18, '9780140443622', 1, 180.00),

-- Recent orders
(19, '9780099590088', 1, 300.00),
(20, '9780262033848', 1, 450.00),
(21, '9780195144031', 1, 230.00);

-- Publisher orders with various statuses for testing
INSERT INTO Publisher_orders (isbn, pub_id, qty, status, created_at) VALUES
('9780262033848', 3, 50, 'pending', DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY)),   
('9789770916738', 7, 50, 'pending', DATE_SUB(CURRENT_DATE, INTERVAL 8 DAY)),  
('9780132126953', 2, 50, 'pending', DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY)),
('9781426203385', 6, 50, 'confirmed', DATE_SUB(CURRENT_DATE, INTERVAL 15 DAY)),
('9781426203385', 6, 50, 'confirmed', DATE_SUB(CURRENT_DATE, INTERVAL 20 DAY)),
('9780500238678', 5, 50, 'confirmed', DATE_SUB(CURRENT_DATE, INTERVAL 12 DAY)),
('9780500238685', 5, 50, 'confirmed', DATE_SUB(CURRENT_DATE, INTERVAL 18 DAY)),
('9780195180053', 2, 50, 'pending', DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY));
