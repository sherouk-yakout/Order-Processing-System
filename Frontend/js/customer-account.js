const API_BASE = window.API_BASE || "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  loadProfile();

  const form = document.getElementById("profileForm");
  if (form) form.addEventListener("submit", saveProfile);
});

async function loadProfile() {
  const user_id = localStorage.getItem("user_id");
  const out = document.getElementById("profileMsg");
  if (!user_id) return setMsg(out, "Missing user_id. Login again.", true);

  try {
    const res = await fetch(`${API_BASE}/customers/${encodeURIComponent(user_id)}`);
    const raw = await res.text();
    let data = {};
    try { data = JSON.parse(raw); } catch {}

    if (!res.ok) throw new Error(data.error || raw || "Failed to load profile");

    // IDs must match your HTML inputs:
    setVal("first_name", data.first_name);
    setVal("last_name", data.last_name);
    setVal("username", data.username);
    setVal("email", data.email);
    setVal("phone", data.phone);
    setVal("shipping_address", data.shipping_address);

    setMsg(out, "Profile loaded ✔️", false);
  } catch (e) {
    setMsg(out, e.message, true);
  }
}

async function saveProfile(e) {
  e.preventDefault();

  const old_user_id = localStorage.getItem("user_id");
  const out = document.getElementById("profileMsg");
  if (!old_user_id) return setMsg(out, "Missing user_id. Login again.", true);

  const payload = {
    first_name: val("first_name"),
    last_name: val("last_name"),
    username: val("username"),
    email: val("email"),
    phone: val("phone"),
    shipping_address: val("shipping_address"),
    password: val("password") // optional
  };

  try {
    const res = await fetch(`${API_BASE}/customers/update/${encodeURIComponent(old_user_id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const raw = await res.text();
    let data = {};
    try { data = JSON.parse(raw); } catch {}

    if (!res.ok) throw new Error(data.error || raw || "Update failed");

    // if username changed, update localStorage
    if (payload.username && payload.username !== old_user_id) {
      localStorage.setItem("user_id", payload.username);
    }

    // clear password field
    setVal("password", "");

    setMsg(out, "Profile updated ✔️", false);
  } catch (e2) {
    setMsg(out, e2.message, true);
  }
}

/* helpers */
function val(id) { return (document.getElementById(id)?.value || "").trim(); }
function setVal(id, v) { const el = document.getElementById(id); if (el) el.value = v ?? ""; }
function setMsg(el, msg, isErr) {
  if (!el) return;
  el.textContent = msg;
  el.style.color = isErr ? "red" : "green";
}
