// Simple book search
const books = [
  { title: "Clean Code", available: true },
  { title: "The Pragmatic Programmer", available: true },
  { title: "1984", available: false }
];
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("themeToggle");
  const body = document.body;

  body.classList.add("light-theme");

  toggle.addEventListener("click", () => {
    body.classList.toggle("dark-theme");
    body.classList.toggle("light-theme");

    toggle.textContent = body.classList.contains("dark-theme")
      ? "☀️ Light Mode"
      : "🌙 Dark Mode";
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase();
      const results = books.filter(b =>
        b.title.toLowerCase().includes(query)
      );

      searchResults.innerHTML = results.map(b => `
        <div class="card">
          <h4>${b.title}</h4>
          <p>${b.available ? "In Stock" : "Out of Stock"}</p>
        </div>
      `).join("");
    });
  }
});
