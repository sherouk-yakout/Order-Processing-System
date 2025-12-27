const ORDERS_API = "http://localhost:3000/orders";
let allOrders = [];

document.addEventListener("DOMContentLoaded", () => {
  loadReplenishmentOrders();
});

async function loadReplenishmentOrders() {
  try {
    const res = await fetch(ORDERS_API);
    const data = await res.json();
    allOrders = Array.isArray(data) ? data : [];
    renderOrders(allOrders);
  } catch (err) {
    console.error("Failed to fetch orders", err);
  }
}

function renderOrders(orders) {
  const container = document.getElementById("ordersContainer");
  if (!container) return;
  container.innerHTML = "";

  if (orders.length === 0) {
    container.innerHTML = "<p>No orders found for this view 📭</p>";
    return;
  }

  orders.forEach(order => {
    const id = order.rep_order_id;
    const isPending = order.status === 'pending';
    
    // UI Label logic
    const statusLabel = isPending ? "Pending" : "Confirmed";
    const statusClass = isPending ? "status-pending" : "status-completed";

    container.innerHTML += `
      <div class="card order-card fade-in">
        <div class="order-header" onclick="toggleOrder(${id})">
          <div>
            <h3>Order #${id} - ${escapeHtml(order.title)}</h3>
            <p>Created: ${new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <span class="order-status ${statusClass}">${statusLabel}</span>
          <span id="arrow-${id}" class="arrow">▼</span>
        </div>

        <div id="items-${id}" class="order-details hidden">
          <div class="order-detail-item">
            <div class="order-info">
              <p><strong>ISBN:</strong> ${order.isbn}</p>
              <p><strong>Restock Quantity:</strong> ${order.qty}</p>
              <p><strong>Publisher ID:</strong> ${order.pub_id}</p>
            </div>
          </div>
          <div class="order-actions">
            ${isPending ? 
              `<button class="btn primary-btn" onclick="confirmOrder(${id})">Confirm & Add to Stock ✔️</button>` : 
              `<p class="success-text">Stock Added on ${new Date(order.confirmed_at).toLocaleDateString()}</p>`
            }
          </div>
        </div>
      </div>
    `;
  });
}

async function confirmOrder(orderId) {
  if (!confirm("Confirm receipt? This will automatically increase book stock.")) return;

  try {
    const res = await fetch(`${ORDERS_API}/confirm/${orderId}`, { method: "PUT" });
    const data = await res.json();

    if (res.ok) {
      alert("Success: " + data.message);
      loadReplenishmentOrders(); // Refresh list
    } else {
      alert("Error: " + data.error);
    }
  } catch (err) {
    alert("Connection error to backend.");
  }
}

function filterOrders(type) {
  if (type === "all") {
    renderOrders(allOrders);
  } else if (type === "completed") {
    // We filter for 'confirmed' in DB but it represents 'completed' in UI
    renderOrders(allOrders.filter(o => o.status === "confirmed"));
  } else {
    renderOrders(allOrders.filter(o => o.status === "pending"));
  }
}

function toggleOrder(id) {
  const box = document.getElementById(`items-${id}`);
  const arrow = document.getElementById(`arrow-${id}`);
  box.classList.toggle("hidden");
  arrow.textContent = box.classList.contains("hidden") ? "▼" : "▲";
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}