// location-map.js - Location Modal and Google Maps Integration

document.addEventListener('DOMContentLoaded', () => {
    const locationModal = document.getElementById('locationModal');
    const locationInput = document.querySelector('.location-input');
    const locationInputField = document.querySelector('.location-input input');
    const closeModal = document.querySelector('.close-modal');
    const confirmBtn = document.querySelector('.confirm-location-btn');
    const searchAreaBtn = document.getElementById('searchAreaBtn');
    const modalSearchInput = document.getElementById('modalLocationSearch');
    const mapFrame = document.getElementById('mapFrame');

    if (!locationModal) return;

    function updateMap(query) {
        if (!query) return;
        const searchURL = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
        if (mapFrame) mapFrame.src = searchURL;
    }

    if (locationInput) {
        const icons = locationInput.querySelectorAll('i');
        icons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                locationModal.style.display = 'block';
                if (modalSearchInput && locationInputField) {
                    modalSearchInput.value = locationInputField.value;
                    updateMap(locationInputField.value);
                }
            });
        });

        if (locationInputField) {
            locationInputField.addEventListener('click', (e) => {
                e.stopPropagation();
                // If on index page, we might want to type directly.
                // On product pages, it usually triggers modal.
                if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
                    locationModal.style.display = 'block';
                }
            });

            locationInputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    locationModal.style.display = 'block';
                    if (modalSearchInput) {
                        modalSearchInput.value = locationInputField.value;
                        updateMap(locationInputField.value);
                    }
                }
            });
        }
    }

    if (searchAreaBtn && modalSearchInput) {
        searchAreaBtn.addEventListener('click', () => {
            updateMap(modalSearchInput.value);
        });
        modalSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') updateMap(modalSearchInput.value);
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            locationModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target == locationModal) {
            locationModal.style.display = 'none';
        }
    });

    if (confirmBtn && locationInputField && modalSearchInput) {
        confirmBtn.addEventListener('click', () => {
            if (modalSearchInput.value) {
                locationInputField.value = modalSearchInput.value;
            }
            locationModal.style.display = 'none';
        });
    }
});
