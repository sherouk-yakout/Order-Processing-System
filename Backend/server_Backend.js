const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const booksRoutes = require('./routes/books');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');
const reportsRoutes = require('./routes/reports');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Root route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Routes
app.use('/auth', authRoutes);
app.use('/books', booksRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', ordersRoutes);
app.use('/reports', reportsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

