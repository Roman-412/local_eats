// login.js - Login logic

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById("loginForm");
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

        try {
            const response = await fetch("http://127.0.0.1:8000/users/login", {
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
                message.textContent = "Login successful! Redirecting...";
                message.style.color = "green";

                // Store user info
                localStorage.setItem("username", username);
                localStorage.setItem("user_id", data.user_id);

                // Redirect after 1 second
                setTimeout(() => {
                    window.location.href = "../index.html";
                }, 1000);
            } else {
                message.textContent = data.detail || "Login failed. Please check your credentials.";
                message.style.color = "red";
            }
        } catch (error) {
            console.error("Login error:", error);
            message.textContent = "Server not connected. Please try again later.";
            message.style.color = "red";
        }
    });
});
