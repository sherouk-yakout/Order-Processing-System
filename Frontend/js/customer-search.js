const API = "http://localhost:3000/books";

let debounceTimer;

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchInput");
  const category = document.getElementById("categoryFilter");

  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(searchBooks, 300); // Smooth typing
  });

  category.addEventListener("change", searchBooks);

  searchBooks(); // Load all books initially
});

/* === Fetch Google Books Thumbnail === */
async function getBookImage(isbn) {
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
    );
    const data = await res.json();

    if (data.items && data.items[0].volumeInfo.imageLinks) {
      return data.items[0].volumeInfo.imageLinks.thumbnail;
    }
  } catch (err) {
    console.error("Image fetch failed:", err);
  }

  return "https://via.placeholder.com/150?text=No+Image";
}

/* === Main search function === */
async function searchBooks() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const category = document.getElementById("categoryFilter").value;

  const skeleton = document.getElementById("loadingSkeleton");
  const output = document.getElementById("searchResults");

  // Show loading skeletons
  skeleton.innerHTML = "";
  output.innerHTML = "";
  skeleton.classList.remove("hidden");
  for (let i = 0; i < 6; i++) {
    skeleton.innerHTML += `<div class="skeleton-card"></div>`;
  }

  const res = await fetch(API);
  const books = await res.json();

  const filtered = books.filter(book => {
    const matchesText =
      book.title.toLowerCase().includes(query) ||
      book.authors.toLowerCase().includes(query) ||
      book.isbn.toLowerCase().includes(query) ||
      book.publisher.toLowerCase().includes(query);

    const matchesCategory = category === "" || book.category === category;

    return matchesText && matchesCategory;
  });

  skeleton.classList.add("hidden");

  if (filtered.length === 0) {
    output.innerHTML = "<p>No books found ❌</p>";
    return;
  }

  for (const book of filtered) {
    const stockClass = book.stock > 0 ? "stock-ok" : "stock-out";
    const stockText = book.stock > 0 ? "In Stock" : "Out of Stock";

    const imageUrl = await getBookImage(book.isbn);

    output.innerHTML += `
      <div class="card book-card fade-in">
        <img src="${imageUrl}" class="book-cover" />

        <div class="book-info">
          <h3>${book.title}</h3>
          <p><strong>Authors:</strong> ${book.authors}</p>
          <p><strong>Publisher:</strong> ${book.publisher}</p>
          <p><strong>Year:</strong> ${book.year}</p>
          <p><strong>Category:</strong> ${book.category}</p>
          <p><strong>ISBN:</strong> ${book.isbn}</p>
          <p><strong>Price:</strong> $${book.price}</p>
          <p class="${stockClass}">${stockText}</p>

          <button class="primary-btn"
            onclick="addToCart(${book.id})"
            ${book.stock === 0 ? "disabled" : ""}>
            🛒 Add to Cart
          </button>
        </div>
      </div>
    `;
  }
}

/* === Add to cart === */
async function addToCart(bookId) {
  const user_id = localStorage.getItem("user_id");

  const res = await fetch("http://localhost:3000/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, book_id: bookId, quantity: 1 }),
  });

  const data = await res.json();

  if (res.ok) {
    alert("Book added to cart ✔️");
  } else {
    alert(data.error || "Cannot add to cart ❌");
  }
}
