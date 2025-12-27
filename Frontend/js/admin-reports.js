const API_BASE = window.API_BASE || "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
    // Initial data load
    loadDashboardStats();
    loadMonthlySalesChart();
    loadTopBooksChartAndTable();
    loadTopCustomers();
});

// 1) Load Top Stat Cards (Monthly Overview)
async function loadDashboardStats() {
    try {
        const res = await fetch(`${API_BASE}/reports/sales/monthly`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load monthly stats");

        if (data.length > 0) {
            const currentMonth = data[0]; // Most recent month
            
            // Set Last Month Total Sales
            setOut("statLastMonth", `<h3>$${Number(currentMonth.total_sales).toFixed(2)}</h3><p>Sales (${currentMonth.month_name})</p>`);
            
            // Set Orders this month
            setOut("statOrdersMonth", `<h3>${currentMonth.order_count}</h3><p>Orders this month</p>`);
            
            // Calculate and set Average Order Value
            const avg = currentMonth.order_count > 0 ? (currentMonth.total_sales / currentMonth.order_count) : 0;
            setOut("statAvgOrder", `<h3>$${avg.toFixed(2)}</h3><p>Avg Order Value</p>`);
        }

        // Fetch Top Category for the 4th stat card
        const catRes = await fetch(`${API_BASE}/reports/top-categories`);
        const catData = await catRes.json();
        if (catData.length > 0) {
            setOut("statTopCategory", `<h3>${catData[0].category}</h3><p>Top Category</p>`);
        } else {
            setOut("statTopCategory", `<h3>N/A</h3><p>Top Category</p>`);
        }

    } catch (e) {
        console.error("Dashboard Stats Error:", e);
    }
}

// 2) Render Monthly Sales Chart
async function loadMonthlySalesChart() {
    try {
        const res = await fetch(`${API_BASE}/reports/sales/monthly`);
        const data = await res.json();
        if (!res.ok) return;

        const ctx = document.getElementById('chartMonthlySales').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.month_name).reverse(),
                datasets: [{
                    label: 'Monthly Sales ($)',
                    data: data.map(d => d.total_sales).reverse(),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { responsive: true }
        });
    } catch (e) { console.error(e); }
}

// 3) Load Top Books Chart & Table
async function loadTopBooksChartAndTable() {
    const outTableId = "topBooks";
    try {
        const res = await fetch(`${API_BASE}/reports/top-books`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        // Render Chart
        const ctx = document.getElementById('chartTopBooks').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(b => b.title),
                datasets: [{
                    label: 'Copies Sold',
                    data: data.map(b => b.total_sold),
                    backgroundColor: '#10b981'
                }]
            }
        });

        // Render Table
        const rows = data.map(r => `
            <tr>
                <td>${escapeHtml(r.isbn)}</td>
                <td>${escapeHtml(r.title)}</td>
                <td><strong>${escapeHtml(String(r.total_sold))}</strong></td>
            </tr>
        `).join("");

        setOut(outTableId, `
            <table class="styled-table">
                <thead><tr><th>ISBN</th><th>Title</th><th>Sold</th></tr></thead>
                <tbody>${rows || `<tr><td colspan="3">No data</td></tr>`}</tbody>
            </table>
        `);
    } catch (e) { setOut(outTableId, `<p style="color:red;">${e.message}</p>`); }
}

// 4) Top 5 Customers
async function loadTopCustomers() {
    const outId = "topCustomers";
    try {
        const res = await fetch(`${API_BASE}/reports/top-customers`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        const rows = data.map(r => `
            <div class="card" style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span><strong>${escapeHtml(r.fname)} ${escapeHtml(r.lname)}</strong> (@${escapeHtml(r.customer_username)})</span>
                <span class="stock-ok">$${Number(r.total).toFixed(2)}</span>
            </div>
        `).join("");

        setOut(outId, rows || "<p>No customer data found.</p>");
    } catch (e) { setOut(outId, `<p style="color:red;">${e.message}</p>`); }
}

// 5) Specific Date Sales
async function getSalesOnDate() {
    const date = document.getElementById("specificDate").value;
    if (!date) return alert("Please select a date.");
    
    const outId = "salesOnDate";
    setOut(outId, "Calculating...");
    try {
        const res = await fetch(`${API_BASE}/reports/sales/by-day?date=${date}`);
        const data = await res.json();
        setOut(outId, `<div class="card"><h4>Total for ${date}:</h4> <h2 class="stock-ok">$${Number(data.total_sales || 0).toFixed(2)}</h2></div>`);
    } catch (e) { setOut(outId, "Error fetching data."); }
}

// 6) Publisher Order Count
async function loadBookOrderCount() {
    const title = document.getElementById("bookTitleSearch").value.trim();
    if (!title) return alert("Enter a title.");
    
    const outId = "bookOrderCount";
    try {
        const res = await fetch(`${API_BASE}/reports/book-orders/count?title=${encodeURIComponent(title)}`);
        const data = await res.json();
        setOut(outId, `<div class="card"><h4>"${title}" Replenishment:</h4> <p>This book has been ordered <strong>${data.times_ordered || 0}</strong> times from publishers.</p></div>`);
    } catch (e) { setOut(outId, "Book not found or error."); }
}

// Helper Functions
function setOut(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}