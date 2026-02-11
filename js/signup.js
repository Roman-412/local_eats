// signup.js - Signup logic

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById("signupForm");
    const message = document.getElementById("message");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        // Basic validation
        if (!username || !password) {
            message.textContent = "Please fill in all fields";
            message.style.color = "red";
            return;
        }

        if (password.length < 6) {
            message.textContent = "Password must be at least 6 characters long";
            message.style.color = "red";
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/users/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: username,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                message.textContent = "Signup successful! Redirecting...";
                message.style.color = "green";

                // Store user info if needed
                localStorage.setItem("username", username);

                // Redirect after 1 second
                setTimeout(() => {
                    window.location.href = "Login.html";
                }, 1000);
            } else {
                message.textContent = data.detail || "Signup failed. Username might already exist.";
                message.style.color = "red";
            }
        } catch (error) {
            console.error("Signup error:", error);
            message.textContent = "Server not connected. Please try again later.";
            message.style.color = "red";
        }
    });
});
