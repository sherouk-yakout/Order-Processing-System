const express = require('express');
const router = express.Router();
const pool = require('../db');

// Helper functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPassword(password) {
    // At least 8 characters, one uppercase, one lowercase, one number, one special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM Users WHERE username = ? AND `password` = ?',
            [username, password]
        );
        if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Register (Customer)
router.post('/register', async (req, res) => {
    const { username, password, fname, lname, email, phone, shipping_address } = req.body;

    // Validation
    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!isValidPassword(password)) {
        return res.status(400).json({
            error: 'Password must be at least 8 characters, include uppercase, lowercase, number, and special character'
        });
    }

    try {
        await pool.execute(
            'INSERT INTO Users(username, password, fname, lname, email, phone, shipping_address, role) VALUES (?, ?, ?, ?, ?, ?, ?, "Customer")',
            [username, password, fname, lname, email, phone, shipping_address]
        );
        res.json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Edit user info or password
router.put('/edit', async (req, res) => {
    const { username, password, fname, lname, email, phone, shipping_address } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    try {
        // Fetch current password for validation
        const [currentRows] = await pool.execute(
            'SELECT `password` FROM Users WHERE username = ?',
            [username]
        );

        if (currentRows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const currentPassword = currentRows[0].password;

        const fields = [];
        const values = [];

        // Password validation
        if (password) {
            if (!isValidPassword(password)) {
                return res.status(400).json({
                    error: 'Password must be at least 8 characters, include uppercase, lowercase, number, and special character'
                });
            }
            if (password === currentPassword) {
                return res.status(400).json({ error: 'New password must be different from the old password' });
            }
            fields.push('`password` = ?');
            values.push(password);
        }

        // Email validation
        if (email) {
            if (!isValidEmail(email)) {
                return res.status(400).json({ error: 'Invalid email format' });
            }
            fields.push('email = ?');
            values.push(email);
        }

        if (fname) {
            fields.push('fname = ?');
            values.push(fname);
        }
        if (lname) {
            fields.push('lname = ?');
            values.push(lname);
        }
        if (phone) {
            fields.push('phone = ?');
            values.push(phone);
        }
        if (shipping_address) {
            fields.push('shipping_address = ?');
            values.push(shipping_address);
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        // Add username for WHERE clause
        values.push(username);

        const sql = `UPDATE Users SET ${fields.join(', ')} WHERE username = ?`;
        const [result] = await pool.execute(sql, values);

        res.json({ message: 'User info updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
