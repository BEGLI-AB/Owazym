
(function () {
  const modalEl = document.getElementById('searchFiltersModal');
  if (!modalEl) return;

  const sortingSection = modalEl.querySelector('[data-search-sorting]');
  if (sortingSection) sortingSection.classList.add('d-none');

  const openButtons = document.querySelectorAll('[data-open-search-filters]');
  if (!openButtons.length) return;

  openButtons.forEach((btn) => {
    if (btn.dataset.filtersBound === '1') return;
    btn.dataset.filtersBound = '1';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.bootstrap?.Modal) {
        const instance = window.bootstrap.Modal.getOrCreateInstance(modalEl);
        instance.show();
      }
    });
  });
})();


