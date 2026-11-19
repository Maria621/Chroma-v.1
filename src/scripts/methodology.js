(()=> {
  'use strict';
  const methods=[...document.querySelectorAll('.method-step')];
  function selectMethod(i) {
    methods.forEach((b,j)=> {
      b.classList.toggle('active',i===j);
      b.setAttribute('aria-expanded',String(i===j));
      let txt=b.querySelector('.method-step-main>span');
      if(txt)txt.style.display=i===j?'block':'none';
      let plus=b.querySelector('.method-plus');
      if(plus)plus.textContent=i===j?'−':'+'
    });
  }
  methods.forEach((button,i) => {
    button.addEventListener('click', () => selectMethod(i));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? methods.length - 1
          : (i + (event.key === 'ArrowDown' ? 1 : -1) + methods.length) % methods.length;
      methods[next]?.focus();
    });
  });
})();
