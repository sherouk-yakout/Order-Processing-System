const API_BASE = window.API_BASE || "http://localhost:3000";
const API_BOOKS = `${API_BASE}/books`;

document.addEventListener("DOMContentLoaded", () => {
  loadBooks();

  const addForm = document.getElementById("addBookForm");
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
  const category = val("category");
  const publish_year = Number(val("publish_year") || 0);
  const price = Number(val("price") || 0);
  const stock = Number(val("stock") || 0);
  const threshold = Number(val("threshold") || 0);
  const pub_id = Number(val("pub_id") || 0); // backend expects pub_id

  try {
    const res = await fetch(API_BOOKS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isbn, title, category, publish_year, price, stock, threshold, pub_id })
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

function openEdit(isbn) {
  const editIsbn = document.getElementById("edit_isbn");
  if (editIsbn) editIsbn.value = isbn;

  // If you already have modal, open it here.
  const modal = document.getElementById("editModal");
  if (modal) modal.classList.remove("hidden");
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

  try {
    const res = await fetch(`${API_BOOKS}/${encodeURIComponent(isbn)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, publish_year, price, stock, threshold, pub_id })
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
