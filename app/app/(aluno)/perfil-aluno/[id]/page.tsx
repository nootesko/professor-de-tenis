"use client";
import { Card, Avatar, Badge, LevelBadge, PanelPage, Section, ListRow, InfoRow, StatGrid, StatCard, EmptyState, NotFoundState } from "@/components/ui";
import { formatDate } from "@/lib/date";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getAlunoSession } from "@/lib/aluno-creds";
import { assertOwnership } from "@/lib/auth";
import { Trophy, Mail, Phone, Cake, Lock, Crown, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function PerfilAlunoPublicPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { alunos, niveis, premios, feedbacks, professores } = useStore(useShallow((s) => ({ alunos: s.alunos, niveis: s.niveis, premios: s.premios, feedbacks: s.feedbacks, professores: s.professores })));
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

  const aluno = alunos.find((a) => a.id === id);
  const fbs = useMemo(
    () => feedbacks.filter((f) => f.alunoId === id).sort((a, b) => b.data.localeCompare(a.data)),
    [feedbacks, id],
  );

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

  if (!aluno) return <NotFoundState title="Aluno não encontrado" backHref="/perfil-aluno/ranking" backLabel="Ver ranking" />;

  const nivel = niveis.find((n) => n.id === aluno.nivelId);
  const progresso = nivel ? Math.min(100, Math.max(0, ((aluno.pontos - nivel.pontosMin) / Math.max(1, nivel.pontosMax - nivel.pontosMin)) * 100)) : 0;
  const ativos = [...alunos].filter((a) => a.status === "ativo").sort((a, b) => b.pontos - a.pontos);
  const posicao = ativos.findIndex((a) => a.id === aluno.id) + 1;
  const conquistados = premios.filter((p) => aluno.pontos >= p.pontosNecessarios).length;

  return (
    <PanelPage width="readable" className="px-0 sm:px-0 lg:px-0">
      <Section flush>
        <ListRow className="py-5">
          <Avatar src={aluno.avatar} alt="" size={64} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-xl font-bold text-brand">{aluno.nome}</h1>
            {nivel && <div className="mt-1"><LevelBadge cor={nivel.cor} nome={nivel.nome} size={24} /></div>}
          </div>
        </ListRow>
        <InfoRow label="E-mail" icon={<Mail size={14} />}>{aluno.email}</InfoRow>
        <InfoRow label="Telefone" icon={<Phone size={14} />}>{aluno.telefone}</InfoRow>
        <InfoRow label="Nascimento" icon={<Cake size={14} />}>{aluno.nascimento}</InfoRow>
      </Section>

      <StatGrid>
        <StatCard label="Pontos" value={aluno.pontos} />
        <StatCard label="Ranking" value={posicao > 0 ? `#${posicao}` : "—"} hint={`de ${ativos.length} alunos`} />
        <StatCard label="Prêmios" value={`${conquistados}/${premios.length}`} hint="conquistados" />
        <StatCard label="Feedbacks" value={fbs.length} />
      </StatGrid>

      {nivel && (
        <Section title="Evolução no nível" description={`${nivel.nome}: ${nivel.pontosMin}–${nivel.pontosMax} pts`}>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={Math.round(progresso)} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso no nível">
            <div className="h-full rounded-full bg-brand-lime2" style={{ width: `${progresso}%` }} />
          </div>
        </Section>
      )}

      <Section flush title="Prêmios">
        {[...premios].sort((a, b) => a.pontosNecessarios - b.pontosNecessarios).map((p) => {
          const got = aluno.pontos >= p.pontosNecessarios;
          return (
            <ListRow key={p.id}>
              <Trophy size={20} className={got ? "text-brand-yellow" : "text-ink-300"} />
              <div className="min-w-0 flex-1">
                <div className={`truncate text-sm font-semibold ${got ? "text-ink-900" : "text-ink-500"}`}>{p.nome}</div>
                <div className="text-xs tabular-nums text-ink-500">{p.pontosNecessarios} pts</div>
              </div>
              {got ? <Badge color="lime">Conquistado</Badge> : <span className="text-xs tabular-nums text-ink-500">faltam {p.pontosNecessarios - aluno.pontos} pts</span>}
            </ListRow>
          );
        })}
      </Section>

      <Section flush title="Feedbacks dos professores">
        {fbs.length === 0 ? (
          <EmptyState compact icon={MessageSquare} title="Nenhum feedback ainda" />
        ) : (
          fbs.map((f) => {
            const prof = professores.find((p) => p.id === f.professorId);
            return (
              <div key={f.id} className="px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  {prof && <Avatar src={prof.avatar} alt="" size={32} />}
                  <div>
                    <div className="text-sm font-semibold text-ink-900">{prof?.nome ?? "Professor"}</div>
                    <div className="text-xs text-ink-500">{formatDate(f.data, { day: "2-digit", month: "long", year: "numeric" })}</div>
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm text-ink-700">{f.texto}</p>
              </div>
            );
          })
        )}
      </Section>
    </PanelPage>
  );
}
