"use client";
import { Card, Avatar } from "@/components/ui";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/lib/store";
import { getAlunoSession } from "@/lib/aluno-creds";
import { Crown, Medal, Lock } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function RankingAlunoPage() {
  const router = useRouter();
  const { alunos, niveis } = useStore(useShallow((s) => ({ alunos: s.alunos, niveis: s.niveis })));
  const [filtroNivel, setFiltroNivel] = useState<string>("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = getAlunoSession();
    setSessionId(s);
    setReady(true);
    if (!s) router.replace("/perfil-aluno/login");
  }, [router]);

  const ranking = useMemo(() => {
    return [...alunos]
      .filter((a) => a.status === "ativo")
      .filter((a) => !filtroNivel || a.nivelId === filtroNivel)
      .sort((a, b) => b.pontos - a.pontos);
  }, [alunos, filtroNivel]);

  const podio = ranking.slice(0, 3);
  const restante = ranking.slice(3);
  const podioOrder = [1, 0, 2];
  const podioHeights = ["h-24", "h-32", "h-20"];
  const podioColors = ["bg-brand-mint2", "bg-brand-lime2", "bg-brand-tint"];
  const podioMedals = [
    <Medal key="silver" size={22} className="text-ink-500" />,
    <Crown key="gold" size={26} className="text-brand-yellow" />,
    <Medal key="bronze" size={20} className="text-orange-500" />,
  ];

  const isMe = (id: string) => id === sessionId;

  if (!ready || !sessionId) return null;

  const renderItem = (a: typeof alunos[number], pos: number) => {
    const nivel = niveis.find((n) => n.id === a.nivelId);
    const me = isMe(a.id);
    const inner = (
      <div className={`flex items-center gap-3 rounded-card border p-3 transition-all ${me ? "border-brand bg-brand-mint2 hover:shadow-card" : "border-line bg-white"} ${me ? "hover:-translate-y-0.5" : "cursor-not-allowed opacity-90"}`}>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-mint2 text-sm font-bold text-brand">
          {pos}
        </div>
        <Avatar src={a.avatar} alt={a.nome} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate font-medium text-ink-900">{a.nome}</div>
            {me && <span className="rounded-pill bg-brand px-2 py-0.5 text-[10px] font-semibold text-brand-lime">VOCÊ</span>}
            {!me && <Lock size={12} className="text-ink-400" />}
          </div>
          {nivel && <div className="text-xs text-ink-500">{nivel.nome}</div>}
        </div>
        <div className="text-right">
          <div className="font-display text-lg font-bold text-brand">{a.pontos}</div>
          <div className="text-[10px] text-ink-500">pontos</div>
        </div>
      </div>
    );
    return me ? <Link key={a.id} href={`/perfil-aluno/${a.id}`}>{inner}</Link> : <div key={a.id}>{inner}</div>;
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand">Ranking</h1>
          <p className="text-xs text-ink-500">Veja como os alunos estão se saindo. Você só pode acessar seu próprio perfil.</p>
        </div>
        <select
          value={filtroNivel}
          onChange={(e) => setFiltroNivel(e.target.value)}
          className="rounded-pill border border-line bg-white px-4 py-2 text-sm focus:border-brand focus:outline-none"
        >
          <option value="">Todos os níveis</option>
          {niveis.map((n) => (
            <option key={n.id} value={n.id}>{n.nome}</option>
          ))}
        </select>
      </div>

      {/* Pódio */}
      {podio.length > 0 && (
        <Card className="mb-6 p-6">
          <div className="flex items-end justify-center gap-3 sm:gap-6">
            {podioOrder.map((idx, i) => {
              const a = podio[idx];
              if (!a) return <div key={i} className="flex-1" />;
              const nivel = niveis.find((n) => n.id === a.nivelId);
              const place = idx + 1;
              const me = isMe(a.id);
              const Wrap = me ? Link : "div";
              const wrapProps: any = me ? { href: `/perfil-aluno/${a.id}` } : {};
              return (
                <Wrap key={a.id} {...wrapProps} className="group flex flex-1 flex-col items-center text-center">
                  <div className="mb-2">{podioMedals[idx]}</div>
                  <div className="relative">
                    <Avatar src={a.avatar} alt={a.nome} size={place === 1 ? 80 : 64} />
                    <div className="absolute -bottom-1 left-1/2 grid h-7 w-7 -translate-x-1/2 place-items-center rounded-full bg-brand text-xs font-bold text-brand-lime ring-2 ring-white">
                      {place}
                    </div>
                    {me && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-pill bg-brand px-2 py-0.5 text-[9px] font-semibold text-brand-lime ring-2 ring-white">VOCÊ</div>
                    )}
                  </div>
                  <div className="mt-3 truncate max-w-[120px] text-sm font-semibold text-ink-900">{a.nome}</div>
                  <div className="text-xs text-ink-500">{a.pontos} pts</div>
                  {nivel && (
                    <div className={`mt-3 w-full rounded-t-card ${podioColors[idx]} ${podioHeights[idx]} flex items-end justify-center pb-2`}>
                      <span className="text-[10px] font-semibold uppercase text-brand">{nivel.nome}</span>
                    </div>
                  )}
                </Wrap>
              );
            })}
          </div>
        </Card>
      )}

      {/* Demais posições */}
      <Card className="p-4 md:p-6">
        <h3 className="mb-4 font-display text-base font-bold text-brand">Classificação</h3>
        {ranking.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-500">Nenhum aluno encontrado.</p>
        ) : (
          <div className="space-y-2">
            {restante.map((a, i) => renderItem(a, i + 4))}
            {restante.length === 0 && podio.length > 0 && (
              <p className="py-4 text-center text-xs text-ink-500">Apenas o pódio nesta categoria.</p>
            )}
          </div>
        )}
      </Card>
    </>
  );
}
