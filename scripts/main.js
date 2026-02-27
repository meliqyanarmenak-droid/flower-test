const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
const cursor     = document.querySelector('.cursor');
const cursorRing = document.querySelector('.cursor-ring');

if (cursor && cursorRing && !isTouchDevice) {
  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  function isDarkUnderCursor(x, y) {
    let el = document.elementFromPoint(x, y);

    while (el && (el === cursor || el === cursorRing)) {
      el = el.parentElement;
    }
    if (!el) return false;

    while (el && el !== document.body) {
      const bg = window.getComputedStyle(el).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        const match = bg.match(/[\d.]+/g);
        if (match && match.length >= 3) {
          const r = +match[0], g = +match[1], b = +match[2];
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          return luminance < 0.45;
        }
      }
      el = el.parentElement;
    }

    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    const m = bodyBg.match(/[\d.]+/g);
    if (m) {
      const lum = (0.299 * +m[0] + 0.587 * +m[1] + 0.114 * +m[2]) / 255;
      return lum < 0.45;
    }
    return false;
  }

  let colourCheckRaf = null;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';

    if (!colourCheckRaf) {
      colourCheckRaf = requestAnimationFrame(() => {
        const dark = isDarkUnderCursor(mouseX, mouseY);
        cursor.classList.toggle('on-light', !dark);
        cursorRing.classList.toggle('on-light', !dark);
        colourCheckRaf = null;
      });
    }
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity     = '0';
    cursorRing.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity     = '1';
    cursorRing.style.opacity = '0.45';
  });

} else if (cursor && cursorRing) {
  cursor.style.display     = 'none';
  cursorRing.style.display = 'none';
}

const header = document.querySelector('.header');

if (header && !header.classList.contains('header--inner')) {
  const onScroll = () => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); 
}

const burger    = document.querySelector('.burger');
const mobileNav = document.querySelector('.mobile-nav');

if (burger && mobileNav) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('.mobile-nav__link').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

const heroBg = document.querySelector('.hero__bg');

if (heroBg) {
  let ticking = false;

  const updateParallax = () => {
    const scrollY  = window.scrollY;
    const heroH    = document.querySelector('.hero')?.offsetHeight || window.innerHeight;
    const progress = Math.min(scrollY / heroH, 1);
    const offset   = progress * 30; // % of shift

    heroBg.style.transform = `translateY(${offset}%)`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
}

const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-scale');

if (revealEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  revealEls.forEach(el => observer.observe(el));
}

const overlay = document.querySelector('.page-overlay');

function navigateTo(url) {
  if (!overlay) {
    window.location.href = url;
    return;
  }

  overlay.classList.add('enter');

  setTimeout(() => {
    window.location.href = url;
  }, 480);
}

document.querySelectorAll('a[href]').forEach(link => {
  const href = link.getAttribute('href');

  if (
    !href.startsWith('http') &&
    !href.startsWith('#') &&
    !href.startsWith('mailto') &&
    !href.startsWith('tel') &&
    href.endsWith('.html') || href === '/' || href.endsWith('index.html')
  ) {
    link.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;

      e.preventDefault();
      navigateTo(href);
    });
  }
});

window.addEventListener('load', () => {
  if (overlay) {
    overlay.classList.remove('enter');
    overlay.classList.add('exit');

    setTimeout(() => {
      overlay.classList.remove('exit');
    }, 600);
  }
});

const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card[data-category]');

if (filterBtns.length && productCards.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-filter');

      productCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        const show    = category === 'all' || cardCat === category;

        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

        if (show) {
          card.style.opacity   = '1';
          card.style.transform = 'scale(1)';
          card.style.pointerEvents = '';
        } else {
          card.style.opacity   = '0.2';
          card.style.transform = 'scale(0.97)';
          card.style.pointerEvents = 'none';
        }
      });
    });
  });
}

const marqueeTrack = document.querySelector('.marquee-track');

if (marqueeTrack) {
  const items    = Array.from(marqueeTrack.children);
  const cloneSet = items.map(item => item.cloneNode(true));
  cloneSet.forEach(clone => marqueeTrack.appendChild(clone));
}

const heroTitle = document.querySelector('.hero__title');

if (heroTitle) {
  heroTitle.style.animation = 'heroFadeUp 1.2s 0.3s both cubic-bezier(0.16, 1, 0.3, 1)';
}

const style = document.createElement('style');
style.textContent = `
  @keyframes heroFadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes heroTagFade {
    from { opacity: 0; transform: translateX(-20px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes heroBottomFade {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);

const heroTag = document.querySelector('.hero__tag');
if (heroTag) {
  heroTag.style.animation = 'heroTagFade 0.8s 0.1s both ease';
}

const heroBottom = document.querySelector('.hero__bottom');
if (heroBottom) {
  heroBottom.style.animation = 'heroBottomFade 1s 0.7s both ease';
}
(function setActiveNav() {
  const path   = window.location.pathname;
  const links  = document.querySelectorAll('.nav__link');

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    const cleanPath = path.split('/').pop() || 'index.html';
    const cleanHref = href.split('/').pop();

    if (cleanPath === cleanHref || (cleanPath === '' && cleanHref === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

function animateCounter(el, target, duration = 2000) {
  const start     = performance.now();
  const startVal  = 0;
  const isDecimal = target % 1 !== 0;

  const update = (time) => {
    const elapsed  = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = startVal + (target - startVal) * eased;

    el.textContent = isDecimal ? current.toFixed(1) : Math.round(current);

    if (progress < 1) requestAnimationFrame(update);
  };

  requestAnimationFrame(update);
}

const statNumbers = document.querySelectorAll('.stat-num[data-target]');

if (statNumbers.length) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseFloat(el.getAttribute('data-target'));
        animateCounter(el, target);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => counterObserver.observe(el));
}

document.querySelectorAll('.card, .product-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect   = card.getBoundingClientRect();
    const x      = (e.clientX - rect.left) / rect.width  - 0.5;
    const y      = (e.clientY - rect.top)  / rect.height - 0.5;
    const tiltX  = y * -4;
    const tiltY  = x *  4;

    card.style.transform         = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    card.style.transition        = 'transform 0.1s ease';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform  = '';
    card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
  });
})