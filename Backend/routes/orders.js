const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all publisher orders (for admin) including book title
router.get('/', async (req, res) => {
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
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Helper function for credit card validation (basic Luhn check)
function isValidCreditCard(number) {
    if (!number) return false;
    const sanitized = number.replace(/\D/g, '');
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
    if (!expiry) return false; // make sure expiry is provided
    const parts = expiry.split('/');
    if (parts.length !== 2) return false;
    const [month, year] = parts.map(Number);
    if (!month || !year || month < 1 || month > 12) return false;

    const current = new Date();
    const expiryDate = new Date(2000 + year, month - 1, 1);
    return expiryDate >= new Date(current.getFullYear(), current.getMonth(), 1);
}

// Customer checkout
router.post('/checkout', async (req, res) => {
    const { cart_id, customer_username, credit_card_number, credit_card_expiry } = req.body;

    // Validate credit card input
    if (!credit_card_number || !credit_card_expiry) {
        return res.status(400).json({ error: "Credit card number and expiry are required" });
    }

    if (!isValidCreditCard(credit_card_number)) {
        return res.status(400).json({ error: "Invalid credit card number" });
    }

    if (!isValidExpiry(credit_card_expiry)) {
        return res.status(400).json({ error: "Invalid or expired credit card" });
    }

    try {
        // Check if cart has items
        const [items] = await pool.execute('SELECT * FROM Cart_items WHERE cart_id = ?', [cart_id]);
        if (items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

        // Calculate total
        let total = items.reduce((sum, item) => sum + item.qty * item.price, 0);

        // Insert order
        const [orderResult] = await pool.execute(
            'INSERT INTO Customer_orders(customer_username, total_amount) VALUES (?, ?)',
            [customer_username, total]
        );
        const order_id = orderResult.insertId;

        // Insert order items and update stock
        for (const item of items) {
            await pool.execute(
                'INSERT INTO Order_items(order_id, isbn, qty, unit_price) VALUES (?, ?, ?, ?)',
                [order_id, item.isbn, item.qty, item.price]
            );
            await pool.execute('UPDATE Books SET stock = stock - ? WHERE isbn = ?', [item.qty, item.isbn]);
        }

        // Clear cart
        await pool.execute('DELETE FROM Cart_items WHERE cart_id = ?', [cart_id]);

        res.json({ message: 'Checkout successful', order_id });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin confirms publisher order
router.put('/confirm/:rep_order_id', async (req, res) => {
    const { rep_order_id } = req.params;
    try {
        await pool.execute(
            'UPDATE Publisher_orders SET status = "confirmed", confirmed_at = NOW() WHERE rep_order_id = ?',
            [rep_order_id]
        );
        res.json({ message: 'Publisher order confirmed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// View past orders for a customer
router.get('/past/:customer_username', async (req, res) => {
    const { customer_username } = req.params;
    try {
        const [orders] = await pool.execute(
            `SELECT co.order_id, co.order_date, co.total_amount, 
                    oi.isbn, b.title, oi.qty, oi.unit_price
             FROM Customer_orders co
             JOIN Order_items oi ON co.order_id = oi.order_id
             JOIN Books b ON oi.isbn = b.isbn
             WHERE co.customer_username = ?
             ORDER BY co.order_date DESC`,
            [customer_username]
        );
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
