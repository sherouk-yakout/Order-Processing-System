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
('James Gleick');
INSERT INTO Books
(isbn, title, publish_year, price, stock, threshold, category, pub_id)
VALUES
('9780262033848', 'Introduction to Algorithms', 2009, 450, 25, 5, 'Science', 3),
('9780132126953', 'Computer Networks', 2011, 380, 18, 5, 'Science', 2),
('9780465026562', 'The Information', 2011, 320, 20, 5, 'Science', 6),
('9780671027032', 'Chaos', 1987, 260, 14, 4, 'Science', 6),
('9781846148334', 'The Selfish Gene', 2006, 280, 16, 4, 'Science', 5),

('9780099590088', 'Sapiens', 2015, 300, 30, 6, 'History', 5),
('9780393317558', 'Guns, Germs, and Steel', 1997, 290, 22, 5, 'History', 6),
('9780140449198', 'The Muqaddimah', 2005, 280, 14, 4, 'History', 5),

('9781426203385', 'National Geographic Atlas of the World', 2008, 520, 8, 2, 'Geography', 6),
('9780241226148', 'The Geography Book', 2016, 240, 18, 4, 'Geography', 6),
('9781465444027', 'DK Geography of the World', 2017, 260, 15, 4, 'Geography', 6),

('9780345384560', 'A History of God', 1994, 240, 20, 5, 'Religion', 5),
('9780195144031', 'What Everyone Needs to Know About Islam', 2011, 230, 17, 4, 'Religion', 2),

('9789770916738', 'Palace Walk', 1956, 200, 22, 5, 'Art', 7),
('9789770916745', 'Palace of Desire', 1957, 210, 18, 5, 'Art', 7),
('9780140449266', 'The Art of War', 2005, 160, 25, 6, 'Art', 5);

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
('9780140449266', 12);

INSERT INTO Users (username, password, fname, lname, email, phone, shipping_address, role) VALUES
('admin1', 'admin123', 'Admin', 'One', 'admin@store.com', '0100000000', 'Admin Office', 'admin'),
('user1', 'user123', 'Sara', 'Ali', 'sara@mail.com', '0101111111', 'Alexandria', 'customer'),
('user2', 'user123', 'Omar', 'Hassan', 'omar@mail.com', '0102222222', 'Cairo', 'customer');

INSERT INTO Carts (customer_username, status) VALUES
('user1', 'active'),
('user2', 'active');

INSERT INTO Cart_items (cart_id, isbn, qty, price) VALUES
(1, '9780262033848', 1, 450),
(1, '9780099590088', 1, 300),
(2, '9789770916738', 1, 200);

INSERT INTO Customer_orders (customer_username, total_amount) VALUES
('user1', 750.00),   
('user2', 200.00),   
('user1', 380.00);   
INSERT INTO Order_items (order_id, isbn, qty, unit_price) VALUES
(1, '9780262033848', 1, 450.00),  
(1, '9780099590088', 1, 300.00),  
(2, '9789770916738', 1, 200.00),  
(3, '9780132126953', 1, 380.00);  
INSERT INTO Publisher_orders (isbn, pub_id, qty, status) VALUES
('9780262033848', 3, 40, 'pending'),   
('9789770916738', 7, 60, 'pending'),  
('9780132126953', 2, 50, 'pending');   
