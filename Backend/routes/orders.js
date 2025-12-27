const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all customer orders (for admin dashboard stats)
router.get("/all", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        order_id,
        customer_username,
        order_date,
        total_amount,
        status
      FROM Customer_orders
      WHERE status != 'cancelled'
      ORDER BY order_date DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET all publisher orders (for admin) including book title
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
            SELECT po.rep_order_id,
                   po.isbn,
                   po.pub_id,
                   po.qty,
                   po.status,
                   po.created_at,
                   po.confirmed_at,
                   b.title
            FROM Publisher_orders po
            JOIN Books b ON po.isbn = b.isbn
            ORDER BY po.created_at DESC
        `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Helper function for credit card validation (basic Luhn check)
function isValidCreditCard(number) {
  if (!number) return false;
  const sanitized = number.replace(/\D/g, "");
  if (sanitized.length !== 16) return false; // basic 16-digit check
  let sum = 0;
  let shouldDouble = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i));

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

// Helper function for expiry date validation (format MM/YY)
function isValidExpiry(expiry) {
    if (!expiry) return false;

    const [month, year] = expiry.split('/').map(Number);
    if (!month || !year || month < 1 || month > 12) return false;

    const now = new Date();
    const expiryDate = new Date(2000 + year, month, 0); // LAST day of month

    return expiryDate >= now;
}


// Customer checkout
router.post("/checkout", async (req, res) => {
  const { cart_id, customer_username, credit_card_number, credit_card_expiry } =
    req.body;

  // Validate credit card input
  if (!credit_card_number || !credit_card_expiry) {
    return res
      .status(400)
      .json({ error: "Credit card number and expiry are required" });
  }

  if (!isValidCreditCard(credit_card_number)) {
   return res.status(400).json({
  error: "Invalid credit card number. Use a valid test card like 4242 4242 4242 4242"
});

  }

  if (!isValidExpiry(credit_card_expiry)) {
    return res.status(400).json({ error: "Invalid or expired credit card" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check if cart has items
    const [items] = await conn.execute(
      "SELECT ci.*, b.stock, b.title FROM Cart_items ci JOIN Books b ON ci.isbn = b.isbn WHERE cart_id = ?",
      [cart_id]
    );
    if (items.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Validate stock availability for all items before processing
    for (const item of items) {
      if (item.stock < item.qty) {
        await conn.rollback();
        return res.status(400).json({ 
          error: `Insufficient stock for "${item.title}". Available: ${item.stock}, Requested: ${item.qty}` 
        });
      }
    }

    // Calculate total
    let total = items.reduce((sum, item) => sum + item.qty * item.price, 0);

    // Insert order
    const [orderResult] = await conn.execute(
      "INSERT INTO Customer_orders(customer_username, total_amount) VALUES (?, ?)",
      [customer_username, total]
    );
    const order_id = orderResult.insertId;

    // Insert order items and update stock (trigger will prevent negative stock)
    for (const item of items) {
      await conn.execute(
        "INSERT INTO Order_items(order_id, isbn, qty, unit_price) VALUES (?, ?, ?, ?)",
        [order_id, item.isbn, item.qty, item.price]
      );
      // Update stock - trigger will prevent negative values
      await conn.execute("UPDATE Books SET stock = stock - ? WHERE isbn = ?", [
        item.qty,
        item.isbn,
      ]);
    }

    // Clear cart
    await conn.execute("DELETE FROM Cart_items WHERE cart_id = ?", [cart_id]);

    await conn.commit();
    res.json({ message: "Checkout successful", order_id });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

router.put("/confirm/:id", async (req, res) => {
  const repOrderId = req.params.id;

  try {
    // We simply update the status to 'confirmed'. 
    // The MySQL trigger 'confirm_publisher_order' will detect this 
    // and automatically add NEW.qty to Books.stock.
    const [result] = await pool.execute(
      `UPDATE Publisher_orders 
       SET status = 'confirmed', confirmed_at = NOW() 
       WHERE rep_order_id = ? AND status = 'pending'`,
      [repOrderId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Order not found or already confirmed." });
    }

    res.json({ message: "Order confirmed! Stock updated automatically via database trigger." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// View past orders for a customer
router.get('/user/:customer_username', async (req, res) => {
  const { customer_username } = req.params;

  try {
    const [rows] = await pool.execute(
      `SELECT 
         co.order_id,
         co.order_date,
         co.total_amount,
         oi.isbn,
         oi.qty,
         oi.unit_price,
         b.title
       FROM Customer_orders co
       JOIN Order_items oi ON co.order_id = oi.order_id
       JOIN Books b ON oi.isbn = b.isbn
       WHERE co.customer_username = ?
       ORDER BY co.order_date DESC`,
      [customer_username]
    );

    const ordersMap = {};

    for (const row of rows) {
      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          id: row.order_id,
          created_at: row.order_date,
          total: row.total_amount,
          items: []
        };
      }

      ordersMap[row.order_id].items.push({
        isbn: row.isbn,
        title: row.title,
        quantity: row.qty,
        price: row.unit_price
      });
    }

    res.json(Object.values(ordersMap));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
