(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Menu mobile */
  const toggle = document.getElementById('menu-toggle');
  const offcanvas = document.getElementById('offcanvas');

  if (toggle && offcanvas) {
    const openMenu = () => {
      offcanvas.classList.add('open');
      toggle.classList.add('on');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
    };

    const closeMenu = () => {
      offcanvas.classList.remove('open');
      toggle.classList.remove('on');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    };

    const isOpen = () => offcanvas.classList.contains('open');

    toggle.addEventListener('click', () => {
      if (isOpen()) closeMenu();
      else openMenu();
    });

    document.querySelectorAll('[data-close-menu]').forEach((el) => {
      el.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) closeMenu();
    });
  }

  /* Animações de entrada */
  const reveals = document.querySelectorAll('.reveal');

  if (prefersReducedMotion) {
    reveals.forEach((el) => el.classList.add('is-inview'));
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-inview');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-inview'));
  }

  /* Contador 32 crianças */
  const counter = document.querySelector('.big.n[data-count]');
  if (counter) {
    const target = Number(counter.getAttribute('data-count')) || 32;
    const label = counter.querySelector('span');

    const setValue = (value) => {
      counter.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) node.remove();
      });
      counter.insertBefore(document.createTextNode(String(value)), label || null);
    };

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      setValue(target);
    } else {
      setValue(0);
      const cio = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const start = performance.now();
            const duration = 1400;
            const tick = (now) => {
              const t = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - t, 3);
              setValue(Math.round(target * eased));
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.4 }
      );
      cio.observe(counter);
    }
  }

  /* Header com fundo ao rolar (fallback sem scroll-timeline) */
  const hdr = document.querySelector('.hdr');
  if (hdr && !CSS.supports('animation-timeline', 'scroll()')) {
    const onScroll = () => {
      hdr.classList.toggle('scrolled', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
