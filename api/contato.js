// Handler opcional Vercel; configurar Resend + e-mail de destino antes da publicação.
// Requer revisão LGPD, antispam e rate limit em produção.
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ok:false,message:'Use POST'}); }
  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) return res.status(503).json({ok:false,message:'Envio ainda não configurado'});
  let p;
  try { p = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}; }
  catch { return res.status(400).json({ok:false,message:'Corpo JSON inválido'}); }
  const trim = v => typeof v === 'string' ? v.trim() : '';
  if (p.website) return res.status(200).json({ok:true});
  const nome=trim(p.nome), email=trim(p.email), unidade=trim(p.unidade), assunto=trim(p.assunto)||'Contato', mensagem=trim(p.mensagem)||'Solicitação de retorno';
  if (nome.length<2 || !/^\S+@\S+\.\S+$/.test(email) || !unidade || !['on','true',true].includes(p.consentimento) || mensagem.length>2000) return res.status(400).json({ok:false,message:'Campos inválidos'});
  const safe=x=>x.replace(/[<>]/g,'').slice(0,2100);
  const lines=[
    'Nome: '+safe(nome), 'E-mail: '+safe(email), 'Telefone: '+safe(trim(p.telefone)),
    'Unidade: '+safe(unidade), 'Perfil: '+safe(trim(p.perfil)), 'Assunto: '+safe(assunto), 'Mensagem: '+safe(mensagem)
  ];
  try {
    const response=await fetch('https://api.resend.com/emails',{
      method:'POST',headers:{Authorization:'Bearer '+RESEND_API_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({from:CONTACT_FROM_EMAIL,to:[CONTACT_TO_EMAIL],reply_to:email,subject:'Chroma • '+safe(assunto)+' / '+safe(unidade),text:lines.join('\n')})
    });
    if (!response.ok) return res.status(502).json({ok:false,message:'Provedor não confirmou envio'});
    return res.status(200).json({ok:true});
  } catch { return res.status(502).json({ok:false,message:'Erro no serviço de envio'}); }
};
