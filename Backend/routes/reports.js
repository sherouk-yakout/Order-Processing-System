const express = require('express');
const router = express.Router();
const pool = require('../db');

// a) Total sales for previous month
router.get('/sales/previous-month', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT SUM(total_amount) AS total_sales
            FROM Customer_orders
            WHERE MONTH(order_date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)
              AND YEAR(order_date) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH)
        `);
        res.json(rows[0]);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// b) Total sales for a specific day
// Pass date as query param: ?date=YYYY-MM-DD
router.get('/sales/by-day', async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date is required. Format: YYYY-MM-DD' });

    try {
        const [rows] = await pool.execute(`
            SELECT SUM(total_amount) AS total_sales
            FROM Customer_orders
            WHERE DATE(order_date) = ?
        `, [date]);
        res.json(rows[0]);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// c) Top 5 customers (last 3 months)
router.get('/top-customers', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT customer_username, SUM(total_amount) AS total
            FROM Customer_orders
            WHERE order_date >= DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)
            GROUP BY customer_username
            ORDER BY total DESC
            LIMIT 5
        `);
        res.json(rows);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// d) Top 10 selling books (last 3 months)
router.get('/top-books', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT b.isbn, b.title, SUM(oi.qty) AS total_sold
            FROM Order_items oi
            JOIN Books b ON oi.isbn = b.isbn
            JOIN Customer_orders co ON oi.order_id = co.order_id
            WHERE co.order_date >= DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)
            GROUP BY b.isbn, b.title
            ORDER BY total_sold DESC
            LIMIT 10
        `);
        res.json(rows);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// e) Total number of times a specific book has been ordered
// Pass isbn as query param: ?isbn=XXX
router.get('/book-orders/count', async (req, res) => {
    const { title } = req.query;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    try {
        const [books] = await pool.execute(`SELECT isbn FROM Books WHERE title = ?`, [title]);
        if (books.length === 0) return res.status(404).json({ error: 'Book not found' });

        const isbn = books[0].isbn;
        const [rows] = await pool.execute(`
            SELECT COUNT(*) AS times_ordered
            FROM Publisher_orders
            WHERE isbn = ?
        `, [isbn]);
        res.json(rows[0]);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
