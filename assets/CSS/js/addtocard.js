
/**
 * Sets the delivery partner tip based on a button click.
 * @param {HTMLElement} element The button element that was clicked.
 */
function setTip(element) {
    // Reset all buttons' 'selected' class
    document.querySelectorAll('.tip-btn').forEach(btn => btn.classList.remove('selected'));
    
    // Clear custom tip input
    document.getElementById('custom-tip').value = '';

    // Set the new tip value and mark the button as selected
    currentTip = parseInt(element.dataset.tip);
    element.classList.add('selected');
    
    updateTotal();
}

