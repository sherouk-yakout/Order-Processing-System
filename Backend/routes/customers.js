const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get customer profile by username (used as user_id throughout the frontend)
router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const [rows] = await pool.execute(
      'SELECT username, fname AS first_name, lname AS last_name, email, phone, shipping_address FROM Users WHERE username = ?',
      [user_id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update customer profile by username
router.put('/update/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const {
    first_name,
    last_name,
    username,
    email,
    phone,
    shipping_address,
    password
  } = req.body;

  try {
    // If username is changed, we update it too (simple approach).
    // In a full system you'd enforce uniqueness + update foreign keys.
    const newUsername = username || user_id;

    // Build query based on whether password is provided
    if (password && String(password).trim().length > 0) {
      await pool.execute(
        `UPDATE Users
         SET fname = ?, lname = ?, username = ?, email = ?, phone = ?, shipping_address = ?, password = ?
         WHERE username = ?`,
        [first_name, last_name, newUsername, email, phone, shipping_address, password, user_id]
      );
    } else {
      await pool.execute(
        `UPDATE Users
         SET fname = ?, lname = ?, username = ?, email = ?, phone = ?, shipping_address = ?
         WHERE username = ?`,
        [first_name, last_name, newUsername, email, phone, shipping_address, user_id]
      );
    }

    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
