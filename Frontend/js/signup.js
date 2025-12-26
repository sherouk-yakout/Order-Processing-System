// ===============================
// PASSWORD SHOW / HIDE (EYE ICON)
// ===============================
document.querySelectorAll(".toggle-eye").forEach(eye => {
    eye.addEventListener("click", () => {
        const targetId = eye.getAttribute("data-target");
        const passwordInput = document.getElementById(targetId);

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            eye.textContent = "🙈";
        } else {
            passwordInput.type = "password";
            eye.textContent = "👁";
        }
    });
});

// ===============================
// PASSWORD STRENGTH CHECKER
// ===============================
const passwordInput = document.getElementById("signupPassword");
const strengthText = document.getElementById("passwordStrength");

passwordInput.addEventListener("input", () => {
    const password = passwordInput.value;

    const checks = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    };

    let missing = [];

    if (!checks.length) missing.push("at least 8 characters");
    if (!checks.upper) missing.push("1 uppercase letter");
    if (!checks.lower) missing.push("1 lowercase letter");
    if (!checks.number) missing.push("1 number");
    if (!checks.special) missing.push("1 special character");

    if (missing.length === 0) {
        strengthText.textContent = "✅ Strong password";
        strengthText.style.color = "green";
    } else if (missing.length <= 2) {
        strengthText.textContent = "⚠ Medium password — add: " + missing.join(", ");
        strengthText.style.color = "orange";
    } else {
        strengthText.textContent = "❌ Weak password — missing: " + missing.join(", ");
        strengthText.style.color = "red";
    }
});

// ===============================
// SIGNUP FORM SUBMIT
// ===============================
document.getElementById("signupForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Prevent submit if password weak
    if (strengthText.textContent.includes("Weak")) {
        alert("Password is too weak ❌");
        return;
    }

    const newUser = {
        username: document.getElementById("signupUsername").value.trim(),
        password: document.getElementById("signupPassword").value.trim(),
        first_name: document.getElementById("signupFirstName").value.trim(),
        last_name: document.getElementById("signupLastName").value.trim(),
        email: document.getElementById("signupEmail").value.trim(),
        phone: document.getElementById("signupPhone").value.trim(),
        shipping_address: document.getElementById("signupAddress").value.trim(),
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
