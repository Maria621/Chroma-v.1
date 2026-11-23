# Instituto Chroma — verificação visual e desempenho

## Revisão em navegador

Capturas analisadas do commit 5058aa7 (mesmo HTML/CSS da atualização de CI 07c758d).

- Desktop 1440 × 900: hero, marca, navegação, CTA e ilustração completos, sem corte visível.
- Mobile 390 × 844: headline legível em quatro linhas, CTA e imagem inteira abaixo do texto.
- Os 14 cenários Playwright de desktop e celular passaram no GitHub Actions.
- A ausência de rolagem horizontal foi conferida nas 12 páginas pelos testes.

Run: https://github.com/Maria621/Chroma-v.1/actions/runs/45234493435

## Limites

Capturas não substituem teste com leitores de tela reais, inspeção de cada seção em todos os tamanhos de tela, teste em Safari/Firefox nem prova de autenticidade das fotos.

## Lighthouse

O script scripts/run-performance-audit.mjs mede a versão local em mobile/desktop e registra JSON, sem interromper a publicação caso a medição falhe. Os relatórios são enviados como artefato do GitHub Actions. A nota de SEO de uma prévia noindex não é equivalente à nota do domínio oficial.
