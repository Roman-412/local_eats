// filters-logic.js - Complex filtering logic for filters.html

document.addEventListener('DOMContentLoaded', () => {
    let selectedSort = 'cost_30_80';
    let selectedCategory = 'all';
    let selectedPriceRange = null;
    let selectedRating = null;
    let selectedDistance = null;

    // Sidebar navigation
    const sidebarItems = document.querySelectorAll('.filter-sidebar li');
    const sections = document.querySelectorAll('.filter-section');

    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Hide all sections
            sections.forEach(s => s.style.display = 'none');

            // Show corresponding section
            const text = item.textContent.toLowerCase();
            if (text.includes('sort')) {
                document.getElementById('section-sort').style.display = 'block';
            } else if (text.includes('category')) {
                document.getElementById('section-category').style.display = 'block';
            } else if (text.includes('cost')) {
                document.getElementById('section-cost').style.display = 'block';
            } else if (text.includes('rating')) {
                document.getElementById('section-rating').style.display = 'block';
            } else if (text.includes('distance')) {
                document.getElementById('section-distance').style.display = 'block';
            } else if (text.includes('cuisines')) {
                document.getElementById('section-cuisines').style.display = 'block';
            }
        });
    });

    // Handle sort selection
    const sortRadios = document.querySelectorAll('input[name="sort"]');
    sortRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) selectedSort = e.target.value;
        });
    });

    // Handle category selection
    const categoryRadios = document.querySelectorAll('input[name="category"]');
    categoryRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) selectedCategory = e.target.value;
        });
    });

    // Handle price range selection
    const priceRadios = document.querySelectorAll('input[name="price-range"]');
    priceRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) selectedPriceRange = e.target.value;
        });
    });

    // Handle rating selection
    const ratingRadios = document.querySelectorAll('input[name="rating-range"]');
    ratingRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) selectedRating = e.target.value;
        });
    });

    // Handle distance selection
    const distanceRadios = document.querySelectorAll('input[name="distance-range"]');
    distanceRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) selectedDistance = e.target.value;
        });
    });

    // Apply button functionality
    const applyBtn = document.getElementById('apply-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const params = new URLSearchParams();
            let finalSort = selectedSort;
            let minP = null, maxP = null, minR = null, maxR = null;

            if (selectedSort === 'cost_30_80') {
                minP = 30; maxP = 80; finalSort = 'popularity';
            } else if (selectedSort === 'cost_80_150') {
                minP = 80; maxP = 150; finalSort = 'popularity';
            } else if (selectedSort === 'rating_3.5_4') {
                minR = 3.5; maxR = 4; finalSort = 'popularity';
            } else if (selectedSort === 'rating_4_5') {
                minR = 4; maxR = 5; finalSort = 'popularity';
            }

            params.append('sort_by', finalSort);
            if (minP !== null) params.append('min_price', minP);
            if (maxP !== null) params.append('max_price', maxP);
            if (minR !== null) params.append('min_rating', minR);
            if (maxR !== null) params.append('max_rating', maxR);

            if (!minP && selectedPriceRange) {
                const [min, max] = selectedPriceRange.split('-');
                params.append('min_price', min);
                if (max) params.append('max_price', max);
            }
            if (!minR && selectedRating) params.append('min_rating', selectedRating);
            if (selectedDistance) params.append('max_distance', selectedDistance);

            const targetPage = selectedCategory === 'non-veg' ? 'Non_veg.html' : 'Veg_food.html';
            if (selectedCategory !== 'all') params.append('category', selectedCategory);

            window.location.href = `${targetPage}?${params.toString()}`;
        });
    }

    // Clear button functionality
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            sortRadios.forEach(radio => radio.checked = (radio.value === 'popularity'));
            [priceRadios, ratingRadios, distanceRadios, categoryRadios].forEach(group => {
                group.forEach(radio => radio.checked = false);
            });
            // Reset "all" category
            const allCat = document.querySelector('input[name="category"][value="all"]');
            if (allCat) allCat.checked = true;

            selectedSort = 'popularity';
            selectedCategory = 'all';
            selectedPriceRange = null;
            selectedRating = null;
            selectedDistance = null;
        });
    }
});
