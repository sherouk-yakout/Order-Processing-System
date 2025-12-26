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

document.addEventListener("DOMContentLoaded", async () => {
  const userName = localStorage.getItem("username") || "Customer";
  const userId = localStorage.getItem("user_id");

  document.getElementById("customerName").textContent = userName;

  // Load stats + recommendations
  loadStats(userId);
  loadRecommendations(userId);
});

// ---- LOAD STATS ----
async function loadStats(userId) {
  // CART COUNT
  const cartRes = await fetch(`${CART_API}/${userId}`);
  const cartData = await cartRes.json();
  document.getElementById("cartCount").textContent = cartData.length;

  // ORDER COUNT
  const orderRes = await fetch(`${ORDER_API}/user/${userId}`);
  const orderData = await orderRes.json();
  document.getElementById("orderCount").textContent = orderData.length;

  // CATEGORY COUNT
  const booksRes = await fetch(BOOK_API);
  const allBooks = await booksRes.json();

  const uniqueCategories = [...new Set(allBooks.map(b => b.category))];
  document.getElementById("categoryCount").textContent = uniqueCategories.length;
}

// ---- LOAD RECOMMENDED BOOKS ----
async function loadRecommendations(userId) {
  const recBox = document.getElementById("recommendedContainer");
  recBox.innerHTML = "<p>Loading recommendations...</p>";

  // 1. Check user's past orders
  const orderRes = await fetch(`${ORDER_API}/user/${userId}`);
  const orders = await orderRes.json();

  // 2. Load all books
  const bookRes = await fetch(BOOK_API);
  const allBooks = await bookRes.json();

  let recommendedCategory = null;

  if (orders.length > 0) {
    // Pick most frequent purchased category
    let categoryMap = {};

    orders.forEach(order =>
      order.items.forEach(item => {
        categoryMap[item.category] =
          (categoryMap[item.category] || 0) + item.quantity;
      })
    );

    recommendedCategory = Object.keys(categoryMap).sort(
      (a, b) => categoryMap[b] - categoryMap[a]
    )[0];
  } else {
    // If no orders → pick most common category in store
    let storeCategories = {};

    allBooks.forEach(book => {
      storeCategories[book.category] =
        (storeCategories[book.category] || 0) + 1;
    });

    recommendedCategory = Object.keys(storeCategories).sort(
      (a, b) => storeCategories[b] - storeCategories[a]
    )[0];
  }

  // Filter recommended books
  const recommendedBooks = allBooks
    .filter(book => book.category === recommendedCategory)
    .slice(0, 6);

  recBox.innerHTML = "";

  for (let book of recommendedBooks) {
    const img = await getBookImage(book.isbn);

    recBox.innerHTML += `
      <div class="card rec-card">
        <img src="${img}" class="book-cover" />
        <h4>${book.title}</h4>
        <p class="small">${book.authors}</p>
        <p><strong>$${book.price}</strong></p>
      </div>
    `;
  }
}
