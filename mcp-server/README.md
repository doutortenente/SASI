# sasi-mcp-server

MCP Server do **SASI — Sistema de Auditoria e Síntese Intensiva**  
Banco: UTI2 (13) · UTI3 (13) · UTI4 (8 leitos)

Conecta o Claude (Desktop ou Claude Code) diretamente ao banco Supabase do SASI via stdio. Inclui **`sasi_deploy_ingest`** — persiste
payload `sasi-ocr-ingest/v1` completo (equivalente operacional ao Edge Function `ocr-ingest`). A evolução grava também `intercorrencias`, `prescricao`, `tipo_nota`, `illness_severity`, `turno` e `data_plantao`; sem `plantao` válido a ferramenta decide (pelo `turno`, ou pela hora de `data_evolucao` em São Paulo); nunca envia `plantao` nulo.

As tools operam sobre o schema real (pacientes, evolucoes, eventos_clinicos, pendencias, atbs, culturas,
antibiograma, alerts_log).

---

## Tools disponíveis (23)

| Tool                    | Descrição                                                                                          |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| `sasi_sitrep`           | Snapshot tático completo da UTI — tabela com todos os leitos, gravidade, SOFA, alertas, pendências |
| `sasi_deploy_ingest`    | Grava o payload `sasi-ocr-ingest/v1` (paciente, evolução, eventos, pendências) e registra em `ingest_audit_log` |
| `sasi_list_patients`    | Lista pacientes com filtros por UTI / gravidade / status                                           |
| `sasi_get_patient`      | Ficha completa: última evolução + ATBs ativos + culturas pendentes + alertas abertos               |
| `sasi_admit_patient`    | Admite novo paciente (leito, HD, SOFA baseline)                                      |
| `sasi_update_patient`   | Atualiza gravidade, status, isolamento                                               |
| `sasi_get_evolution`    | Última evolução (ou histórico) por sistemas + prescrição vigente                                   |
| `sasi_create_evolution` | Registra nova evolução SOAP + SOFA + kardex                                                        |
| `sasi_insert_event`     | Insere evento clínico pontual na série temporal (PAM, lactato, pH, etc.)                           |
| `sasi_get_timeseries`   | Série temporal de 1–10 parâmetros em janela de tempo                                               |
| `sasi_list_pendencias`  | Lista tarefas abertas — por paciente ou toda a UTI                                                 |
| `sasi_create_pendencia` | Cria pendência com prioridade                                                                      |
| `sasi_close_pendencia`  | Conclui pendência                                                                                  |
| `sasi_list_atbs`        | Lista ATBs ativos (com DTA calculado) ou histórico                                                 |
| `sasi_start_atb`        | Inicia novo ATB (droga, dose, via, intenção, foco, alvo)                                           |
| `sasi_stop_atb`         | Suspende ATB com motivo e data                                                                     |
| `sasi_list_culturas`    | Lista culturas com antibiograma embutido                                                           |
| `sasi_create_cultura`   | Registra nova cultura (coleta ou resultado)                                                        |
| `sasi_add_antibiograma` | Adiciona sensibilidade (S/I/R + CIM) a uma cultura                                                 |
| `sasi_update_cultura`   | Atualiza laudo de cultura existente                                                                |
| `sasi_list_alerts`      | Lista alertas ativos (não reconhecidos) por paciente ou UTI                                        |
| `sasi_ack_alert`        | Reconhece alerta individual                                                                        |
| `sasi_ack_all_alerts`   | Reconhece todos os alertas ativos (paciente ou UTI inteira)                                        |


O campo `dispositivos` é calculado pelo banco (a partir dos episódios de dispositivo, dos antibióticos e da última evolução). O servidor nunca o grava: `sasi_admit_patient`, `sasi_update_patient` e o `paciente_upsert` do `sasi_deploy_ingest` ainda aceitam o campo na entrada, mas o ignoram e devolvem um aviso. `sasi_update_patient` chamado só com `dispositivos` não toca no banco.

---

## Setup

### 1. Variáveis de ambiente

O servidor não lê o arquivo `.env` sozinho: ele só enxerga as duas variáveis abaixo se elas estiverem no ambiente de quem o inicia. O `.mcp.json` da raiz já passa as duas na hora de iniciar. `mcp-server/.env.example` serve de molde para anotar os nomes.

Encontre em: **Supabase Dashboard → Settings → API**

```
SUPABASE_URL=https://idswehsvvqczzkiatuzu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

Opcional: `SASI_OPERATOR_USER_ID` (gravado como `user_id` no registro de auditoria do ingest).

> **A chave `service_role` ignora o RLS (as regras de acesso por linha).** Use só localmente; nunca no app.

### 2. Build

```bash
cd mcp-server
npm install
npm run build
```

### 3. Ligar ao Claude

Claude Code: o `.mcp.json` da raiz já aponta para `mcp-server/dist/index.js` e lê a chave da variável de ambiente `SASI_SERVICE_ROLE_KEY`.

Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "sasi": {
      "command": "node",
      "args": ["C:/caminho/absoluto/SASI/mcp-server/dist/index.js"],
      "env": {
        "SUPABASE_URL": "https://idswehsvvqczzkiatuzu.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "sua_service_role_key_aqui"
      }
    }
  }
}
```

---

## Fluxo tático de uso

```
sasi_sitrep                     → visão geral da UTI
sasi_get_patient uti=UTI2 leito=L03 → ficha completa do leito
sasi_create_evolution           → registra evolução do turno
sasi_insert_event tipo=lactato  → atualiza série temporal
sasi_list_alerts                → confere alertas críticos
sasi_ack_all_alerts             → fecha fila de alertas
```

---

## Desenvolvimento

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run dev
npx @modelcontextprotocol/inspector node dist/index.js
```
