// food-loader.js - Dynamic Food Filling logic for filtered/search pages

async function loadFoods() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const sortBy = urlParams.get('sort_by') || 'popularity';
        const minRating = urlParams.get('min_rating');
        const minPrice = urlParams.get('min_price');
        const maxPrice = urlParams.get('max_price');
        const maxDistance = urlParams.get('max_distance');
        const search = urlParams.get('search');

        // Update header Name if it exists
        const nameHeader = document.querySelector('.Name');
        if (nameHeader) {
            if (category === 'veg') {
                nameHeader.textContent = "ORDER OUR BEST VEG FOOD OPTIONS";
            } else if (category === 'non-veg') {
                nameHeader.textContent = "ORDER OUR BEST NON-VEG FOOD OPTIONS";
            } else if (search) {
                nameHeader.textContent = `Search Results for "${search}"`;
            } else if (!category || category === 'all') {
                nameHeader.textContent = "ORDER OUR BEST FOOD OPTIONS";
            }
        }

        // Build query string
        let queryString = '?';
        if (category && category !== 'all') queryString += `category=${category}&`;
        if (sortBy) queryString += `sort_by=${sortBy}&`;
        if (minRating) queryString += `min_rating=${minRating}&`;
        if (minPrice) queryString += `min_price=${minPrice}&`;
        if (maxPrice) queryString += `max_price=${maxPrice}&`;
        if (maxDistance) queryString += `max_distance=${maxDistance}&`;
        if (search) queryString += `search=${search}&`;

        queryString = queryString.replace(/[&?]$/, '');

        const response = await fetch(`http://127.0.0.1:8000/foods${queryString}`);
        const foods = await response.json();

        const menuContainer = document.getElementById('menu-container');
        if (!menuContainer) return;

        menuContainer.innerHTML = '';

        if (!foods || foods.length === 0) {
            menuContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px;"><p>No foods found matching your criteria.</p></div>';
            return;
        }

        foods.forEach(food => {
            let imagePath = food.image_url || '../assets/default-food.jpg';
            // Normalize path for HTML/ folder
            if (imagePath.startsWith('./assets')) {
                imagePath = '../' + imagePath.substring(2);
            } else if (imagePath.startsWith('assets')) {
                imagePath = '../' + imagePath;
            } else if (imagePath.startsWith('/assets')) {
                imagePath = '..' + imagePath;
            }

            imagePath = imagePath.replace(/ /g, "%20");

            const foodCard = document.createElement('div');
            foodCard.className = 'food-card';
            foodCard.innerHTML = `
                <div class="image-box">
                    <img src="${imagePath}" alt="${food.title}">
                </div>
                <div class="details-box">
                    <div class="heart-icon">${food.category || 'Food'}</div>
                    <h3 class="title">${food.title}</h3>
                    <div class="rating">
                        ${'★'.repeat(Math.floor(food.rating || 0))}${'☆'.repeat(5 - Math.floor(food.rating || 0))} ${food.rating || 'N/A'}
                    </div>
                    <p class="description">${food.description || 'Delicious food item'}</p>
                    <div class="price">₹${food.price}</div>
                    <button class="add-button" onclick="addToCart(${food.id}, '${food.title.replace(/'/g, "\\'")}', '${food.image_url}', ${food.price}, ${food.rating}, '${(food.description || '').replace(/\n/g, ' ').replace(/'/g, "\\'")}')">Add to Cart</button>
                </div>
            `;
            menuContainer.appendChild(foodCard);
        });
    } catch (error) {
        console.error('Error loading foods:', error);
        const menuContainer = document.getElementById('menu-container');
        if (menuContainer) {
            menuContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Error loading foods. Please try again later.</p>';
        }
    }
}

// Search override for dynamic pages
function initSearchOverride() {
    const searchBarContainer = document.querySelector('.search-bar');
    if (searchBarContainer) {
        const searchInput = searchBarContainer.querySelector('input');
        const searchIcon = searchBarContainer.querySelector('i');

        function performSearch() {
            const query = searchInput.value.trim();
            if (query) {
                // For dynamic pages, we just update the URL search param and reload
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('search', query);
                window.location.href = currentUrl.toString();
            }
        }

        if (searchIcon) {
            searchIcon.addEventListener('click', performSearch);
            searchIcon.style.cursor = 'pointer';
        }

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') performSearch();
            });
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadFoods();
    initSearchOverride();
});
