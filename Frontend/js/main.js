document.addEventListener("DOMContentLoaded", () => {

  /* ===== BACK BUTTON ===== */
  document.querySelectorAll(".back-btn").forEach(btn =>
    btn.onclick = () => history.back()
  );

  /* ===== THEME TOGGLE ===== */
  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.onclick = () => {
      document.body.classList.toggle("dark-theme");
      toggle.textContent =
        document.body.classList.contains("dark-theme")
          ? "☀️ Light Mode"
          : "🌙 Dark Mode";
    };
  }

  /* ===== ROLE PROTECTION ===== */
  const role = sessionStorage.getItem("role");
  const page = location.pathname;

  if (page.includes("admin") && role !== "admin") {
    alert("Access denied ❌");
    location.href = "index.html";
  }

  if (page.includes("customer") && role !== "customer") {
    alert("Access denied ❌");
    location.href = "index.html";
  }

  /* ===== LOGOUT ===== */
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      sessionStorage.clear();
      location.href = "index.html";
    };
  }

  /* ===== SESSION TIMEOUT ===== */
  let timer;
  const LIMIT = 5 * 60 * 1000;

  function resetTimer() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      alert("Session expired ⏱");
      sessionStorage.clear();
      location.href = "index.html";
    }, LIMIT);
  }

  ["click", "mousemove", "keydown"].forEach(e =>
    document.addEventListener(e, resetTimer)
  );

  resetTimer();
});
