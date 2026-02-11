// vendor-registration.js - Vendor Registration logic

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById("vendorForm");
    const imageUrlInput = document.getElementById("image-url");
    const imagePreviewContainer = document.getElementById("image-preview-container");
    const imagePreview = document.getElementById("image-preview");
    const submitBtn = document.getElementById("submitBtn");

    if (!form || !imageUrlInput) return;

    // Image Preview Logic for URL
    imageUrlInput.addEventListener("input", function () {
        const url = this.value;
        if (url) {
            imagePreview.src = url;
            imagePreviewContainer.style.display = "block";

            // Handle image load error
            imagePreview.onerror = function () {
                imagePreviewContainer.style.display = "none";
            };
        } else {
            imagePreviewContainer.style.display = "none";
        }
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Change button state
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = "Registering...";
        submitBtn.disabled = true;

        const formData = new FormData();
        formData.append("cartName", document.getElementById("cart-name").value);
        formData.append("foodType", document.getElementById("food-type").value);
        formData.append("vendorName", document.getElementById("vendor-name").value);
        formData.append("phoneNumber", document.getElementById("phone-number").value);
        formData.append("location", document.getElementById("location").value);
        formData.append("menuList", document.getElementById("menu-list").value);
        formData.append("openTime", document.getElementById("open-time").value);
        formData.append("closeTime", document.getElementById("close-time").value);
        formData.append("imageUrl", imageUrlInput.value);

        try {
            const res = await fetch("http://127.0.0.1:8000/vendors/", {
                method: "POST",
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json();
                alert(`Server error: ${errorData.detail || 'Unknown error'}`);
                return;
            }

            const data = await res.json();
            alert("Vendor Registration Successful!");
            form.reset();
            imagePreviewContainer.style.display = "none";
            window.location.href = "../index.html";
        } catch (error) {
            console.error("Error:", error);
            alert("Connection failed. Please ensure the backend is running.");
        } finally {
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});
