document.addEventListener("DOMContentLoaded", () => {

  const loginTab = document.getElementById("loginTab");
  const signupTab = document.getElementById("signupTab");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  const params = new URLSearchParams(window.location.search);
  const selectedRole = params.get("role");

  /* ===== FORM TOGGLE ===== */
  loginTab.onclick = () => {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
  };

  signupTab.onclick = () => {
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
  };

  /* ===== PASSWORD SHOW / HIDE (ONE CLEAN LOGIC) ===== */
  document.querySelectorAll(".toggle-eye").forEach(eye => {
    eye.addEventListener("click", () => {
      const input = document.getElementById(eye.dataset.target);
      if (!input) return;

      input.type = input.type === "password" ? "text" : "password";
      eye.textContent = input.type === "password" ? "👁" : "🙈";
    });
  });

  /* ===== PASSWORD STRENGTH ===== */
  const signupPassword = document.getElementById("signupPassword");
  const strengthText = document.getElementById("passwordStrength");

  if (signupPassword) {
    signupPassword.oninput = () => {
      const v = signupPassword.value;
      let msg = "Weak ❌", color = "red";

      if (v.length >= 8 && /[A-Z]/.test(v) && /\d/.test(v)) {
        msg = "Strong ✅"; color = "green";
      } else if (v.length >= 6) {
        msg = "Medium ⚠"; color = "orange";
      }

      strengthText.textContent = `Password Strength: ${msg}`;
      strengthText.style.color = color;
    };
  }

  /* ===== LOGIN ===== */
  loginForm.onsubmit = e => {
    e.preventDefault();
    sessionStorage.setItem("role", selectedRole);

    window.location.href =
      selectedRole === "admin"
        ? "admin-dashboard.html"
        : "customer-dashboard.html";
  };

});
