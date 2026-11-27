"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, ArrowRight, AlertCircle, Loader2, Trophy } from "lucide-react";
import { useAuth, ADMIN_USER, ADMIN_PASS } from "@/lib/auth";
import { cn } from "@/lib/cn";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Bola de tênis grande saindo da base do painel. As costuras giram devagar;
 * luz e sombra ficam paradas por cima, o que dá a sensação de bola girando no lugar.
 */
function TennisBall() {
  return (
    <div className="pdt-ball-wrap" aria-hidden="true">
      <svg viewBox="0 0 200 200" className="h-full w-full">
        <defs>
          <clipPath id="pdt-ball-clip">
            <circle cx="100" cy="100" r="100" />
          </clipPath>
          <radialGradient id="pdt-ball-felt" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d4ec3a" />
            <stop offset="100%" stopColor="#b6cd21" />
          </radialGradient>
          <radialGradient id="pdt-ball-light" cx="34%" cy="28%" r="75%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.28" />
            <stop offset="45%" stopColor="#fff" stopOpacity="0" />
            <stop offset="75%" stopColor="#0b2a20" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0b2a20" stopOpacity="0.45" />
          </radialGradient>
        </defs>
        <g clipPath="url(#pdt-ball-clip)">
          <circle cx="100" cy="100" r="100" fill="url(#pdt-ball-felt)" />
          <g className="pdt-ball-spin">
            {/* Costuras: duas curvas opostas, como na bola real */}
            <path d="M 22 4 C 92 50, 92 150, 22 196" fill="none" stroke="#f7f9ee" strokeWidth="6" strokeLinecap="round" />
            <path d="M 178 4 C 108 50, 108 150, 178 196" fill="none" stroke="#f7f9ee" strokeWidth="6" strokeLinecap="round" />
          </g>
          <circle cx="100" cy="100" r="100" fill="url(#pdt-ball-light)" />
        </g>
      </svg>
    </div>
  );
}

function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("grid h-10 w-10 place-items-center rounded-xl", onDark ? "bg-white/10" : "bg-brand-green")}>
        <Trophy size={20} className="text-brand-lime" />
      </div>
      <div className={cn("font-display text-[15px] font-bold leading-[1.1]", onDark ? "text-white" : "text-[#0b2a20]")}>
        Professor
        <br />
        DeTênis<span className={onDark ? "text-brand-lime" : "text-brand-green"}>.com</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState("admin");
  const [senha, setSenha] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [emailErr, setEmailErr] = useState("");
  const [credErr, setCredErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validUser = email === ADMIN_USER || EMAIL_RE.test(email);
  const canSubmit = email.trim().length > 0 && senha.length > 0 && !emailErr && !loading;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setCredErr("");
    if (!validUser) {
      setEmailErr("Use um e-mail válido ou o usuário admin");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if ((email === ADMIN_USER || email.toLowerCase() === "admin@admin.com") && senha === ADMIN_PASS) {
        login("admin", ADMIN_USER);
        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 400);
      } else {
        setCredErr("Usuário ou senha incorretos");
      }
    }, 350);
  };

  return (
    <div className="flex min-h-dvh bg-[#f4f6f5] text-[#0b2a20]">
      {/* Painel da marca */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#0b2a20] p-16 lg:flex">
        <TennisBall />
        <div className="relative flex items-center justify-between gap-4">
          <Logo onDark />
          <p className="text-[0.9375rem] font-semibold text-white/40">professordetenis.com</p>
        </div>
        <div className="relative max-w-lg pb-64">
          <span className="pdt-eyebrow text-brand-lime">Painel do professor</span>
          <h1 className="mt-4 text-4xl font-medium leading-[1.1] tracking-[-0.02em] text-white [text-wrap:balance] xl:text-5xl">
            Cada aula conta. Cada ponto também.
          </h1>
          <p className="mt-6 max-w-md text-[1.0625rem] leading-relaxed text-white/60 md:text-lg">
            Chamada, avaliações, corrida de pontos e prêmios dos seus alunos em um só painel.
          </p>
        </div>
      </aside>

      {/* Formulário */}
      <main
        className={cn(
          "flex flex-1 items-center justify-center px-4 py-16 transition-[opacity,transform] duration-300 sm:px-8",
          success && "scale-[0.98] opacity-0"
        )}
      >
        <div className="w-full max-w-[400px]">
          <div className="mb-16 lg:hidden">
            <Logo />
          </div>

          <span className="pdt-eyebrow text-brand-green">Acesso do professor</span>
          <h2 className="mt-4 text-3xl font-medium leading-[1.1] tracking-[-0.02em]">Entrar</h2>
          <p className="mt-2 text-[1.0625rem] leading-relaxed text-ink-600">Use seu usuário ou e-mail e a sua senha.</p>

          <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-6">
            <div>
              <label htmlFor="login-email" className="mb-2 block text-[0.9375rem] font-semibold">
                Usuário ou e-mail
              </label>
              <input
                id="login-email"
                type="text"
                autoComplete="username"
                className="pdt-input"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailErr) setEmailErr("");
                }}
                onBlur={() => setEmailErr(email && !(email === ADMIN_USER || EMAIL_RE.test(email)) ? "Use um e-mail válido ou o usuário admin" : "")}
                placeholder="voce@email.com"
                aria-invalid={!!emailErr || undefined}
              />
              {emailErr && <p className="mt-2 text-[0.9375rem] font-semibold text-red-600">{emailErr}</p>}
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <label htmlFor="login-senha" className="text-[0.9375rem] font-semibold">
                  Senha
                </label>
                <a href="#" className="text-sm font-semibold text-brand-green hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative">
                <input
                  id="login-senha"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  className="pdt-input pr-14"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-ink-500 transition-colors hover:text-[#0b2a20] focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-green"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {credErr && (
              <p role="alert" className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-[0.9375rem] text-[#0b2a20]">
                <AlertCircle size={18} className="shrink-0 text-red-600" />
                {credErr}
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-green px-6 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-[#0c6e3a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-green disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <p className="text-center text-xs text-ink-500">Ambiente de demonstração: admin / admin</p>
          </form>
        </div>
      </main>
    </div>
  );
}
