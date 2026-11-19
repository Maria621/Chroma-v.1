(()=> {
  'use strict';
  const dialog=document.getElementById('chroma-image-dialog');
  if(dialog) {
    document.querySelectorAll('[data-view-image]').forEach(btn=>btn.addEventListener('click',()=> {
      const img=dialog.querySelector('img');
      img.src=btn.dataset.viewImage;
      img.alt=btn.previousElementSibling?.alt||'Arte original da Chroma';
      dialog.showModal()
    }));
    dialog.querySelector('[data-close-image]')?.addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=> {
      if(e.target===dialog)dialog.close()
    })
  }
})();
