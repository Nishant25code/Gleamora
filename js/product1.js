(() => {
    document.addEventListener('DOMContentLoaded', () => {
        const { initBasePage, initAddToCart } = window.Gleamora || {};
        initBasePage?.();
        initAddToCart?.();
    });
})();
