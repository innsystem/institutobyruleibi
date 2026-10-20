(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero video: garante autoplay (mobile + desktop); pausa se reduced-motion */
  const heroVideo = document.getElementById('hero-video');
  if (heroVideo) {
    if (prefersReducedMotion) {
      heroVideo.pause();
      heroVideo.removeAttribute('autoplay');
      heroVideo.classList.remove('is-active');
    } else {
      heroVideo.classList.add('is-active');
      const play = () => heroVideo.play().catch(() => {});
      play();
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) play();
      });
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

  /* Copiar chave PIX (CNPJ) */
  const pixBtn = document.getElementById('btn-copy-pix');
  if (pixBtn) {
    const pixKey =
      pixBtn.getAttribute('data-pix') ||
      (document.getElementById('cnpj-pix')?.textContent || '').replace(/\D/g, '') ||
      '62977846000133';
    const pixLabel =
      pixBtn.getAttribute('data-pix-label') ||
      document.getElementById('cnpj-pix')?.textContent?.trim() ||
      '62.977.846/0001-33';

    const notifyCopied = () => {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'success',
          title: 'Chave PIX copiada!',
          html: `CNPJ <strong>${pixLabel}</strong> pronto para colar no app do banco.`,
          confirmButtonText: 'Ok',
          confirmButtonColor: '#12808f',
          timer: 3500,
          timerProgressBar: true,
        });
        return;
      }
      alert(`Chave PIX copiada!\n${pixLabel}`);
    };

    const notifyError = () => {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'error',
          title: 'Não foi possível copiar',
          text: `Copie manualmente: ${pixLabel}`,
          confirmButtonText: 'Ok',
          confirmButtonColor: '#ff6b3d',
        });
        return;
      }
      alert(`Não foi possível copiar. Chave PIX: ${pixLabel}`);
    };

    const copyPix = async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(pixKey);
        } else {
          const input = document.createElement('textarea');
          input.value = pixKey;
          input.setAttribute('readonly', '');
          input.style.position = 'fixed';
          input.style.left = '-9999px';
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);
        }
        notifyCopied();
      } catch (err) {
        notifyError();
      }
    };

    pixBtn.addEventListener('click', copyPix);
  }
})();
