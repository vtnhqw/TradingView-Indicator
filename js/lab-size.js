// Size the embedded lesson to its content so the surrounding page scrolls.
// Measure the sheet, not document.scrollHeight: body has a viewport min-height.
(() => {
  if (window.parent === window) return;
  const sheet = document.querySelector('.sheet');
  let pending = false;
  let lastHeight = null;
  function report() {
    pending = false;
    const bounds = sheet.getBoundingClientRect();
    if (bounds.width <= 0) return;
    const padding = parseFloat(getComputedStyle(document.body).paddingBottom) || 0;
    const height = Math.ceil(bounds.bottom + (window.scrollY || 0) + padding);
    if (height <= 0 || height === lastHeight) return;
    lastHeight = height;
    window.parent.postMessage({ type: 'studio-size', height }, location.origin === 'null' ? '*' : location.origin);
  }
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(report);
  }
  new ResizeObserver(schedule).observe(sheet);
  window.addEventListener('resize', schedule);
  window.addEventListener('message', event => {
    if (event.source !== window.parent || event.origin !== location.origin) return;
    if (event.data?.type === 'studio-visibility' && event.data.visible === true) schedule();
  });
  schedule();
})();

