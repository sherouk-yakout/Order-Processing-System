const ORDER_API = "http://localhost:3000/orders";
const BOOK_API = "http://localhost:3000/books";

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

document.addEventListener("DOMContentLoaded", loadOrders);

// Load all orders for this user
async function loadOrders() {
  const user_id = localStorage.getItem("user_id");

  const res = await fetch(`${ORDER_API}/user/${user_id}`);
  const orders = await res.json();

  const container = document.getElementById("ordersContainer");
  container.innerHTML = "";

  if (orders.length === 0) {
    container.innerHTML = "<p>You have no orders yet 📭</p>";
    return;
  }

  for (const order of orders) {
    let itemsHTML = "";

    for (const item of order.items) {
      const img = await getBookImage(item.isbn);

      itemsHTML += `
        <div class="order-item">
          <img src="${img}" class="order-img" />

          <div class="order-item-info">
            <h4>${item.title}</h4>
            <p>Quantity: ${item.quantity}</p>
            <p>$${item.price}</p>
          </div>
        </div>
      `;
    }

    // Optional status (you can remove if backend doesn't send it)
    const status = order.status || "Delivered";
    const statusClass =
      status === "Delivered" ? "status-delivered" :
      status === "Processing" ? "status-processing" :
      "status-other";

    container.innerHTML += `
      <div class="card order-card fade-in">
        
        <div class="order-header" onclick="toggleOrder(${order.id})">
          <div>
            <h3>Order #${order.id}</h3>
            <p>${new Date(order.created_at).toLocaleDateString()}</p>
          </div>

          <span class="order-status ${statusClass}">${status}</span>

          <span id="arrow-${order.id}" class="arrow">▼</span>
        </div>

        <div id="items-${order.id}" class="order-items hidden">
          ${itemsHTML}
          <div class="order-total">
            <strong>Total:</strong> $${order.total}
          </div>
        </div>

      </div>
    `;
  }
}

// Expand / collapse
function toggleOrder(id) {
  const items = document.getElementById(`items-${id}`);
  const arrow = document.getElementById(`arrow-${id}`);

  items.classList.toggle("hidden");
  arrow.textContent = items.classList.contains("hidden") ? "▼" : "▲";
}
