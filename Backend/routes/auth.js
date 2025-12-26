const express = require("express");
const router = express.Router();
const pool = require("../db");

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
    const [rows] = await pool.execute(
      "SELECT username, role FROM Users WHERE email = ? AND password = ?",
      [email, password]
    );

    if (rows.length === 0)
      return res.status(401).json({ error: "Invalid email or password" });

    const user = rows[0];

   //  ALWAYS create a NEW cart on login
const [insertResult] = await pool.execute(
  "INSERT INTO Carts(customer_username) VALUES (?)",
  [user.username]
);

const cart_id = insertResult.insertId;


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
    await pool.execute(
      `INSERT INTO Users(username, password, fname, lname, email, phone, shipping_address, role)
             VALUES (?, ?, ?, ?, ?, ?, ?, "Customer")`,
      [
        username,
        password,
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
