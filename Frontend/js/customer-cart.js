const API_BASE = "http://localhost:3000";

function attachCardFormatter() {
  const cardInput = document.getElementById("creditCardNumber");
  if (!cardInput || cardInput.dataset.bound) return;

  cardInput.dataset.bound = "true";

  cardInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");

    // limit to 16 digits
    value = value.slice(0, 16);

    // space every 4 digits
    value = value.replace(/(.{4})/g, "$1 ").trim();

    e.target.value = value;
  });
const typeEl = document.getElementById("cardType");
const digits = value.replace(/\s/g, "");

if (typeEl) {
  if (digits.startsWith("4")) {
    typeEl.textContent = "VISA";
  } else if (/^5[1-5]/.test(digits)) {
    typeEl.textContent = "MasterCard";
  } else if (/^3[47]/.test(digits)) {
    typeEl.textContent = "AMEX";
  } else {
    typeEl.textContent = "";
  }
}


}



document.addEventListener("DOMContentLoaded", () => {
  loadCart();

  const cardInput = document.getElementById("creditCardNumber");

  if (cardInput) {
    cardInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "");

      // limit to 16 digits
      value = value.substring(0, 16);

      // add spaces every 4 digits
      value = value.replace(/(.{4})/g, "$1 ").trim();

      e.target.value = value;
    });
  }
});

async function loadCart() {
  const cart_id = localStorage.getItem("cart_id");
  const container = document.getElementById("cartContainer");
  const summary = document.getElementById("cartSummary");
  const totalEl = document.getElementById("totalPrice");

  if (!container) return;

  if (!cart_id) {
    container.innerHTML = `<p style="color:red;">Missing cart_id. Please login again.</p>`;
    if (summary) summary.classList.add("hidden");
    return;
  }

  container.innerHTML = "Loading cart...";

  try {
    const res = await fetch(`${API_BASE}/cart/${encodeURIComponent(cart_id)}`);
    const raw = await res.text();
    let items = [];
    try { items = JSON.parse(raw); } catch {}

    if (!res.ok) throw new Error(items?.error || raw || "Failed to load cart");

    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = `<p>Your cart is empty.</p>`;
      if (summary) summary.classList.add("hidden");
      if (totalEl) totalEl.textContent = "0";
      return;
    }

    // Render items
    container.innerHTML = "";
    let total = 0;

    for (const it of items) {
      const isbn = it.isbn;
      const title = it.title || isbn;
      const qty = Number(it.qty || 0);
      const price = Number(it.price || 0);

      total += qty * price;

      container.innerHTML += `
        <div class="card fade-in">
          <h3>${escapeHtml(title)}</h3>
          <p><strong>ISBN:</strong> ${escapeHtml(isbn)}</p>
          <p><strong>Qty:</strong></p>
          <div class="qty-controls">
            <button class="qty-btn" onclick="updateQty('${escapeAttr(isbn)}', -1)">−</button>
            <span class="qty-value">${qty}</span>
            <button class="qty-btn" onclick="updateQty('${escapeAttr(isbn)}', 1)">+</button>
          </div>
          <p><strong>Unit Price:</strong> $${price.toFixed(2)}</p>
          <p><strong>Subtotal:</strong> $${(qty * price).toFixed(2)}</p>
          <button class="btn secondary-btn" onclick="removeItem('${escapeAttr(isbn)}')">Remove</button>
        </div>
      `;
    }

    if (totalEl) totalEl.textContent = total.toFixed(2);
    if (summary) summary.classList.remove("hidden");
  } catch (e) {
    container.innerHTML = `<p style="color:red;">${escapeHtml(e.message)}</p>`;
    if (summary) summary.classList.add("hidden");
  }
}

async function removeItem(isbn) {
  const cart_id = localStorage.getItem("cart_id");
  if (!cart_id) return alert("Missing cart_id. Please login again.");

  try {
    const res = await fetch(
      `${API_BASE}/cart/${encodeURIComponent(cart_id)}/${encodeURIComponent(isbn)}`,
      { method: "DELETE" }
    );

    const raw = await res.text();
    let data = {};
    try { data = JSON.parse(raw); } catch {}

    if (!res.ok) throw new Error(data.error || raw || "Remove failed");

    loadCart();
  } catch (e) {
    const errEl = document.getElementById("checkoutError");
if (errEl) errEl.textContent = e.message;
else alert(e.message);

  }
}

/* ========= CHECKOUT MODAL FUNCTIONS ========= */
function openCheckout() {
  const modal = document.getElementById("checkoutModal");
  if (modal) modal.classList.remove("hidden");

  // attach formatter AFTER modal opens
  attachCardFormatter();
}


function closeCheckout() {
  const modal = document.getElementById("checkoutModal");
  if (modal) modal.classList.add("hidden");
}

async function checkout() {
  const cart_id = localStorage.getItem("cart_id");
  const customer_username = localStorage.getItem("user_id");

 const credit_card_number =
  (document.getElementById("creditCardNumber")?.value || "").trim();

  const credit_card_expiry = (document.getElementById("expiry")?.value || "").trim();

const cardInput = document.getElementById("creditCardNumber");



  if (!cart_id) return alert("Missing cart_id. Please login again.");
  if (!customer_username) return alert("Missing user_id. Please login again.");

  try {
    const res = await fetch(`${API_BASE}/orders/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cart_id: Number(cart_id),
        customer_username,
        credit_card_number,
        credit_card_expiry
      })
    });

    const raw = await res.text();
    let data = {};
    try { data = JSON.parse(raw); } catch {}

    if (!res.ok) {
      throw new Error(data.error || data.message || raw || "Checkout failed");
    }

    alert(`Checkout successful ✔️ Order ID: ${data.order_id}`);
    closeCheckout();

    loadCart();
  } catch (e) {
    alert(e.message);
  }
}
async function updateQty(isbn, delta) {
  const cart_id = localStorage.getItem("cart_id");
  if (!cart_id) return alert("Missing cart_id. Please login again.");

  try {
    const res = await fetch(`${API_BASE}/cart/qty`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cart_id,
        isbn,
        delta: Number(delta)
      })
    });

    const raw = await res.text();
    let data = [];
    try { data = JSON.parse(raw); } catch {}

    if (!res.ok) throw new Error(data?.error || raw || "Qty update failed");

    loadCart();
  } catch (err) {
    console.error("Qty update failed", err);
    alert(err.message);
  }
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}
function escapeAttr(s) {
  return String(s).replace(/'/g, "\\'");
}
