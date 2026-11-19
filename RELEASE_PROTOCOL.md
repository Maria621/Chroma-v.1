# Etapa 1 — Estabilização e protocolo de publicação

**Data da verificação:** 19/11/2026  
**Projeto GitHub:** `Maria621/Chroma-v.1`  
**Projeto Vercel:** `chroma-v1` · `prj_VaHVaPi1EmIjMM8Efq5H0D9sNghG`  
**Branch de trabalho:** `revisao-institucional-v4`  
**Baseline V5.0 aprovado no QA estático:** `9bc79fc1e9263f50da80c13d4d4e757a648fcbec`  
**Branch de recuperação:** `backup-v5-0-estabilizacao-20261119` (aponta para o baseline)  
**Branch de produção:** `main` — não alterar durante esta etapa.

## Estado real da publicação na abertura da etapa

- GitHub Actions do baseline `9bc79fc`: **success**.
- Status Vercel do mesmo commit informado ao GitHub: **failure**, com link para limite de build da conta.
- A lista de deployments do projeto **não continha um deploy READY do commit `9bc79fc`**.
- Última prévia READY identificada: `df62c994e086354c3f7f70bfc113b7dd0867a1f4`, anterior ao baseline.
- O projeto Vercel possui proteção SSO para previews. Um navegador sem autorização pode não abrir a prévia, mesmo em status READY.
- **Conclusão:** o QA do código passou, mas a versão publicada não correspondia ao código aprovado. A V5.0 ainda não estava homologada em navegador.

## Gates obrigatórios por alteração

1. Manter todas as alterações na branch de revisão e preservar a branch `main`.
2. Rodar `npm run validate` (sintaxe JS, componentes compartilhados, HTML, IDs, links e assets).
3. Rodar `npm run check:preview` para impedir indexação da prévia.
4. Aguardar GitHub Actions com resultado **success no SHA exato**.
5. Consultar o Vercel: exija deployment com `readyState=READY`, branch de revisão e o **mesmo SHA** do GitHub.
6. Comparar, com valores obtidos da plataforma, usando `npm run verify:deployment`; o comando não acessa a plataforma por conta própria.
7. Abrir a URL de preview autenticada e executar o checklist visual/funcional. **Não confundir READY com aprovação visual.**
8. Somente após aprovação explícita e confirmação das informações institucionais preparar uma promoção para produção.

## Comandos locais

```bash
npm run validate
npm run check:preview

# Exemplo apenas depois de obter estes dados diretamente do Vercel:
CHROMA_DEPLOY_SHA=<sha-real-deploy> \
CHROMA_DEPLOY_STATE=READY \
CHROMA_DEPLOY_URL=https://<host-real> \
CHROMA_DEPLOY_TARGET=preview \
npm run verify:deployment
```

## Reversão

- Recuperar a versão anterior usando a branch `backup-v5-0-estabilizacao-20261119`.
- Comparar as modificações com `git diff backup-v5-0-estabilizacao-20261119..revisao-institucional-v4`.
- Em vez de forçar o histórico de `main`, reverter commits defeituosos na **branch de trabalho** via `git revert` e passar novamente os gates.
- No Vercel, um deployment preview antigo permanece como referência; **não** promover ou alterar o domínio da produção como parte da reversão de preview.

## Controles pendentes que exigem autorização de administrador

As branches atuais do repositório não estão protegidas por regras de branch. Antes da publicação definitiva, configurar no GitHub: revisão obrigatória de PR para `main`, status check obrigatório `Validate institutional site`, impedimento de force-push e de alterações diretas. O CI foi ampliado para testar também pushes em `main`, mas isso **não substitui a proteção da branch**.

## Fora do escopo da estabilização

Sem mudança no layout, conteúdo institucional, fotografias, integração de e-mail ou indexação pública. O refinamento tipográfico e do design system começa na Etapa 2.
