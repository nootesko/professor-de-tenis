"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { LayoutDashboard, Users, GraduationCap, Layers, Trophy, Star, LogOut, ClipboardCheck, MoreHorizontal, X, User } from "lucide-react";
import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/alunos", label: "Alunos", icon: Users },
  { href: "/professores", label: "Professores", icon: GraduationCap },
  { href: "/turmas", label: "Turmas", icon: Layers },
  { href: "/niveis", label: "Níveis", icon: Star },
  { href: "/premios", label: "Prêmios", icon: Trophy },
  { href: "/avaliacoes", label: "Avaliações", icon: ClipboardCheck },
];

const MOBILE_PRIMARY = items.slice(0, 5); // Dashboard, Alunos, Professores, Turmas, Níveis
const MOBILE_MORE = items.slice(5); // Prêmios, Avaliações (overflow real)

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const logoutAuth = useAuth((s) => s.logout);
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logoutAuth();
    router.push("/login");
  };
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => { setMoreOpen(false); }, [path]);
  useEffect(() => {
    document.body.style.overflow = moreOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [moreOpen]);
  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[230px] flex-col bg-brand text-white md:flex">
        <div className="flex h-20 items-center gap-2 px-6">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/10">
            <Trophy className="text-brand-lime" size={22} />
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold">Professor</div>
            <div className="font-display text-sm font-bold">DeTênis<span className="text-brand-lime">.com</span></div>
          </div>
        </div>
        <nav className="mt-4 flex-1 space-y-1 px-3">
          {items.map((it) => {
            const active = path === it.href || path.startsWith(it.href + "/");
            const Icon = it.icon;
            return (
              <Link key={it.href} href={it.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  active ? "bg-brand-tint text-brand-dark" : "text-white/85 hover:bg-white/10"
                )}>
                {active && <span className="absolute -left-3 top-1.5 bottom-1.5 w-1 rounded-r bg-brand-lime" />}
                <Icon size={18} />{it.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={handleLogout} className="m-3 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/10">
          <LogOut size={18} /> Sair
        </button>
      </aside>
      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-line bg-brand pb-[env(safe-area-inset-bottom)] pt-2 md:hidden">
        {MOBILE_PRIMARY.map((it) => {
          const active = path === it.href || path.startsWith(it.href + "/");
          const Icon = it.icon;
          return (
            <Link key={it.href} href={it.href} className={cn("flex flex-col items-center gap-0.5 rounded-lg p-2 transition", active ? "text-brand-lime" : "text-white/80 hover:text-white")}>
              <Icon size={20} />
              <span className="text-[10px] font-medium">{it.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={cn("flex flex-col items-center gap-0.5 rounded-lg p-2 transition", moreOpen ? "text-brand-lime" : "text-white/80 hover:text-white")}
          aria-label="Mais opções"
        >
          <MoreHorizontal size={20} />
          <span className="text-[10px] font-medium">Mais</span>
        </button>
      </nav>

      {/* Mobile "More" drawer */}
      {moreOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setMoreOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-soft animate-slide-down" style={{ animationName: "scale-in" }}>
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
            <div className="mb-2 flex items-center justify-between px-2">
              <div className="font-display text-sm font-bold text-brand">Mais opções</div>
              <button onClick={() => setMoreOpen(false)} aria-label="Fechar" className="grid h-8 w-8 place-items-center rounded-full hover:bg-brand-mint2">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MOBILE_MORE.map((it) => {
                const active = path === it.href || path.startsWith(it.href + "/");
                const Icon = it.icon;
                return (
                  <Link key={it.href} href={it.href} className={cn("flex flex-col items-center gap-2 rounded-card border border-line p-4 transition", active ? "border-brand bg-brand-mint2 text-brand" : "text-ink-700 hover:bg-brand-mint2")}>
                    <Icon size={22} />
                    <span className="text-xs font-medium">{it.label}</span>
                  </Link>
                );
              })}
              <Link href="/perfil" className="flex flex-col items-center gap-2 rounded-card border border-line p-4 text-ink-700 hover:bg-brand-mint2">
                <User size={22} />
                <span className="text-xs font-medium">Perfil</span>
              </Link>
              <button onClick={handleLogout} className="col-span-3 flex items-center justify-center gap-2 rounded-card bg-red-50 p-3 text-sm font-semibold text-red-600 hover:bg-red-100">
                <LogOut size={16} /> Sair da conta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
