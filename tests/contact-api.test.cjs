'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

const handler = require('../api/contato.js');
const ENV = [
  'CONTACT_FORM_ENABLED',
  'CONTACT_PRIVACY_APPROVED',
  'CONTACT_ALLOWED_ORIGINS',
  'CONTACT_RATE_LIMIT_SECRET',
  'CONTACT_TO_EMAIL',
  'CONTACT_FROM_EMAIL',
  'RESEND_API_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
];
const initial = Object.fromEntries(ENV.map((k) => [k, process.env[k]]));
const originalFetch = global.fetch;

function setup(activated = true) {
  const env = {
    CONTACT_FORM_ENABLED: activated ? 'true' : 'false',
    CONTACT_PRIVACY_APPROVED: 'true',
    CONTACT_ALLOWED_ORIGINS: 'https://chroma.example',
    CONTACT_RATE_LIMIT_SECRET: 'a-random-testing-key-that-is-longer-than-24',
    CONTACT_TO_EMAIL: 'recipient@example.com',
    CONTACT_FROM_EMAIL: 'sender@example.com',
    RESEND_API_KEY: 'fake-resend-key',
    UPSTASH_REDIS_REST_URL: 'https://chroma-test.upstash.io',
    UPSTASH_REDIS_REST_TOKEN: 'fake-redis-token',
  };
  Object.assign(process.env, env);
}
function cleanup() {
  for (const [k, value] of Object.entries(initial)) {
    if (value === undefined) delete process.env[k];
    else process.env[k] = value;
  }
  global.fetch = originalFetch;
}
function body(patch = {}) {
  return {
    nome: 'Maria de Teste',
    email: 'maria@example.com',
    telefone: '11999999999',
    unidade: 'Diadema — São Jorge',
    perfil: 'Responsável por aluno',
    assunto: 'Conhecer a escola',
    mensagem: 'Gostaria de receber informações sobre a instituição.',
    consentimento: 'on',
    ...patch,
  };
}
async function invoke(method, payload = body(), customHeaders = {}) {
  const headers = {
    origin: 'https://chroma.example',
    'content-type': 'application/json',
    'x-real-ip': '192.0.2.30',
    ...customHeaders,
  };
  const req = { method, body: payload, headers };
  const outcome = { headers: {}, status: 200, data: null };
  const res = {
    setHeader(key, value) { outcome.headers[key] = value; return this; },
    status(code) { outcome.status = code; return this; },
    json(value) { outcome.data = value; return this; },
  };
  await handler(req, res);
  return outcome;
}

test('form stays offline unless explicitly enabled', async () => {
  setup(false);
  const availability = await invoke('GET');
  assert.equal(availability.data.acceptingMessages, false);
  const posted = await invoke('POST');
  assert.equal(posted.status, 503);
  cleanup();
});

test('privacy approval is required, even with credentials', async () => {
  setup(true);
  process.env.CONTACT_PRIVACY_APPROVED = 'false';
  assert.equal((await invoke('GET')).data.acceptingMessages, false);
  cleanup();
});

test('all configuration flags are required before advertising availability', async () => {
  setup(true);
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  assert.equal((await invoke('GET')).data.acceptingMessages, false);
  cleanup();
});

test('enabled form advertises readiness without leaking credentials', async () => {
  setup(true);
  const r = await invoke('GET');
  assert.equal(r.status, 200);
  assert.deepEqual(r.data, { ok: true, acceptingMessages: true });
  cleanup();
});

test('untrusted POST origin is rejected without network access', async () => {
  setup(true);
  global.fetch = async () => { throw Error('Should not call network'); };
  const r = await invoke('POST', body(), { origin: 'https://other.example' });
  assert.equal(r.status, 403);
  cleanup();
});

test('invalid payload is rejected before Redis or email', async () => {
  setup(true);
  global.fetch = async () => { throw Error('Should not call network'); };
  const r = await invoke('POST', body({ consentimento: '', mensagem: 'short' }));
  assert.equal(r.status, 400);
  cleanup();
});

test('honeypot does not invoke Redis or email provider', async () => {
  setup(true);
  global.fetch = async () => { throw Error('Should not call network'); };
  const r = await invoke('POST', body({ website: 'spam-site' }));
  assert.equal(r.status, 200);
  cleanup();
});

test('distributed limiter responds with 429 and retry hint', async () => {
  setup(true);
  let calls = 0;
  global.fetch = async () => { calls++; return { ok: true, async json() { return { result: 4 }; } }; };
  const r = await invoke('POST');
  assert.equal(r.status, 429);
  assert.equal(r.headers['Retry-After'], '900');
  assert.equal(calls, 1);
  cleanup();
});

test('a Redis failure prevents the email send', async () => {
  setup(true);
  let calls = 0;
  global.fetch = async () => { calls++; return { ok: false }; };
  const r = await invoke('POST');
  assert.equal(r.status, 503);
  assert.equal(calls, 1);
  cleanup();
});

test('Resend failure is not reported as successful delivery', async () => {
  setup(true);
  let calls = 0;
  global.fetch = async (url) => {
    calls++;
    if (url.includes('.upstash.io')) return { ok: true, async json() { return { result: 1 }; } };
    return { ok: false };
  };
  const r = await invoke('POST');
  assert.equal(r.status, 502);
  assert.equal(calls, 2);
  cleanup();
});

test('valid submission goes through rate limiter then Resend', async () => {
  setup(true);
  const urls = [];
  let emailRequest = null;
  global.fetch = async (url, opts) => {
    urls.push(url);
    if (url.includes('.upstash.io')) {
      assert.equal(opts.method, 'POST');
      const command = JSON.parse(opts.body);
      assert.equal(command[0], 'EVAL');
      assert.equal(command[2], '1');
      assert.ok(!opts.body.includes('192.0.2.30'), 'Redis key must not contain raw IP');
      return { ok: true, async json() { return { result: 1 }; } };
    }
    emailRequest = JSON.parse(opts.body);
    return { ok: true };
  };
  const r = await invoke('POST');
  assert.equal(r.status, 200);
  assert.equal(r.data.ok, true);
  assert.equal(urls.length, 2);
  assert.deepEqual(emailRequest.to, ['recipient@example.com']);
  assert.equal(emailRequest.reply_to, 'maria@example.com');
  assert.ok(emailRequest.text.includes('Gostaria de receber informações'));
  cleanup();
});
