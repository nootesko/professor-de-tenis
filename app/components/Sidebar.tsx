"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, MoreHorizontal, X, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { BrandMark } from "@/components/ui";
import { NAV_GROUPS, NAV_ITEMS, isActive } from "@/components/nav";

const MOBILE_PRIMARY = ["/dashboard", "/alunos", "/turmas", "/premios"];

function useLogout() {
  const router = useRouter();
  const logout = useAuth((s) => s.logout);
  return () => {
    logout();
    router.push("/login");
  };
}

/** Item de navegação: pílula; no modo trilho (md–lg) mostra só o ícone. */
function NavLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: React.ElementType; active: boolean }) {
  return (
    <Link
      href={href}
      title={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-pill px-3 text-[0.9375rem] font-medium transition-colors md:justify-center lg:justify-start lg:px-4",
        active ? "bg-brand-tint text-brand-dark" : "text-ink-700 hover:bg-soft hover:text-ink-900",
      )}
    >
      <Icon size={18} className={cn("shrink-0", active && "text-brand")} />
      <span className="md:sr-only lg:not-sr-only">{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const path = usePathname();
  const handleLogout = useLogout();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => { setMoreOpen(false); }, [path]);
  useEffect(() => {
    if (!moreOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMoreOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [moreOpen]);

  const primary = NAV_ITEMS.filter((i) => MOBILE_PRIMARY.includes(i.href));
  const more = NAV_ITEMS.filter((i) => !MOBILE_PRIMARY.includes(i.href));

  return (
    <>
      {/* Desktop: trilho de ícones (md) → sidebar completa (lg) */}
      <aside className="hidden w-[72px] shrink-0 flex-col border-r border-line-strong bg-white md:flex lg:w-[264px]">
        <div className="flex h-16 items-center border-b border-line px-4 md:justify-center lg:justify-start lg:px-5">
          <Link href="/dashboard" aria-label="Ir para o Dashboard">
            <span className="lg:hidden"><BrandMark compact /></span>
            <span className="hidden lg:block"><BrandMark /></span>
          </Link>
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto p-3" aria-label="Navegação principal">
          {NAV_GROUPS.map((g) => (
            <div key={g.label}>
              <div className="caps mb-1.5 hidden px-4 text-[10px] lg:block">{g.label}</div>
              <div className="space-y-0.5">
                {g.items.map((it) => <NavLink key={it.href} {...it} active={isActive(path, it.href)} />)}
              </div>
            </div>
          ))}
        </nav>
        <div className="space-y-0.5 border-t border-line p-3">
          <NavLink href="/perfil" label="Meu perfil" icon={UserRound} active={isActive(path, "/perfil")} />
          <button
            type="button"
            onClick={handleLogout}
            title="Sair"
            className="flex min-h-11 w-full items-center gap-3 rounded-pill px-3 text-[0.9375rem] font-medium text-ink-700 transition-colors hover:bg-red-50 hover:text-red-600 md:justify-center lg:justify-start lg:px-4"
          >
            <LogOut size={18} className="shrink-0" />
            <span className="md:sr-only lg:not-sr-only">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile: barra inferior */}
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-30 grid h-16 grid-cols-5 border-t border-line-strong bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {primary.map((it) => {
          const active = isActive(path, it.href);
          const Icon = it.icon;
          return (
            <Link key={it.href} href={it.href} aria-current={active ? "page" : undefined}
              className={cn("flex flex-col items-center justify-center gap-0.5", active ? "text-brand" : "text-ink-500")}>
              <Icon size={20} />
              <span className="text-[10px] font-semibold">{it.label}</span>
            </Link>
          );
        })}
        <button type="button" onClick={() => setMoreOpen(true)} aria-expanded={moreOpen}
          className={cn("flex flex-col items-center justify-center gap-0.5", moreOpen ? "text-brand" : "text-ink-500")}>
          <MoreHorizontal size={20} />
          <span className="text-[10px] font-semibold">Mais</span>
        </button>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Mais opções">
          <div className="absolute inset-0 bg-ink-900/60 animate-fade-in" onClick={() => setMoreOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[24px] bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-4 animate-scale-in">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line-strong" />
            <div className="mb-2 flex items-center justify-between px-3">
              <span className="caps">Mais opções</span>
              <button onClick={() => setMoreOpen(false)} aria-label="Fechar" className="grid h-9 w-9 place-items-center rounded-full hover:bg-soft">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-0.5">
              {more.map((it) => {
                const Icon = it.icon;
                const active = isActive(path, it.href);
                return (
                  <Link key={it.href} href={it.href}
                    className={cn("flex h-12 items-center gap-3 rounded-pill px-4 text-sm font-medium", active ? "bg-brand-tint text-brand-dark" : "text-ink-700 hover:bg-soft")}>
                    <Icon size={18} /> {it.label}
                  </Link>
                );
              })}
              <Link href="/perfil" className="flex h-12 items-center gap-3 rounded-pill px-4 text-sm font-medium text-ink-700 hover:bg-soft">
                <UserRound size={18} /> Meu perfil
              </Link>
              <button onClick={handleLogout} className="flex h-12 w-full items-center gap-3 rounded-pill px-4 text-sm font-medium text-red-600 hover:bg-red-50">
                <LogOut size={18} /> Sair da conta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
