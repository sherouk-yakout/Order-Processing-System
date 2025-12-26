const ACCOUNT_API = "http://localhost:3000/customers";

document.addEventListener("DOMContentLoaded", loadAccount);

// Load user info into form
async function loadAccount() {
  const user_id = localStorage.getItem("user_id");

  const res = await fetch(`${ACCOUNT_API}/${user_id}`);
  const user = await res.json();

  document.getElementById("firstName").value = user.first_name;
  document.getElementById("lastName").value = user.last_name;
  document.getElementById("username").value = user.username;
  document.getElementById("email").value = user.email;
  document.getElementById("phone").value = user.phone;
  document.getElementById("address").value = user.shipping_address;
}

// Save changes
document.getElementById("accountForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const user_id = localStorage.getItem("user_id");

  const updated = {
    first_name: document.getElementById("firstName").value,
    last_name: document.getElementById("lastName").value,
    username: document.getElementById("username").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    shipping_address: document.getElementById("address").value
  };

  const newPass = document.getElementById("newPassword")?.value;
  if (newPass && newPass.trim().length > 0) {
    updated.password = newPass.trim();
  }

  const res = await fetch(`${ACCOUNT_API}/update/${user_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated),
  });

  if (res.ok) {
    alert("Profile updated ✔️");

    // If username changed, keep frontend session consistent
    if (updated.username && updated.username !== user_id) {
      localStorage.setItem("user_id", updated.username);
      localStorage.setItem("username", updated.username);
    }
  } else {
    alert("Error updating profile ❌");
  }
});
