const ORDERS_API = "http://localhost:3000/orders";

// Fetch Google Books thumbnail
async function getBookImage(isbn) {
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
    );
    const data = await res.json();

    if (data.items && data.items[0].volumeInfo?.imageLinks?.thumbnail) {
      return data.items[0].volumeInfo.imageLinks.thumbnail;
    }
  } catch (err) {
    console.error("Image fetch failed:", err);
  }
  return "https://via.placeholder.com/120x160?text=No+Image";
}

let allOrders = [];

document.addEventListener("DOMContentLoaded", async () => {
  await loadReplenishmentOrders();
});

async function loadReplenishmentOrders() {
  const res = await fetch(ORDERS_API);
  allOrders = await res.json();

  renderOrders(allOrders);
}

async function renderOrders(orders) {
  const container = document.getElementById("ordersContainer");
  container.innerHTML = "";

  if (orders.length === 0) {
    container.innerHTML = "<p>No replenishment orders found 📭</p>";
    return;
  }

  for (const order of orders) {
    const img = await getBookImage(order.isbn);

    const statusClass =
      order.status === "pending"
        ? "status-pending"
        : "status-completed";

    const actionButton =
      order.status === "pending"
        ? `<button class="btn primary-btn" onclick="confirmOrder(${order.rep_order_id})">Confirm ✔️</button>`
        : `<p class="success-text">Order confirmed ✔️</p>`;

    container.innerHTML += `
      <div class="card order-card fade-in">

        <div class="order-header" onclick="toggleOrder(${order.rep_order_id})">
          <div>
            <h3>Order #${order.rep_order_id}</h3>
            <p>${new Date(order.created_at).toLocaleDateString()}</p>
          </div>

          <span class="order-status ${statusClass}">${order.status}</span>

          <span id="arrow-${order.rep_order_id}" class="arrow">▼</span>
        </div>

        <div id="items-${order.rep_order_id}" class="order-details hidden">

          <div class="order-detail-item">
            <img src="${img}" class="order-img" />
            <div>
              <p><strong>Title:</strong> ${order.title}</p>
              <p><strong>Quantity:</strong> ${order.qty}</p>
              <p><strong>ISBN:</strong> ${order.isbn}</p>
            </div>
          </div>

          <div class="order-actions">
            ${actionButton}
          </div>

        </div>

      </div>
    `;
  }
}
function toggleOrder(id) {
  const box = document.getElementById(`items-${id}`);
  const arrow = document.getElementById(`arrow-${id}`);

  box.classList.toggle("hidden");
  arrow.textContent = box.classList.contains("hidden") ? "▼" : "▲";
}
async function confirmOrder(orderId) {
  if (!confirm("Confirm this replenishment order?")) return;

  const res = await fetch(`${ORDERS_API}/confirm/${orderId}`, {
    method: "PUT",
  });

  const data = await res.json();

  if (res.ok) {
    alert("Order confirmed! Stock updated ✔️");
    await loadReplenishmentOrders();
  } else {
    alert(data.error || "Error confirming order ❌");
  }
}
function filterOrders(type) {
  if (type === "all") return renderOrders(allOrders);

  const filtered = allOrders.filter(o => o.status === type);
  renderOrders(filtered);
}
