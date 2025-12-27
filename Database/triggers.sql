-- ========================================================
-- DATABASE TRIGGERS: ORDER PROCESSING SYSTEM
-- This file handles inventory safety and auto-replenishment.
-- ========================================================

DELIMITER $$

-- --------------------------------------------------------
-- TRIGGER 1: PREVENT NEGATIVE STOCK
-- Requirement: 2.c - Cancels any update that results in stock < 0.
-- --------------------------------------------------------
DROP TRIGGER IF EXISTS prevent_negative_stock$$

CREATE TRIGGER prevent_negative_stock
BEFORE UPDATE ON Books
FOR EACH ROW
BEGIN
    IF NEW.stock < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Operation cancelled: Stock cannot be negative.';
    END IF;
END$$


-- --------------------------------------------------------
-- TRIGGER 2: AUTOMATIC REPLENISHMENT LOGIC
-- Requirement: 3.a - Fires when stock drops below the threshold.
-- It avoids creating duplicate pending orders for the same book.
-- --------------------------------------------------------
DROP TRIGGER IF EXISTS replenish_stock$$

CREATE TRIGGER replenish_stock
AFTER UPDATE ON Books
FOR EACH ROW
BEGIN
    DECLARE pending_count INT DEFAULT 0;
    
    -- Condition: Stock was safe (>= threshold) but is now low (< threshold)
    IF OLD.stock >= OLD.threshold AND NEW.stock < NEW.threshold THEN
        
        -- Check if there is already an active 'pending' order for this ISBN
        SELECT COUNT(*) INTO pending_count
        FROM Publisher_orders
        WHERE isbn = NEW.isbn AND status = 'pending';
        
        -- Only insert if no other pending order exists
        IF pending_count = 0 THEN
            INSERT INTO Publisher_orders (isbn, pub_id, qty, status, created_at)
            VALUES (NEW.isbn, NEW.pub_id, 50, 'pending', CURRENT_TIMESTAMP);
        END IF;
    END IF;
END$$


-- --------------------------------------------------------
-- TRIGGER 3: CONFIRM PUBLISHER ORDER LOGIC
-- Requirement: 4.b - Automatically increases stock when an admin 
-- marks a publisher order as 'confirmed'.
-- --------------------------------------------------------
DROP TRIGGER IF EXISTS confirm_publisher_order$$

CREATE TRIGGER confirm_publisher_order
AFTER UPDATE ON Publisher_orders
FOR EACH ROW
BEGIN
    -- Condition: Status changed specifically from something else to 'confirmed'
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
        UPDATE Books
        SET stock = stock + NEW.qty
        WHERE isbn = NEW.isbn;
    END IF;
END$$

DELIMITER ;