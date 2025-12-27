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
  try {
    // Books
    const resBooks = await fetch(BOOK_API);
    if (!resBooks.ok) throw new Error("Failed to load books");
    const books = await resBooks.json();
    document.getElementById("bookCount").textContent = Array.isArray(books) ? books.length : 0;

    // Out of Stock
    const out = Array.isArray(books) ? books.filter(b => b.stock <= 0).length : 0;
    document.getElementById("outOfStockCount").textContent = out;

    // Customers count
    const resCustomers = await fetch(`${USER_API}/customers`);
    if (!resCustomers.ok) throw new Error("Failed to load customers");
    const customers = await resCustomers.json();
    document.getElementById("customerCount").textContent = Array.isArray(customers) ? customers.length : 0;

    // Orders count
    const resOrders = await fetch(`${ORDER_API}/all`);
    if (!resOrders.ok) throw new Error("Failed to load orders");
    const orders = await resOrders.json();
    document.getElementById("orderCount").textContent = Array.isArray(orders) ? orders.length : 0;

    // Pending replenish orders (use /orders endpoint for publisher orders)
    const resReplenish = await fetch(`${ORDER_API}/`);
    if (!resReplenish.ok) throw new Error("Failed to load replenishment orders");
    const replenish = await resReplenish.json();
    const pending = Array.isArray(replenish) ? replenish.filter(o => o.status === "pending").length : 0;
    document.getElementById("pendingReplenishCount").textContent = pending;

    // Total sales
    const resSales = await fetch(`${REPORTS_API}/total-sales`);
    if (!resSales.ok) throw new Error("Failed to load total sales");
    const sales = await resSales.json();
    const totalSales = sales.total || sales.total_sales || 0;
    document.getElementById("totalSales").textContent = typeof totalSales === 'number' ? totalSales.toFixed(2) : totalSales;
  } catch (error) {
    console.error("Error loading stats:", error);
    // Set defaults on error
    document.getElementById("bookCount").textContent = 0;
    document.getElementById("outOfStockCount").textContent = 0;
    document.getElementById("customerCount").textContent = 0;
    document.getElementById("orderCount").textContent = 0;
    document.getElementById("pendingReplenishCount").textContent = 0;
    document.getElementById("totalSales").textContent = "0.00";
  }
}

async function loadTopCategories() {
  try {
    const res = await fetch(`${REPORTS_API}/top-categories`);
    if (!res.ok) throw new Error("Failed to load top categories");
    const categories = await res.json();

    const container = document.getElementById("topCategories");
    container.innerHTML = "";

    if (!Array.isArray(categories) || categories.length === 0) {
      container.innerHTML = "<p>No category data available</p>";
      return;
    }

    categories.forEach(cat => {
      container.innerHTML += `
        <div class="card">
          <h4>${cat.category || "Unknown"}</h4>
          <p>Sold: ${cat.total || 0}</p>
        </div>
      `;
    });
  } catch (error) {
    console.error("Error loading top categories:", error);
    document.getElementById("topCategories").innerHTML = 
      "<p style='color: red;'>Error loading categories</p>";
  }
}

async function loadSalesChart() {
  try {
    const res = await fetch(`${REPORTS_API}/sales/monthly`);
    if (!res.ok) throw new Error("Failed to load monthly sales");
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      document.getElementById("salesChart").parentElement.innerHTML = 
        "<p>No sales data available</p>";
      return;
    }

    const ctx = document.getElementById("salesChart");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map(d => d.month_name || d.month),
        datasets: [{
          label: "Sales ($)",
          data: data.map(d => d.total_sales || d.total || 0),
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
  } catch (error) {
    console.error("Error loading sales chart:", error);
    document.getElementById("salesChart").parentElement.innerHTML = 
      "<p style='color: red;'>Error loading sales chart</p>";
  }
}
