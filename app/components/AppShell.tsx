"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useAuth } from "@/lib/auth";

/**
 * Shell do painel (admin): sidebar + topbar fixas, `main` é a única área com rolagem.
 * Também protege as rotas: sem sessão de admin → /login.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const role = useAuth((s) => s.role);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => {
    if (hydrated && role !== "admin") router.replace("/login");
  }, [hydrated, role, router]);

  if (!hydrated || role !== "admin") return null;

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand">
        Pular para o conteúdo
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0">
        <Topbar />
        <main id="conteudo" className="flex flex-1 flex-col overflow-y-auto [scrollbar-gutter:stable]">
          {children}
        </main>
      </div>
    </div>
  );
}
