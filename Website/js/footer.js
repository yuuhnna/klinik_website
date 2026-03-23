(function () {
  // -- Detect if we're at root or inside a subfolder --
  const isRoot   = !window.location.pathname.includes('/pages/');
  const basePath = isRoot ? '' : '../';

  // -- Load footer component with cache buster to bypass aggressive browser caching --
  const cacheBuster = '?t=' + new Date().getTime();
  fetch(basePath + 'pages/footer.html' + cacheBuster, { cache: 'no-store' })
    .then(res => res.text())
    .then(html => {
      document.getElementById('footer-placeholder').innerHTML = html;
    })
    .catch(err => console.error('Error loading footer:', err));
})();
