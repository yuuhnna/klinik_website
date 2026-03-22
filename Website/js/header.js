(function () {

  // -- Detect if we're at root or inside a subfolder --
  const isRoot   = !window.location.pathname.includes('/pages/');
  const basePath = isRoot ? '' : '../';

  // -- Load header component --
  fetch(basePath + 'pages/header.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('header-placeholder').innerHTML = html;

      const nav       = document.getElementById('main-nav');
      const pill      = document.getElementById('nav-pill');
      const hamburger = document.getElementById('hamburger');
      const links     = [...nav.querySelectorAll('a[data-section]')];
      const HEADER    = 70;
      let isClicking  = false;

      // -- Hamburger toggle --
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        nav.classList.toggle('open');
      });

      // Close menu when a link is clicked on mobile
      links.forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('open');
          nav.classList.remove('open');
        });
      });

      // Close menu when clicking outside
      document.addEventListener('click', e => {
        if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
          hamburger.classList.remove('open');
          nav.classList.remove('open');
        }
      });

      // -- Sliding pill (desktop) --
      function movePill(link) {
        const nr = nav.getBoundingClientRect();
        const lr = link.getBoundingClientRect();
        pill.style.left  = (lr.left - nr.left) + 'px';
        pill.style.width = lr.width + 'px';
      }

      function setActive(id) {
        links.forEach(a => a.classList.toggle('active', a.dataset.section === id));
        const active = links.find(a => a.dataset.section === id);
        if (active && window.innerWidth > 768) movePill(active);
      }

      // -- Click to smooth scroll --
      links.forEach(link => {
        link.addEventListener('click', e => {
          e.preventDefault();
          const target = document.getElementById(link.dataset.section);
          if (!target) return;

          setActive(link.dataset.section);

          const top = target.getBoundingClientRect().top + window.scrollY - HEADER;
          isClicking = true;
          window.scrollTo({ top, behavior: 'smooth' });

          clearTimeout(link._scrollTimer);
          link._scrollTimer = setTimeout(() => { isClicking = false; }, 700);
        });
      });

      // -- Scroll-spy --
      function onScroll() {
        if (isClicking) return;
        const secs = links.map(a => document.getElementById(a.dataset.section)).filter(Boolean);
        const y = window.scrollY + HEADER + 200; /* Large offset so active updates when section is well into view */
        let cur = secs[0]?.id;
        secs.forEach(s => { if (s.offsetTop <= y) cur = s.id; });
        if (cur) setActive(cur);
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', () => requestAnimationFrame(onScroll));
      requestAnimationFrame(onScroll);
    });

})();