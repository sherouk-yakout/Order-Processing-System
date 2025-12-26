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

  /* ===== LOGOUT ===== */
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      localStorage.clear(); // <--- unified auth storage
      location.href = "index.html";
    };
  }

  /* ===== SESSION TIMEOUT ===== */
  let timer;
  const LIMIT = 5 * 60 * 1000; // 5 minutes

  function resetTimer() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      alert("Session expired ⏱");
      localStorage.clear();
      location.href = "index.html";
    }, LIMIT);
  }

  ["click", "mousemove", "keydown"].forEach(e =>
    document.addEventListener(e, resetTimer)
  );

  resetTimer();
});


window.requireAuth = function(role = null) {

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    window.location.href = "auth.html";
    return;
  }

  if (role && role !== userRole) {
    alert("Unauthorized access ❌");
    window.location.href = "index.html";
  }
};
