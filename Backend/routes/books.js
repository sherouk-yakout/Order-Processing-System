const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const { isbn, title, category, author, publisher } = req.query;

  let sql = `
    SELECT
      b.isbn,
      b.title,
      b.category,
      b.publish_year,
      b.price,
      b.stock,
      p.pub_name AS publisher,
      COALESCE(GROUP_CONCAT(DISTINCT a.author_name ORDER BY a.author_name SEPARATOR ', '), '') AS author
    FROM Books b
    JOIN Publishers p ON b.pub_id = p.pub_id
    LEFT JOIN Book_authors ba ON b.isbn = ba.isbn
    LEFT JOIN Authors a ON ba.author_id = a.author_id
    WHERE 1=1
  `;

  const params = [];
  const having = [];
  const havingParams = [];

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
  if (publisher) {
    sql += ' AND p.pub_name LIKE ?';
    params.push(`%${publisher}%`);
  }

  if (author) {
    having.push('author LIKE ?');
    havingParams.push(`%${author}%`);
  }

  sql += `
    GROUP BY
      b.isbn, b.title, b.category, b.publish_year, b.price, b.stock, p.pub_name
  `;

  if (having.length) {
    sql += ` HAVING ${having.join(' AND ')}`;
  }

  try {
    const [rows] = await pool.execute(sql, [...params, ...havingParams]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new book (Admin only)
router.post('/', async (req, res) => {
  const { isbn, title, category, publish_year, price, stock, threshold, publisher,authors } = req.body;

  try {
    // 1️⃣ Check if publisher exists
    const [pubRows] = await pool.execute('SELECT pub_id FROM Publishers WHERE pub_name = ?', [publisher]);
    let pub_id;

    if (pubRows.length > 0) {
      pub_id = pubRows[0].pub_id; // existing publisher
    } else {
      // 2️⃣ Add new publisher
      const [result] = await pool.execute('INSERT INTO Publishers(pub_name) VALUES (?)', [publisher]);
      pub_id = result.insertId;
    }
     const authorNames = authors.split(',').map(a => a.trim()).filter(a => a);
    const authorIds = [];
    for (const name of authorNames) {
      const [authRows] = await pool.execute('SELECT author_id FROM Authors WHERE author_name = ?', [name]);
      let author_id;
      if (authRows.length > 0) {
        author_id = authRows[0].author_id;
      } else {
        const [result] = await pool.execute('INSERT INTO Authors(author_name) VALUES (?)', [name]);
        author_id = result.insertId;
      }
      authorIds.push(author_id);
    }

    // 3️⃣ Insert book with the correct pub_id
    await pool.execute(
      'INSERT INTO Books(isbn, title, category, publish_year, price, stock, threshold, pub_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [isbn, title, category, publish_year, price, stock, threshold, pub_id]
    );
    for (const author_id of authorIds) {
      await pool.execute('INSERT INTO Book_authors(isbn, author_id) VALUES (?, ?)', [isbn, author_id]);
    }
    res.json({ message: 'Book added successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Update book (Admin)
router.put('/:isbn', async (req, res) => {
  const { isbn } = req.params;
  const { title, category, publish_year, price, stock, threshold, publisher,authors} = req.body;

  try {
    // Check if publisher exists
    const [pubRows] = await pool.execute('SELECT pub_id FROM Publishers WHERE pub_name = ?', [publisher]);
    let pub_id;

    if (pubRows.length > 0) {
      pub_id = pubRows[0].pub_id;
    } else {
      const [result] = await pool.execute('INSERT INTO Publishers(pub_name) VALUES (?)', [publisher]);
      pub_id = result.insertId;
    }
    // Handle authors
    const authorNames = authors.split(',').map(a => a.trim()).filter(a => a);
    const authorIds = [];
    for (const name of authorNames) {
      const [authRows] = await pool.execute('SELECT author_id FROM Authors WHERE author_name = ?', [name]);
      let author_id;
      if (authRows.length > 0) {
        author_id = authRows[0].author_id;
      } else {
        const [result] = await pool.execute('INSERT INTO Authors(author_name) VALUES (?)', [name]);
        author_id = result.insertId;
      }
      authorIds.push(author_id);
    }
    // Update book
    await pool.execute(
      'UPDATE Books SET title=?, category=?, publish_year=?, price=?, stock=?, threshold=?, pub_id=? WHERE isbn=?',
      [title, category, publish_year, price, stock, threshold, pub_id, isbn]
    );
    // Remove old authors
    await pool.execute('DELETE FROM Book_authors WHERE isbn = ?', [isbn]);
    // Add new authors
    for (const author_id of authorIds) {
      await pool.execute('INSERT INTO Book_authors(isbn, author_id) VALUES (?, ?)', [isbn, author_id]);
    }
    res.json({ message: 'Book updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
