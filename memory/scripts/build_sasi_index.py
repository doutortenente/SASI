#!/usr/bin/env python3
"""Indexa toda a arvore do SASI e materializa em SQLite (memory/sasi_index.db).

Doutrina ZERO ALUCINACAO: so registra fato lido do disco. Nada inferido sem regra explicita.
Ao final, regenera MAPA-SASI.md a partir da base (evita drift manual).

Uso (da raiz do repo): python3 memory/scripts/build_sasi_index.py
"""
import datetime
import os
import re
import sqlite3

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB = os.path.join(ROOT, "memory", "sasi_index.db")
MAPA = os.path.join(ROOT, "memory", "MAPA-SASI.md")
SKIP_DIRS = {".git", "node_modules"}
SKIP_FILES = {"sasi_index.db", "sasi_index.db.bak"}
TEXT_EXT = {
    ".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".sql", ".css", ".scss", ".html",
    ".txt", ".yml", ".yaml", ".toml", ".sh", ".py", ".env", ".example", ".mjs", ".cjs",
    ".svg", ".gitignore", ".editorconfig", ".lock", ".map",
}

CAT_LABELS = {
    "frontend_src": "App React+Vite+TS — `frontend/src/`",
    "design_system": "Tokens, componentes, guidelines — `design-system/`",
    "frontend_config": "Configs do front (package-lock, vite, tsconfig)",
    "mcp_config": "Config do MCP server",
    "build_artifact": "**Ruído gerado** — `dist/` de front e mcp",
    "docs": "Documentação — `docs/`",
    "mcp_src": "Código-fonte MCP — `mcp-server/src/`",
    "doctrine": "Doutrina clínica/arquitetura — `doctrine/`",
    "supabase_config": "Config Supabase (config.toml, seed)",
    "root_config": "CLAUDE.md, README, .env.example, .mcp.json",
    "edge_function": "Edge Functions Deno — `supabase/functions/`",
    "db_migration": "Migrations SQL — `supabase/migrations/`",
    "ide_config": "`.idea/` (WebStorm)",
    "ci": "GitHub Actions — `.github/workflows/`",
    "project_memory": "Esta pasta `memory/`",
    "claude_config": "`.claude/` (rules)",
    "frontend_public": "`frontend/public/`",
    "other": "Sem categoria (revisar regras)",
}


def categorize(rel):
    p = rel.replace("\\", "/")
    rules = [
        (r"^frontend/src/", "frontend_src"),
        (r"^frontend/dist/", "build_artifact"),
        (r"^frontend/public/", "frontend_public"),
        (r"^frontend/", "frontend_config"),
        (r"^mcp-server/src/", "mcp_src"),
        (r"^mcp-server/dist/", "build_artifact"),
        (r"^mcp-server/", "mcp_config"),
        (r"^supabase/migrations/", "db_migration"),
        (r"^supabase/functions/", "edge_function"),
        (r"^supabase/", "supabase_config"),
        (r"^doctrine/", "doctrine"),
        (r"^docs/", "docs"),
        (r"^design-system/", "design_system"),
        (r"^\.design-sync/", "design_system"),
        (r"^\.claude/", "claude_config"),
        (r"^memory/", "project_memory"),
        (r"^\.github/", "ci"),
        (r"^\.idea/", "ide_config"),
    ]
    for rx, cat in rules:
        if re.search(rx, p):
            return cat
    if "/" not in p:
        return "root_config"
    return "other"


def is_text(path, ext):
    if ext in TEXT_EXT:
        return True
    try:
        with open(path, "rb") as f:
            chunk = f.read(1024)
        if b"\x00" in chunk:
            return False
        chunk.decode("utf-8")
        return True
    except OSError:
        return False


def count_lines(path):
    try:
        with open(path, "rb") as f:
            return sum(1 for _ in f)
    except OSError:
        return None


def scan_files():
    rows = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fn in filenames:
            if fn in SKIP_FILES:
                continue
            full = os.path.join(dirpath, fn)
            if os.path.islink(full):
                continue
            try:
                st = os.stat(full)
            except OSError:
                continue
            rel = os.path.relpath(full, ROOT)
            ext = os.path.splitext(fn)[1].lower() or (fn.lower() if fn.startswith(".") else "")
            cat = categorize(rel)
            txt = is_text(full, ext)
            lines = count_lines(full) if (txt and st.st_size < 5_000_000) else None
            reldir = os.path.dirname(rel) or "."
            rows.append((
                rel, reldir, fn, ext, st.st_size, lines, int(txt),
                datetime.datetime.fromtimestamp(st.st_mtime).isoformat(timespec="seconds"), cat,
            ))
    return rows


def build_db(rows):
    os.makedirs(os.path.dirname(DB), exist_ok=True)
    if os.path.exists(DB):
        os.rename(DB, DB + ".bak")
    con = sqlite3.connect(DB)
    c = con.cursor()
    c.execute("""create table files(
      id integer primary key, path text unique, dir text, name text, ext text,
      size_bytes integer, lines integer, is_text integer, mtime text, category text)""")
    c.executemany(
        "insert into files(path,dir,name,ext,size_bytes,lines,is_text,mtime,category) values(?,?,?,?,?,?,?,?,?)",
        rows,
    )
    c.execute("""create table dirs as
      select dir, count(*) file_count, sum(size_bytes) total_bytes, sum(coalesce(lines,0)) total_lines
      from files group by dir""")
    c.execute(
        "create view categorias as select category, count(*) arquivos, sum(size_bytes) bytes, "
        "sum(coalesce(lines,0)) linhas from files group by category order by linhas desc"
    )
    c.execute("create index idx_files_cat on files(category)")
    c.execute("create index idx_files_ext on files(ext)")
    c.execute("create index idx_files_path on files(path)")
    con.commit()
    return con, c


