document.querySelectorAll(".toggle-eye").forEach(icon => {
  icon.onclick = () => {
    const input = document.getElementById(icon.dataset.target);
    input.type = input.type === "password" ? "text" : "password";
  };
});

document.getElementById("loginForm").addEventListener("submit", async e => {
  e.preventDefault();

  const loginData = {
    username: document.getElementById("loginUsername").value,
    password: document.getElementById("loginPassword").value
  };

  const res = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginData)
  });

  const data = await res.json();

  if (!res.ok) return alert(data.message || "Login failed ❌");

  localStorage.setItem("username", data.username);
  localStorage.setItem("role", data.role);

  window.location.href =
    data.role === "Admin" ? "admin-dashboard.html" : "customer-dashboard.html";
});
