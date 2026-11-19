# Instituto Chroma — Design System V5.1

## Objetivo
Padronizar tipografia e tokens essenciais sem redesenhar as páginas. As regras de componentes permanecem em `style.css` e `v31.css`.

## Tipografia
- **Manrope**: títulos e elementos que usam `var(--sans)`; novos componentes utilizam `var(--font-heading)`.
- **DM Sans**: texto corrido que usa `var(--body)`; novos componentes utilizam `var(--font-body)`.
- Pesos carregados: 400, 500, 600, 700, 800. Fallback: Arial, sans-serif. A API utiliza `display=swap`.
- Ordem das folhas: Google Fonts → `src/styles/tokens.css` → `style.css` → `v31.css`.

**Privacidade:** esta versão de prévia carrega fontes de servidores externos do Google. O pedido pode transmitir metadados técnicos como endereço IP. Antes do lançamento, validar com o responsável de privacidade se será adotada hospedagem própria ou outra solução institucional aprovada. Nenhum arquivo de fonte é distribuído no repositório nesta etapa.

## Paleta institucional preservada
| Token | Cor |
| --- | --- |
| `--color-brand-navy` | `#081b38` |
| `--color-brand-primary` | `#1458bc` |
| `--color-brand-electric` | `#3d8bff` |
| `--color-brand-deep` | `#052f68` |
| `--color-brand-royal` | `#1454af` |
| `--color-brand-accent` | `#ffe025` |
| `--color-ink` | `#142139` |
| `--color-surface-soft` | `#f5f8fc` |
| `--color-border` | `#dae2eb` |

Os nomes legados (`--navy`, `--ink`, `--chroma-yellow`, `--chroma-focus` etc.) permanecem como aliases.

## Layout e espaçamento
- `--container-max: 1360px`; `--container-gutter: 96px`; responsividade específica preservada.
- `--space-section: clamp(80px, 8.8vw, 120px)`.
- `--tracking-heading: -.065em`; `--leading-body: 1.8`.
- Uma escala de espaçamentos e raios está disponível para novos componentes, sem alterar milhares de valores legados nesta etapa.

## Regras de manutenção
1. Declarar tokens globais apenas em `src/styles/tokens.css`, nunca em novos `:root` de versões.
2. Rodar `npm run check:design` e `npm run validate` antes do commit.
3. Realizar inspeção visual real da fonte renderizada e das quebras dos títulos em desktop e celular.
4. A substituição sistemática de valores fixos será objeto da Etapa 3, após a homologação visual.

## Limite da verificação
O QA estático confirma links e variáveis, mas não prova que a API de fontes respondeu nem que a renderização final esteja aprovada.
