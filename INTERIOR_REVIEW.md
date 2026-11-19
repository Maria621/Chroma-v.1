# Instituto Chroma — Etapa 5: páginas internas e navegação

## Alterações efetuadas
- As 11 páginas internas substituíram a segunda legenda genérica do topo pelo link contextual **← Página inicial**.
- O estilo desse link respeita o hero azul/escuro ou claro, com foco visível e responsividade.
- O cabeçalho compartilhado e todas as cópias geradas removem o atributo `aria-haspopup="true"`: trata-se de um painel de links (disclosure), não de um menu ARIA de aplicação. `aria-expanded` e `aria-controls` foram preservados.
- A navegação desktop permite setas acima/abaixo e Home/End no painel institucional; o menu mobile fecha o painel desktop ao abrir.
- O modal das artes em Novidades devolve o foco ao botão que o abriu e seus três botões têm rótulos específicos.
- Nas cinco etapas de metodologia, os ícones +/− agora são decorativos para leitores de tela; as setas e Home/End movimentam o foco entre etapas.
- Em Unidades, removida a afirmação de que a pessoa poderá identificar a unidade mais próxima sem endereços confirmados. Há informação explícita sobre o formulário pendente e o Instagram como canal alternativo.
- CSS novo isolado em `src/styles/refinements/07-inner-navigation.css`, incorporado ao arquivo `v31.css` via gerador.

## Preservado
- Estrutura das 12 páginas, hero da V5.3, logo, paleta, fontes e módulos de conteúdo.
- Metodologia com cinco etapas; história institucional e informações de bolsas sem alteração.
- `src/partials/footer.html` e o formulário, que continua dependente da homologação da etapa final.
- Nenhuma promoção para `main` ou alteração de configurações de produção.

## QA
```bash
npm run check:interior
npm run validate
npm run check:preview
```

## Testes visuais obrigatórios, pendentes de prévia do commit exato
- [ ] Layout de cabeçalho, primeiro bloco e rodapé nas 11 páginas internas.
- [ ] Navegação e quebra dos títulos em 320, 360, 390, 768, 1024 e 1440 px.
- [ ] Menu mobile com teclado e toque, foco preso e Escape retornando ao botão.
- [ ] Dropdown aberto com teclado e navegação entre links.
- [ ] Modal de Novidades: abrir, fechar, Escape e retorno de foco.
- [ ] Metodologia: as cinco etapas com clique, Tab, setas e Home/End.
- [ ] Unidade: CTA, mensagem de canal alternativo e responsividade.

A validação automatizada é **estática**. Não substitui testes em navegador nem comprova perfeição visual.
