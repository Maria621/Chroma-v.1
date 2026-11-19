(()=> {
  'use strict';
  const q=new URLSearchParams(window.__chromaRouteQuery || location.search);
  for(const n of ['unidade','assunto','perfil']) {
    const v=q.get(n);
    if(!v)continue;
    document.querySelectorAll('select[name="'+n+'"]').forEach(s=> {
      const o=[...s.options].find(x=>x.value===v);
      if(o)s.value=o.value;
    });
  }
  const forms=[...document.querySelectorAll('[data-chroma-form]')];
  function status(f,msg,bad) {
    const e=f.querySelector('.v3-form-notice');
    if(e) {
      e.textContent=msg;
      e.classList.toggle('is-error',!!bad);
    }
  }
  function availability(ready) {
    for(const f of forms) {
      f.dataset.sendReady=ready?'true':'false';
      const b=f.querySelector('button[type="submit"]');
      if(b)b.disabled=!ready;
      status(f,ready?'Envio disponível. A mensagem será encaminhada após a confirmação.':'Formulário em configuração nesta prévia. Nenhuma mensagem será enviada por aqui; use o Instagram institucional.',!ready);
    }
  }
  async function check() {
    if(!forms.length)return;
    if(!/^https?:$/.test(location.protocol)) {
      availability(false);
      return;
    }
    try {
      const r=await fetch('/api/contato', {
        method:'GET',cache:'no-store'
      });
      const data=await r.json();
      availability(r.ok&&data.acceptingMessages===true);
    }
    catch {
      availability(false);
    }
  }
  check();
  for(const f of forms) {
    f.addEventListener('submit',async ev=> {
      ev.preventDefault();
      if(f.dataset.sendReady!=='true') {
        status(f,'Envio indisponível. Utilize o Instagram institucional.',true);
        return;
      }
      if(!f.checkValidity()) {
        f.reportValidity();
        status(f,'Revise os campos obrigatórios.',true);
        return;
      }
      const d=new FormData(f);
      if(d.get('website'))return;
      const payload=Object.fromEntries(d.entries());
      delete payload.website;
      const btn=f.querySelector('button[type="submit"]'),before=btn?.innerHTML;
      try {
        if(btn) {
          btn.disabled=true;
          btn.textContent='Enviando…';
        }
        const r=await fetch('/api/contato', {
          method:'POST',headers: {
            'Content-Type':'application/json'
          },body:JSON.stringify(payload)
        });
        const result=await r.json().catch(()=>( {
        }));
        if(!r.ok||result.ok!==true)throw Error('not sent');
        status(f,'Mensagem enviada. A equipe poderá responder pelo contato informado.',false);
        f.reset();
      }
      catch {
        status(f,'Não foi possível confirmar o envio. Tente novamente ou utilize o Instagram institucional.',true);
      }
      finally {
        if(btn) {
          btn.disabled=false;
          btn.innerHTML=before;
        }
      }
    });
  }
})();
