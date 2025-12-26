const CART_API = "http://localhost:3000/cart";
const ORDER_API = "http://localhost:3000/orders";

// Fetch Google Books image
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

  return "https://via.placeholder.com/150?text=No+Image";
}

document.addEventListener("DOMContentLoaded", loadCart);

async function loadCart() {
  const user_id = localStorage.getItem("user_id");
  const res = await fetch(`${CART_API}/${user_id}`);
  const items = await res.json();

  const container = document.getElementById("cartContainer");
  const summary = document.getElementById("cartSummary");
  const totalSpan = document.getElementById("totalPrice");

  container.innerHTML = "";
  let total = 0;

  if (items.length === 0) {
    summary.classList.add("hidden");
    container.innerHTML = "<p>Your cart is empty 🛒</p>";
    return;
  }

  summary.classList.remove("hidden");

  for (const item of items) {
    const image = await getBookImage(item.isbn);
    total += item.price * item.quantity;

    container.innerHTML += `
      <div class="card cart-item">
        
        <img src="${image}" class="cart-img" />

        <div class="cart-info">
          <h3>${item.title}</h3>
          <p><strong>Price:</strong> $${item.price}</p>
        </div>

        <div class="qty-controls">
          <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
          <span class="qty">${item.quantity}</span>
          <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
        </div>

        <button class="btn secondary-btn remove-btn" onclick="removeItem(${item.id})">❌</button>

      </div>
    `;
  }

  totalSpan.textContent = total.toFixed(2);
}

// Update quantity
async function updateQuantity(cartId, newQty) {
  if (newQty <= 0) return removeItem(cartId);

  const res = await fetch(`${CART_API}/update/${cartId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity: newQty })
  });

  if (res.ok) loadCart();
  else alert("Error updating quantity ❌");
}

// Remove item
async function removeItem(cartId) {
  const res = await fetch(`${CART_API}/remove/${cartId}`, { method: "DELETE" });

  if (res.ok) loadCart();
  else alert("Error removing item ❌");
}

// Open checkout
function openCheckout() {
  document.getElementById("checkoutModal").classList.remove("hidden");
}

// Close modal
function closeCheckout() {
  document.getElementById("checkoutModal").classList.add("hidden");
}

// Validate credit card
function validatePayment() {
  const num = document.getElementById("cardNumber").value;
  const exp = document.getElementById("expiry").value;

  const cardOk = /^\d{16}$/.test(num);
  const expOk = /^(0[1-9]|1[0-2])\/\d{2}$/.test(exp);

  return cardOk && expOk;
}

// Checkout
async function checkout() {
  if (!validatePayment()) {
    alert("Invalid payment details ❌");
    return;
  }

  const user_id = localStorage.getItem("user_id");
  const res = await fetch(`${ORDER_API}/checkout/${user_id}`, { method: "POST" });
  const data = await res.json();

  if (res.ok) {
    alert("Order placed successfully! 🎉");
    closeCheckout();
    loadCart();
  } else {
    alert(data.error || "Checkout failed ❌");
  }
}
