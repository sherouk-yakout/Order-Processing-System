const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/auth");
const customersRoutes = require("./routes/customers");
const booksRoutes = require("./routes/books");
const cartRoutes = require("./routes/cart");
const ordersRoutes = require("./routes/orders");
const reportsRoutes = require("./routes/reports");
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});


const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Backend is running ✔️");
});

app.use("/auth", authRoutes);
app.use("/customers", customersRoutes);
app.use("/books", booksRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", ordersRoutes);
app.use("/reports", reportsRoutes);

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
