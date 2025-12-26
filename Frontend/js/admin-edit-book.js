const API_BASE = "http://localhost:3000";
const API_BOOKS = `${API_BASE}/books`;

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const isbn = params.get("isbn");

  if (!isbn) return alert("No ISBN provided!");

  try {
    // Fetch book data
    const res = await fetch(`${API_BOOKS}/${encodeURIComponent(isbn)}`);
    const book = await res.json();
    if (!res.ok) throw new Error(book.error || "Failed to load book");

    // Fill form fields
    valSet("edit_isbn", book.isbn);
    valSet("edit_title", book.title);
    valSet("edit_authors", book.authors);
    valSet("edit_publisher", book.publisher);
    valSet("edit_publish_year", book.publish_year);
    valSet("edit_category", book.category);
    valSet("edit_price", book.price);
    valSet("edit_stock", book.stock);
    valSet("edit_threshold", book.threshold);

  } catch (err) {
    alert(err.message);
  }

  // Handle form submit
  document.getElementById("editBookForm").addEventListener("submit", async e => {
    e.preventDefault();

    const isbn = val("edit_isbn");
    const data = {
      title: val("edit_title"),
      authors: val("edit_authors"),
      publisher: val("edit_publisher"),
      publish_year: Number(val("edit_publish_year") || 0),
      category: val("edit_category"),
      price: Number(val("edit_price") || 0),
      stock: Number(val("edit_stock") || 0),
      threshold: Number(val("edit_threshold") || 0)
    };

    try {
      const res = await fetch(`${API_BOOKS}/${encodeURIComponent(isbn)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const msg = await res.json();
      if (!res.ok) throw new Error(msg.error || "Update failed");

      alert(msg.message || "Book updated ✔️");
      window.location.href = "admin-search.html";

    } catch (err) {
      alert(err.message);
    }
  });
});

/* helpers */
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function valSet(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value ?? "";
}
