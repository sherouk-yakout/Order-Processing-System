const API_BASE = window.API_BASE || "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  loadProfile();

  const form = document.getElementById("accountForm");
  if (form) form.addEventListener("submit", saveProfile);
});

async function loadProfile() {
  const user_id = localStorage.getItem("user_id");
  const out = document.getElementById("accountMsg");
  if (!user_id) return setMsg(out, "Missing user_id. Login again.", true);

  try {
    const res = await fetch(`${API_BASE}/customers/${encodeURIComponent(user_id)}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to load profile");

    setVal("firstName", data.first_name);
    setVal("lastName", data.last_name);
    setVal("username", data.username);
    setVal("email", data.email);
    setVal("phone", data.phone);
    setVal("address", data.shipping_address);

    setMsg(out, "", false);
  } catch (e) {
    setMsg(document.getElementById("accountMsg"), e.message, true);
  }
}

async function saveProfile(e) {
  e.preventDefault();

  const old_user_id = localStorage.getItem("user_id");
  const out = document.getElementById("accountMsg");
  if (!old_user_id) return setMsg(out, "Missing user_id. Login again.", true);

  // Backend expects these field names:
  const payload = {
    first_name: val("firstName"),
    last_name: val("lastName"),
    username: val("username"),
    email: val("email"),
    phone: val("phone"),
    shipping_address: val("address"),
    password: val("newPassword") // optional
  };

  // If password is empty, delete it so backend doesn’t update it
  if (!payload.password) delete payload.password;

  try {
    const res = await fetch(`${API_BASE}/customers/update/${encodeURIComponent(old_user_id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Update failed");

    // If username changed, keep localStorage in sync
    if (payload.username && payload.username !== old_user_id) {
      localStorage.setItem("user_id", payload.username);
      localStorage.setItem("username", payload.username);
    }

    // Clear password input after save
    setVal("newPassword", "");

    setMsg(out, "Profile updated ✔️", false);
  } catch (err) {
    setMsg(out, err.message, true);
  }
}

function val(id) { return (document.getElementById(id)?.value || "").trim(); }
function setVal(id, v) { const el = document.getElementById(id); if (el) el.value = v ?? ""; }
function setMsg(el, msg, isErr) {
  if (!el) return;
  el.textContent = msg;
  el.style.color = isErr ? "red" : "green";
}
