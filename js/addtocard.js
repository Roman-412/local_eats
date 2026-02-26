// addtocard.js - Cart Page Logic

// Sets the delivery partner tip based on a button click.
function setTip(element) {
    document.querySelectorAll('.tip-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('custom-tip').value = '';
    window.currentTip = parseInt(element.dataset.tip);
    element.classList.add('selected');
    updateTotal();
}

// Sets a custom tip amount from the input field.
function setCustomTip(element) {
    document.querySelectorAll('.tip-btn').forEach(btn => btn.classList.remove('selected'));
    let val = parseInt(element.value) || 0;
    if (val < 0) {
        val = 0;
        element.value = 0;
    }
    window.currentTip = val;
    updateTotal();
}

// Synchronizes the local cart with the backend.
async function syncCartWithBackend() {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) return;

    try {
        let response = await fetch(`https://backend-2h2s.onrender.com/carts/user/${userId}`);
        let backendCart;

        if (response.ok) {
            backendCart = await response.json();
        } else {
            response = await fetch(`https://backend-2h2s.onrender.com/carts/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: parseInt(userId),
                    delivery_type: 'home',
                    delivery_charge: 30,
                    tip_amount: 0,
                    promo_discount: 0,
                    subtotal: 0,
                    total_amount: 0
                })
            });

            if (response.ok) {
                backendCart = await response.json();
            } else if (response.status === 400) {
                console.error("User no longer exists in database.");
                localStorage.removeItem('user_id');
                localStorage.removeItem('username');
                alert("Session expired. Please log in again.");
                window.location.href = 'Login.html';
                return;
            } else {
                console.error("Failed to sync cart:", response.statusText);
                return;
            }
        }

        for (const item of cart) {
            const itemRes = await fetch(`https://backend-2h2s.onrender.com/carts/${backendCart.id}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    food_id: item.food_id || 1,
                    food_title: item.title,
                    food_image: item.image,
                    price: parseFloat(item.price),
                    quantity: item.quantity || 1
                })
            });
            if (!itemRes.ok) {
                console.error("Failed to sync item:", item.title, await itemRes.text());
            }
        }

        window.backendCartId = backendCart.id;
        localStorage.removeItem('cart');
        await loadCartFromBackend();
    } catch (error) {
        console.error("Error syncing cart:", error);
    }
}

// Loads the cart from the backend and updates the UI.
async function loadCartFromBackend() {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    try {
        const response = await fetch(`https://backend-2h2s.onrender.com/carts/user/${userId}`);
        if (response.ok) {
            const backendCart = await response.json();
            window.backendCartId = backendCart.id;
            renderCart(backendCart.items);
        } else if (response.status === 404) {
            renderCart([]);
        } else {
            console.error("Failed to load backend cart:", response.statusText);
            renderCart([]);
        }
    } catch (error) {
        console.error("Error loading cart from backend:", error);
        renderCart([]);
    }
}

async function updateBackendItemQuantity(itemId, quantity) {
    if (!window.backendCartId) return;
    try {
        const res = await fetch(`https://backend-2h2s.onrender.com/carts/${window.backendCartId}/items/${itemId}?quantity=${quantity}`, {
            method: 'PUT'
        });
        if (!res.ok) {
            console.error("Failed to update quantity:", await res.text());
            alert("Failed to update quantity in backend.");
            return;
        }
        await loadCartFromBackend();
    } catch (error) {
        console.error("Error updating quantity:", error);
    }
}

async function removeBackendItem(itemId) {
    if (!window.backendCartId) return;
    try {
        await fetch(`https://backend-2h2s.onrender.com/carts/${window.backendCartId}/items/${itemId}`, {
            method: 'DELETE'
        });
        await loadCartFromBackend();
    } catch (error) {
        console.error("Error removing item:", error);
    }
}

function updateTotal() {
    const userId = localStorage.getItem('user_id');
    let subtotal = 0;

    if (userId && window.lastRenderedItems) {
        window.lastRenderedItems.forEach(item => {
            subtotal += item.price * (item.quantity || 1);
        });
    } else {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.forEach(item => {
            subtotal += item.price * (item.quantity || 1);
        });
    }

    const deliveryType = document.querySelector('input[name="deliveryType"]:checked');
    const deliveryCharge = deliveryType && deliveryType.value === 'pickup' ? 0 : 30;

    const subtotalEl = document.getElementById('subtotal');
    const chargeEl = document.getElementById('charge-value');
    const promoEl = document.getElementById('promo-value');
    const tipEl = document.getElementById('tip-value');
    const totalEl = document.getElementById('final-total');

    if (subtotalEl) subtotalEl.textContent = subtotal;
    if (chargeEl) chargeEl.textContent = deliveryCharge;
    const currentDiscount = window.promoDiscount || 0;
    if (promoEl) promoEl.textContent = currentDiscount;
    const currentTip = window.currentTip || 0;
    if (tipEl) tipEl.textContent = currentTip;
    if (totalEl) totalEl.textContent = subtotal + deliveryCharge + currentTip - currentDiscount;
}

