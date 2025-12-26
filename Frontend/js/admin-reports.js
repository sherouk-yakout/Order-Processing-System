const REPORTS_API = "http://localhost:3000/reports";

document.addEventListener("DOMContentLoaded", () => {
  loadStats();
  loadMonthlySalesChart();
  loadTopBooksChart();
  getTopCustomers();
  getTopBooks();
});

/* ============================
    STATS CARDS
============================ */
async function loadStats() {
  // Last month total sales
  const res1 = await fetch(`${REPORTS_API}/last-month`);
  const lastMonth = await res1.json();

  document.getElementById("statLastMonth").innerHTML = `
    <h3>$${lastMonth.total || 0}</h3>
    <p>Sales Last Month</p>
  `;

  // Orders this month
  const res2 = await fetch(`${REPORTS_API}/orders-this-month`);
  const orders = await res2.json();

  document.getElementById("statOrdersMonth").innerHTML = `
    <h3>${orders.count}</h3>
    <p>Orders This Month</p>
  `;

  // Average order value
  const res3 = await fetch(`${REPORTS_API}/avg-order`);
  const avg = await res3.json();

  document.getElementById("statAvgOrder").innerHTML = `
    <h3>$${avg.value || 0}</h3>
    <p>Average Order Value</p>
  `;

  // Top category
  const res4 = await fetch(`${REPORTS_API}/top-category`);
  const cat = await res4.json();

  document.getElementById("statTopCategory").innerHTML = `
    <h3>${cat.category || "N/A"}</h3>
    <p>Top Category</p>
  `;
}

/* ============================
    MONTHLY SALES CHART
============================ */
async function loadMonthlySalesChart() {
  const res = await fetch(`${REPORTS_API}/monthly-sales`);
  const data = await res.json();

  new Chart(document.getElementById("chartMonthlySales"), {
    type: "bar",
    data: {
      labels: data.map(d => d.month),
      datasets: [{
        label: "Sales ($)",
        data: data.map(d => d.total),
        backgroundColor: "rgba(75, 123, 236, 0.7)",
        borderColor: "#4b7bec",
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

/* ============================
    TOP 10 BOOKS (CHART)
============================ */
async function loadTopBooksChart() {
  const res = await fetch(`${REPORTS_API}/top-books`);
  const books = await res.json();

  new Chart(document.getElementById("chartTopBooks"), {
    type: "bar",
    data: {
      labels: books.map(b => b.title),
      datasets: [{
        label: "Copies Sold",
        data: books.map(b => b.sold),
        backgroundColor: "rgba(46, 204, 113, 0.7)",
        borderColor: "#2ecc71",
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true
    }
  });
}

/* ============================
    TOP CUSTOMERS TABLE
============================ */
async function getTopCustomers() {
  const res = await fetch(`${REPORTS_API}/top-customers`);
  const customers = await res.json();

  let html = `
    <table class='styled-table'>
      <tr><th>Name</th><th>Total Spent</th></tr>
  `;

  customers.forEach(c => {
    html += `
      <tr>
        <td>${c.first_name} ${c.last_name}</td>
        <td>$${c.total_spent}</td>
      </tr>
    `;
  });

  html += "</table>";
  document.getElementById("topCustomers").innerHTML = html;
}

/* ============================
    TOP BOOKS TABLE
============================ */
async function getTopBooks() {
  const res = await fetch(`${REPORTS_API}/top-books`);
  const books = await res.json();

  let html = `
    <table class='styled-table'>
      <tr><th>Title</th><th>Sold</th></tr>
  `;

  books.forEach(b => {
    html += `
      <tr>
        <td>${b.title}</td>
        <td>${b.sold}</td>
      </tr>
    `;
  });

  html += "</table>";
  document.getElementById("topBooks").innerHTML = html;
}

/* ============================
    SALES ON SPECIFIC DATE
============================ */
async function getSalesOnDate() {
  const date = document.getElementById("specificDate").value;

  if (!date) return alert("Please select a date.");

  const res = await fetch(`${REPORTS_API}/day/${date}`);
  const data = await res.json();

  document.getElementById("salesOnDate").innerHTML = `
    <p><strong>Total Sales:</strong> $${data.total || 0}</p>
  `;
}

/* ============================
    BOOK ORDER COUNT
============================ */
async function getBookOrderCount() {
  const title = document.getElementById("bookTitleSearch").value;

  if (!title.trim()) return alert("Enter a book title.");

  const res = await fetch(`${REPORTS_API}/book-count?title=${encodeURIComponent(title)}`);
  const data = await res.json();

  document.getElementById("bookOrderCount").innerHTML = `
    <p><strong>"${title}" was ordered:</strong> ${data.count} times</p>
  `;
}
