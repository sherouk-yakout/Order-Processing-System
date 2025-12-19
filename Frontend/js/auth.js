document.addEventListener("DOMContentLoaded", () => {
  const loginTab = document.getElementById("loginTab");
  const signupTab = document.getElementById("signupTab");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  // Toggle Forms
  loginTab.addEventListener("click", () => {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
  });

  signupTab.addEventListener("click", () => {
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const pass = document.getElementById("loginPassword").value;

    if (email === "" || pass === "") {
      alert("Please fill all login fields");
      return;
    }

    // Dummy login logic with role detection
    const isAdmin = email.toLowerCase().includes("admin"); // crude example

    alert("Login successful!");

    // Redirect based on role
    if (isAdmin) {
      window.location.href = "admin-dashboard.html";
    } else {
      window.location.href = "customer-dashboard.html";
    }
  });

  // Dummy Signup
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const pass = document.getElementById("signupPassword").value;
    if (!name || !email || !pass) {
      alert("Please fill all signup fields");
      return;
    }
    if (!email.includes("@")) {
      alert("Enter a valid email");
      return;
    }
    alert("Signup successful! You can now log in.");
    loginTab.click(); // Switch to login tab
  });
});
