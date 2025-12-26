const express = require('express');
const router = express.Router();
const pool = require('../db');

// Add item to cart
router.post("/add", async (req, res) => {
  const { cart_id, isbn, qty, price } = req.body;

  try {
    await pool.execute(
      `INSERT INTO cart_items (cart_id, isbn, qty, price)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         qty = qty + VALUES(qty),
         price = VALUES(price)`,
      [cart_id, isbn, qty || 1, price]
    );

    res.json({ message: "Added to cart (qty updated if existed)" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear cart (for logout)
router.delete('/clear/:cart_id', async (req, res) => {
  const { cart_id } = req.params;
  try {
    await pool.execute(
      'DELETE FROM Cart_items WHERE cart_id = ?',
      [cart_id]
    );
    res.json({ message: 'Cart cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// View cart
router.get('/:cart_id', async (req, res) => {
    const { cart_id } = req.params;
    try {
        const [rows] = await pool.execute(
            'SELECT ci.isbn, b.title, ci.qty, ci.price FROM Cart_items ci JOIN Books b ON ci.isbn = b.isbn WHERE cart_id = ?',
            [cart_id]
        );
        res.json(rows);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// Remove item
router.delete('/:cart_id/:isbn', async (req, res) => {
    const { cart_id, isbn } = req.params;
    try {
        await pool.execute('DELETE FROM Cart_items WHERE cart_id = ? AND isbn = ?', [cart_id, isbn]);
        res.json({ message: 'Item removed from cart' });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});
// Clear cart (for logout)
router.delete('/clear/:cart_id', async (req, res) => {
    const { cart_id } = req.params;
    try {
        await pool.execute('DELETE FROM Cart_items WHERE cart_id = ?', [cart_id]);
        res.json({ message: 'Cart cleared successfully' });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});
// Update quantity 
router.patch("/qty", async (req, res) => {
  const { cart_id, isbn, delta } = req.body;

  if (!cart_id || !isbn || !Number.isInteger(delta) || delta === 0) {
    return res.status(400).json({ error: "cart_id, isbn, and delta are required" });
  }

  try {
    if (delta > 0) {
      // Increase qty
      await pool.execute(
        `UPDATE Cart_items SET qty = qty + ? WHERE cart_id = ? AND isbn = ?`,
        [delta, cart_id, isbn]
      );
    } else {
      // Decrease qty but don't go below 0
      await pool.execute(
        `UPDATE Cart_items SET qty = GREATEST(qty + ?, 0) WHERE cart_id = ? AND isbn = ?`,
        [delta, cart_id, isbn]
      );

      // Remove row if qty became 0
      await pool.execute(
        `DELETE FROM Cart_items WHERE cart_id = ? AND isbn = ? AND qty <= 0`,
        [cart_id, isbn]
      );
    }

    // return updated cart
    const [rows] = await pool.execute(
      `SELECT ci.isbn, b.title, ci.qty, ci.price
       FROM Cart_items ci JOIN Books b ON ci.isbn = b.isbn
       WHERE cart_id = ?`,
      [cart_id]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;