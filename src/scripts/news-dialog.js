(() => {
  'use strict';

  const dialog = document.getElementById('chroma-image-dialog');
  if (!dialog) return;

  const image = dialog.querySelector('img[data-dynamic-image]');
  const closeButton = dialog.querySelector('[data-close-image]');
  let trigger = null;

  document.querySelectorAll('[data-view-image]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!image || dialog.open) return;

      trigger = button;
      image.src = button.dataset.viewImage;
      image.alt = button.previousElementSibling?.alt || 'Arte original da Chroma';
      dialog.showModal();
      closeButton?.focus();
    });
  });

  closeButton?.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', () => {
    if (trigger?.isConnected) trigger.focus();
    trigger = null;
  });
})();
