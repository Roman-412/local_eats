// orderstatus.js - Order Status Page Logic

document.addEventListener("DOMContentLoaded", () => {
    const finalOrder = JSON.parse(localStorage.getItem("finalOrder"));
    const paymentMethod = localStorage.getItem("paymentMethod") || "UPI";

    const orderTotalEl = document.getElementById("order-total");
    const orderNumberEl = document.getElementById("order-number");
    const paymentMethodEl = document.getElementById("payment-method");

    if (finalOrder && orderTotalEl) {
        orderTotalEl.textContent = (finalOrder.total || 0).toFixed(2);
    }

    // Generate random order number or use saved one
    const orderNumber = finalOrder && finalOrder.orderId ? finalOrder.orderId : Math.floor(100000 + Math.random() * 900000);
    if (orderNumberEl) orderNumberEl.textContent = orderNumber;

    if (paymentMethodEl) paymentMethodEl.textContent = paymentMethod.toUpperCase();

    const progress = document.getElementById('progress');
    const step3 = document.getElementById('step3');
    const step4 = document.getElementById('step4');
    const msg = document.getElementById('msg');

    if (progress && msg) {
        setTimeout(() => {
            progress.style.width = "66%";
            if (step3) step3.classList.add('active');
            msg.innerHTML = '<i class="fas fa-motorcycle"></i> Our delivery partner is on the way!';
            msg.style.borderColor = "#3498db";
            msg.style.background = "#ebf5fb";
        }, 5000);

        setTimeout(() => {
            progress.style.width = "100%";
            if (step4) step4.classList.add('active');
            msg.innerHTML = '<i class="fas fa-check"></i> Order Delivered! Enjoy your meal.';
            msg.style.borderColor = "#27ae60";
            msg.style.background = "#eafaf1";
        }, 10000);
    }
});