function applyPromo() {
    const input = document.getElementById('promo-input').value.trim();
    if (input) {
        window.promoDiscount = 10;
        window.appliedPromoCode = input;
        alert("Promo code applied! ₹10 subtracted.");
    } else {
        window.promoDiscount = 0;
        window.appliedPromoCode = null;
    }
    updateTotal();
}

function renderCart(items) {
    window.lastRenderedItems = items;
    const foodItemsList = document.getElementById("food-items-list");
    if (!foodItemsList) return;

    foodItemsList.innerHTML = "";

    if (!items || items.length === 0) {
        foodItemsList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Your cart is empty.</p>';
        updateTotal();
        return;
    }

    items.forEach((item, index) => {
        const itemId = item.id || index;
        const foodCard = document.createElement("div");
        foodCard.className = "food-card";
        foodCard.style.cssText = "display: flex; align-items: center; background: #fff; padding: 15px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);";

        let imageSrc = item.image || item.food_image || "";
        if (imageSrc) imageSrc = imageSrc.replace(/ /g, "%20");

        const title = item.title || item.food_title || "Unknown Item";
        const quantity = item.quantity || 1;
        const unitPrice = parseFloat(item.price);
        const rating = item.rating || "★★★★☆ 4.5";
        const description = item.description || "";

        foodCard.innerHTML = `
          <img src="${imageSrc}" alt="${title}" class="food-img" style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover;">
          <div class="food-info" style="display: flex; flex-direction: column; gap: 4px; flex: 1; margin: 0 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="food-name" style="font-weight: 700; font-size: 1.1rem; color: #333;">${title}</span>
              <button onclick="handleRemove('${itemId}')" style="background: none; border: none; color: #ff5722; cursor: pointer; padding: 5px;"><i class="fas fa-trash"></i></button>
            </div>
            <span class="food-rating" style="color: #f1c40f; font-size: 0.85rem;">${rating}</span>
            <p class="food-desc" style="font-size: 0.85rem; color: #777; margin: 0; line-height: 1.2;">${description}</p>
            <div style="display: flex; align-items: center; gap: 10px; margin-top: 8px;">
              <button onclick="handleDecrement('${itemId}', ${quantity})" style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid #ddd; background: #f9f9f9; cursor: pointer;">-</button>
              <span style="font-weight: 600; min-width: 20px; text-align: center;">${quantity}</span>
              <button onclick="handleIncrement('${itemId}', ${quantity})" style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid #ddd; background: #f9f9f9; cursor: pointer;">+</button>
            </div>
          </div>
          <span class="food-price" style="font-weight: 800; font-size: 1.1rem; color: #333;">₹ ${unitPrice * quantity}</span>
        `;
        foodItemsList.appendChild(foodCard);
    });

    updateTotal();
}

window.handleIncrement = async function (id, currentQty) {
    const userId = localStorage.getItem("user_id");
    if (userId) {
        await updateBackendItemQuantity(id, currentQty + 1);
    } else {
        incrementQty(id);
    }
};

window.handleDecrement = async function (id, currentQty) {
    if (currentQty > 1) {
        const userId = localStorage.getItem("user_id");
        if (userId) {
            await updateBackendItemQuantity(id, currentQty - 1);
        } else {
            decrementQty(id);
        }
    } else {
        window.handleRemove(id);
    }
};

window.handleRemove = async function (id) {
    const userId = localStorage.getItem("user_id");
    if (userId) {
        await removeBackendItem(id);
    } else {
        removeItem(id);
    }
};

window.clearCart = async function () {
    const userId = localStorage.getItem("user_id");
    if (userId && window.backendCartId) {
        try {
            await fetch(`https://backend-2h2s.onrender.com/carts/${window.backendCartId}`, { method: 'DELETE' });
            window.backendCartId = null;
            renderCart([]);
        } catch (e) { console.error(e); }
    } else {
        localStorage.removeItem("cart");
        renderCart([]);
    }
};

function incrementQty(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart[index]) {
        cart[index].quantity = (cart[index].quantity || 1) + 1;
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart(cart);
    }
}

function decrementQty(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart[index]) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
            localStorage.setItem("cart", JSON.stringify(cart));
            renderCart(cart);
        } else {
            removeItem(index);
        }
    }
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart(cart);
}

