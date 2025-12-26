const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all books OR search books (Admin & Customer)
router.get('/', async (req, res) => {
    const { isbn, title, category, author, publisher } = req.query;

    let sql = `
        SELECT DISTINCT
            b.isbn,
            b.title,
            b.category,
            b.publish_year,
            b.price,
            b.stock,
            p.pub_name AS publisher,
            a.author_name AS author
        FROM Books b
        JOIN Publishers p ON b.pub_id = p.pub_id
        LEFT JOIN Book_authors ba ON b.isbn = ba.isbn
        LEFT JOIN Authors a ON ba.author_id = a.author_id
        WHERE 1=1
    `;

    const params = [];

    if (isbn) {
        sql += ' AND b.isbn = ?';
        params.push(isbn);
    }

    if (title) {
        sql += ' AND b.title LIKE ?';
        params.push(`%${title}%`);
    }

    if (category) {
        sql += ' AND b.category = ?';
        params.push(category);
    }

    if (author) {
        sql += ' AND a.author_name LIKE ?';
        params.push(`%${author}%`);
    }

    if (publisher) {
        sql += ' AND p.pub_name LIKE ?';
        params.push(`%${publisher}%`);
    }

    try {
        const [rows] = await pool.execute(sql, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Add new book (Admin only)
router.post('/', async (req, res) => {
    const { isbn, title, category, publish_year, price, stock, threshold, pub_id } = req.body;
    try {
        await pool.execute(
            'INSERT INTO Books(isbn, title, category, publish_year, price, stock, threshold, pub_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [isbn, title, category, publish_year, price, stock, threshold, pub_id]
        );
        res.json({ message: 'Book added successfully' });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// Update book (Admin)
router.put('/:isbn', async (req, res) => {
    const { isbn } = req.params;
    const { title, category, publish_year, price, stock, threshold, pub_id } = req.body;
    try {
        await pool.execute(
            'UPDATE Books SET title=?, category=?, publish_year=?, price=?, stock=?, threshold=?, pub_id=? WHERE isbn=?',
            [title, category, publish_year, price, stock, threshold, pub_id, isbn]
        );
        res.json({ message: 'Book updated successfully' });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
