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
  methods.forEach((b,i)=>b.addEventListener('click',()=>selectMethod(i)));
})();
