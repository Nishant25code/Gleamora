document.addEventListener('DOMContentLoaded', function () {
    var box = document.querySelector('.order-summary') || document.querySelector('[data-checkout-total]');
    if (!box) {
        return;
    }
    var data;
    try {
        data = JSON.parse(localStorage.getItem('gleamoraCart')) || [];
    } catch (error) {
        data = [];
    }
    if (!data.length) {
        box.innerHTML = 'No items in cart';
        return;
    }
    var total = 0;
    for (var i = 0; i < data.length; i++) {
        total += (data[i].price || 0) * (data[i].quantity || 1);
    }
    total += 100;
    var text = 'Total Amount: ₹' + (Number(total) || 0).toLocaleString('en-IN');
    box.innerHTML = '<div class="checkout-total-only">' + text + '</div>';
});
