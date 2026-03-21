// Resolve base path depending on whether we're at the root or a subfolder
const isRoot = !window.location.pathname.includes('/pages/');
const basePath = isRoot ? '' : '../';

// Load and inject the header HTML
fetch(basePath + 'pages/header.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('header-placeholder').innerHTML = html;

    // Cache DOM elements
    const nav       = document.getElementById('main-nav');
    const pill      = document.getElementById('nav-pill');
    const hamburger = document.getElementById('hamburger');
    const links     = [...nav.querySelectorAll('a[data-section]')];
    const secs      = links.map(a => document.getElementById(a.dataset.section)).filter(Boolean);
    
    const HEADER_HEIGHT = 70; // Offset for fixed header
    let isClicking      = false; // Prevents scroll-spy conflicts during click navigation

    // --- Mobile Hamburger Menu ---
    
    // Toggle menu visibility
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      nav.classList.toggle('open');
    });

    // Close menu on link click
    links.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        nav.classList.remove('open');
      });
    });

    // Close menu on outside click
    document.addEventListener('click', e => {
      if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('open');
        nav.classList.remove('open');
      }
    });

    // --- Desktop Sliding Pill ---

    // Position the pill visually over the active link
    function movePill(link) {
      const navRect = nav.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      pill.style.left  = (linkRect.left - navRect.left) + 'px';
      pill.style.width = linkRect.width + 'px';
    }

    // Update active class and trigger pill movement on desktop
    function setActive(id) {
      links.forEach(a => a.classList.toggle('active', a.dataset.section === id));
      const activeLink = links.find(a => a.dataset.section === id);
      if (activeLink && window.innerWidth > 768) movePill(activeLink);
    }

    // --- Smooth Scrolling ---

    links.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const targetSection = document.getElementById(link.dataset.section);
        if (!targetSection) return;

        setActive(link.dataset.section);

        // Scroll to target section, accounting for header height
        const targetTop = targetSection.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT;
        
        isClicking = true;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });

        // Re-enable scroll-spy after animation finishes
        clearTimeout(link._scrollTimer);
        link._scrollTimer = setTimeout(() => { isClicking = false; }, 700);
      });
    });

    // --- Scroll-Spy ---

    // Update active nav link based on current scroll position
    function onScroll() {
      if (isClicking) return; // Ignore if currently smooth scrolling via click
      
      const scrollPosition = window.scrollY + HEADER_HEIGHT + 10;
      let currentSectionId = secs[0]?.id;
      
      secs.forEach(section => { 
          if (section.offsetTop <= scrollPosition) currentSectionId = section.id; 
      });
      
      if (currentSectionId) setActive(currentSectionId);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => requestAnimationFrame(onScroll));
    requestAnimationFrame(onScroll); // Set initial state on load
  });