# Instituto Chroma — roteiro de homologação visual e funcional

Este documento distingue verificações estáticas executadas automaticamente de testes que exigem navegador e validação institucional.

## Navegação e UX
- [ ] Conferir a página inicial em 360, 390, 768, 1024 e 1440 px; rolagem e composição sem cortes.
- [ ] Testar abertura e fechamento do menu mobile, foco por Tab/Shift+Tab e Esc.
- [ ] Validar navegação de todas as páginas, breadcrumbs ou retornos, âncoras e estados ativos.
- [ ] Testar a galeria: abrir, avançar/voltar, fechar com Esc, clicar fora e devolver o foco ao item original.
- [ ] Testar o modal de Novidades e a navegação pelo teclado.
- [ ] Verificar que a home apresenta valor institucional, metodologia, projetos, unidades, novidades e parcerias sem repetições.

## UI e acessibilidade
- [ ] Verificar legibilidade de títulos, cardápios e legendas, especialmente entre 320–390 px.
- [ ] Testar contraste normal e `:focus-visible` em fundos claros e escuros.
- [ ] Conferir comportamento com `prefers-reduced-motion: reduce` e zoom de 200%.
- [ ] Verificar dimensão de toque mínima nos controles interativos.
- [ ] Inspecionar os enquadramentos das imagens e legendas “ilustração digital”.
- [ ] Executar Lighthouse para LCP, CLS, INP, acessibilidade, SEO e práticas recomendadas.

## Conteúdo institucional e serviços
- [ ] Conferir fotos autorizadas das unidades São Jorge, Itavuvu e Pannunzio.
- [ ] Confirmar endereços completos, horários e canal compartilhado Itavuvu/Pannunzio.
- [ ] Aprovar os marcos da história desde 2016, fundador(a) e registros da expansão.
- [ ] Conferir regras do Aluno Nota 10 com o regulamento responsável.
- [ ] Aprovar aviso de privacidade e configuração segura de e-mail antes de habilitar o formulário.
- [ ] Liberar a indexação somente após a publicação oficial, nunca na prévia.

## QA executado automaticamente
O comando `npm test` verifica sintaxe JavaScript, HTML, IDs, links locais, assets, dimensões de imagens, integridade dos componentes compartilhados e limites básicos do CSS. Esses testes **não substituem** uma auditoria visual em navegador.
