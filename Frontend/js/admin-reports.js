const API_BASE = window.API_BASE || "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  getPreviousMonthSales();

  loadTopCustomers();
  loadTopBooks();
});

// 1) Total sales last month (stat card)
async function getPreviousMonthSales() {
  const outId = "statLastMonth";
  setOut(outId, "Loading...");
  try {
    const res = await fetch(`${API_BASE}/reports/sales/previous-month`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    setOut(outId, `📅 Total sales last month: <strong>${data.total_sales || 0}</strong>`);
  } catch (e) {
    setOut(outId, `<p style="color:red;">${escapeHtml(e.message)}</p>`);
  }
}

// 2) Sales on specific date (called from HTML onclick="getSalesOnDate()")
async function getSalesOnDate() {
  const date = (document.getElementById("specificDate")?.value || "").trim();
  if (!date) return alert("Choose a date first (YYYY-MM-DD)");

  const outId = "salesOnDate";
  setOut(outId, "Loading...");
  try {
    const res = await fetch(`${API_BASE}/reports/sales/by-day?date=${encodeURIComponent(date)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    setOut(outId, `Total sales on <strong>${escapeHtml(date)}</strong>: <strong>${data.total_sales || 0}</strong>`);
  } catch (e) {
    setOut(outId, `<p style="color:red;">${escapeHtml(e.message)}</p>`);
  }
}

// 3) Top 5 customers (last 3 months)
async function loadTopCustomers() {
  const outId = "topCustomers";
  setOut(outId, "Loading...");
  try {
    const res = await fetch(`${API_BASE}/reports/top-customers`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");

    // simple table render
    const rows = (Array.isArray(data) ? data : []).map(r => `
      <tr>
        <td>${escapeHtml(r.customer_username)}</td>
        <td>${escapeHtml(String(r.total))}</td>
      </tr>
    `).join("");

    setOut(outId, `
      <table class="styled-table">
        <thead><tr><th>Customer</th><th>Total</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="2">No data</td></tr>`}</tbody>
      </table>
    `);
  } catch (e) {
    setOut(outId, `<p style="color:red;">${escapeHtml(e.message)}</p>`);
  }
}

// 4) Top 10 selling books (last 3 months) + table section
async function loadTopBooks() {
  const outId = "topBooks";
  setOut(outId, "Loading...");
  try {
    const res = await fetch(`${API_BASE}/reports/top-books`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");

    const rows = (Array.isArray(data) ? data : []).map(r => `
      <tr>
        <td>${escapeHtml(r.isbn)}</td>
        <td>${escapeHtml(r.title)}</td>
        <td>${escapeHtml(String(r.total_sold))}</td>
      </tr>
    `).join("");

    setOut(outId, `
      <table class="styled-table">
        <thead><tr><th>ISBN</th><th>Title</th><th>Copies Sold</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="3">No data</td></tr>`}</tbody>
      </table>
    `);
  } catch (e) {
    setOut(outId, `<p style="color:red;">${escapeHtml(e.message)}</p>`);
  }
}

// 5) How many times a book was ordered (replenishment count)
async function loadBookOrderCount() {
  const title = (document.getElementById("bookTitleSearch")?.value || "").trim();
  if (!title) return alert("Enter book title");

  const outId = "bookOrderCount";
  setOut(outId, "Loading...");
  try {
    const res = await fetch(`${API_BASE}/reports/book-orders/count?title=${encodeURIComponent(title)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");

    setOut(outId, `Times ordered for <strong>${escapeHtml(title)}</strong>: <strong>${data.times_ordered || 0}</strong>`);
  } catch (e) {
    setOut(outId, `<p style="color:red;">${escapeHtml(e.message)}</p>`);
  }
}
function setOut(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}
