// auth.js - Authentication and Search Logic

document.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem("user_id");
    const username = localStorage.getItem("username");

    // 1. Navbar Update logic
    const authContainer = document.getElementById("auth-buttons-container");
    const profileContainer = document.getElementById("user-profile-container");
    const welcomeMsg = document.getElementById("welcome-message");

    if (username) {
        if (authContainer) authContainer.style.display = "none";
        if (profileContainer) profileContainer.style.display = "flex";
        if (welcomeMsg) welcomeMsg.textContent = `Welcome, ${username}`;
    } else {
        if (authContainer) authContainer.style.display = "flex";
        if (profileContainer) profileContainer.style.display = "none";
    }

    // 2. Global Search Logic
    const searchInput = document.querySelector('.search-bar input');
    const searchIcon = document.querySelector('.search-bar i.fa-search');

    if (searchInput && searchIcon) {
        const handleSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                const isInsideHTML = window.location.pathname.includes('/HTML/');
                let searchPath = "search_results.html";

                // If we are at the root (index.html)
                if (!isInsideHTML) {
                    searchPath = "HTML/search_results.html";
                } else if (window.location.pathname.includes('/shops/') ||
                    window.location.pathname.includes('/Breakfast/') ||
                    window.location.pathname.includes('/Lunch/') ||
                    window.location.pathname.includes('/Diner/') ||
                    window.location.pathname.includes('/Snacks/')) {
                    searchPath = "../search_results.html";
                }

                window.location.href = `${searchPath}?search=${encodeURIComponent(query)}`;
            }
        };

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
        searchIcon.addEventListener('click', handleSearch);
    }
});

// Logout functionality
function logout() {
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    localStorage.removeItem("cart");

    const isInsideHTML = window.location.pathname.includes('/HTML/');
    let loginPath = isInsideHTML ? "Login.html" : "HTML/Login.html";

    // Adjustment for different folder depths
    if (window.location.pathname.includes('/Snacks/') ||
        window.location.pathname.includes('/Breakfast/') ||
        window.location.pathname.includes('/Lunch/') ||
        window.location.pathname.includes('/Diner/') ||
        window.location.pathname.includes('/shops/')) {
        loginPath = "../Login.html";
    }

    window.location.href = loginPath;
}
