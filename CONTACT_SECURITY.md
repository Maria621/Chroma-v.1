# Instituto Chroma — contato, dados pessoais e ativação segura (V5.5)

## Situação inicial
O formulário permaneceu desativado por falta de credenciais institucionais e aprovação do tratamento de dados. Esta revisão **não envia mensagens reais**, não alterou ambiente Vercel e não confirmou endereço de recebimento.

## Fluxo implementado
1. `GET /api/contato` informa disponibilidade pública sem revelar chaves.
2. `POST /api/contato` aceita JSON apenas quando existe autorização explícita em ambiente, privacidade aprovada, remetente e destinatário válidos, origens autorizadas e um Redis Upstash configurado.
3. Valida campos obrigatórios, comprimento de mensagem, consentimento, tipos de assunto/perfil/unidade e tamanho do corpo.
4. Bloqueia solicitações de outra origem; usa honeypot invisível para reduzir spam simples.
5. Aplica limite distribuído **3 mensagens por IP a cada 15 minutos**. O identificador armazenado no Redis é derivado por HMAC de IP com uma chave secreta; o IP original não aparece na chave.
6. Falhas de Redis ou Resend retornam indisponibilidade, nunca sucesso falso.
7. A resposta positiva do provedor de e-mail confirma a aceitação do pedido de envio, não a leitura da mensagem pela equipe.

## Variáveis de ambiente — definir nos controles privados do Vercel

```text
CONTACT_FORM_ENABLED=false
CONTACT_PRIVACY_APPROVED=false
CONTACT_ALLOWED_ORIGINS=https://DOMINIO-VERIFICADO.example
CONTACT_RATE_LIMIT_SECRET=<SEGREDO_ALEATORIO_DE_PELO_MENOS_24_CARACTERES>
CONTACT_FROM_EMAIL=<REMETENTE_COM_DOMINIO_VALIDADO>
CONTACT_TO_EMAIL=<DESTINATARIO_INSTITUCIONAL_APROVADO>
RESEND_API_KEY=<CHAVE_PRIVADA_DO_PROVEDOR>
UPSTASH_REDIS_REST_URL=<URL_PRIVADA_HTTPS_UPSTASH>
UPSTASH_REDIS_REST_TOKEN=<TOKEN_PRIVADO_UPSTASH>
```

**Não colocar esses valores no GitHub nem enviá-los por chat.**

A ativação requer `CONTACT_FORM_ENABLED=true` **e** `CONTACT_PRIVACY_APPROVED=true`. Antes disso, a API não aceita envios, mesmo que existam credenciais.

## Pontos de segurança a homologar antes do envio real

- Confirmar endereço institucional de destino e domínio verificado de remetente no provedor.
- Aprovar a política LGPD com o responsável pelo tratamento e canal de direitos.
- Configurar uma instância Upstash e monitorar limites, custos, erros e alertas de abuso.
- Configurar as origens corretas de produção e/ou preview **por ambiente**, não utilizar wildcard.
- Revisar proteção na borda do Vercel (WAF/limites contra automação); validação de `Origin` por si só não autentica clientes externos.
- Testar envio real e recebimento em caixa autorizada sem registrar conteúdo sensível.
- Reavaliar a retenção de e-mails e logs do provedor conforme política aprovada.
- Avaliar uso de fontes Google Fonts e eventuais cookies de terceiros na versão final.

## Testes locais
```bash
node --test tests/contact-api.test.cjs
npm run validate
```

Os testes usam servidores simulados, **não enviam e-mails**, e cobrem bloqueio por ausência de configuração, consentimento, origem, limite de requisições e falha do provedor.

## Limitações
Este endpoint foi desenhado para o backend atual em função serverless Node. O limitador depende da disponibilidade externa do Redis; quando indisponível, o formulário falha de forma segura. A origem da requisição é um filtro adicional, não proteção completa contra robôs. Segurança operacional depende das variáveis de produção e dos controles de borda.
