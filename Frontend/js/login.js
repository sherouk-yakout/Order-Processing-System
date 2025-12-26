// SHOW / HIDE PASSWORD (EYE ICON)
document.querySelectorAll(".toggle-eye").forEach(eye => {
    eye.addEventListener("click", () => {
        const targetId = eye.getAttribute("data-target");
        const input = document.getElementById(targetId);

        if (input.type === "password") {
            input.type = "text";
            eye.textContent = "🙈";
        } else {
            input.type = "password";
            eye.textContent = "👁";
        }
    });
});

// TOAST NOTIFICATION
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.className = "toast";
    }, 3000);
}

// LOGIN FORM SUBMIT
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const loginData = {
        email: document.getElementById("loginEmail").value.trim(),
        password: document.getElementById("loginPassword").value.trim(),
    };

    try {
        const res = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok) {
            const role = (data.role || "").toLowerCase();

            localStorage.setItem("user_id", data.user_id);
            localStorage.setItem("username", data.user_id);
            localStorage.setItem("role", role);
            localStorage.setItem("cart_id", data.cart_id);

            showToast("Login successful ✔️", "success");

            setTimeout(() => {
                if (role === "admin") {
                    window.location.href = "admin-dashboard.html";
                } else {
                    window.location.href = "customer-dashboard.html";
                }
            }, 1200);

        } else {
            showToast(data.error || "Login failed ❌", "error");
        }
    } catch (err) {
        console.error(err);
        showToast("Backend server not reachable ❌", "error");
    }
});
