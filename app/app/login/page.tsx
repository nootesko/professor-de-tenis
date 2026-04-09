"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Trophy, CheckCircle2 } from "lucide-react";
import { useAuth, ADMIN_USER, ADMIN_PASS } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [email, setEmail] = useState("admin");
  const [senha, setSenha] = useState("");
  const [touched, setTouched] = useState<{ email?: boolean; senha?: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  // Allow plain admin user OR an email
  const validUser = email === ADMIN_USER || EMAIL_RE.test(email);
  const emailErr = touched.email && !validUser ? "Usuário inválido" : "";
  const senhaErr = touched.senha && senha.trim().length === 0 ? "Campo obrigatório" : "";
  const canSubmit = validUser && senha.trim().length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, senha: true });
    setError(null);
    if (!canSubmit) return;
    if ((email === ADMIN_USER || email.toLowerCase() === "admin@admin.com") && senha === ADMIN_PASS) {
      login("admin", ADMIN_USER);
      router.push("/dashboard");
    } else {
      setError("Credenciais inválidas. Use admin / admin.");
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-brand-green p-4">
      <div className="w-full max-w-md rounded-card bg-brand p-10 shadow-soft">
        <div className="flex flex-col items-center gap-3">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10">
            <Trophy size={36} className="text-brand-lime" />
          </div>
          <div className="text-center font-display text-2xl font-bold text-white">
            Professor<br />DeTênis<span className="text-brand-lime">.com</span>
          </div>
        </div>
        <form className="mt-8 space-y-4" onSubmit={submit}>
          <div>
            <div className={`rounded-pill bg-white px-5 py-2 ${emailErr ? "ring-2 ring-red-400" : ""}`}>
              <div className="text-[10px] font-semibold text-brand-green">Usuário ou e-mail</div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                className="w-full bg-transparent text-sm text-ink-900 focus:outline-none"
              />
            </div>
            {emailErr && <p className="mt-1 pl-5 text-xs font-medium text-red-200">{emailErr}</p>}
          </div>
          <div>
            <div className={`flex items-center rounded-pill bg-white px-5 py-2 ${senhaErr ? "ring-2 ring-red-400" : ""}`}>
              <div className="flex-1">
                <div className="text-[10px] font-semibold text-brand-green">Senha</div>
                <input
                  type={showPwd ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, senha: true }))}
                  placeholder="Senha"
                  className="w-full bg-transparent text-sm focus:outline-none"
                />
              </div>
              <button type="button" onClick={() => setShowPwd((v) => !v)} className="text-ink-500">
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {senhaErr && <p className="mt-1 pl-5 text-xs font-medium text-red-200">{senhaErr}</p>}
          </div>
          {error && <p className="text-center text-xs font-medium text-red-200">{error}</p>}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-pill bg-brand-lime2 py-3 text-sm font-semibold text-brand-dark hover:brightness-95 disabled:opacity-50"
          >
            Acessar
          </button>
          <div className="flex items-center justify-between text-xs text-white">
            <button type="button" onClick={() => setRemember((v) => !v)} className="flex items-center gap-2">
              <CheckCircle2 size={16} className={remember ? "text-brand-lime" : "text-white/40"} />
              Lembrar senha
            </button>
            <a className="underline-offset-2 hover:underline">Esqueceu a senha?</a>
          </div>
          <p className="text-center text-[10px] text-white/60">Mock: admin / admin</p>
        </form>
      </div>
    </div>
  );
}
