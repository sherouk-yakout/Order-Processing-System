const API_BASE = window.API_BASE || "http://localhost:3000";
const API_BOOKS = `${API_BASE}/books`;

document.addEventListener("DOMContentLoaded", () => {
  loadBooks();
  const params = new URLSearchParams(window.location.search);
  const isbn = params.get("isbn");

  const addForm = document.getElementById("bookForm");
  if (addForm) addForm.addEventListener("submit", addBook);
});

async function loadBooks() {
  const out = document.getElementById("bookList"); 
  if (!out) return;

  out.innerHTML = `<tr><td colspan="9">Loading...</td></tr>`;

  try {
    const res = await fetch(API_BOOKS);
    const raw = await res.text();
    let data = [];
    try { data = JSON.parse(raw); } catch {}

    if (!res.ok) throw new Error((data && data.error) ? data.error : raw || "Failed to load books");

    const books = Array.isArray(data) ? data : [];

    if (books.length === 0) {
      out.innerHTML = `<tr><td colspan="9">No books found.</td></tr>`;
      return;
    }

    out.innerHTML = "";

    for (const b of books) {
      const coverUrl = b.cover_url || "https://via.placeholder.com/60x80?text=No+Cover";

      out.innerHTML += `
        <tr>
          <td><img src="${escapeAttr(coverUrl)}" alt="cover" style="width:60px;height:80px;object-fit:cover;border-radius:6px;"></td>
          <td>${escapeHtml(b.isbn)}</td>
          <td>${escapeHtml(b.title)}</td>
          <td>${escapeHtml(b.author || "—")}</td>
          <td>${escapeHtml(b.category || "—")}</td>
          <td>${escapeHtml(String(b.price ?? "—"))}</td>
          <td>${escapeHtml(String(b.stock ?? "—"))}</td>
          <td>${escapeHtml(String(b.threshold ?? "—"))}</td>
        </tr>
      `;
    }

  } catch (e) {
    out.innerHTML = `<tr><td colspan="9" style="color:red;">${escapeHtml(e.message)}</td></tr>`;
  }
}


async function addBook(e) {
  e.preventDefault();

  const isbn = val("isbn");
  const title = val("title");
  const author = val("authors");
  const publisher = val("publisher");
  const publish_year = Number(val("year") || 0);
  const category = val("category");
  const price = Number(val("price") || 0);
  const stock = Number(val("stock") || 0);
  const threshold = Number(val("threshold") || 0);

  if (!isbn) {
    alert("ISBN is required");
    return;
  }

  const ALLOWED_CATEGORIES = [
    "Science",
    "Art",
    "Religion",
    "History",
    "Geography",
  ];
  if (!ALLOWED_CATEGORIES.includes(category)) {
    alert("Invalid category selected");
    return;
  }

  if (price < 0 || stock < 0 || threshold < 0) {
    alert("Price, stock, and threshold must be non-negative");
    return;
  }

  try {
    const res = await fetch(API_BOOKS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isbn,
        title,
        category,
        publish_year,
        price,
        stock,
        threshold,
        publisher,
        authors: author,
      }),
    });

    const raw = await res.text();
    let data = {};
    try {
      data = JSON.parse(raw);
    } catch {}

    if (!res.ok) throw new Error(data.error || raw || "Add book failed");

    alert("Book added ✔️");
    e.target.reset();
    loadBooks();
  } catch (err) {
    alert(err.message);
  }
}

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}
function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[
        m
      ])
  );
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
