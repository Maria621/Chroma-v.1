(()=>{'use strict';
const header=document.querySelector('#header');
const panel=document.querySelector('#mobile-panel');
const isHome=!!document.querySelector('section.hero#inicio');
const logo=header?.querySelector('.brand-official-image');
const logoWhite='assets/logo-instituto-chroma-branco.png';
const logoNavy='assets/logo-instituto-chroma.png';
function onScroll(){if(!header)return;const solid=!isHome||scrollY>36||!!(panel&&!panel.hidden);header.classList.toggle('header-solid',solid);header.querySelector('.brand')?.classList.toggle('brand-light',!solid);if(logo){const next=solid?logoNavy:logoWhite;if(logo.dataset.chromaLogo!==next){logo.dataset.chromaLogo=next;logo.src=window.__chromaAssets?.[next]||next}}}
window.chromaHeaderSync=onScroll;window.addEventListener('scroll',onScroll,{passive:true});onScroll();
const methods=[...document.querySelectorAll('.method-step')];
function selectMethod(i){methods.forEach((b,j)=>{b.classList.toggle('active',i===j);b.setAttribute('aria-selected',String(i===j));let txt=b.querySelector('.method-step-main>span');if(txt)txt.style.display=i===j?'block':'none';let plus=b.querySelector('.method-plus');if(plus)plus.textContent=i===j?'−':'+'});const lab=document.getElementById('method-label');if(lab)lab.textContent='PERSPECTIVA DE APRENDIZAGEM / 0'+(i+1)}
methods.forEach((b,i)=>b.addEventListener('click',()=>selectMethod(i)));
const experience=[['Descobrir','Tudo começa com uma nova pergunta.','O aprendizado ganha sentido quando existe espaço para curiosidade, investigação e novas ideias.','CURIOSIDADE / DESCOBERTA','orbit'],['Praticar','Conhecimento que sai do papel.','A prática cria oportunidades de experimentar, rever caminhos e transformar conteúdo em repertório.','PRÁTICA / EXPERIMENTAÇÃO','grid'],['Evoluir','Crescer é um processo contínuo.','Cada etapa pode fortalecer competências, autonomia e a confiança para enfrentar novos desafios.','AUTONOMIA / DESENVOLVIMENTO','wave']];let activeExperience=0;
function chooseExperience(i){activeExperience=(i+experience.length)%experience.length;const e=experience[activeExperience];const w=document.getElementById('exp-word');if(w)w.innerHTML=e[0]+'<span>.</span>';for(const [id,value]of [['exp-counter','0'+(activeExperience+1)+' / 03'],['exp-title',e[1]],['exp-copy',e[2]],['exp-tag',e[3]]]){const el=document.getElementById(id);if(el)el.textContent=value}document.querySelectorAll('.experience-dots button').forEach((b,j)=>{b.classList.toggle('current',activeExperience===j);b.setAttribute('aria-pressed',String(activeExperience===j))});const visual=document.querySelector('#experience-art .visual-art');if(visual&& !visual.classList.contains('visual-has-image'))visual.className='visual-art visual-'+e[4]}
document.querySelectorAll('.experience-dots button').forEach((b,i)=>b.addEventListener('click',()=>chooseExperience(i)));const nav=document.querySelectorAll('.experience-buttons button');if(nav.length===2){nav[0].addEventListener('click',()=>chooseExperience(activeExperience-1));nav[1].addEventListener('click',()=>chooseExperience(activeExperience+1))}
const modal=document.getElementById('gallery-modal');const galleryTitles=['Ambientes de aprendizagem','Estrutura e tecnologia','Aprendizado em movimento','O cotidiano da Chroma'];const galleryVar=['grid','rays','wave','orbit'];let selected=0;let lastGalleryButton=null;
function galleryOpen(i){if(!modal)return;selected=(i+galleryTitles.length)%galleryTitles.length;modal.style.display='grid';document.body.style.overflow='hidden';const v=document.getElementById('modal-photo');if(v)v.className='visual-art visual-'+galleryVar[selected];const c=document.getElementById('modal-count');if(c)c.textContent='0'+(selected+1)+' / 04 — '+galleryTitles[selected];modal.querySelector('.modal-close')?.focus()}
function galleryClose(){if(!modal)return;modal.style.display='none';document.body.style.overflow='';lastGalleryButton?.focus()}
function galleryStep(d){galleryOpen(selected+d)}
document.querySelectorAll('.gallery-cell button').forEach((b,i)=>b.addEventListener('click',()=>{lastGalleryButton=b;galleryOpen(i)}));
modal?.querySelector('.modal-close')?.addEventListener('click',galleryClose);
modal?.addEventListener('click',e=>{if(e.target===modal)galleryClose()});
const mnav=modal?.querySelectorAll('.modal-bottom button');if(mnav?.length===2){mnav[0].addEventListener('click',()=>galleryStep(-1));mnav[1].addEventListener('click',()=>galleryStep(1))}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){galleryClose()}if(modal?.style.display==='grid'){if(e.key==='ArrowLeft')galleryStep(-1);if(e.key==='ArrowRight')galleryStep(1)}});
})();
(()=>{'use strict';
const destination=(window.CHROMA_EMAIL_OFICIAL||'').trim(); // Configurar somente com e-mail confirmado.
const query=new URLSearchParams(window.__chromaRouteQuery || location.search);
let chosenUnit=query.get('unidade');
if(chosenUnit){document.querySelectorAll('select[name="unidade"]').forEach(s=>{let option=[...s.options].find(o=>o.value===chosenUnit);if(option)s.value=option.value;});}
function setStatus(form,message,error){const node=form.querySelector('.v3-form-notice');if(node){node.textContent=message;node.classList.toggle('is-error',!!error);}}
function toMailto(data){const subject='Contato pelo site Chroma — '+(data.get('assunto')||'Solicitação de retorno')+' / '+(data.get('unidade')||'Unidade não informada');
 const body=[
  'Olá, equipe Chroma!', '',
  'Contato preenchido pelo site institucional:',
  'Nome: '+(data.get('nome')||''),
  'E-mail: '+(data.get('email')||''),
  'Telefone: '+(data.get('telefone')||'Não informado'),
  'Unidade de interesse: '+(data.get('unidade')||'Não informado'),
  'Perfil: '+(data.get('perfil')||'Não informado'),
  'Assunto: '+(data.get('assunto')||'Solicitação de retorno'),
  'Mensagem: '+(data.get('mensagem')||'Gostaria de receber mais informações sobre a Escola Chroma.'),'',
  'Esta mensagem foi preparada pelo formulário e precisa ser enviada pelo usuário.'
 ].join('\n');
 return 'mailto:'+encodeURIComponent(destination)+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
}
for(const form of document.querySelectorAll('[data-chroma-form]')){
 form.addEventListener('submit',async e=>{
   e.preventDefault();
   if(!form.checkValidity()){form.reportValidity();setStatus(form,'Confira os campos obrigatórios antes de continuar.',true);return;}
   const data=new FormData(form);
   if(data.get('website'))return;
   const btn=form.querySelector('button[type="submit"]');const label=btn?.innerHTML;
   const payload=Object.fromEntries(data.entries());delete payload.website;
   const preview=location.protocol==='file:' || location.origin==='null' || window.parent!==window || !location.pathname.startsWith('/');
   // Client preview always opens user email; the browser never asserts delivery.
   if(!preview){
      try{
       btn.disabled=true;btn.textContent='Enviando...';
       const response=await fetch('/api/contato',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
       const body=await response.json().catch(()=>({}));
       if(response.ok && body.ok){setStatus(form,'Mensagem enviada à equipe com sucesso. Confira sua caixa de entrada para eventual resposta.',false);form.reset();return;}
       setStatus(form,'O envio automático não está configurado. Abriremos uma mensagem para você revisar e enviar.',true);
      }catch(_err){setStatus(form,'Não foi possível enviar automaticamente. Abriremos seu aplicativo de e-mail.',true)}
      finally{btn.disabled=false;btn.innerHTML=label}
   }else{setStatus(form,'Sua mensagem está pronta. Confira-a no aplicativo de e-mail e clique em Enviar. O site ainda não recebeu seus dados.',false)}
   if(!destination){setStatus(form,'O envio depende da confirmação do e-mail institucional. Nenhuma mensagem foi enviada.',true);return;}
   window.location.href=toMailto(data);
 });
}
})();
