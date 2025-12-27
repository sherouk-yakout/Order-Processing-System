DELIMITER $$
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

DROP TRIGGER IF EXISTS replenish_stock$$

CREATE TRIGGER replenish_stock
AFTER UPDATE ON Books
FOR EACH ROW
BEGIN
    DECLARE pending_count INT DEFAULT 0;
    
    IF OLD.stock >= OLD.threshold AND NEW.stock < NEW.threshold THEN
        
        SELECT COUNT(*) INTO pending_count
        FROM Publisher_orders
        WHERE isbn = NEW.isbn AND status = 'pending';
        
        IF pending_count = 0 THEN
            INSERT INTO Publisher_orders (isbn, pub_id, qty, status, created_at)
            VALUES (NEW.isbn, NEW.pub_id, 50, 'pending', CURRENT_TIMESTAMP);
        END IF;
    END IF;
END$$

DROP TRIGGER IF EXISTS confirm_publisher_order$$

CREATE TRIGGER confirm_publisher_order
AFTER UPDATE ON Publisher_orders
FOR EACH ROW
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
        UPDATE Books
        SET stock = stock + NEW.qty
        WHERE isbn = NEW.isbn;
    END IF;
END$$

DELIMITER ;