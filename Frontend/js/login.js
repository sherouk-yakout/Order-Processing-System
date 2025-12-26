document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Backend expects: { email, password }
    const loginData = {
        email: document.getElementById("loginEmail")?.value.trim(),
        password: document.getElementById("loginPassword")?.value.trim(),
    };

    try {
        const res = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok) {
            // Backend returns: { message, user_id, role }
            const role = (data.role || "").toLowerCase();

            // In this project, we use user_id (username) as the session key
            localStorage.setItem("user_id", data.user_id);
            localStorage.setItem("username", data.user_id);
            localStorage.setItem("role", role);

            alert("Login successful ✔️");

            if (role === "admin") {
                window.location.href = "admin-dashboard.html";
            } else {
                window.location.href = "customer-dashboard.html";
            }
        } else {
            alert(data.error || "Login failed ❌");
        }
    } catch (err) {
        console.error(err);
        alert("Cannot reach backend. Make sure Backend is running on http://localhost:3000 ❌");
    }
});
