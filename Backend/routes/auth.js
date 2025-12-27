const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
  return password.length >= 6;
}

router.post("/login", async (req, res) => {
  console.log("LOGIN HIT:", req.body);

  const { email, password } = req.body;

  try {
    // Get user with hashed password
    const [rows] = await pool.execute(
      "SELECT username, role, password FROM Users WHERE email = ?",
      [email]
    );

    if (rows.length === 0)
      return res.status(401).json({ error: "Invalid email or password" });

    const user = rows[0];

    // Verify password (check both hashed and plain text for backward compatibility during migration)
    let passwordValid = false;
    if (user.password.startsWith('$2')) {
      // Password is hashed with bcrypt
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      // Plain text password (for existing data)
      passwordValid = user.password === password;
    }

    if (!passwordValid)
      return res.status(401).json({ error: "Invalid email or password" });

    // Only create cart for customers, not admins
    let cart_id = null;
    if (user.role === 'Customer') {
      const [insertResult] = await pool.execute(
      "INSERT INTO Carts(customer_username, status) VALUES (?, 'active')",
      [user.username]
    );
      cart_id = insertResult.insertId;
    }

    res.json({
      message: "Login successful",
      user_id: user.username,
      role: user.role,
      cart_id
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all customers (for admin dashboard)
router.get("/customers", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT username, fname, lname, email, phone, shipping_address FROM Users WHERE role = 'Customer'"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/signup", async (req, res) => {
  const {
    username,
    password,
    first_name,
    last_name,
    email,
    phone,
    shipping_address,
  } = req.body;

  if (!isValidEmail(email))
    return res.status(400).json({ error: "Invalid email format" });

  if (!isValidPassword(password))
    return res.status(400).json({ error: "Weak password" });

  try {
    // Hash password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await pool.execute(
      `INSERT INTO Users(username, password, fname, lname, email, phone, shipping_address, role)
             VALUES (?, ?, ?, ?, ?, ?, ?, "Customer")`,
      [
        username,
        hashedPassword,
        first_name,
        last_name,
        email,
        phone,
        shipping_address,
      ]
    );

    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
