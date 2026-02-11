// pay_details.js - Payment Page Logic

const payBtn = document.getElementById("payBtn");
const upiModal = document.getElementById("upiModal");
const upiConfirm = document.getElementById("upiConfirm");
const upiClose = document.getElementById("upiClose");
const methods = document.querySelectorAll(".method");
const cardBox = document.getElementById("card-box");

let selectedMethod = "upi";
let orderTotal = 0;

async function loadOrderSummary() {
    let finalOrder = JSON.parse(localStorage.getItem("finalOrder"));
    const userId = localStorage.getItem("user_id");

    if (!finalOrder && userId) {
        try {
            const response = await fetch(`http://127.0.0.1:8000/carts/user/${userId}`);
            if (response.ok) {
                const backendCart = await response.json();
                if (backendCart.items && backendCart.items.length > 0) {
                    finalOrder = {
                        items: backendCart.items,
                        subtotal: backendCart.subtotal,
                        delivery: backendCart.delivery_charge,
                        tip: backendCart.tip_amount,
                        total: backendCart.total_amount,
                        address: {
                            street: backendCart.street,
                            street_num: backendCart.street_num,
                            house: backendCart.house,
                            floor: backendCart.floor
                        },
                        deliveryType: backendCart.delivery_type,
                        customerName: backendCart.customer_name,
                        customerPhone: backendCart.customer_phone
                    };
                    localStorage.setItem("finalOrder", JSON.stringify(finalOrder));
                }
            }
        } catch (error) {
            console.error("Error fetching cart from backend:", error);
        }
    }

    if (!finalOrder) {
        alert("No order found. Please add items to cart first.");
        window.location.href = "addtocard.html";
        return;
    }

    const orderItemsContainer = document.getElementById("order-items");
    if (orderItemsContainer) {
        orderItemsContainer.innerHTML = "";
        finalOrder.items.forEach(item => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "item";
            itemDiv.innerHTML = `
                <span>${item.title || item.food_title || "Unknown Item"} x ${item.quantity || 1}</span>
                <span>₹${(item.price * (item.quantity || 1)).toFixed(2)}</span>
            `;
            orderItemsContainer.appendChild(itemDiv);
        });
    }

    const subtotalEl = document.getElementById("summary-subtotal");
    const deliveryEl = document.getElementById("summary-delivery");
    const tipEl = document.getElementById("summary-tip");
    const totalEl = document.getElementById("summary-total");
    const payAmountEl = document.getElementById("pay-amount");

    if (subtotalEl) subtotalEl.textContent = (finalOrder.subtotal || 0).toFixed(2);
    if (deliveryEl) deliveryEl.textContent = (finalOrder.delivery || 0).toFixed(2);
    if (tipEl) tipEl.textContent = (finalOrder.tip || 0).toFixed(2);
    if (totalEl) totalEl.textContent = (finalOrder.total || 0).toFixed(2);
    if (payAmountEl) payAmountEl.textContent = (finalOrder.total || 0).toFixed(2);

    orderTotal = finalOrder.total;
}

window.formatExpiry = function (input) {
    let val = input.value.replace(/\D/g, "");
    if (val.length > 2) {
        val = val.substring(0, 2) + "/" + val.substring(2, 4);
    }
    input.value = val;
}

function validateCardDetails() {
    const cardNum = document.getElementById("card").value.trim();
    const expiry = document.getElementById("expiry").value.trim();
    const cvv = document.getElementById("cvv").value.trim();

    if (cardNum.length !== 16) {
        alert("Please enter a valid 16-digit Card Number.");
        return false;
    }

    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(expiry)) {
        alert("Please enter a valid Expiry Date (MM/YY).");
        return false;
    }

    const [m, y] = expiry.split("/").map(n => parseInt(n));
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = parseInt(now.getFullYear().toString().slice(-2));

    if (y < currentYear || (y === currentYear && m < currentMonth)) {
        alert("This card has already expired.");
        return false;
    }

    if (cvv.length !== 3) {
        alert("Please enter a valid 3-digit CVV.");
        return false;
    }

    return true;
}

async function processPayment() {
    const finalOrder = JSON.parse(localStorage.getItem("finalOrder"));
    const userId = localStorage.getItem("user_id");
    const parsedUserId = parseInt(userId);

    if (!finalOrder) {
        alert("Order data missing. Please try again.");
        return;
    }

    const name = finalOrder.customerName;
    const phone = finalOrder.customerPhone;

    const originalBtnText = payBtn.textContent;
    payBtn.textContent = "Processing...";
    payBtn.disabled = true;

    try {
        const orderData = {
            user_id: parsedUserId || 1,
            street: finalOrder.address.street,
            street_num: finalOrder.address.street_num,
            house: finalOrder.address.house,
            floor: finalOrder.address.floor,
            delivery_type: finalOrder.deliveryType,
            delivery_charge: finalOrder.delivery,
            tip_amount: finalOrder.tip,
            promo_code: finalOrder.promoCode || null,
            promo_discount: finalOrder.promoDiscount || 0,
            payment_method: selectedMethod,
            customer_name: name,
            customer_phone: phone,
            items: finalOrder.items.map(item => ({
                food_id: item.food_id || 1,
                food_title: item.title || item.food_title,
                price: item.price,
                quantity: item.quantity || 1
            }))
        };

        const response = await fetch("http://127.0.0.1:8000/orders/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to save order.");
        }

        const savedOrder = await response.json();

        try {
            await fetch("http://127.0.0.1:8000/payments/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    order_id: savedOrder.id,
                    user_name: name,
                    phone: phone,
                    payment_method: selectedMethod,
                    amount: orderTotal
                })
            });
        } catch (e) {
            console.error("Error saving payment record:", e);
        }

        localStorage.setItem("finalOrder", JSON.stringify({
            ...finalOrder,
            orderId: savedOrder.id,
            timestamp: new Date().toISOString()
        }));

        if (userId) {
            try {
                let cartRes = await fetch(`http://127.0.0.1:8000/carts/user/${userId}`);
                if (cartRes.ok) {
                    const cart = await cartRes.json();
                    await fetch(`http://127.0.0.1:8000/carts/${cart.id}`, { method: 'DELETE' });
                }
            } catch (e) { console.error(e); }
        }

        localStorage.removeItem("cart");
        completePayment();

    } catch (error) {
        console.error("Payment Process Error:", error);
        alert(`Order Error: ${error.message}`);
        payBtn.textContent = originalBtnText;
        payBtn.disabled = false;
    }
}

function completePayment() {
    localStorage.setItem("paymentSuccess", "true");
    localStorage.setItem("paymentMethod", selectedMethod);
    window.location.href = "order_status.html";
}

document.addEventListener("DOMContentLoaded", () => {
    loadOrderSummary();

    if (methods) {
        methods.forEach(btn => {
            btn.addEventListener("click", () => {
                methods.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                selectedMethod = btn.dataset.method;
                if (selectedMethod === "card") {
                    cardBox.classList.remove("hidden");
                } else {
                    cardBox.classList.add("hidden");
                }
            });
        });
    }

    if (payBtn) {
        payBtn.addEventListener("click", () => {
            if (selectedMethod === "upi") {
                upiModal.style.display = "flex";
            } else if (selectedMethod === "card") {
                if (validateCardDetails()) {
                    processPayment();
                }
            } else {
                processPayment();
            }
        });
    }

    if (upiConfirm) {
        upiConfirm.addEventListener("click", () => {
            upiModal.style.display = "none";
            processPayment();
        });
    }

    if (upiClose) {
        upiClose.addEventListener("click", () => {
            upiModal.style.display = "none";
        });
    }
});
