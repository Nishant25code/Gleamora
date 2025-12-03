(() => {
    document.addEventListener('DOMContentLoaded', () => {
        const { initBasePage } = window.Gleamora || {};
        initBasePage?.();
    });
})();
