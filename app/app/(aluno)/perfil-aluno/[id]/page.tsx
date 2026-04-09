"use client";
import { Card, Avatar, Badge, LevelBadge } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getAlunoSession } from "@/lib/aluno-creds";
import { assertOwnership } from "@/lib/auth";
import { Trophy, Mail, Phone, Cake, Lock, Crown } from "lucide-react";
import Link from "next/link";

export default function PerfilAlunoPublicPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { alunos, niveis, premios, feedbacks, professores } = useStore();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = getAlunoSession();
    setSessionId(s);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!sessionId) {
      router.replace("/perfil-aluno/login");
      return;
    }
    if (!assertOwnership(sessionId, id)) {
      router.replace("/perfil-aluno/login");
    }
  }, [ready, sessionId, id, router]);

  if (!ready) return null;

  // Bloqueio: só pode ver o próprio perfil (fallback enquanto redireciona)
  if (!assertOwnership(sessionId, id)) {
    return (
      <div className="grid place-items-center py-16">
        <Card className="max-w-md p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-600">
            <Lock size={24} />
          </div>
          <h2 className="mt-3 font-display text-xl font-bold text-brand">Acesso restrito</h2>
          <p className="mt-1 text-sm text-ink-500">
            Você só pode visualizar o seu próprio perfil. Redirecionando…
          </p>
          <Link
            href="/perfil-aluno/ranking"
            className="mt-4 inline-flex items-center gap-2 rounded-pill bg-brand-lime px-5 py-2.5 text-sm font-semibold text-brand-dark hover:brightness-95"
          >
            <Crown size={14} /> Ir para o Ranking
          </Link>
        </Card>
      </div>
    );
  }

  const aluno = alunos.find((a) => a.id === id);
  if (!aluno) return <div className="p-8 text-center">Aluno não encontrado</div>;

  const nivel = niveis.find((n) => n.id === aluno.nivelId);
  const fbs = useMemo(
    () => feedbacks.filter((f) => f.alunoId === aluno.id).sort((a, b) => b.data.localeCompare(a.data)),
    [feedbacks, aluno.id]
  );

  // Posição no ranking
  const ativos = [...alunos].filter((a) => a.status === "ativo").sort((a, b) => b.pontos - a.pontos);
  const posicao = ativos.findIndex((a) => a.id === aluno.id) + 1;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="p-6 text-center lg:col-span-1">
        <Avatar src={aluno.avatar} alt={aluno.nome} size={120} />
        <h2 className="mt-3 font-display text-xl font-bold text-brand">{aluno.nome}</h2>
        <Badge color={aluno.status === "ativo" ? "lime" : "red"}>{aluno.status}</Badge>
        <div className="mt-4 grid gap-2 text-left text-sm text-ink-700">
          <div className="flex items-center gap-2"><Mail size={14} className="text-brand" /> {aluno.email}</div>
          <div className="flex items-center gap-2"><Phone size={14} className="text-brand" /> {aluno.telefone}</div>
          <div className="flex items-center gap-2"><Cake size={14} className="text-brand" /> {aluno.nascimento}</div>
        </div>
      </Card>

      <div className="space-y-6 lg:col-span-2">
        <Card className="p-6">
          <h3 className="font-display text-lg font-bold text-brand">Nível & Pontuação</h3>
          <div className="mt-4 flex items-center justify-between">
            {nivel && <LevelBadge cor={nivel.cor} nome={nivel.nome} size={48} />}
            <div className="text-right">
              <div className="font-display text-3xl font-bold text-brand">{aluno.pontos}</div>
              <div className="text-xs text-ink-500">pontos</div>
            </div>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-line">
            <div className="h-full bg-brand-lime2" style={{ width: `${Math.min(100, (aluno.pontos / 160) * 100)}%` }} />
          </div>
          {posicao > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-card bg-brand-mint2 p-3">
              <span className="text-xs text-brand">Sua posição no ranking</span>
              <span className="font-display text-xl font-bold text-brand">#{posicao}</span>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-lg font-bold text-brand">Prêmios Conquistados</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {premios.map((p) => {
              const got = aluno.pontos >= p.pontosNecessarios;
              return (
                <div key={p.id} className={`rounded-card border border-line p-4 text-center ${got ? "" : "opacity-40"}`}>
                  <Trophy size={32} className="mx-auto text-brand-yellow" />
                  <div className="mt-2 text-xs font-semibold">{p.nome}</div>
                  <div className="text-[10px] text-ink-500">{p.pontosNecessarios} pts</div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-lg font-bold text-brand">Feedbacks dos professores</h3>
          <div className="mt-4 space-y-3">
            {fbs.length === 0 && <p className="text-sm text-ink-500">Nenhum feedback ainda.</p>}
            {fbs.map((f) => {
              const prof = professores.find((p) => p.id === f.professorId);
              return (
                <div key={f.id} className="rounded-card border border-line bg-white p-4">
                  <div className="flex items-center gap-2">
                    {prof && <Avatar src={prof.avatar} alt={prof.nome} size={28} />}
                    <div>
                      <div className="text-xs font-semibold text-brand">{prof?.nome ?? "Professor"}</div>
                      <div className="text-[10px] text-ink-500">
                        {new Date(f.data + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-ink-700">{f.texto}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
