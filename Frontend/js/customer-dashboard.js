const BOOK_API = "http://localhost:3000/books";
const ORDER_API = "http://localhost:3000/orders";
const CART_API = "http://localhost:3000/cart";

// Get Google Books thumbnail
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
document.addEventListener("DOMContentLoaded", () => {
  const userName = localStorage.getItem("username") || "Customer";
  const userId = localStorage.getItem("user_id");

  document.getElementById("customerName").textContent = userName;

  if (!userId) {
    window.location.href = "./login.html";
    return;
  }

  loadCartCount();       
  loadStats(userId);
  loadRecommendations(userId);
});


async function loadStats(userId) {
  try {
    const orderRes = await fetch(`${ORDER_API}/user/${userId}`);
    const orderData = await orderRes.json();
    document.getElementById("orderCount").textContent =
      Array.isArray(orderData) ? orderData.length : 0;

    const booksRes = await fetch(BOOK_API);
    const allBooks = await booksRes.json();

    const uniqueCategories = [
      ...new Set((Array.isArray(allBooks) ? allBooks : []).map((b) => b.category).filter(Boolean))
    ];
    document.getElementById("categoryCount").textContent = uniqueCategories.length;
  } catch (e) {
    console.error("Stats error:", e);
    document.getElementById("cartCount").textContent = 0;
    document.getElementById("orderCount").textContent = 0;
    document.getElementById("categoryCount").textContent = 0;
  }
}
async function loadRecommendations(userId) {
  const recBox = document.getElementById("recommendedContainer");
  recBox.innerHTML = "<p>Loading recommendations...</p>";

  try {
    // Load orders (may or may not include items)
    const orderRes = await fetch(`${ORDER_API}/user/${userId}`);
    const orders = await orderRes.json();

    // Load all books
    const bookRes = await fetch(BOOK_API);
    const allBooks = await bookRes.json();

    if (!Array.isArray(allBooks) || allBooks.length === 0) {
      recBox.innerHTML = "<p>No books available for recommendations.</p>";
      return;
    }

    let recommendedCategory = null;

    const categoryMap = {};

    if (Array.isArray(orders) && orders.length > 0) {
      for (const order of orders) {
        if (!order.items || !Array.isArray(order.items)) continue;

        for (const item of order.items) {
          const cat = item.category;
          const qty = Number(item.quantity || item.qty || 1);
          if (!cat) continue;
          categoryMap[cat] = (categoryMap[cat] || 0) + qty;
        }
      }

      const cats = Object.keys(categoryMap);
      if (cats.length > 0) {
        recommendedCategory = cats.sort((a, b) => categoryMap[b] - categoryMap[a])[0];
      }
    }

    if (!recommendedCategory) {
      const storeCategories = {};
      for (const book of allBooks) {
        const cat = book.category;
        if (!cat) continue;
        storeCategories[cat] = (storeCategories[cat] || 0) + 1;
      }
      const storeCats = Object.keys(storeCategories);
      recommendedCategory = storeCats.length
        ? storeCats.sort((a, b) => storeCategories[b] - storeCategories[a])[0]
        : allBooks[0].category;
    }

    const recommendedBooks = allBooks
      .filter(b => b.category === recommendedCategory && Number(b.stock || 0) > 0)
      .slice(0, 6);

    if (recommendedBooks.length === 0) {
      recBox.innerHTML = `<p>No in-stock recommendations for ${recommendedCategory}.</p>`;
      return;
    }

    recBox.innerHTML = "";

    for (const book of recommendedBooks) {
      const img = await getBookImage(book.isbn);

      recBox.innerHTML += `
        <div class="card rec-card">
          <img src="${img}" class="book-cover"
            onerror="this.onerror=null; this.src='https://via.placeholder.com/150?text=No+Image';" />
          <h4>${book.title || "Untitled"}</h4>
          <p class="small">${book.author || "—"}</p>
          <p><strong>$${Number(book.price || 0).toFixed(2)}</strong></p>
        </div>
      `;
    }
  } catch (err) {
    console.error("Recommendations error:", err);
    recBox.innerHTML = "<p>Could not load recommendations.</p>";
  }
}
async function loadCartCount() {
  const cartId = localStorage.getItem("cart_id");
  const cartCountEl = document.getElementById("cartCount");

  if (!cartCountEl) return;

  if (!cartId) {
    cartCountEl.textContent = "0";
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/cart/${encodeURIComponent(cartId)}`);
    const items = await res.json();

    if (!Array.isArray(items)) {
      cartCountEl.textContent = "0";
      return;
    }

    //  SUM quantities (same logic as cart page)
    const totalItems = items.reduce(
      (sum, item) => sum + Number(item.qty || 0),
      0
    );

    cartCountEl.textContent = totalItems;
  } catch (err) {
    console.error("Cart count error:", err);
    cartCountEl.textContent = "0";
  }
}
window.addEventListener("storage", (e) => {
  if (e.key === "cart_id") {
    loadCartCount();
  }
});

async function loadCartCount() {
  const cart_id = localStorage.getItem("cart_id");
  const el = document.getElementById("cartCount");

  if (!el) return;

  if (!cart_id) {
    el.textContent = "0";
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/cart/${cart_id}`);
    const items = await res.json();

    let totalQty = 0;
    if (Array.isArray(items)) {
      for (const item of items) {
        totalQty += Number(item.qty || 0);
      }
    }

    el.textContent = totalQty;
  } catch (err) {
    console.error(err);
    el.textContent = "0";
  }
}
window.addEventListener("focus", () => {
  loadCartCount();
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    loadCartCount();
  }
});
