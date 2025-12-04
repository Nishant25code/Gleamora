(() => {
    const CART_KEY = 'gleamoraCart';
    const SHIPPING_FEE = 100;

    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
    const setText = (node, value) => node && (node.textContent = value);
    const safeJson = (fallback, fn) => {
        try {
            return fn();
        } catch (error) {
            return fallback;
        }
    };

    const readCart = () => safeJson([], () => JSON.parse(localStorage.getItem(CART_KEY)) || []);
    const saveCart = (cart) => safeJson(null, () => localStorage.setItem(CART_KEY, JSON.stringify(cart)));
    const formatCurrency = (value = 0) => `₹${Number(value).toLocaleString('en-IN')}`;

    const updateCartCount = (cartItems) => {
        const count = (cartItems || readCart()).reduce((sum, item) => sum + item.quantity, 0);
        $$('[data-cart-count]').forEach((badge) => setText(badge, count));
    };

    const getCartSummary = (cartItems) => {
        const cart = Array.isArray(cartItems) ? cartItems : readCart();
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return {
            cart,
            subtotal,
            shipping: cart.length ? SHIPPING_FEE : 0,
            total: subtotal + (cart.length ? SHIPPING_FEE : 0)
        };
    };

    const renderCartPage = () => {
        const { cart, subtotal, shipping, total } = getCartSummary();
        updateCartCount(cart);
        const cartBody = $('[data-cart-body]');
        if (!cartBody) {
            return;
        }
        if (!cart.length) {
            cartBody.innerHTML = '<tr><td colspan="5">Your cart is empty</td></tr>';
        } else {
            cartBody.innerHTML = cart.map((item) => {
                const imageCell = item.image ? `<img src="${item.image}" alt="${item.name}">` : '';
                const quantityCell = `<div class="qty-control"><button type="button" data-qty-action="decrement" data-id="${item.id}">-</button><span>${item.quantity}</span><button type="button" data-qty-action="increment" data-id="${item.id}">+</button></div>`;
                return `<tr><td>${imageCell}</td><td>${item.name}</td><td>${formatCurrency(item.price)}</td><td>${quantityCell}</td><td>${formatCurrency(item.price * item.quantity)}</td></tr>`;
            }).join('');
        }
        setText($('[data-cart-subtotal]'), formatCurrency(subtotal));
        setText($('[data-cart-shipping]'), formatCurrency(shipping));
        setText($('[data-cart-total]'), formatCurrency(total));
    };

    const addItemToCart = (product) => {
        const cart = readCart();
        const existing = cart.find((item) => item.id === product.id);
        if (existing) {
            existing.quantity += product.quantity;
        } else {
            cart.push(product);
        }
        saveCart(cart);
        renderCartPage();
    };

    const changeItemQuantity = (id, delta) => {
        const cart = readCart();
        const item = cart.find((entry) => entry.id === id);
        if (!item) {
            return;
        }
        item.quantity += delta;
        if (item.quantity <= 0) {
            const index = cart.findIndex((entry) => entry.id === id);
            cart.splice(index, 1);
        }
        saveCart(cart);
        renderCartPage();
    };

    const initCartQuantityControls = () => {
        const cartBody = document.querySelector('[data-cart-body]');
        if (!cartBody) {
            return;
        }
        cartBody.addEventListener('click', (event) => {
            const button = event.target.closest('[data-qty-action]');
            if (!button) {
                return;
            }
            const { id, qtyAction } = button.dataset;
            if (!id) {
                return;
            }
            const delta = qtyAction === 'increment' ? 1 : -1;
            changeItemQuantity(id, delta);
        });
    };

    const initMenuToggle = () => {
        const toggle = $('.menu-toggle');
        const nav = $('.nav-container');
        const menu = nav?.querySelector('ul');
        if (!toggle || !nav || !menu) {
            return;
        }
        const setState = (isOpen) => {
            nav.classList.toggle('open', isOpen);
            toggle.setAttribute('aria-expanded', String(isOpen));
            toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
            document.body.classList.toggle('nav-menu-open', isOpen);
        };

        toggle.addEventListener('click', () => setState(!nav.classList.contains('open')));
        menu.id ||= 'primary-navigation';
        toggle.setAttribute('aria-controls', menu.id);
        toggle.setAttribute('aria-haspopup', 'true');
        $$('a', nav).forEach((link) => link.addEventListener('click', () => setState(false)));
        document.addEventListener('click', (event) => {
            if (!nav.contains(event.target) && event.target !== toggle) {
                setState(false);
            }
        });
    };

    const initAddToCart = () => {
        const buttons = $$('[data-add-to-cart]');
        if (!buttons.length) {
            return;
        }
        buttons.forEach((button) => {
            const originalText = button.textContent;
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const product = {
                    id: button.dataset.id,
                    name: button.dataset.name,
                    price: Number(button.dataset.price) || 0,
                    quantity: Number(button.dataset.quantity) || 1,
                    image: button.dataset.image || ''
                };
                if (!product.id || !product.name) {
                    return;
                }
                addItemToCart(product);
                if (button.dataset.goCart === 'true') {
                    window.location.href = 'cart.html';
                    return;
                }
                button.disabled = true;
                button.textContent = 'Added';
                setTimeout(() => {
                    button.disabled = false;
                    button.textContent = originalText;
                }, 1200);
            });
        });
    };

    const initBasePage = () => {
        initMenuToggle();
        updateCartCount();
    };

    const initCheckoutPage = () => {
        initBasePage();
        const elements = {
            items: $('[data-checkout-items]'),
            subtotal: $('[data-checkout-subtotal]'),
            shipping: $('[data-checkout-shipping]'),
            total: $('[data-checkout-total]'),
            count: $('[data-checkout-count]'),
            note: $('[data-checkout-note]'),
            button: $('[data-place-order]'),
            form: $('form')
        };

        const setNote = (message, variant) => {
            if (!elements.note) {
                return;
            }
            elements.note.textContent = message;
            elements.note.classList.toggle('is-success', variant === 'success');
            elements.note.classList.toggle('is-warning', variant === 'warning');
        };

        const renderItems = (cart) => {
            if (!elements.items) {
                return;
            }
            elements.items.innerHTML = cart.length
                ? cart.map((item) => {
                    const image = item.image ? `<img src="${item.image}" alt="${item.name}">` : '';
                    return `
                        <div class="summary-item">
                            ${image}
                            <div class="summary-item-details">
                                <p class="summary-item-name">${item.name}</p>
                                <p class="summary-item-meta">Qty ${item.quantity} · ${formatCurrency(item.price)}</p>
                            </div>
                            <span class="summary-item-total">${formatCurrency(item.price * item.quantity)}</span>
                        </div>
                    `;
                }).join('')
                : '<p>Your cart is empty. <a href="products.html">Shop now</a>.</p>';
        };

        const renderCheckoutSummary = () => {
            const summary = getCartSummary();
            renderItems(summary.cart);
            setText(elements.subtotal, formatCurrency(summary.subtotal));
            setText(elements.shipping, summary.cart.length ? formatCurrency(summary.shipping) : '₹0');
            setText(elements.total, formatCurrency(summary.total));
            if (elements.count) {
                const itemCount = summary.cart.reduce((sum, item) => sum + item.quantity, 0);
                setText(elements.count, itemCount === 1 ? '1 item' : `${itemCount} items`);
            }
            if (elements.button) {
                const hasItems = summary.cart.length > 0;
                elements.button.disabled = !hasItems;
                elements.button.textContent = hasItems ? 'Place Order' : 'Add items to place order';
            }
            setNote(summary.cart.length ? 'Shipping is free on orders above ₹2,999.' : 'Add items to your cart to place an order.', summary.cart.length ? undefined : 'warning');
            updateCartCount(summary.cart);
            return summary;
        };

        const latestSummary = () => renderCheckoutSummary();
        latestSummary();

        elements.form?.addEventListener('submit', (event) => {
            event.preventDefault();
            const summary = latestSummary();
            if (!summary.cart.length) {
                return;
            }
            if (elements.button) {
                elements.button.disabled = true;
                elements.button.textContent = 'Placing order...';
            }
            setTimeout(() => {
                saveCart([]);
                latestSummary();
                elements.form?.reset();
                setNote('Thank you! Your order has been placed. Check your email for details.', 'success');
                if (elements.button) {
                    elements.button.disabled = false;
                    elements.button.textContent = 'Place Order';
                }
            }, 700);
        });
    };

    window.Gleamora = {
        readCart,
        saveCart,
        addItemToCart,
        updateCartCount,
        renderCartPage,
        initAddToCart,
        initCartQuantityControls,
        initMenuToggle,
        initBasePage,
        initCheckoutPage,
        formatCurrency,
        getCartSummary
    };
})();
