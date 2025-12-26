document.querySelectorAll(".toggle-eye").forEach(icon => {
  icon.onclick = () => {
    const input = document.getElementById(icon.dataset.target);
    input.type = input.type === "password" ? "text" : "password";
  };
});

document.getElementById("signupForm").addEventListener("submit", async e => {
  e.preventDefault();

  const newUser = {
    username: document.getElementById("signupUsername").value,
    fname: document.getElementById("signupFirstName").value,
    lname: document.getElementById("signupLastName").value,
    email: document.getElementById("signupEmail").value,
    phone: document.getElementById("signupPhone").value,
    shipping_address: document.getElementById("signupAddress").value,
    password: document.getElementById("signupPassword").value
  };

  const res = await fetch("http://localhost:3000/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser),
  });

  const data = await res.json();

  if (!res.ok) return alert(data.error || "Signup failed ❌");

  alert("Account created successfully ✔️");
  window.location.href = "login.html";
});
