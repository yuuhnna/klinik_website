(function () {

    // -- Detect if we're at root or inside a subfolder --
    const isRoot   = !window.location.pathname.includes('/pages/');
    const basePath = isRoot ? '' : '../';

    // -- Load offers component --
    fetch(basePath + 'pages/offers.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('offers-placeholder').innerHTML = html;
    });

})();