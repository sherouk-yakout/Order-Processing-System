const API_BASE = "http://localhost:3000";
const API_BOOKS = `${API_BASE}/books`;
const API_CART_ADD = `${API_BASE}/cart/add`;

let debounceTimer;

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchInput");
  const category = document.getElementById("categoryFilter");

  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(searchBooks, 300);
  });

  category.addEventListener("change", searchBooks);

  searchBooks(); // load all initially
});

async function getBookImage(isbn) {
  const clean = String(isbn || "").replace(/[^0-9X]/gi, "");
  if (!clean) return "https://via.placeholder.com/150?text=No+Image";

  return `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(
    clean
  )}-M.jpg`;
}

// Main search function
async function searchBooks() {
  const query = (document.getElementById("searchInput").value || "")
    .toLowerCase()
    .trim();
  const categoryValue = document.getElementById("categoryFilter").value || "";

  const skeleton = document.getElementById("loadingSkeleton");
  const output = document.getElementById("searchResults");

  // skeleton
  skeleton.innerHTML = "";
  output.innerHTML = "";
  skeleton.classList.remove("hidden");
  for (let i = 0; i < 6; i++)
    skeleton.innerHTML += `<div class="skeleton-card"></div>`;

  let books = [];
  try {
    const res = await fetch(API_BOOKS);
    const raw = await res.text();
    let data = [];
    try {
      data = JSON.parse(raw);
    } catch {}

    if (!res.ok) {
      throw new Error(
        data && data.error ? data.error : raw || "Books API failed"
      );
    }

    books = Array.isArray(data) ? data : [];
  } catch (err) {
    skeleton.classList.add("hidden");
    output.innerHTML = `<p style="color:red;">Error loading books: ${err.message}</p>`;
    console.error("BOOKS LOAD ERROR:", err);
    return;
  }

  const filtered = books.filter((book) => {
    const title = (book.title || "").toLowerCase();
    const author = (book.author || "").toLowerCase(); // backend: author
    const isbn = (book.isbn || "").toLowerCase();
    const publisher = (book.publisher || "").toLowerCase();

    const matchesText =
      title.includes(query) ||
      author.includes(query) ||
      isbn.includes(query) ||
      publisher.includes(query);

    const matchesCategory =
      categoryValue === "" || book.category === categoryValue;
    return matchesText && matchesCategory;
  });

  skeleton.classList.add("hidden");

  if (filtered.length === 0) {
    output.innerHTML = "<p>No books found ❌</p>";
    return;
  }

  for (const book of filtered) {
    const stock = Number(book.stock || 0);
    const stockClass = stock > 0 ? "stock-ok" : "stock-out";
    const stockText = stock > 0 ? "In Stock" : "Out of Stock";

    const imageUrl = await getBookImage(book.isbn);
    const year = book.publish_year ?? "—";
    const price = Number(book.price || 0).toFixed(2);

    output.innerHTML += `
      <div class="card book-card fade-in">
      <img src="${imageUrl}" class="book-cover"
      onerror="this.onerror=null; this.src='https://via.placeholder.com/150?text=No+Image';" />

        <div class="book-info">
          <h3>${book.title || "Untitled"}</h3>
          <p><strong>Author:</strong> ${book.author || "—"}</p>
          <p><strong>Publisher:</strong> ${book.publisher || "—"}</p>
          <p><strong>Year:</strong> ${year}</p>
          <p><strong>Category:</strong> ${book.category || "—"}</p>
          <p><strong>ISBN:</strong> ${book.isbn || "—"}</p>
          <p><strong>Price:</strong> $${price}</p>
          <p class="${stockClass}">${stockText}</p>

          <button class="primary-btn"
            onclick="addToCart('${book.isbn}', ${price})"
            ${stock === 0 ? "disabled" : ""}>
            🛒 Add to Cart
          </button>
        </div>
      </div>
    `;
  }
}

/* === Add to cart ===
   Backend expects: POST /cart/add { cart_id, isbn, qty, price }
*/
async function addToCart(isbn, price) {
  const cart_id = localStorage.getItem("cart_id");

  if (!cart_id) {
    alert("Missing cart_id. Please login again.");
    return;
  }

  try {
    const res = await fetch(API_CART_ADD, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cart_id,
        isbn,
        qty: 1,
        price: Number(price),
      }),
    });

    const raw = await res.text();
    let data = {};
    try {
      data = JSON.parse(raw);
    } catch {}

    if (res.ok) {
      alert("Item added to cart ✔️");
    } else {
      alert(data.error || raw || "Cannot add to cart ❌");
    }
  } catch (err) {
    console.error("CART ERROR:", err);
    alert("Cannot add to cart ❌");
  }
}
