#!/usr/bin/env python3
"""Indexa toda a arvore do SASI e materializa em SQLite (~/dev/sasi/memory/sasi_index.db).
Doutrina ZERO ALUCINACAO: so registra fato lido do disco. Nada inferido sem regra explicita."""
import os, sqlite3, hashlib, re, datetime, sys

ROOT = "/home/dr/dev/sasi"
DB = os.path.join(ROOT, "memory", "sasi_index.db")
SKIP_DIRS = {".git", "node_modules"}
TEXT_EXT = {".ts",".tsx",".js",".jsx",".json",".md",".sql",".css",".scss",".html",
            ".txt",".yml",".yaml",".toml",".sh",".env",".example",".mjs",".cjs",
            ".svg",".gitignore",".editorconfig",".lock",".map"}

def categorize(rel):
    p = rel.replace("\\","/")
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
    except Exception:
        return False

def count_lines(path):
    try:
        with open(path, "rb") as f:
            return sum(1 for _ in f)
    except Exception:
        return None

rows = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
    for fn in filenames:
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
        rows.append((rel, reldir, fn, ext, st.st_size, lines, int(txt),
                     datetime.datetime.fromtimestamp(st.st_mtime).isoformat(timespec="seconds"), cat))

os.makedirs(os.path.dirname(DB), exist_ok=True)
if os.path.exists(DB):
    os.rename(DB, DB + ".bak")
con = sqlite3.connect(DB)
c = con.cursor()
c.execute("""create table files(
  id integer primary key, path text unique, dir text, name text, ext text,
  size_bytes integer, lines integer, is_text integer, mtime text, category text)""")
c.executemany("""insert into files(path,dir,name,ext,size_bytes,lines,is_text,mtime,category)
  values(?,?,?,?,?,?,?,?,?)""", rows)
c.execute("""create table dirs as
  select dir, count(*) file_count, sum(size_bytes) total_bytes, sum(coalesce(lines,0)) total_lines
  from files group by dir""")
c.execute("create view categorias as select category, count(*) arquivos, sum(size_bytes) bytes, sum(coalesce(lines,0)) linhas from files group by category order by linhas desc")
c.execute("create index idx_files_cat on files(category)")
c.execute("create index idx_files_ext on files(ext)")
con.commit()

def q(sql):
    return c.execute(sql).fetchall()

tot_files, tot_bytes, tot_lines = q("select count(*), sum(size_bytes), sum(coalesce(lines,0)) from files")[0]
print(f"DB: {DB}")
print(f"TOTAL: {tot_files} arquivos | {tot_bytes/1024:.0f} KB | {tot_lines} linhas\n")
print("=== POR CATEGORIA ===")
print(f"{'categoria':<18}{'arq':>5}{'KB':>8}{'linhas':>9}")
for cat, n, b, l in q("select * from categorias"):
    print(f"{cat:<18}{n:>5}{(b or 0)/1024:>8.0f}{l or 0:>9}")
print("\n=== TOP EXTENSOES (por nº arquivos) ===")
for ext, n, l in q("select ext, count(*), sum(coalesce(lines,0)) from files group by ext order by count(*) desc limit 12"):
    print(f"  {ext or '(sem)':<12}{n:>4} arq  {l or 0:>7} linhas")
print("\n=== 10 MAIORES ARQUIVOS DE CODIGO/TEXTO (por linhas) ===")
for path, l in q("select path, lines from files where is_text=1 and lines is not null order by lines desc limit 10"):
    print(f"  {l:>6}  {path}")
con.close()
print("\nOK")
