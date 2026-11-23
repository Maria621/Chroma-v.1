/**
 * Instituto Chroma — contato institucional (V5.5).
 * Ativação deliberadamente fail-closed. Não habilitar antes da aprovação
 * de privacidade, credenciais do Resend e limite distribuído Upstash Redis.
 *
 * Nunca registrar o payload ou as credenciais em logs.
 */
'use strict';

const { createHmac } = require('node:crypto');

const UNITS = new Set([
  'Diadema — São Jorge',
  'Sorocaba — Itavuvu',
  'Sorocaba — Pannunzio (Polo Anhanguera)',
  'Não sei / ambas',
]);
const PROFILES = new Set([
  'Responsável por aluno',
  'Aluno(a)',
  'Visitante',
  'Parceiro(a) institucional',
  'Representante de escola',
  'Representante de empresa',
  'Outro',
]);
const SUBJECTS = new Set([
  'Conhecer a escola',
  'Aluno Nota 10',
  'Acompanhamento pedagógico',
  'Atendimento administrativo',
  'Projetos e parcerias',
  'Parceria com escola',
  'Parceria com empresa',
  'Outros assuntos',
]);
const LIMIT_WINDOW_SECONDS = 900;
const LIMIT_MAX_MESSAGES = 3;
const text = (value) => typeof value === 'string' ? value.trim() : '';
const headerValue = (req, name) => {
  const raw = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] || '' : '';
};
const validEmail = (value) =>
  value.length <= 254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
const safeText = (value, limit = 2100) =>
  text(value).replace(/[\u0000-\u001f\u007f<>]/g, ' ').slice(0, limit);

function allowedOrigins() {
  return new Set(
    (process.env.CONTACT_ALLOWED_ORIGINS || '')
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => {
        try {
          const url = new URL(entry);
          return url.protocol === 'https:' && url.origin === entry;
        } catch {
          return false;
        }
      }),
  );
}

function configured() {
  const env = process.env;
  let validRedis = false;
  try {
    const url = new URL(env.UPSTASH_REDIS_REST_URL || '');
    validRedis = url.protocol === 'https:' &&
      url.hostname.endsWith('.upstash.io') &&
      (url.pathname === '/' || url.pathname === '');
  } catch {
    validRedis = false;
  }

  return env.CONTACT_FORM_ENABLED === 'true' &&
    env.CONTACT_PRIVACY_APPROVED === 'true' &&
    Boolean(env.RESEND_API_KEY && env.CONTACT_TO_EMAIL &&
      env.CONTACT_FROM_EMAIL && env.UPSTASH_REDIS_REST_TOKEN) &&
    validEmail(env.CONTACT_TO_EMAIL || '') &&
    validEmail(env.CONTACT_FROM_EMAIL || '') &&
    validRedis &&
    (env.CONTACT_RATE_LIMIT_SECRET || '').length >= 24 &&
    allowedOrigins().size > 0;
}

async function rateLimit(req) {
  const env = process.env;
  // Anonymized key: raw IP is never stored in Redis.
  const ip = headerValue(req, 'x-real-ip') ||
    headerValue(req, 'x-forwarded-for').split(',')[0].trim();
  if (!ip) return { ok: false, unavailable: true };

  const digest = createHmac('sha256', env.CONTACT_RATE_LIMIT_SECRET)
    .update(ip).digest('hex');
  const key = 'chroma:contact:v1:' + digest;
  const script = 'local n=redis.call("INCR",KEYS[1]); ' +
    'if n==1 then redis.call("EXPIRE",KEYS[1],ARGV[1]) end; return n';

  try {
    const response = await fetch(env.UPSTASH_REDIS_REST_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + env.UPSTASH_REDIS_REST_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        'EVAL', script, '1', key, String(LIMIT_WINDOW_SECONDS),
      ]),
      signal: AbortSignal.timeout(6500),
    });
    if (!response.ok) return { ok: false, unavailable: true };
    const data = await response.json();
    const count = Number(data.result);
    if (!Number.isInteger(count) || count < 1) {
      return { ok: false, unavailable: true };
    }
    return { ok: count <= LIMIT_MAX_MESSAGES, unavailable: false };
  } catch {
    return { ok: false, unavailable: true };
  }
}

module.exports = async function contato(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      acceptingMessages: configured(),
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, message: 'Método não permitido' });
  }

  if (!configured()) {
    return res.status(503).json({
      ok: false,
      message: 'O envio ainda não está disponível. Utilize o Instagram institucional.',
    });
  }

  const origin = headerValue(req, 'origin');
  if (!allowedOrigins().has(origin)) {
    return res.status(403).json({ ok: false, message: 'Origem não autorizada' });
  }

  if (!/^application\/json\b/i.test(headerValue(req, 'content-type'))) {
    return res.status(415).json({ ok: false, message: 'Formato não suportado' });
  }

  let body = req.body;
  try {
    const raw = typeof body === 'string' ? body : JSON.stringify(body);
    if (!raw || Buffer.byteLength(raw, 'utf8') > 8000) {
      return res.status(413).json({ ok: false, message: 'Mensagem extensa demais' });
    }
    if (typeof body === 'string') body = JSON.parse(body);
  } catch {
    return res.status(400).json({ ok: false, message: 'Dados inválidos' });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ ok: false, message: 'Dados inválidos' });
  }

  // Honeypot: acknowledge silently without invoking Redis or the email provider.
  if (body.website) return res.status(200).json({ ok: true });

  const nome = text(body.nome);
  const email = text(body.email);
  const unidade = text(body.unidade);
  const perfil = text(body.perfil);
  const assunto = text(body.assunto);
  const mensagem = text(body.mensagem);
  const telefone = text(body.telefone);

  if (nome.length < 2 || nome.length > 150 ||
    !validEmail(email) ||
    !UNITS.has(unidade) || !PROFILES.has(perfil) ||
    !SUBJECTS.has(assunto) ||
    mensagem.length < 10 || mensagem.length > 2000 ||
    telefone.length > 40 ||
    ![true, 'true', 'on'].includes(body.consentimento)) {
    return res.status(400).json({
      ok: false,
      message: 'Confira os campos obrigatórios e o consentimento.',
    });
  }

  const limiter = await rateLimit(req);
  if (limiter.unavailable) {
    return res.status(503).json({
      ok: false,
      message: 'Serviço temporariamente indisponível. Utilize o Instagram institucional.',
    });
  }
  if (!limiter.ok) {
    res.setHeader('Retry-After', String(LIMIT_WINDOW_SECONDS));
    return res.status(429).json({
      ok: false,
      message: 'Muitas solicitações. Tente novamente mais tarde.',
    });
  }

  const lines = [
    'Nome: ' + safeText(nome, 150),
    'E-mail: ' + safeText(email, 254),
    'Telefone: ' + safeText(telefone, 40),
    'Unidade: ' + safeText(unidade, 80),
    'Perfil: ' + safeText(perfil, 80),
    'Assunto: ' + safeText(assunto, 150),
    'Mensagem:',
    safeText(mensagem, 2000),
  ];

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL,
        to: [process.env.CONTACT_TO_EMAIL],
        reply_to: email,
        subject: 'Chroma • ' + safeText(assunto, 150) +
          ' / ' + safeText(unidade, 80),
        text: lines.join('\n'),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      return res.status(502).json({
        ok: false, message: 'Não foi possível confirmar o envio.',
      });
    }
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({
      ok: false, message: 'Falha de envio. Utilize o canal alternativo.',
    });
  }
};
