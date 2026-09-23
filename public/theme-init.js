(function () {
  var stored = null;
  try {
    stored = localStorage.getItem('pixaeron-theme');
  } catch {
    stored = null;
  }
  var theme =
    stored === 'light' || stored === 'dark'
      ? stored
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
  document.documentElement.setAttribute('data-theme', theme);
})();
