## O que mudou e por quê

<!-- 1-3 frases. Foque no porquê, não só no quê. -->

## Tipo de mudança

- [ ] Correção de erro
- [ ] Funcionalidade nova
- [ ] Refatoração (sem mudar o comportamento)
- [ ] Build, CI ou configuração (publicação, variáveis de ambiente, dependências)
- [ ] Documentação
- [ ] Limpeza de código morto

## Conferência

- [ ] `npm run typecheck` passa
- [ ] `npm run build` passa
- [ ] `npm run test:e2e` passa, se mexeu em tela (ver `README.md`, seção Rodar)
- [ ] Testei na mão o fluxo afetado
- [ ] Atualizei `docs/STATUS.md` se a mudança afeta publicação, banco ou arquitetura
- [ ] Nenhuma chave, token, senha ou dado de paciente no diff
- [ ] A chave `service_role` não entrou em código do app
- [ ] Mudança de banco tem migração em `supabase/migrations/`
- [ ] Views `vw_*` continuam com `security_invoker`

## Como testar

1.
2.
3.

## Imagens (se mexeu em tela)

> Se este PR muda variáveis de ambiente na Vercel ou a forma de publicar, diga na mensagem do commit.
