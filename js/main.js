(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero video: só no desktop (mobile usa poster leve = LCP mais rápido) */
  const heroVideo = document.getElementById('hero-video');
  if (heroVideo) {
    const canPlayHero =
      !prefersReducedMotion &&
      window.matchMedia('(min-width: 901px)').matches &&
      heroVideo.dataset.src;

    if (canPlayHero) {
      const source = document.createElement('source');
      source.src = heroVideo.dataset.src;
      source.type = 'video/mp4';
      heroVideo.appendChild(source);
      heroVideo.classList.add('is-active');
      const play = () => heroVideo.play().catch(() => {});
      if (heroVideo.readyState >= 2) play();
      else heroVideo.addEventListener('loadeddata', play, { once: true });
      heroVideo.load();
    }
  }

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
  const supportsScrollTimeline =
    typeof CSS !== 'undefined' &&
    CSS.supports &&
    CSS.supports('animation-timeline', 'scroll()');

  if (hdr && !supportsScrollTimeline) {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        hdr.classList.toggle('scrolled', window.scrollY > 40);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
