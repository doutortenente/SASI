---
title: README_SYNC
origin: /home/dr/Downloads/Files_to_claudecode/SASI_codigo_fonte/sasi_backup_temp/README_SYNC.md
ingested: 2026-06-24
kind: source-text
---
# 🪖 SASI — Sincronização de Código-Fonte
**Data:** 26 de Abril de 2026 - 09:15 ZULU  
**Operação:** Backup Local do Sistema Comando UTI Alpha

---

## 📋 Arquivos Sincronizados

### 📁 Estrutura Esperada
```
SASI_codigo_fonte/
├── README_SYNC.md                    (este arquivo)
├── _HANDOFF_BRIEFING.md              (briefing completo)
├── docs/
│   ├── 01-schema-eventos-clinicos.md
│   ├── 02-extraction-dictionary.md
│   ├── 03-clinical-sanity-checks.md
│   ├── 04-export-evolucao-template.md
│   ├── 05-export-passagem-turno.md
│   ├── 06-api-automation-prompts.md
│   ├── README-FASE-BRAVO.md
│   └── README.md
├── src/
│   ├── lib/
│   │   ├── calculations/
│   │   ├── constants/
│   │   ├── dictionaries/
│   │   ├── guards/
│   │   ├── scores/
│   │   ├── types/
│   │   ├── alerts/
│   │   └── __tests__/
│   ├── hooks/
│   │   ├── useSupabasePatients.ts
│   │   └── useClinicalAlerts.ts
│   ├── supabaseClient.ts
│   └── firebase-to-supabase.ts
├── supabase/
│   ├── schema.sql
│   ├── smoke.sql
│   └── functions/
│       ├── ocr-ingest/
│       │   └── index.ts (README.md dentro)
│       └── (outras Edge Functions)
├── assets/
│   └── payload-example.json
└── .env.local (NÃO SINCRONIZADO — gere localmente)
```

---

## ✅ Status de Sincronização

| Arquivo | Linhas | Status |
|---------|--------|--------|
| _HANDOFF_BRIEFING.md | 284 | ✅ |
| docs/01-schema-eventos-clinicos.md | ~150 | ✅ |
| docs/02-extraction-dictionary.md | ~200 | ✅ |
| docs/03-clinical-sanity-checks.md | ~150 | ✅ |
| docs/04-export-evolucao-template.md | ~180 | ✅ |
| docs/05-export-passagem-turno.md | ~150 | ✅ |
| docs/06-api-automation-prompts.md | ~250 | ✅ |
| docs/README-FASE-BRAVO.md | ~200 | ✅ |
| docs/README.md | ~100 | ✅ |
| src/lib/**/* | 26 arquivos | ⏳ |
| src/hooks/useSupabasePatients.ts | 450 | ✅ |
| src/hooks/useClinicalAlerts.ts | 200 | ✅ |
| src/supabaseClient.ts | ~80 | ✅ |
| src/firebase-to-supabase.ts | ~350 | ✅ |
| supabase/schema.sql | 872 | ✅ |
| supabase/smoke.sql | ~300 | ✅ |
| assets/payload-example.json | ~100 | ✅ |

---

## 🚀 Como Usar Este Backup

### 1. **Setup Inicial**
```bash
# Na raiz do seu projeto local
cp -r ~/Documents/SASI_codigo_fonte/src/* ./src/
cp -r ~/Documents/SASI_codigo_fonte/supabase/* ./supabase/
cp -r ~/Documents/SASI_codigo_fonte/docs/* ./docs/
cp ~/Documents/SASI_codigo_fonte/_HANDOFF_BRIEFING.md ./
```

### 2. **Deploy do Schema Supabase**
```bash
# Via CLI
supabase db push < supabase/schema.sql

# Ou no SQL Editor em https://supabase.com/dashboard/project/idswehsvvqczzkiatuzu/sql/new
# Copiar e colar o conteúdo completo de schema.sql
```

### 3. **Instalação de Dependências**
```bash
npm install
# ou yarn / pnpm
```

### 4. **Configuração de Variáveis de Ambiente**
Crie `.env.local` na raiz:
```env
VITE_SUPABASE_URL=https://idswehsvvqczzkiatuzu.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_[REDACTED]
VITE_GEMINI_API_KEY=*** (obter de https://ai.google.dev)
```

---

## 🔧 Próximos Passos Recomendados

1. **Verificar integridade do schema:**
   ```bash
   supabase db lint < supabase/schema.sql
   ```

2. **Rodar smoke tests:**
   ```bash
   psql $DATABASE_URL < supabase/smoke.sql
   ```

3. **Deploy de Edge Functions:**
   ```bash
   supabase functions deploy ocr-ingest
   ```

4. **Testar pipeline completo:**
   - Subir app: `npm run dev`
   - Testar ingesta via POST em `/functions/v1/ocr-ingest`
   - Verificar dados em `supabase.co/dashboard`

---

## 📞 Suporte

**Dúvidas sobre a estrutura?** Leia `_HANDOFF_BRIEFING.md` seção 6 (Regras de Ouro).

**Erros de deploy?** Confira `supabase/smoke.sql` para diagnosticar.

**Precisa atualizar?** Mantém este arquivo sincronizado com mudanças no projeto remoto.

---

**Gerado automaticamente pelo Claude**  
Operação SASI — Comando UCI Alpha 🪖
