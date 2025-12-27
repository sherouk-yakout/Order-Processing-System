const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/sales/previous-month', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT COALESCE(SUM(total_amount), 0) AS total_sales
            FROM Customer_orders
            WHERE MONTH(order_date) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))
              AND YEAR(order_date) = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))
              AND status != 'cancelled'
        `);
        res.json(rows[0]);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/sales/by-day', async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date is required. Format: YYYY-MM-DD' });

    try {
        const [rows] = await pool.execute(`
            SELECT COALESCE(SUM(total_amount), 0) AS total_sales
            FROM Customer_orders
            WHERE DATE(order_date) = ?
              AND status != 'cancelled'
        `, [date]);
        res.json(rows[0]);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// Monthly sales report - sales by month
router.get('/sales/monthly', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                DATE_FORMAT(order_date, '%Y-%m') AS month,
                DATE_FORMAT(order_date, '%M %Y') AS month_name,
                COALESCE(SUM(total_amount), 0) AS total_sales,
                COALESCE(SUM(total_amount), 0) AS total,
                COUNT(*) AS order_count
            FROM Customer_orders
            WHERE order_date >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
              AND status != 'cancelled'
            GROUP BY DATE_FORMAT(order_date, '%Y-%m'), DATE_FORMAT(order_date, '%M %Y')
            ORDER BY month DESC
        `);
        res.json(rows);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/top-customers', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                co.customer_username,
                u.fname,
                u.lname,
                COALESCE(SUM(co.total_amount), 0) AS total
            FROM Customer_orders co
            JOIN Users u ON co.customer_username = u.username
            WHERE co.order_date >= DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)
              AND co.status != 'cancelled'
            GROUP BY co.customer_username, u.fname, u.lname
            ORDER BY total DESC
            LIMIT 5
        `);
        res.json(rows);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/top-books', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                b.isbn, 
                b.title, 
                COALESCE(SUM(oi.qty), 0) AS total_sold
            FROM Order_items oi
            JOIN Books b ON oi.isbn = b.isbn
            JOIN Customer_orders co ON oi.order_id = co.order_id
            WHERE co.order_date >= DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)
              AND co.status != 'cancelled'
            GROUP BY b.isbn, b.title
            HAVING total_sold > 0
            ORDER BY total_sold DESC
            LIMIT 10
        `);
        res.json(rows);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/book-orders/count', async (req, res) => {
    const { title } = req.query;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    try {
        const [books] = await pool.execute(`SELECT isbn, title FROM Books WHERE title = ?`, [title]);
        if (books.length === 0) return res.status(404).json({ error: 'Book not found' });

        const isbn = books[0].isbn;
        const [rows] = await pool.execute(`
            SELECT 
                b.title,
                COUNT(*) AS times_ordered
            FROM Publisher_orders po
            JOIN Books b ON po.isbn = b.isbn
            WHERE po.isbn = ?
            GROUP BY b.title
        `, [isbn]);
        res.json(rows[0] || { title: books[0].title, times_ordered: 0 });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// Total sales (all time)
router.get('/total-sales', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT COALESCE(SUM(total_amount), 0) AS total
            FROM Customer_orders
            WHERE status != 'cancelled'
        `);
        res.json(rows[0]);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// Top categories by sales
router.get('/top-categories', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                b.category,
                COALESCE(SUM(oi.qty), 0) AS total
            FROM Order_items oi
            JOIN Books b ON oi.isbn = b.isbn
            JOIN Customer_orders co ON oi.order_id = co.order_id
            WHERE co.status != 'cancelled'
            GROUP BY b.category
            ORDER BY total DESC
            LIMIT 10
        `);
        res.json(rows);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
