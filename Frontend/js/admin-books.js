const API_BASE = window.API_BASE || "http://localhost:3000";
const API_BOOKS = `${API_BASE}/books`;

document.addEventListener("DOMContentLoaded", () => {
  loadBooks();
  const params = new URLSearchParams(window.location.search);
  const isbn = params.get("isbn");

  if (isbn) {
    setTimeout(() => openEdit(isbn), 500);
  }

  const addForm = document.getElementById("bookForm");
  if (addForm) addForm.addEventListener("submit", addBook);

  const editForm = document.getElementById("editBookForm");
  if (editForm) editForm.addEventListener("submit", saveEdit);
});

async function loadBooks() {
  const out = document.getElementById("booksTableBody") || document.getElementById("booksList");
  if (!out) return;

  out.innerHTML = "Loading...";

  try {
    const res = await fetch(API_BOOKS);
    const raw = await res.text();
    let data = [];
    try { data = JSON.parse(raw); } catch {}

    if (!res.ok) throw new Error(data.error || raw || "Failed to load books");
    const books = Array.isArray(data) ? data : [];

    if (books.length === 0) {
      out.innerHTML = "<tr><td colspan='9'>No books found.</td></tr>";
      return;
    }

    out.innerHTML = "";
    for (const b of books) {
      // backend fields: isbn,title,category,publish_year,price,stock,publisher,author
      out.innerHTML += `
        <tr>
          <td>${escapeHtml(b.isbn)}</td>
          <td>${escapeHtml(b.title)}</td>
          <td>${escapeHtml(b.author || "—")}</td>
          <td>${escapeHtml(b.publisher || "—")}</td>
          <td>${escapeHtml(String(b.publish_year ?? "—"))}</td>
          <td>${escapeHtml(b.category || "—")}</td>
          <td>${escapeHtml(String(b.price ?? "—"))}</td>
          <td>${escapeHtml(String(b.stock ?? "—"))}</td>
          <td>
            <button class="btn" onclick="openEdit('${escapeAttr(b.isbn)}')">Edit</button>
          </td>
        </tr>
      `;
    }
  } catch (e) {
    out.innerHTML = `<tr><td colspan="9" style="color:red;">${escapeHtml(e.message)}</td></tr>`;
  }
}

async function addBook(e) {
  e.preventDefault();

  // These IDs must match your HTML inputs
  const isbn = val("isbn");
  const title = val("title");
  const author = val("authors");
   const publisher = val("publisher");
  const publish_year = Number(val("year") || 0);
  const category = val("category");
  const price = Number(val("price") || 0);
  const stock = Number(val("stock") || 0);
  const threshold = Number(val("threshold") || 0);
  

  try {
    const res = await fetch(API_BOOKS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isbn, title, category, publish_year, price, stock, threshold,publisher,authors: author })
    });

    const raw = await res.text();
    let data = {};
    try { data = JSON.parse(raw); } catch {}

    if (!res.ok) throw new Error(data.error || raw || "Add book failed");
    alert("Book added ✔️");
    e.target.reset();
    loadBooks();
  } catch (err) {
    alert(err.message);
  }
}

async function openEdit(isbn) {
  try {
    const res = await fetch(`${API_BOOKS}/${isbn}`);
    const book = await res.json();

    if (!res.ok) throw new Error(book.error || "Failed to load book");

    valSet("edit_isbn", book.isbn);
    valSet("edit_title", book.title);
    valSet("edit_category", book.category);
    valSet("edit_publish_year", book.publish_year);
    valSet("edit_price", book.price);
    valSet("edit_stock", book.stock);
    valSet("edit_threshold", book.threshold);
    valSet("edit_publisher", book.publisher);
    valSet("edit_authors", book.authors);

    const modal = document.getElementById("editModal");
    if (modal) modal.classList.remove("hidden");

  } catch (err) {
    alert(err.message);
  }
}

async function saveEdit(e) {
  e.preventDefault();

  const isbn = val("edit_isbn");
  const title = val("edit_title");
  const category = val("edit_category");
  const publish_year = Number(val("edit_publish_year") || 0);
  const price = Number(val("edit_price") || 0);
  const stock = Number(val("edit_stock") || 0);
  const threshold = Number(val("edit_threshold") || 0);
  const pub_id = Number(val("edit_pub_id") || 0);
  const publisher = val("edit_publisher");
   const author = val("edit_authors");

  try {
    const res = await fetch(`${API_BOOKS}/${encodeURIComponent(isbn)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, publish_year, price, stock, threshold, publisher, authors: author})
    });

    const raw = await res.text();
    let data = {};
    try { data = JSON.parse(raw); } catch {}

    if (!res.ok) throw new Error(data.error || raw || "Update failed");
    alert("Book updated ✔️");

    const modal = document.getElementById("editModal");
    if (modal) modal.classList.add("hidden");

    loadBooks();
  } catch (err) {
    alert(err.message);
  }
}

/* helpers */
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}
function escapeAttr(s) {
  return String(s).replace(/'/g, "\\'");
}
function valSet(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value ?? "";
}
function closeEdit() {
  const modal = document.getElementById("editModal");
  if (modal) modal.classList.add("hidden");
}

