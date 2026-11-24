# Preservação da versão aprovada — Chroma V.1

Referência: `5692437bd423516a3ae4cd1c5c005bd9d2397429` (revisao-institucional-v4). A branch técnica não substitui o deploy aprovado.

- HTML, imagens, estilos, módulos JS, API e parciais existentes permanecem byte a byte idênticos.
- A ordem de concatenação foi extraída para scripts/front-end-manifest.mjs, sem alterar as listas nem os arquivos gerados.
- `npm run check:approved` verifica os hashes Git dos arquivos protegidos. `npm run validate` mantém os demais testes existentes.
- Para uma futura mudança visual autorizada, revise a diferença, execute os testes e atualize a referência somente após aprovação explícita.
- Evidências e relatórios locais não devem ser versionados. Nenhuma configuração de publicação ou domínio foi alterada.
