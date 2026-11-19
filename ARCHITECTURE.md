# Instituto Chroma — Arquitetura CSS e JavaScript (V5.2)

## Estrutura em produção e em desenvolvimento

O site continua sendo composto por **12 páginas HTML estáticas**, preservando as URLs, a identidade e as funcionalidades. Para evitar divergência visual e quebra de interações, a arquitetura desta etapa separa os **arquivos-fonte** dos **arquivos de saída**.

### Fonte editável

```text
src/
├── styles/
│   ├── tokens.css                  # Design System (etapa 2)
│   ├── base/
│   │   ├── 01-foundation.css       # Regras básicas e componentes originais
│   │   ├── 02-responsive.css       # Media queries originais
│   │   ├── 03-identity.css         # Elementos e ativos da marca
│   │   ├── 04-interior-pages.css   # Páginas internas
│   │   ├── 05-editorial.css        # Ajustes editoriais
│   │   ├── 06-units-news.css       # Unidades, notícias e contato
│   │   └── 07-qa-refinements.css   # Correções pré-existentes
│   ├── refinements/
│   │   ├── 01-navigation-campaigns.css
│   │   ├── 02-institutional-content.css
│   │   ├── 03-partnerships-hero.css
│   │   ├── 04-footer.css
│   │   └── 05-units-accessibility.css
│   └── ...
└── scripts/
    ├── header.js                   # Cabeçalho com scroll e logotipo
    ├── methodology.js              # Accordion das etapas
    ├── gallery.js                  # Galeria inicial
    ├── contact.js                  # Formulário e disponibilidade
    ├── navigation.js               # Menu mobile e dropdown
    └── news-dialog.js              # Modal de notícias
```

### Saída final utilizada pelas páginas

- `style.css` e `v31.css` são **gerados**, e não devem receber alterações manuais.
- `app.js` e `v31.js` são **gerados** a partir dos seis módulos.
- As 12 páginas continuam com os mesmos dois scripts, usando `defer`. Não há novas dependências em tempo de execução.
- `src/styles/tokens.css` é carregado diretamente pelas páginas e não faz parte dos bundles legados.
- `api/contato.js` continua separado e **não foi modificado**; o envio de e-mail permanece para a última etapa.

### Comandos de manutenção

```bash
npm run build:assets  # gera todos os bundles após alterações na fonte
npm run check:assets  # verifica se a saída acompanha a fonte
npm run validate      # valida bundles, JS, layout, design system e HTML
npm run check:preview # verifica que a prévia não é indexada
```

### Estratégia de risco

1. O CSS foi repartido **somente em limites de regras de nível superior**, e é concatenado de forma idêntica ao conteúdo anterior, mantendo a cascata e o comportamento visual original.
2. Cada funcionalidade JavaScript foi extraída como função imediatamente invocada (IIFE) isolada, preservando o código dos handlers e a ordem de execução. O funcionamento depende da mesma ordem: `app.js` antes de `v31.js`.
3. O `npm run check:assets` falha se algum bundle tiver sido editado manualmente ou não tiver sido gerado corretamente.
4. **Não há garantia de equivalência funcional no navegador somente por comparação estática.** Confirmar menu, hero, galeria, accordion, modal de Novidades, seletores de unidade e status do formulário na URL do commit revisado.

### Dívida técnica remanescente

Os módulos CSS herdaram a ordem e as regras antigas para evitar regressões. Não foi feita exclusão automatizada de seletores, overrides ou `!important` sem medição visual; esses casos exigem um trabalho posterior de identificação de usos e comparação por navegador. A existência de módulos **não equivale** à remoção de toda a dívida técnica.

A meta de V5.2 é permitir ajustes futuros em arquivos menores, com uma etapa de compilação verificável, sem redesenhar páginas ou criar um framework desnecessário.
