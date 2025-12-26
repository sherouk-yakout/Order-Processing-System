const API = "http://localhost:3000/books";

/* ===== FETCH GOOGLE BOOK IMAGE ===== */
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

  return "https://via.placeholder.com/120x160?text=No+Image";
}

document.addEventListener("DOMContentLoaded", () => {
  loadBooks();

  document.getElementById("bookForm").addEventListener("submit", saveBook);

  // Live preview image when ISBN changes
  document.getElementById("isbn").addEventListener("input", updatePreview);
});

/* ===== LIVE COVER PREVIEW ===== */
async function updatePreview() {
  const isbn = document.getElementById("isbn").value;
  const img = document.getElementById("coverPreview");

  if (!isbn) return img.classList.add("hidden");

  const url = await getBookImage(isbn);
  img.src = url;
  img.classList.remove("hidden");
}

/* ===== LOAD BOOK LIST ===== */
async function loadBooks() {
  const res = await fetch(API);
  const books = await res.json();

  const list = document.getElementById("bookList");
  list.innerHTML = "";

  for (const book of books) {
    const img = await getBookImage(book.isbn);

    const stockClass =
      book.stock <= book.threshold ? "stock-low" : "stock-ok";

    list.innerHTML += `
      <tr class="fade-in">
        <td><img src="${img}" class="table-cover" /></td>
        <td>${book.isbn}</td>
        <td>${book.title}</td>
        <td>${book.authors}</td>
        <td>${book.category}</td>
        <td>$${book.price}</td>
        <td class="${stockClass}">${book.stock}</td>
        <td>${book.threshold}</td>

        <td>
          <button class="btn small-btn" onclick="editBook(${book.id})">✏ Edit</button>
          <button class="btn danger-btn small-btn" onclick="deleteBook(${book.id})">🗑 Delete</button>
        </td>
      </tr>
    `;
  }
}

/* ===== SAVE OR UPDATE BOOK ===== */
async function saveBook(e) {
  e.preventDefault();

  const id = document.getElementById("bookId").value;

  const bookData = {
    isbn: isbn.value,
    title: title.value,
    authors: authors.value,
    publisher: publisher.value,
    year: year.value,
    category: category.value,
    price: price.value,
    stock: stock.value,
    threshold: threshold.value,
  };

  const res = await fetch(id ? `${API}/${id}` : API, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookData),
  });

  if (res.ok) {
    alert(id ? "Book updated!" : "Book added!");
    resetForm();
    loadBooks();
  } else {
    alert("Error saving book ❌");
  }
}

/* ===== RESET FORM ===== */
function resetForm() {
  document.getElementById("bookForm").reset();
  document.getElementById("bookId").value = "";
  document.getElementById("formTitle").textContent = "Add New Book";
  document.getElementById("coverPreview").classList.add("hidden");
}

/* ===== EDIT BOOK ===== */
async function editBook(id) {
  const res = await fetch(`${API}/${id}`);
  const book = await res.json();

  document.getElementById("formTitle").textContent = "Edit Book";
  document.getElementById("bookId").value = book.id;

  isbn.value = book.isbn;
  title.value = book.title;
  authors.value = book.authors;
  publisher.value = book.publisher;
  year.value = book.year;
  category.value = book.category;
  price.value = book.price;
  stock.value = book.stock;
  threshold.value = book.threshold;

  updatePreview();
}

/* ===== DELETE BOOK ===== */
async function deleteBook(id) {
  if (!confirm("Delete this book?")) return;

  const res = await fetch(`${API}/${id}`, { method: "DELETE" });

  if (res.ok) {
    alert("Book deleted ✔️");
    loadBooks();
  } else {
    alert("Error deleting book ❌");
  }
}
