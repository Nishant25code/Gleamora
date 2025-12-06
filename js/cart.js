document.addEventListener('DOMContentLoaded', function () {
    var app = window.Gleamora;
    if (!app) {
        return;
    }
    if (typeof app.initBasePage === 'function') {
        app.initBasePage();
    }
    if (typeof app.renderCartPage === 'function') {
        app.renderCartPage();
    }
});
