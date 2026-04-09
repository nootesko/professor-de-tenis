"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import {
  bumpAttempts, clearAttempts, isLocked, lockedUntil, MAX_ATTEMPTS, getAttempts,
  getAlunoSession, setAlunoSession,
} from "@/lib/aluno-creds";
import { Button } from "@/components/ui";
import { Trophy, Eye, EyeOff } from "lucide-react";

export default function PerfilAlunoLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { alunoCreds } = useStore();
  const authLogin = useAuth((s) => s.login);
  const [user, setUser] = useState(params.get("user") ?? "");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockRemaining, setLockRemaining] = useState(0);

  useEffect(() => {
    const id = getAlunoSession();
    if (id) router.replace(`/perfil-aluno/${id}`);
  }, [router]);

  useEffect(() => {
    if (!isLocked()) return;
    const tick = () => {
      const ms = Math.max(0, lockedUntil() - Date.now());
      setLockRemaining(ms);
      if (ms === 0) clearAttempts();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [error]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isLocked()) {
      setError(`Muitas tentativas. Aguarde ${Math.ceil(lockRemaining / 1000)}s.`);
      return;
    }
    const match = alunoCreds.find((c) => c.user === user.trim().toLowerCase() && c.senha === senha);
    if (!match) {
      const n = bumpAttempts();
      if (n >= MAX_ATTEMPTS) {
        setError(`Bloqueado por 30 segundos após ${MAX_ATTEMPTS} tentativas.`);
      } else {
        setError(`Usuário ou senha inválidos. Tentativa ${n}/${MAX_ATTEMPTS}.`);
      }
      return;
    }
    clearAttempts();
    setAlunoSession(match.alunoId);
    authLogin("aluno", match.alunoId);
    router.replace(`/perfil-aluno/${match.alunoId}`);
  };

  const locked = lockRemaining > 0;

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md rounded-card bg-white p-8 shadow-card animate-scale-in">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand">
            <Trophy size={26} className="text-brand-lime" />
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold text-brand">Acesso ao perfil</h1>
          <p className="text-xs text-ink-500">Entre com as credenciais fornecidas pela escola.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Usuário</label>
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              autoFocus
              className="input"
              placeholder="seu.usuario"
              disabled={locked}
            />
          </div>
          <div>
            <label className="label">Senha</label>
            <div className="relative">
              <input
                type={showSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input pr-10"
                placeholder="••••••"
                disabled={locked}
              />
              <button
                type="button"
                onClick={() => setShowSenha((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-brand"
                aria-label="Mostrar senha"
              >
                {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {locked && (
            <p className="text-xs text-ink-500">
              Reabrindo em {Math.ceil(lockRemaining / 1000)}s
            </p>
          )}
          <Button type="submit" className="w-full" disabled={locked}>Entrar</Button>
          {!locked && getAttempts() > 0 && (
            <p className="text-center text-[10px] text-ink-500">
              Tentativas: {getAttempts()}/{MAX_ATTEMPTS}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
