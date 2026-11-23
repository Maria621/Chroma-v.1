# Instituto Chroma — SEO, performance e critérios de lançamento V5.6

## Preparação implantada na branch de revisão

- As 12 páginas têm títulos, descrições próprios, idioma `pt-BR`, estado `noindex,nofollow` e metadados Open Graph consistentes com o conteúdo.
- Foi incluído `twitter:card=summary`, sem inventar imagem social e sem domínio canônico não verificado.
- O título do hero e a imagem prioritária preservam dimensões reais; o arquivo principal é buscado com prioridade e carregamento inicial.
- Cabeçalhos HTTP configurados no `vercel.json`: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- Não foi configurada indexação automática, sitemap com domínio inventado, pixel de rastreamento ou cookies analíticos.
- A política de privacidade explica fontes externas, serviços envolvidos no envio de contato e revisão jurídica pendente.

## Preparação de SEO para o domínio final

**Somente após confirmar o endereço oficial de produção:**

1. Definir URL canônica HTTPS oficial, domínio preferido e redirecionamento 301 entre aliases.
2. Produzir sitemap XML com as 12 páginas corretas (ou retirar páginas que não devam indexar).
3. Incluir `rel=canonical` e `og:url` absolutos, corretos e por página.
4. Aprovar uma imagem social institucional (1200 × 630 preferencialmente), sem usar fachada falsa; incluir `og:image` absoluto e dimensões.
5. Reavaliar títulos e descrições com responsáveis e revisar conteúdo de legislação/privacidade.
6. Remover `noindex,nofollow` e habilitar robots.txt/sitemap apenas após QA e aprovação institucional.
7. Enviar domínio e sitemap para ferramentas oficiais de indexação.
8. Revisar imagens e dados estruturados de Organization/LocalBusiness somente quando endereços e contato estiverem confirmados.

## Critérios técnicos de homologação

- [ ] Link do preview Vercel corresponde exatamente ao SHA validado no GitHub.
- [ ] Testes automatizados de todas as páginas, menu, modal, metodologia e formulário.
- [ ] Visual 320, 360, 390, 768, 1024, 1280, 1440 px; nenhum corte ou rolagem horizontal indevida.
- [ ] Medição Lighthouse mobile e desktop com LCP, CLS, INP, contraste e navegação por teclado.
- [ ] Teste com leitor de tela e zoom 200%.
- [ ] Checagem da carga de fontes Manrope e DM Sans, avaliando opção de hospedagem própria sob privacidade.
- [ ] Imagens autorizadas e fatos institucionais confirmados.
- [ ] Política LGPD, envio de e-mail e antispam homologados pela organização.
- [ ] Revisão executiva final antes de qualquer promoção para `main`.

## Fora do escopo de uma revisão automática

Uma nota Lighthouse real ou status READY de um preview **não pode ser inferido** por leitura de código. Não existem neste repositório dados suficientes para declarar endereços, telefone e fotografia de unidades como oficiais. São pendências institucionais, não falhas que podem ser resolvidas com suposições.
