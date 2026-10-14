// Apply the saved theme before CSS and page content can paint.
// Shared by the studio and standalone simulator; no storage is required.
(() => {
  let preference = null;
  try {
    for (const key of ['signal-theme', 'theme', 'theme-preference']) {
      const value = localStorage.getItem(key);
      if (value === 'light' || value === 'dark') { preference = value; break; }
    }
  } catch { /* Fall back to the system when storage is unavailable. */ }
  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#101012' : '#fbfbfd';
  }
  window.StudioTheme = { preference, apply };
  apply(preference || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
})();

