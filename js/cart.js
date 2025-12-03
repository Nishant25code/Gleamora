(() => {
    document.addEventListener('DOMContentLoaded', () => {
        const { initBasePage, initCartQuantityControls, renderCartPage } = window.Gleamora || {};
        initBasePage?.();
        initCartQuantityControls?.();
        renderCartPage?.();
    });
})();
