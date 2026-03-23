(function () {

  /* ── Detect path to services.html (same folder as index.html) ── */
  const path = window.location.pathname;
  const dir = path.substring(0, path.lastIndexOf('/') + 1);
  const SERVICES_URL = dir + 'services.html';

  fetch(SERVICES_URL)
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status + ' — could not load: ' + SERVICES_URL);
      return res.text();
    })
    .then(html => {
      const placeholder = document.getElementById('services-placeholder');
      if (!placeholder) return;
      placeholder.innerHTML = html;

      /* Wait until the first real card has a non-zero offsetWidth
         before running the carousel logic.
         ResizeObserver fires as soon as the element is laid out.    */
      const firstCard = placeholder.querySelector('.service-card');
      if (!firstCard) return;

      let attempts = 0;
      function attemptInit() {
        const firstCard = placeholder.querySelector('.service-card');
        if (!firstCard) return;
        
        if (firstCard.offsetWidth > 0) {
          initCarousel();
        } else if (attempts < 50) {
          attempts++;
          setTimeout(attemptInit, 50);
        } else {
          initCarousel();
        }
      }
      attemptInit();
    })
    .catch(err => console.error('[services.js]', err));


  /* ==============
      initCarousel
     ============== */
  function initCarousel() {
    try {
      const track = document.querySelector('#carouselTrack') || document.querySelector('.carousel-track');
      if (!track) return;

      const wrapper = track.parentElement;
      const dotsWrap = wrapper.parentElement.querySelector('.carousel-dots') || document.querySelector('#carouselDots');
      const arrowL = wrapper.querySelector('.arrow-left') || document.querySelector('#arrowLeft');
      const arrowR = wrapper.querySelector('.arrow-right') || document.querySelector('#arrowRight');

    /*  Originals  */
    const originals = [...track.querySelectorAll('.service-card')];
    const TOTAL = originals.length;

    /*  Build dots  */
    let dots = [];
    let activeDotsWrap = dotsWrap;

    if (!activeDotsWrap) {
      activeDotsWrap = document.createElement('div');
      activeDotsWrap.className = 'carousel-dots';
      activeDotsWrap.id = 'carouselDots';
      wrapper.parentElement.appendChild(activeDotsWrap);
    }
    
    activeDotsWrap.innerHTML = '';
    dots = originals.map(() => {
      const b = document.createElement('button');
      b.className = 'dot';
      activeDotsWrap.appendChild(b);
      return b;
    });

    /* -- Seamless Infinite Clones -- 
       Clone entire set to the left, and entire set to the right 
       so user never sees an empty edge.
    */
    originals.forEach(card => {
      const clone = card.cloneNode(true);
      clone.classList.add('clone');
      track.appendChild(clone);
    });
    for (let i = TOTAL - 1; i >= 0; i--) {
      const clone = originals[i].cloneNode(true);
      clone.classList.add('clone');
      track.insertBefore(clone, track.firstChild);
    }

    const all = [...track.querySelectorAll('.service-card')];

    let cur = TOTAL;
    let animating = false;
    let timer = null;

    /* Card step width */
    function step() {
      const c = all[TOTAL];
      const ml = parseFloat(getComputedStyle(c).marginLeft) || 20;
      const mr = parseFloat(getComputedStyle(c).marginRight) || 20;
      return c.offsetWidth + ml + mr;
    }

    /* Offset to centre all[index] in the viewport */
    function offsetFor(i) {
      const ml = parseFloat(getComputedStyle(all[i]).marginLeft) || 20;
      return i * step() + ml - (wrapper.offsetWidth / 2 - all[i].offsetWidth / 2);
    }

    /*  Sync active card + dot */
    function syncUI() {
      all.forEach((c, i) => {
        const isMirrorActive = (i % TOTAL) === (cur % TOTAL);
        c.classList.toggle('active', isMirrorActive);
      });
      const ri = cur % TOTAL;
      if (dots && dots.length > 0) {
        dots.forEach((d, i) => d.classList.toggle('active', i === ri));
      }
    }

    /* Slide */
    function slideTo(i, animate) {
      track.style.transition = animate
        ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        : 'none';
      track.style.transform = `translateX(-${offsetFor(i)}px)`;
      cur = i;
      syncUI();
      if (animate) animating = true;
    }

    /* Seamless jump after clone lands */
    track.addEventListener('transitionend', () => {
      animating = false;
      if (cur < TOTAL) {
        slideTo(cur + TOTAL, false);
      }
      if (cur >= TOTAL * 2) {
        slideTo(cur - TOTAL, false);
      }
    });

    /* 12-second auto-advance */
    function startTimer() {
      clearInterval(timer);
      timer = setInterval(() => {
        if (!animating) { slideTo(cur + 1, true); }
      }, 12000);
    }

    /* Arrows */
    if (arrowL) {
      arrowL.addEventListener('click', () => {
        if (animating) return;
        startTimer(); slideTo(cur - 1, true);
      });
    }
    if (arrowR) {
      arrowR.addEventListener('click', () => {
        if (animating) return;
        startTimer(); slideTo(cur + 1, true);
      });
    }

    /* Dots */
    dots.forEach((d, i) => {
      d.addEventListener('click', () => {
        if (animating) return;
        startTimer(); slideTo(TOTAL + i, true);
      });
    });

    /* Resize */
    window.addEventListener('resize', () => slideTo(cur, false));

    /* GO */
    slideTo(TOTAL, false);
    startTimer();
    
    } catch(err) {
      document.querySelector('.services-main-title').innerHTML = err.toString() + " at line " + (err.lineNumber || "unknown");
      console.error(err);
    }
  }

})();