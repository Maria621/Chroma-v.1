# Homepage e hero — V5.3

## Objetivo
Refinar a apresentação principal do Instituto Chroma **sem substituir a linguagem visual aprovada**, nem alterar o conteúdo institucional, a navegação ou o formulário.

## O que foi aplicado
- Hero desktop com altura limitada por `clamp` e título de escala moderada.
- A imagem de 1100 × 619 px passou a aparecer em uma área própria, à direita, sem crop por `object-fit: cover`.
- O texto tem largura delimitada para não competir com a fotografia conceitual.
- O gradiente azul, a atmosfera visual, a tipografia e a chamada principal são preservados.
- Em até 900 px, apresentação, imagem e rodapé do hero passam a ser empilhados; imagem mantém seu `aspect-ratio` real.
- Em até 600 px, tipografia, margens, espaço de leitura e rótulos são adaptados.
- A legenda da imagem continua identificando a peça como **ilustração digital**, não fotografia real da escola.
- A configuração `prefers-reduced-motion` reduz movimentos decorativos do banner.
- As alterações estão isoladas em `src/styles/refinements/06-home-hero.css`, incluídas no bundle gerado `v31.css` por `scripts/build-front-end.mjs`. Não editar o bundle manualmente.

## Testes automatizados
```bash
npm run build:assets
npm run check:hero
npm run validate
```

Os testes verificam a existência da chamada principal, legenda ilustrativa, proporção da imagem, CSS responsivo e inclusão do módulo no build. **São testes estruturais, não medições visuais.**

## Homologação visual pendente — obrigatório testar em navegador
- [ ] Desktop: 1440 × 900, 1280 × 800, 1024 × 768.
- [ ] Tablet: 820 × 1180 e orientação horizontal.
- [ ] Mobile: 360 × 780, 390 × 844, 430 × 932 e 320 px de largura.
- [ ] Títulos e descrições sem corte, sobreposição nem quebra inadequada.
- [ ] Imagem inteira visível, sem distorção, inclusive em orientação paisagem.
- [ ] CTA, navegação fixa, scroll, marca e legenda acessíveis.
- [ ] Contraste e foco de teclado, zoom de 200%, movimento reduzido.
- [ ] Inspecionar LCP/CLS e recursos carregados com o painel de rede.
- [ ] Avaliar se a ilustração está suficientemente nítida; ampliar o arquivo original apenas com autorização e material adequado.

## Limites
O Vercel tem bloqueado novos builds por cota da conta. Não declarar este layout como visualmente homologado até que a prévia do **SHA exato** esteja disponível. A branch `main` deve permanecer intocada.
