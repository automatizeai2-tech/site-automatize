  // Navegadores sem decodificador h264 (alguns Chromium no Linux) recebem as mesmas pernas em WebM/VP9.
  (function () {
    var v = document.createElement('video');
    var h264 = v.canPlayType('video/mp4; codecs="avc1.42E01E"');
    var forca = /[?&]codec=webm/.test(location.search);
    if (h264 && !forca) return;
    document.querySelectorAll('[data-sc-segment] video').forEach(function (el) {
      ['data-sc-src', 'data-sc-src-mobile'].forEach(function (a) {
        var s = el.getAttribute(a); if (s) el.setAttribute(a, s.replace(/\.mp4$/, '.webm'));
      });
    });
  })();
