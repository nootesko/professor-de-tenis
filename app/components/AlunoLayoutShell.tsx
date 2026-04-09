"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { getAlunoSession } from "@/lib/aluno-creds";
import { Crown, User, Trophy } from "lucide-react";
import { cn } from "@/lib/cn";
import AlunoLogoutButton from "@/components/AlunoLogoutButton";

export default function AlunoLayoutShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const { alunos } = useStore();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const isLogin = path === "/perfil-aluno/login";

  useEffect(() => {
    const id = getAlunoSession();
    setSessionId(id);
    setReady(true);
    if (!id && !isLogin) router.replace("/perfil-aluno/login");
  }, [isLogin, router]);

  useEffect(() => {
    const id = getAlunoSession();
    setSessionId(id);
  }, [path]);

  const aluno = sessionId ? alunos.find((a) => a.id === sessionId) : null;

  if (!ready) return null;

  if (isLogin) {
    return <div className="min-h-screen bg-brand-mint">{children}</div>;
  }

  if (!sessionId) return null;

  return (
    <div className="min-h-screen bg-brand-mint">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-line bg-white px-4 md:px-8">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand">
            <Trophy size={18} className="text-brand-lime" />
          </div>
          <div className="font-display text-sm font-bold leading-tight text-brand">
            Professor<br />DeTênis<span className="text-brand-lime2">.com</span>
          </div>
        </div>
        <nav className="flex items-center gap-1">
          <Link
            href="/perfil-aluno/ranking"
            className={cn(
              "flex items-center gap-2 rounded-pill px-4 py-2 text-sm font-semibold transition",
              path?.startsWith("/perfil-aluno/ranking") ? "bg-brand-lime2 text-brand-dark" : "text-ink-700 hover:bg-brand-mint2"
            )}
          >
            <Crown size={16} /> <span className="hidden sm:inline">Ranking</span>
          </Link>
          {aluno && (
            <Link
              href={`/perfil-aluno/${aluno.id}`}
              className={cn(
                "flex items-center gap-2 rounded-pill px-4 py-2 text-sm font-semibold transition",
                path === `/perfil-aluno/${aluno.id}` ? "bg-brand-lime2 text-brand-dark" : "text-ink-700 hover:bg-brand-mint2"
              )}
            >
              <User size={16} /> <span className="hidden sm:inline">Meu perfil</span>
            </Link>
          )}
          <AlunoLogoutButton />
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-10">{children}</main>
    </div>
  );
}
