(function () {

  // -- Detect if we're at root or inside a subfolder --
  const isRoot   = !window.location.pathname.includes('/pages/');
  const basePath = isRoot ? '' : '../';

  // -- Load about component --
  fetch(basePath + 'pages/about.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('about-placeholder').innerHTML = html;
    });

})();