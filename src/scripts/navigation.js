(()=> {
  'use strict';
  const header=document.getElementById('header');
  if(!header)return;
  const menu=header.querySelector('#mobile-menu'),panel=header.querySelector('#mobile-panel');
  const dropdown=header.querySelector('.nav-dropdown'),toggle=header.querySelector('.nav-dropdown-toggle');
  function sync() {
    window.chromaHeaderSync?.()
  }
  function closeMobile(focus=false) {
    if(!panel||!menu)return;
    panel.hidden=true;
    menu.setAttribute('aria-expanded','false');
    menu.setAttribute('aria-label','Abrir menu de navegação');
    document.body.classList.remove('nav-locked');
    sync();
    if(focus)menu.focus()
  }
  function openMobile() {
    setDropdown(false);
    panel.hidden=false;
    menu.setAttribute('aria-expanded','true');
    menu.setAttribute('aria-label','Fechar menu de navegação');
    document.body.classList.add('nav-locked');
    sync();
    panel.querySelector('a')?.focus()
  }
  menu?.addEventListener('click',()=>panel.hidden?openMobile():closeMobile(true));
  panel?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMobile()));
  window.addEventListener('resize',()=> {
    if(innerWidth>1180&&!panel.hidden)closeMobile()
  });
  document.addEventListener('keydown',e=> {
    if(e.key==='Escape'&&!panel?.hidden) {
      e.preventDefault();
      closeMobile(true)
    }
    else if(e.key==='Tab'&&!panel?.hidden) {
      const items=[menu,...panel.querySelectorAll('a[href]')].filter(x=>x.getClientRects().length);
      const first=items[0],last=items[items.length-1];
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
  function setDropdown(open) {
    if(!dropdown||!toggle)return;
    dropdown.classList.toggle('is-open',open);
    toggle.setAttribute('aria-expanded',String(open));
  }
  function closeDropdown() {
    setDropdown(false)
  }
  toggle?.addEventListener('click',e=> {
    e.preventDefault();
    e.stopPropagation();
    setDropdown(toggle.getAttribute('aria-expanded')!=='true')
  });
  document.addEventListener('pointerdown',e=> {
    if(!dropdown?.contains(e.target))closeDropdown()
  });
  dropdown?.addEventListener('focusout',e=> {
    if(!dropdown.contains(e.relatedTarget))closeDropdown()
  });
  dropdown?.addEventListener('keydown',e=> {
    if(e.key==='Escape') {
      e.preventDefault();
      closeDropdown();
      toggle.focus()
    }
    else if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)) {
      const links=[...dropdown.querySelectorAll('.nav-dropdown-panel a[href]')];
      if(!links.length)return;
      const current=links.indexOf(document.activeElement);
      if(current<0&&e.target!==toggle)return;
      e.preventDefault();
      setDropdown(true);
      let next=0;
      if(e.key==='ArrowDown')next=(current+1)%links.length;
      else if(e.key==='ArrowUp')next=(current-1+links.length)%links.length;
      else if(e.key==='End')next=links.length-1;
      links[next].focus();
    }
  });
})();
