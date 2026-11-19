(()=> {
  'use strict';
  const modal=document.getElementById('gallery-modal');
  const galleryTitles=['Ambientes de aprendizagem','Estrutura e tecnologia','Aprendizado em movimento','O cotidiano da Chroma'];
  const gallerySrc=['assets/visual-hero.avif','assets/visual-metodologia.avif','assets/visual-projetos.avif','assets/visual-acolhimento.avif'];
  let selected=0;
  let lastGalleryButton=null;
  function galleryRender(i) {
    selected=(i+galleryTitles.length)%galleryTitles.length;
    const img=modal?.querySelector('#modal-photo img');
    if(img) {
      img.src=gallerySrc[selected];
      img.alt='Ilustração digital: '+galleryTitles[selected];
    }
    const c=modal?.querySelector('#modal-count');
    if(c)c.textContent=galleryTitles[selected]
  }
  function galleryOpen(i) {
    if(!modal)return;
    galleryRender(i);
    modal.style.display='grid';
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    modal.querySelector('.modal-close')?.focus()
  }
  function galleryClose() {
    if(!modal||modal.style.display!=='grid')return;
    modal.style.display='none';
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    lastGalleryButton?.focus()
  }
  function galleryStep(d) {
    if(modal?.style.display!=='grid')return;
    galleryRender(selected+d)
  }
  document.querySelectorAll('.gallery-cell button').forEach((b,i)=>b.addEventListener('click',()=> {
    lastGalleryButton=b;
    galleryOpen(i)
  }));
  modal?.querySelector('.modal-close')?.addEventListener('click',galleryClose);
  modal?.addEventListener('click',e=> {
    if(e.target===modal)galleryClose()
  });
  const mnav=modal?.querySelectorAll('.modal-bottom button');
  if(mnav?.length===2) {
    mnav[0].addEventListener('click',()=>galleryStep(-1));
    mnav[1].addEventListener('click',()=>galleryStep(1))
  }
  document.addEventListener('keydown',e=> {
    if(modal?.style.display!=='grid')return;
    if(e.key==='Escape') {
      e.preventDefault();
      galleryClose();
      return;
    }
    if(e.key==='ArrowLeft') {
      e.preventDefault();
      galleryStep(-1)
    }
    if(e.key==='ArrowRight') {
      e.preventDefault();
      galleryStep(1)
    }
    if(e.key==='Tab') {
      const controls=[...modal.querySelectorAll('button')].filter(x=>x.getClientRects().length);
      if(!controls.length)return;
      const first=controls[0],last=controls[controls.length-1];
      if(e.shiftKey&&document.activeElement===first) {
        e.preventDefault();
        last.focus()
      }
      else if(!e.shiftKey&&document.activeElement===last) {
        e.preventDefault();
        first.focus()
      }
    }
  });
})();