def write_mapa(c, today):
    tot_files, tot_bytes, tot_lines = c.execute(
        "select count(*), sum(size_bytes), sum(coalesce(lines,0)) from files"
    ).fetchone()
    cats = c.execute("select * from categorias").fetchall()
    top_code = c.execute(
        "select path, lines, category from files where is_text=1 and lines is not null "
        "and category not in ('build_artifact','frontend_config','mcp_config') "
        "order by lines desc limit 8"
    ).fetchall()
    frontend_dirs = c.execute(
        "select dir, count(*), sum(lines) from files where category='frontend_src' "
        "group by dir order by sum(lines) desc"
    ).fetchall()
    memory_docs = c.execute(
        "select path, lines from files where category='project_memory' and ext='.md' order by path"
    ).fetchall()
    other = c.execute("select path from files where category='other'").fetchall()

    lines = [
        "# MAPA DO SASI — inventário do repositório",
        "",
        f"> Gerado automaticamente em {today} por `memory/scripts/build_sasi_index.py`.",
        "> Fonte de verdade: `sasi_index.db` (SQLite). Doutrina ZERO ALUCINAÇÃO: só fato lido do disco.",
        "> Regenerar: `python3 memory/scripts/build_sasi_index.py` (a partir da raiz do repo).",
        "",
        f"**Total:** {tot_files} arquivos · {tot_bytes / 1024 / 1024:.1f} MB · {tot_lines:,} linhas "
        "(excluídos `.git`, `node_modules`, `sasi_index.db`).",
        "",
        "## Por categoria",
        "",
        "| Categoria | Arq | Linhas | O que é |",
        "|---|---:|---:|---|",
    ]
    for cat, n, _b, l in cats:
        label = CAT_LABELS.get(cat, cat)
        lines.append(f"| `{cat}` | {n} | {l or 0:,} | {label} |")

    lines += [
        "",
        "## Núcleo (sem build_artifact nem lock files)",
        "",
        "### `frontend/src/` — por diretório",
        "",
        "| Diretório | Arq | Linhas |",
        "|---|---:|---:|",
    ]
    for d, n, l in frontend_dirs:
        lines.append(f"| `{d}` | {n} | {l or 0:,} |")

    lines += ["", "### Maiores arquivos de código/texto", ""]
    for path, l, cat in top_code:
        lines.append(f"- `{path}` — {l:,} linhas (`{cat}`)")

    lines += [
        "",
        "### Outros núcleos",
        "",
        "- **MCP** → `mcp-server/src/` — ponte skills→MCP→Supabase",
        "- **Backend** → `supabase/migrations/` + `supabase/functions/`",
        "- **Motor clínico v2** → `docs/motor-clinico-v2/`",
        "- **Design system** → `design-system/` (inclui fonts .woff/.woff2 sem contagem de linhas)",
        "",
        "## Memória do projeto (`memory/`)",
        "",
    ]
    for path, l in memory_docs:
        lines.append(f"- `{path}` — {l or 0} linhas")

    lines += [
        "",
        "## Consultas úteis",
        "",
        "```bash",
        "# Resumo por categoria",
        "python3 memory/scripts/query_sasi_index.py categorias",
        "",
        "# Top arquivos por linhas",
        "python3 memory/scripts/query_sasi_index.py top --n 15",
        "",
        "# Buscar path",
        "python3 memory/scripts/query_sasi_index.py find FichaCompleta",
        "```",
        "",
        "Tabelas SQLite: `files`, `dirs`, view `categorias`.",
        "Sync remoto (opcional): `python3 memory/scripts/push_repo_index_to_postgres.py` → schema `repo_index` no Supabase.",
    ]
    if other:
        lines += ["", "## ⚠️ Categoria `other` (revisar regras)", ""]
        for (path,) in other:
            lines.append(f"- `{path}`")

    with open(MAPA, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def main():
    today = datetime.date.today().strftime("%d-%b-%Y").lower()
    rows = scan_files()
    con, c = build_db(rows)

    tot_files, tot_bytes, tot_lines = c.execute(
        "select count(*), sum(size_bytes), sum(coalesce(lines,0)) from files"
    ).fetchone()
    print(f"DB: {DB}")
    print(f"TOTAL: {tot_files} arquivos | {tot_bytes / 1024:.0f} KB | {tot_lines} linhas\n")
    print("=== POR CATEGORIA ===")
    print(f"{'categoria':<18}{'arq':>5}{'KB':>8}{'linhas':>9}")
    for cat, n, b, l in c.execute("select * from categorias"):
        print(f"{cat:<18}{n:>5}{(b or 0) / 1024:>8.0f}{l or 0:>9}")

    write_mapa(c, today)
    print(f"\nMAPA: {MAPA}")
    con.close()
    print("OK")


if __name__ == "__main__":
    main()