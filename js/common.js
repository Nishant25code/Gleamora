(() => {
    const CART_KEY = 'gleamoraCart';
    const SHIPPING_FEE = 100;

    const readCart = () => {
        try {
            const stored = localStorage.getItem(CART_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            return [];
        }
    };

    const saveCart = (cart) => {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
        } catch (error) {
            // Ignore storage failures (private browsing, etc.)
        }
    };

    const updateCartCount = (cartItems) => {
        const cart = cartItems || readCart();
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelectorAll('[data-cart-count]').forEach((badge) => {
            badge.textContent = count;
        });
    };

    const formatCurrency = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

    const renderCartPage = () => {
        const cart = readCart();
        updateCartCount(cart);
        const cartBody = document.querySelector('[data-cart-body]');
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
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shipping = cart.length ? SHIPPING_FEE : 0;
        const total = subtotal + shipping;
        const subtotalEl = document.querySelector('[data-cart-subtotal]');
        const shippingEl = document.querySelector('[data-cart-shipping]');
        const totalEl = document.querySelector('[data-cart-total]');
        if (subtotalEl) {
            subtotalEl.textContent = formatCurrency(subtotal);
        }
        if (shippingEl) {
            shippingEl.textContent = formatCurrency(shipping);
        }
        if (totalEl) {
            totalEl.textContent = formatCurrency(total);
        }
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
        const toggle = document.querySelector('.menu-toggle');
        const navContainer = document.querySelector('.nav-container');
        const menu = navContainer?.querySelector('ul');
        if (!toggle || !navContainer || !menu) {
            return;
        }

        if (!menu.id) {
            menu.id = 'primary-navigation';
        }
        toggle.setAttribute('aria-controls', menu.id);
        toggle.setAttribute('aria-haspopup', 'true');

        const updateToggleState = (isOpen) => {
            toggle.setAttribute('aria-expanded', String(isOpen));
            toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
            document.body.classList.toggle('nav-menu-open', isOpen);
        };

        const closeMenu = () => {
            if (!navContainer.classList.contains('open')) {
                return;
            }
            navContainer.classList.remove('open');
            updateToggleState(false);
        };

        const openMenu = () => {
            if (navContainer.classList.contains('open')) {
                return;
            }
            navContainer.classList.add('open');
            updateToggleState(true);
        };

        toggle.addEventListener('click', () => {
            const isOpen = navContainer.classList.contains('open');
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        navContainer.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });

        document.addEventListener('click', (event) => {
            if (!navContainer.classList.contains('open')) {
                return;
            }
            if (!navContainer.contains(event.target)) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeMenu();
                toggle.focus();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        });
    };

    const initAddToCart = () => {
        const buttons = document.querySelectorAll('[data-add-to-cart]');
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

    window.Gleamora = {
        readCart,
        saveCart,
        addItemToCart,
        updateCartCount,
        renderCartPage,
        initAddToCart,
        initCartQuantityControls,
        initMenuToggle,
        initBasePage
    };
})();