function getUrlParameter(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    const regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    const results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

async function loadCart() {
    const title = getUrlParameter("title");
    let image = getUrlParameter("image");
    const price = getUrlParameter("price");
    const foodId = getUrlParameter("food_id");
    const rating = getUrlParameter("rating");
    const description = getUrlParameter("description");

    if (title) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    const userId = localStorage.getItem("user_id");
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (title && price) {
        if (image) {
            if (image.startsWith("./assets")) image = "../" + image.substring(2);
            else if (image.startsWith("assets")) image = "../" + image;
            else if (image.startsWith("/assets")) image = ".." + image;
            image = image.replace(/ /g, "%20");
        }

        const standardizedTitle = title.trim();
        const existingItem = cart.find(item => item.title.trim() === standardizedTitle);

        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            cart.push({
                title: standardizedTitle,
                image: image,
                price: parseFloat(price),
                rating: rating,
                description: description,
                quantity: 1,
                food_id: parseInt(foodId) || 1
            });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    if (userId) {
        await syncCartWithBackend();
        await loadCartFromBackend();
    } else {
        renderCart(cart);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("username");
    if (username) {
        const userDisplay = document.getElementById("username-display");
        const customerNameInput = document.getElementById("customer_name");
        if (userDisplay) userDisplay.textContent = username;
        if (customerNameInput) customerNameInput.value = username;
    }
    loadCart();

    const placeOrderBtn = document.querySelector('.place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', handlePlaceOrder);
    }

    document.querySelectorAll('input[name="deliveryType"]').forEach((radio) => {
        radio.addEventListener("change", updateTotal);
    });
});

async function handlePlaceOrder(e) {
    e.preventDefault();

    const customerName = document.getElementById('customer_name').value.trim();
    const customerPhone = document.getElementById('customer_phone').value.trim();
    const deliveryTypeRadio = document.querySelector('input[name="deliveryType"]:checked');
    const deliveryType = deliveryTypeRadio ? deliveryTypeRadio.value : 'home';
    const streetNum = document.getElementById('street_num').value.trim();
    const street = document.getElementById('street').value.trim();
    const house = document.getElementById('house').value.trim();
    const floor = document.getElementById('floor').value.trim();

    if (!customerName || !customerPhone) {
        alert("Please enter your Name and Phone Number.");
        return;
    }

    if (customerPhone.length !== 10) {
        alert("Please enter a valid 10-digit Phone Number.");
        return;
    }

    if (deliveryType === 'home') {
        if (!street || !streetNum || !house) {
            alert("Please enter your complete address (Street Number, Street, and House) for Home Delivery.");
            return;
        }
    }

    let subtotal = 0;
    let items = [];

    const userId = localStorage.getItem('user_id');
    if (userId && window.lastRenderedItems) {
        items = window.lastRenderedItems;
        items.forEach(item => {
            subtotal += item.price * (item.quantity || 1);
        });
    } else {
        items = JSON.parse(localStorage.getItem('cart')) || [];
        items.forEach(item => {
            subtotal += item.price * (item.quantity || 1);
        });
    }

    if (items.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const deliveryCharge = deliveryType === 'pickup' ? 0 : 30;
    const currentTip = window.currentTip || 0;
    const currentDiscount = window.promoDiscount || 0;
    const total = subtotal + deliveryCharge + currentTip - currentDiscount;

    const finalOrder = {
        customerName,
        customerPhone,
        items,
        subtotal,
        delivery: deliveryCharge,
        tip: currentTip,
        promoDiscount: currentDiscount,
        promoCode: window.appliedPromoCode || null,
        total,
        deliveryType,
        address: { street, street_num: streetNum, house, floor }
    };

    localStorage.setItem("finalOrder", JSON.stringify(finalOrder));

    if (userId && window.backendCartId) {
        const btn = e.target;
        const originalBtnText = btn.textContent;
        btn.textContent = "Saving...";
        btn.disabled = true;

        try {
            const res = await fetch(`https://backend-2h2s.onrender.com/carts/${window.backendCartId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: parseInt(userId),
                    delivery_type: deliveryType,
                    delivery_charge: deliveryCharge,
                    street: street,
                    street_num: streetNum,
                    house: house,
                    floor: floor,
                    full_address: `${streetNum} ${street}, ${house}, ${floor}`,
                    tip_amount: currentTip,
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    promo_discount: currentDiscount,
                    promo_code: window.appliedPromoCode || null,
                    subtotal: subtotal,
                    total_amount: total
                })
            });
            if (!res.ok) throw new Error("Failed to save cart details");
            window.location.href = "pay_details.html";
        } catch (err) {
            console.error(err);
            alert("Error saving details: " + err.message);
            btn.textContent = originalBtnText;
            btn.disabled = false;
        }
    } else {
        window.location.href = "pay_details.html";
    }
}
