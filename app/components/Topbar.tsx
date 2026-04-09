"use client";
import { Search, ChevronDown, X, User, GraduationCap, Users, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";

type Result = {
  id: string;
  href: string;
  label: string;
  sub?: string;
  group: "Alunos" | "Professores" | "Turmas" | "Níveis";
  avatar?: string;
  icon?: React.ReactNode;
};

const GROUP_ORDER: Result["group"][] = ["Alunos", "Professores", "Turmas", "Níveis"];

export default function Topbar() {
  const router = useRouter();
  const { alunos, professores, turmas, niveis } = useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const results = useMemo<Result[]>(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const out: Result[] = [];
    alunos.forEach((a) => {
      if (a.nome.toLowerCase().includes(term) || a.email?.toLowerCase().includes(term))
        out.push({ id: a.id, href: `/alunos/${a.id}`, label: a.nome, sub: a.email, group: "Alunos", avatar: a.avatar });
    });
    professores.forEach((p) => {
      if (p.nome.toLowerCase().includes(term) || p.especialidade?.toLowerCase().includes(term))
        out.push({ id: p.id, href: `/professores/${p.id}`, label: p.nome, sub: p.especialidade, group: "Professores", avatar: p.avatar });
    });
    turmas.forEach((t) => {
      if (t.nome.toLowerCase().includes(term) || t.diaSemana?.toLowerCase().includes(term))
        out.push({ id: t.id, href: `/turmas/${t.id}`, label: t.nome, sub: `${t.diaSemana} · ${t.horario}`, group: "Turmas", icon: <Users size={16} /> });
    });
    niveis.forEach((n) => {
      if (n.nome.toLowerCase().includes(term))
        out.push({ id: n.id, href: `/niveis/${n.id}`, label: n.nome, group: "Níveis", icon: <Trophy size={16} /> });
    });
    return out.slice(0, 20);
  }, [q, alunos, professores, turmas, niveis]);

  const grouped = useMemo(() => {
    const map = new Map<Result["group"], Result[]>();
    results.forEach((r) => {
      if (!map.has(r.group)) map.set(r.group, []);
      map.get(r.group)!.push(r);
    });
    return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({ group: g, items: map.get(g)! }));
  }, [results]);

  useEffect(() => { setActiveIdx(0); }, [q]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const go = (r: Result) => {
    router.push(r.href);
    setOpen(false);
    setMobileOpen(false);
    setQ("");
  };

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => mobileInputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && results[activeIdx]) { e.preventDefault(); go(results[activeIdx]); }
    else if (e.key === "Escape") { setOpen(false); }
  };

  const renderResults = () => {
    let flat = -1;
    if (!q.trim()) {
      return (
        <div className="px-4 py-10 text-center text-sm text-ink-500">
          Comece a digitar para buscar alunos, professores, turmas e níveis.
        </div>
      );
    }
    if (results.length === 0) {
      return (
        <div className="px-4 py-8 text-center text-sm text-ink-500">
          Nenhum resultado para <span className="font-medium text-brand">"{q}"</span>
        </div>
      );
    }
    return grouped.map(({ group, items }) => (
      <div key={group}>
        <div className="sticky top-0 bg-brand-mint px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
          {group}
        </div>
        {items.map((r) => {
          flat++;
          const active = flat === activeIdx;
          return (
            <button
              key={`${group}-${r.id}`}
              type="button"
              onMouseEnter={() => setActiveIdx(results.indexOf(r))}
              onClick={() => go(r)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${active ? "bg-brand-mint2" : "hover:bg-brand-mint2/60"}`}
            >
              {r.avatar ? (
                <img src={r.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-mint2 text-brand">
                  {r.icon ?? <User size={16} />}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-ink-900">{r.label}</div>
                {r.sub && <div className="truncate text-xs text-ink-500">{r.sub}</div>}
              </div>
              <ChevronDown size={14} className="-rotate-90 text-ink-300" />
            </button>
          );
        })}
      </div>
    ));
  };

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-4 bg-brand-mint px-6 md:px-10">
      <div className="font-display text-sm font-semibold text-brand">Dashboards</div>
      <div ref={wrapRef} className="relative hidden max-w-md flex-1 md:block">
        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Pesquisar alunos, professores, turmas..."
          className="w-full rounded-pill border border-line bg-white py-2.5 pl-10 pr-10 text-sm placeholder:text-ink-300 focus:border-brand focus:outline-none"
        />
        {q && (
          <button
            type="button"
            onClick={() => { setQ(""); setOpen(false); }}
            className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-ink-400 hover:bg-brand-mint2 hover:text-brand"
            aria-label="Limpar"
          >
            <X size={14} />
          </button>
        )}

        {open && q.trim() && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-[70vh] overflow-y-auto rounded-card border border-line bg-white shadow-soft animate-scale-in">
            {renderResults()}
            <div className="border-t border-line px-4 py-2 text-[10px] text-ink-400">
              <kbd className="rounded border border-line bg-white px-1">↑</kbd>{" "}
              <kbd className="rounded border border-line bg-white px-1">↓</kbd> navegar ·{" "}
              <kbd className="rounded border border-line bg-white px-1">Enter</kbd> abrir ·{" "}
              <kbd className="rounded border border-line bg-white px-1">Esc</kbd> fechar
            </div>
          </div>
        )}
      </div>
      {/* Mobile search trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Pesquisar"
        className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-white text-brand shadow-card transition hover:scale-105 active:scale-95 md:hidden"
      >
        <Search size={18} />
      </button>

      {/* Mobile fullscreen overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white animate-fade-in md:hidden">
          <div className="flex items-center gap-2 border-b border-line px-3 py-3">
            <button
              type="button"
              onClick={() => { setMobileOpen(false); setQ(""); }}
              aria-label="Fechar"
              className="grid h-10 w-10 place-items-center rounded-full text-brand hover:bg-brand-mint2"
            >
              <X size={20} />
            </button>
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
              <input
                ref={mobileInputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Pesquisar..."
                className="w-full rounded-pill border border-line bg-white py-2.5 pl-10 pr-10 text-sm placeholder:text-ink-300 focus:border-brand focus:outline-none"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-ink-400 hover:bg-brand-mint2 hover:text-brand"
                  aria-label="Limpar"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {renderResults()}
          </div>
        </div>
      )}

      <Link href="/perfil" className="ml-2 flex items-center gap-2 rounded-pill bg-white px-3 py-1.5 shadow-card">
        <img src="https://i.pravatar.cc/150?img=12" alt="" className="h-8 w-8 rounded-full" />
        <div className="hidden text-xs leading-tight md:block">
          <div className="text-ink-500">Bem vindo,</div>
          <div className="font-semibold text-brand">Prof Cássio</div>
        </div>
        <ChevronDown size={14} className="text-ink-500" />
      </Link>
    </header>
  );
}
