const API_BASE = window.API_BASE || "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  const prevMonthBtn = document.getElementById("prevMonthSalesBtn");
  if (prevMonthBtn) prevMonthBtn.addEventListener("click", loadPreviousMonthSales);

  const dayBtn = document.getElementById("salesByDayBtn");
  if (dayBtn) dayBtn.addEventListener("click", loadSalesByDay);

  const topCustomersBtn = document.getElementById("topCustomersBtn");
  if (topCustomersBtn) topCustomersBtn.addEventListener("click", loadTopCustomers);

  const topBooksBtn = document.getElementById("topBooksBtn");
  if (topBooksBtn) topBooksBtn.addEventListener("click", loadTopBooks);

  const isbnCountBtn = document.getElementById("isbnCountBtn");
  if (isbnCountBtn) isbnCountBtn.addEventListener("click", loadBookOrderCount);
});
document.addEventListener("DOMContentLoaded", () => {
  getPreviousMonthSales(); // automatically load previous month sales
});


async function getSalesOnDate() {
  const date = (document.getElementById("specificDate")?.value || "").trim();
  if (!date) return alert("Choose a date first (YYYY-MM-DD)");
  await fetchToOut(`${API_BASE}/reports/sales/by-day?date=${encodeURIComponent(date)}`, "salesOnDate");
}
async function getPreviousMonthSales() {
  const outId = "statLastMonth"; // or any div you want to show it in
  setOut(outId, "Loading...");
  try {
    const res = await fetch(`${API_BASE}/reports/sales/previous-month`);
    const data = await res.json();
    setOut(outId, `📅 Total sales last month: <strong>${data.total_sales || 0}</strong>`);
  } catch (e) {
    setOut(outId, `<p style="color:red;">${e.message}</p>`);
  }
}

async function loadTopCustomers() {
  await fetchToOut(`${API_BASE}/reports/top-customers`, "reportOut");
}

async function loadTopBooks() {
  await fetchToOut(`${API_BASE}/reports/top-books`, "reportOut");
}

async function loadBookOrderCount() {
  const title= (document.getElementById("bookTitleSearch")?.value || "").trim();
  if (!title) return alert("Enter book title");
  await fetchToOut(`${API_BASE}/reports/book-orders/count?title=${encodeURIComponent(title)}`, "bookOrderCount");
}

async function fetchToOut(url, outId) {
  setOut(outId, "Loading...");
  try {
    const res = await fetch(url);
    const raw = await res.text();
    let data;
    try { data = JSON.parse(raw); } catch { data = raw; }

    if (!res.ok) throw new Error((data && data.error) ? data.error : raw || "Request failed");

    // render
    if (Array.isArray(data)) {
      setOut(outId, `<pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`);
    } else if (typeof data === "object") {
      setOut(outId, `<pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`);
    } else {
      setOut(outId, `<pre>${escapeHtml(String(data))}</pre>`);
    }
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
