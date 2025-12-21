const express = require('express');
const router = express.Router();
const pool = require('../db');

// Add item to cart
router.post('/add', async (req, res) => {
    const { cart_id, isbn, qty, price } = req.body;
    try {
        await pool.execute(
            'INSERT INTO Cart_items(cart_id, isbn, qty, price) VALUES (?, ?, ?, ?)',
            [cart_id, isbn, qty, price]
        );
        res.json({ message: 'Item added to cart' });
    } catch(err) {
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

module.exports = router;
