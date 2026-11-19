# Convenções de código — Instituto Chroma

## HTML
- Cada documento possui `<!doctype html>`, `<html lang="pt-BR">`, `<head>`, `<body>`, `<header>`, `<main>` e `<footer>`.
- Preservar textos, imagens, classes CSS, âncoras e atributos de acessibilidade.
- Indentar blocos aninhados em 2 espaços. Não compactar páginas inteiras em uma linha.
- Preferir elementos semânticos e identificadores únicos, com âncoras funcionais.

## CSS
- Uma declaração por linha, chaves visíveis e indentação de 2 espaços.
- Manter a especificidade sob controle: evitar empilhar `!important` e sobrescritas de versões anteriores.
- Separar estilos globais, componentes e responsividade em futuras evoluções planejadas.
- Verificar o resultado em celular, tablet e desktop após alterações de layout.

## JavaScript
- Funções com responsabilidades delimitadas e eventos com estado consistente.
- Preservar acessibilidade de menus, formulários e diálogos.
- Não ativar envio de e-mails antes da validação institucional e técnica.

## Verificação antes de merge
1. Conferir que todas as páginas e recursos existem.
2. Validar sintaxe JavaScript e fechamento HTML/CSS.
3. Exercitar navegação, menu, galeria, âncoras e formulários em navegador real.
4. Revisar textos cortados, quebras de linha e responsividade.
5. Publicar em preview e aprovar antes de alterar `main`.

> A configuração de Prettier foi adicionada como referência para as próximas edições. A revisão V4.8 preserva os tokens do CSS/JS e as tags HTML; não equivale a uma execução integral do Prettier nem a uma refatoração completa da arquitetura.
