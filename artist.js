document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("artist-login-form");
    const errorMessage = document.getElementById("error-message");

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("http://localhost:5000/api/auth/artist-login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("artistToken", data.token);
                window.location.href = "artist-dashboard.html"; // Redirect to artist dashboard
            } else {
                errorMessage.textContent = data.message || "Invalid login credentials";
            }
        } catch (error) {
            errorMessage.textContent = "Error connecting to server";
        }
    });
});
