"use client";
import { Search, ChevronDown, ChevronRight, X, User, Users, Trophy, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/lib/store";
import { useAuth, ADMIN_PROFILE } from "@/lib/auth";
import { BrandMark } from "@/components/ui";
import { ROUTE_LABELS } from "@/components/nav";

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
  const { alunos, professores, turmas, niveis } = useStore(
    useShallow((s) => ({ alunos: s.alunos, professores: s.professores, turmas: s.turmas, niveis: s.niveis })),
  );
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
          Nenhum resultado para <span className="font-medium text-brand">“{q}”</span>
        </div>
      );
    }
    return grouped.map(({ group, items }) => (
      <div key={group}>
        <div className="sticky top-0 bg-soft px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
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
                // eslint-disable-next-line @next/next/no-img-element
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
              <ChevronRight size={14} className="text-ink-300" />
            </button>
          );
        })}
      </div>
    ));
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line-strong bg-white px-4 sm:px-6 lg:px-8">
      <Link href="/dashboard" aria-label="Ir para o Dashboard" className="md:hidden"><BrandMark compact /></Link>
      <Breadcrumb />
      <div ref={wrapRef} className="relative ml-auto hidden w-full max-w-sm md:block">
        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={open && !!q.trim()}
          aria-controls="busca-resultados"
          aria-label="Pesquisar alunos, professores, turmas e níveis"
          placeholder="Pesquisar..."
          className="h-10 w-full rounded-pill border border-line-strong bg-soft pl-10 pr-10 text-sm placeholder:text-ink-300 focus:border-brand focus:bg-white focus:outline-none"
        />
        {q && (
          <button
            type="button"
            onClick={() => { setQ(""); setOpen(false); }}
            className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-ink-500 hover:bg-brand-mint2 hover:text-brand"
            aria-label="Limpar busca"
          >
            <X size={14} />
          </button>
        )}

        {open && q.trim() && (
          <div id="busca-resultados" className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-[70vh] overflow-y-auto rounded-panel border border-line-strong bg-white shadow-soft animate-scale-in">
            {renderResults()}
            <div className="border-t border-line px-4 py-2 text-[10px] text-ink-500">
              <kbd className="rounded border border-line bg-white px-1">↑</kbd>{" "}
              <kbd className="rounded border border-line bg-white px-1">↓</kbd> navegar ·{" "}
              <kbd className="rounded border border-line bg-white px-1">Enter</kbd> abrir ·{" "}
              <kbd className="rounded border border-line bg-white px-1">Esc</kbd> fechar
            </div>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Pesquisar"
        className="ml-auto grid h-10 w-10 place-items-center rounded-full text-brand hover:bg-soft md:hidden"
      >
        <Search size={18} />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white animate-fade-in md:hidden" role="dialog" aria-modal="true" aria-label="Pesquisar">
          <div className="flex items-center gap-2 border-b border-line px-3 py-3">
            <button
              type="button"
              onClick={() => { setMobileOpen(false); setQ(""); }}
              aria-label="Fechar busca"
              className="grid h-10 w-10 place-items-center rounded-full text-brand hover:bg-soft"
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
                aria-label="Pesquisar alunos, professores, turmas e níveis"
                placeholder="Pesquisar..."
                className="h-11 w-full rounded-pill border border-line-strong bg-white pl-10 pr-10 text-base placeholder:text-ink-300 focus:border-brand focus:outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">{renderResults()}</div>
        </div>
      )}

      <UserMenu />
    </header>
  );
}

function Breadcrumb() {
  const path = usePathname();
  const { alunos, professores, turmas, niveis } = useStore(
    useShallow((s) => ({ alunos: s.alunos, professores: s.professores, turmas: s.turmas, niveis: s.niveis })),
  );
  const segs = path.split("/").filter(Boolean);
  const names: Record<string, { id: string; nome: string }[]> = { alunos, professores, turmas, niveis, aulas: turmas };
  const parts = segs.map((seg, i) => {
    const entity = names[segs[i - 1]]?.find((e) => e.id === seg);
    return { label: entity?.nome ?? ROUTE_LABELS[seg] ?? seg, href: "/" + segs.slice(0, i + 1).join("/") };
  });
  return (
    <nav aria-label="Você está em" className="hidden min-w-0 items-center gap-1.5 truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-500 md:flex">
      <Link href="/dashboard" className="hover:text-brand">Início</Link>
      {parts.map((p, i) => (
        <span key={p.href} className="flex min-w-0 items-center gap-1.5">
          <span className="text-brand-green">/</span>
          {i === parts.length - 1 ? (
            <span aria-current="page" className="truncate text-ink-900">{p.label}</span>
          ) : (
            <span className="truncate">{p.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function UserMenu() {
  const router = useRouter();
  const logout = useAuth((s) => s.logout);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu da conta"
        className="flex items-center gap-1.5 rounded-pill p-1 pr-2 transition hover:bg-soft"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ADMIN_PROFILE.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
        <ChevronDown size={14} className="text-ink-500" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+8px)] z-30 w-64 rounded-panel border border-line-strong bg-white p-2 shadow-soft animate-scale-in">
          <div className="px-3 py-2">
            <div className="text-sm font-semibold text-ink-900">{ADMIN_PROFILE.nome}</div>
            <div className="truncate text-xs text-ink-500">{ADMIN_PROFILE.email}</div>
          </div>
          <div className="my-1 h-px bg-line" />
          <Link role="menuitem" href="/perfil" onClick={() => setOpen(false)} className="flex h-10 items-center gap-2 rounded-input px-3 text-sm font-medium text-ink-700 hover:bg-soft">
            <User size={16} /> Meu perfil
          </Link>
          <button role="menuitem" type="button" onClick={() => { logout(); router.push("/login"); }} className="flex h-10 w-full items-center gap-2 rounded-input px-3 text-sm font-medium text-red-600 hover:bg-red-50">
            <LogOut size={16} /> Sair
          </button>
        </div>
      )}
    </div>
  );
}
