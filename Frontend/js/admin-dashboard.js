const BOOK_API = "http://localhost:3000/books";
const ORDER_API = "http://localhost:3000/orders";
const USER_API = "http://localhost:3000/auth";
const ADMIN_ORDER_API = "http://localhost:3000/admin/orders";
const REPORTS_API = "http://localhost:3000/reports";

document.addEventListener("DOMContentLoaded", async () => {
  const adminName = localStorage.getItem("username") || "Admin";
  document.getElementById("adminName").textContent = adminName;

  loadStats();
  loadTopCategories();
  loadSalesChart();
});

async function loadStats() {
  // Books
  const resBooks = await fetch(BOOK_API);
  const books = await resBooks.json();
  document.getElementById("bookCount").textContent = books.length;

  // Out of Stock
  const out = books.filter(b => b.stock <= 0).length;
  document.getElementById("outOfStockCount").textContent = out;

  // Customers count
  const resCustomers = await fetch(`${USER_API}/customers`);
  const customers = await resCustomers.json();
  document.getElementById("customerCount").textContent = customers.length;

  // Orders count
  const resOrders = await fetch(`${ORDER_API}/all`);
  const orders = await resOrders.json();
  document.getElementById("orderCount").textContent = orders.length;

  // Pending replenish orders
  const resReplenish = await fetch(ADMIN_ORDER_API);
  const replenish = await resReplenish.json();
  const pending = replenish.filter(o => o.status === "pending").length;
  document.getElementById("pendingReplenishCount").textContent = pending;

  // Total sales
  const resSales = await fetch(`${REPORTS_API}/total-sales`);
  const sales = await resSales.json();
  document.getElementById("totalSales").textContent = sales.total || 0;
}

async function loadTopCategories() {
  const res = await fetch(`${REPORTS_API}/top-categories`);
  const categories = await res.json();

  const container = document.getElementById("topCategories");
  container.innerHTML = "";

  categories.forEach(cat => {
    container.innerHTML += `
      <div class="card">
        <h4>${cat.category}</h4>
        <p>Sold: ${cat.total}</p>
      </div>
    `;
  });
}

async function loadSalesChart() {
  const res = await fetch(`${REPORTS_API}/monthly-sales`);
  const data = await res.json();

  const ctx = document.getElementById("salesChart");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map(d => d.month),
      datasets: [{
        label: "Sales ($)",
        data: data.map(d => d.total),
        backgroundColor: "rgba(75, 123, 236, 0.7)",
        borderColor: "#4b7bec",
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
