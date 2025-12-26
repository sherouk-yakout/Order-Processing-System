document.getElementById("signupForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Backend expects POST /auth/signup with keys:
    // { username, password, first_name, last_name, email, phone, shipping_address }
    const newUser = {
        username: document.getElementById("signupUsername")?.value.trim(),
        password: document.getElementById("signupPassword")?.value.trim(),
        first_name: document.getElementById("signupFirstName")?.value.trim(),
        last_name: document.getElementById("signupLastName")?.value.trim(),
        email: document.getElementById("signupEmail")?.value.trim(),
        phone: document.getElementById("signupPhone")?.value.trim(),
        shipping_address: document.getElementById("signupAddress")?.value.trim(),
    };

    try {
        const res = await fetch("http://localhost:3000/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok) {
            alert("Account created successfully ✔️");
            window.location.href = "login.html";
        } else {
            alert(data.error || "Signup failed ❌");
        }
    } catch (err) {
        console.error(err);
        alert("Cannot reach backend. Make sure Backend is running on http://localhost:3000 ❌");
    }
});
