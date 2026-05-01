(function () {
  // Determine base path based on folder structure
  const isRoot = window.location.pathname.indexOf('/pages/') === -1;
  const basePath = isRoot ? "" : "../";

  // Load and initialize services
  fetch(basePath + 'pages/services.html')
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status + ' — could not load services');
      return res.text();
    })
    .then(html => {
      const placeholder = document.getElementById('services-placeholder');
      if (!placeholder) return;

      placeholder.innerHTML = html;

      // Perform Alphabetical Sorting (Categories and Tests)
      sortServicesAlphabetically(placeholder);

      // Wait for layout rendering before initializing carousel
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

  /**
   * Helper: Sorts Categories and their internal test lists A-Z
   */
  function sortServicesAlphabetically(container) {
    const track = container.querySelector('#carouselTrack') || container.querySelector('.carousel-track');
    if (!track) return;

    const cards = Array.from(track.querySelectorAll('.service-card'));

    cards.forEach(card => {
      // Sort the <li> tests inside the card
      const list = card.querySelector('ul');
      if (list) {
        const items = Array.from(list.querySelectorAll('li'));
        items.sort((a, b) => {
          const nameA = a.querySelector('span')?.innerText.trim().toLowerCase() || "";
          const nameB = b.querySelector('span')?.innerText.trim().toLowerCase() || "";
          return nameA.localeCompare(nameB);
        });
        list.innerHTML = '';
        items.forEach(item => list.appendChild(item));
      }
    });

    // Sort the main service cards
    cards.sort((a, b) => {
      const titleA = a.querySelector('.card-title-btn')?.innerText.trim().toUpperCase() || "";
      const titleB = b.querySelector('.card-title-btn')?.innerText.trim().toUpperCase() || "";
      return titleA.localeCompare(titleB);
    });

    // Re-insert sorted cards
    track.innerHTML = '';
    cards.forEach(card => track.appendChild(card));
  }

  /**
   * Carousel Logic
   */
  function initCarousel() {
    const track = document.querySelector('#carouselTrack') || document.querySelector('.carousel-track');
    if (!track) return;

    const wrapper = track.parentElement;
    const dotsWrap = wrapper.parentElement.querySelector('.carousel-dots') || document.querySelector('#carouselDots');
    const arrowL = wrapper.querySelector('.arrow-left') || document.querySelector('#arrowLeft');
    const arrowR = wrapper.querySelector('.arrow-right') || document.querySelector('#arrowRight');

    const originals = Array.from(track.querySelectorAll('.service-card'));
    const TOTAL = originals.length;

    // Build Dots
    let activeDotsWrap = dotsWrap || document.createElement('div');
    if (!dotsWrap) {
      activeDotsWrap.className = 'carousel-dots';
      activeDotsWrap.id = 'carouselDots';
      wrapper.parentElement.appendChild(activeDotsWrap);
    }

    activeDotsWrap.innerHTML = '';
    const dots = originals.map(() => {
      const b = document.createElement('button');
      b.className = 'dot';
      activeDotsWrap.appendChild(b);
      return b;
    });

    // Create Infinite Clones
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

    const all = Array.from(track.querySelectorAll('.service-card'));
    let cur = TOTAL;
    let animating = false;
    let timer = null;

    const getStep = () => {
      const c = all[TOTAL];
      const style = getComputedStyle(c);
      return c.offsetWidth + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
    };

    const offsetFor = (i) => {
      const ml = parseFloat(getComputedStyle(all[i]).marginLeft) || 0;
      return i * getStep() + ml - (wrapper.offsetWidth / 2 - all[i].offsetWidth / 2);
    };

    function syncUI() {
      all.forEach((c, i) => c.classList.toggle('active', (i % TOTAL) === (cur % TOTAL)));
      dots.forEach((d, i) => d.classList.toggle('active', i === (cur % TOTAL)));
    }

    function slideTo(i, animate) {
      track.style.transition = animate ? 'transform 0.5s ease-in-out' : 'none';
      track.style.transform = `translateX(-${offsetFor(i)}px)`;
      cur = i;
      syncUI();
      if (animate) animating = true;
    }

    track.addEventListener('transitionend', () => {
      animating = false;
      if (cur < TOTAL) slideTo(cur + TOTAL, false);
      if (cur >= TOTAL * 2) slideTo(cur - TOTAL, false);
    });

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(() => { if (!animating) slideTo(cur + 1, true); }, 12000);
    }

    arrowL?.addEventListener('click', () => { if (!animating) { startTimer(); slideTo(cur - 1, true); } });
    arrowR?.addEventListener('click', () => { if (!animating) { startTimer(); slideTo(cur + 1, true); } });
    dots.forEach((d, i) => d.addEventListener('click', () => { if (!animating) { startTimer(); slideTo(TOTAL + i, true); } }));

    window.addEventListener('resize', () => slideTo(cur, false));
    slideTo(TOTAL, false);
    startTimer();
  }
})();