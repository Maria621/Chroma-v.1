# Relatório de acessibilidade e performance — Lighthouse

## Medição inicial no commit 8a8154a

O Lighthouse 13.6.0 foi executado em um servidor local com os arquivos da mesma revisão publicada em preview, nos modos desktop e mobile.

| Indicador | Desktop | Mobile |
| --- | ---: | ---: |
| Performance | 100 | 91 |
| Acessibilidade | 90 | 90 |
| Boas práticas | 96 | 96 |
| SEO da prévia noindex | 63 | 63 |
| LCP | 0,7 s | 3,3 s |
| CLS | 0,002 | 0 |

Estas métricas são **de uma medição em ambiente de CI**, e não representam necessariamente a experiência de todos os visitantes.

## Falhas identificadas e intervenção V5.7

1. Um `div.marquee-band` recebia `aria-label` sem papel semântico permitido. Por ser ornamentação repetitiva, passou a usar `aria-hidden="true"`.
2. Cores muito claras em pequenas legendas reduziam o contraste. Os rótulos são agora escurecidos, respeitando a identidade azul. Os alvos incluem a faixa animada, contadores da metodologia, observações da galeria, legenda das unidades, miniaturas de notícias, selo de parcerias e notas do rodapé.
3. O navegador procurava `/favicon.ico` e recebia 404. As 12 páginas agora declaram explicitamente o logotipo PNG já existente como ícone do site.
4. O score SEO de 63 é esperado porque a prévia é `noindex,nofollow`. **Não remover** essa proteção antes da autorização de publicação definitiva.
5. A auditoria identificou CSS não utilizado na primeira visita à home (aproximadamente 93–106 KiB estimados); a limpeza requer cobertura visual das páginas internas e não deve remover estilos automaticamente.

## Política de contraste

Rótulos textuais pequenos devem atingir pelo menos 4,5:1 em relação ao fundo real. O arquivo `src/styles/refinements/08-contrast.css` utiliza cores mais escuras em fundos claros e texto mais claro na faixa azul, preservando a identidade institucional. Os níveis foram calculados para os fundos observados no relatório inicial, mas a auditoria pós-correção continua obrigatória.

## Limites da homologação

- Não foram executados testes manuais com pessoas que usam leitor de tela.
- As imagens são ilustrativas e não substituem comprovação fotográfica.
- A produção segue preservada, e o formulário não foi ativado.
- O Lighthouse da prévia não substitui a avaliação de SEO do domínio final.
