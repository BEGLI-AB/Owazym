(function () {
  let booted = false;

  function boot() {
    if (booted) return;
    booted = true;
    window.OwazymCommon?.initSharedUI();
    window.OwazymPlayer?.initPlayerApp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();

