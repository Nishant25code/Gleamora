  (function () {
    var CART_KEY = 'gleamoraCart';
    var SHIPPING_FEE = 100;

    function q(selector) {
        return document.querySelector(selector);
    }

    function format(value) {
        return '₹' + (Number(value) || 0).toLocaleString('en-IN');
    }

    function readCart() {
        try {
            var saved = localStorage.getItem(CART_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            return [];
        }
    }

    function changeQuantity(id, delta) {
        var cart = readCart();
        for (var i = 0; i < cart.length; i++) {
            if (cart[i].id === id) {
                cart[i].quantity = (cart[i].quantity || 0) + delta;
                if (cart[i].quantity <= 0) {
                    cart.splice(i, 1);
                }
                break;
            }
        }
        writeCart(cart);
        renderCartPage();
    }

    function bindCartTable() {
        var body = q('[data-cart-body]');
        if (!body || body.getAttribute('data-qty-listener')) {
            return;
        }
        body.addEventListener('click', function (event) {
            var target = event.target;
            while (target && target !== body && !target.getAttribute('data-qty')) {
                target = target.parentNode;
            }
            if (!target || target === body) {
                return;
            }
            var id = target.getAttribute('data-id');
            if (!id) {
                return;
            }
            changeQuantity(id, target.getAttribute('data-qty') === 'inc' ? 1 : -1);
        });
        body.setAttribute('data-qty-listener', 'true');
    }

    function writeCart(list) {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(list));
        } catch (error) {}
    }

    function updateBadge(items) {
        var cart = items || readCart();
        var total = 0;
        for (var i = 0; i < cart.length; i++) {
            total += cart[i].quantity || 0;
        }
        var badges = document.querySelectorAll('[data-cart-count]');
        for (var j = 0; j < badges.length; j++) {
            badges[j].textContent = total;
        }
        return cart;
    }

    function bindAddButtons() {
        var buttons = document.querySelectorAll('[data-add-to-cart]');
        for (var i = 0; i < buttons.length; i++) {
            (function (button) {
                var label = button.textContent;
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    var product = {
                        id: button.getAttribute('data-id'),
                        name: button.getAttribute('data-name'),
                        price: Number(button.getAttribute('data-price')) || 0,
                        quantity: Number(button.getAttribute('data-quantity')) || 1,
                        image: button.getAttribute('data-image') || ''
                    };
                    if (!product.id || !product.name) {
                        return;
                    }
                    var cart = readCart();
                    var found = false;
                    for (var k = 0; k < cart.length; k++) {
                        if (cart[k].id === product.id) {
                            cart[k].quantity += product.quantity;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        cart.push(product);
                    }
                    writeCart(cart);
                    updateBadge(cart);
                    button.disabled = true;
                    button.textContent = 'Added';
                    setTimeout(function () {
                        button.disabled = false;
                        button.textContent = label;
                    }, 900);
                });
            })(buttons[i]);
        }
    }

    function setMany(selectors, value) {
        for (var i = 0; i < selectors.length; i++) {
            var node = q(selectors[i]);
            if (node) {
                node.textContent = value;
            }
        }
    }

    function renderCartPage() {
        var cart = updateBadge();
        var body = q('[data-cart-body]');
        var summary = q('[data-checkout-items]');
        var subtotal = 0;
        var rows = '';
        var cards = '';
        for (var i = 0; i < cart.length; i++) {
            var item = cart[i];
            var qty = item.quantity || 1;
            var line = (item.price || 0) * qty;
            subtotal += line;
            var image = item.image ? '<img src="' + item.image + '" alt="' + item.name + '">' : '';
            var controls = '<div class="qty-control">' +
                '<button type="button" data-qty="dec" data-id="' + item.id + '">-</button>' +
                '<span>' + qty + '</span>' +
                '<button type="button" data-qty="inc" data-id="' + item.id + '">+</button>' +
                '</div>';
            rows += '<tr><td>' + image + '</td><td>' + item.name + '</td><td>' + format(item.price) + '</td><td>' + controls + '</td><td>' + format(line) + '</td></tr>';
            cards += '<div class="summary-item"><span>' + item.name + '</span><span>Qty ' + qty + '</span><strong>' + format(line) + '</strong></div>';
        }
        if (body) {
            body.innerHTML = rows || '<tr><td colspan="5">Your cart is empty</td></tr>';
        }
        if (summary) {
            summary.innerHTML = cards || '<p>Your cart is empty.</p>';
        }
        var shipping = cart.length ? SHIPPING_FEE : 0;
        setMany(['[data-cart-subtotal]', '[data-checkout-subtotal]'], format(subtotal));
        setMany(['[data-cart-total]', '[data-checkout-total]'], format(subtotal + shipping));
        setMany(['[data-cart-shipping]', '[data-checkout-shipping]'], format(shipping));
        bindCartTable();
    }

    function clearCart() {
        writeCart([]);
        renderCartPage();
    }

    function initMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var nav = document.querySelector('.nav-container');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = nav.classList.contains('open');
            nav.classList.toggle('open', !open);
            document.body.classList.toggle('nav-menu-open', !open);
            toggle.setAttribute('aria-expanded', !open ? 'true' : 'false');
        });
        document.addEventListener('click', function (event) {
            if (!nav.contains(event.target) && event.target !== toggle) {
                nav.classList.remove('open');
                document.body.classList.remove('nav-menu-open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    function initBasePage() {
        initMenu();
        bindAddButtons();
        updateBadge();
    }

    window.Gleamora = {
        initBasePage: initBasePage,
        renderCartPage: renderCartPage,
        clearCart: clearCart
    };
})();
