document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('nav .nav-container');

  containers.forEach(container => {
    const toggleBtn = container.querySelector('.menu-toggle');
    const navList = container.querySelector('ul');

    if (!toggleBtn || !navList) return;

    const closeMenu = () => {
      container.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    };

    const openMenu = () => {
      container.classList.add('open');
      toggleBtn.setAttribute('aria-expanded', 'true');
    };

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !container.classList.contains('open');
      if (willOpen) openMenu(); else closeMenu();
    });

    navList.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => closeMenu());
    });
  });

  document.addEventListener('click', (e) => {
    document.querySelectorAll('nav .nav-container.open').forEach(container => {
      if (!container.contains(e.target)) {
        const btn = container.querySelector('.menu-toggle');
        container.classList.remove('open');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });
  });


  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      document.querySelectorAll('nav .nav-container.open').forEach(container => {
        const btn = container.querySelector('.menu-toggle');
        container.classList.remove('open');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('nav .nav-container.open').forEach(container => {
        const btn = container.querySelector('.menu-toggle');
        container.classList.remove('open');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }
  });
});
