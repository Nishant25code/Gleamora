document.addEventListener('DOMContentLoaded', function () {
    var app = window.Gleamora;
    if (app && typeof app.initBasePage === 'function') {
        app.initBasePage();
    }
});
