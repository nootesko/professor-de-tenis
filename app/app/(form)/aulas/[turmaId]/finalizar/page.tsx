"use client";
import { FormPage, FormSection, Avatar, NotFoundState, Button, Select } from "@/components/ui";
import { NotaCriterio } from "@/components/ui/NotaCriterio";
import { Celebracao, type Comemoracao } from "@/components/Celebracao";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/lib/store";
import { formatDate, toLocalISODate } from "@/lib/date";
import { mediaNotas, progresso, proximoPremio, pontosDaAula } from "@/lib/gamificacao";
import { toast } from "@/components/Toast";
import { cn } from "@/lib/cn";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Check, X, ChevronDown, Award, ClipboardList, CircleDot, Minus, Plus } from "lucide-react";

const fmt = (v: number) => v.toFixed(1).replace(".", ",");

export default function FinalizarAulaPage() {
  const { turmaId } = useParams<{ turmaId: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const data = params.get("data") || toLocalISODate(new Date());
  const { turmas, alunos, aulas, criterios, niveis, programa, tabela, finalizarAula } = useStore(
    useShallow((s) => ({
      turmas: s.turmas, alunos: s.alunos, aulas: s.aulas, criterios: s.criterios, niveis: s.niveis,
      programa: s.programa, tabela: s.tabela, finalizarAula: s.finalizarAula,
    }))
  );

  const turma = turmas.find((t) => t.id === turmaId);
  const lista = useMemo(() => alunos.filter((a) => turma?.alunosIds.includes(a.id)), [alunos, turma]);
  const ativos = useMemo(() => criterios.filter((c) => c.ativo), [criterios]);
  const niveisOrd = useMemo(() => [...niveis].sort((a, b) => (a.ordem ?? 99) - (b.ordem ?? 99)), [niveis]);

  const existing = aulas.find((a) => a.turmaId === turmaId && a.data === data);
  const [aulaId] = useState(() => existing?.id ?? "au" + Date.now());

  const [presenca, setPresenca] = useState<Record<string, boolean>>(existing?.presenca ?? {});
  const [notas, setNotas] = useState<Record<string, Record<string, number>>>(existing?.notas ?? {});
  const [observacao, setObservacao] = useState<Record<string, string>>(existing?.observacao ?? {});
  const [ponto, setPonto] = useState<Record<string, number>>(existing?.ponto ?? {});
  const [nivel, setNivel] = useState<Record<string, string>>(
    () => existing?.nivel ?? Object.fromEntries(lista.map((a) => [a.id, a.nivelId]))
  );
  const [aberto, setAberto] = useState<string | null>(null);
  const [fila, setFila] = useState<Comemoracao[] | null>(null);

  if (!turma) return <NotFoundState title="Turma não encontrada" backHref="/dashboard" backLabel="Voltar ao Dashboard" />;

  const marcar = (id: string, v: boolean) => {
    setPresenca((p) => ({ ...p, [id]: v }));
    if (v) setAberto(id);
    else if (aberto === id) setAberto(null);
  };

  const setNota = (alunoId: string, criterioId: string, v: number | undefined) => {
    setNotas((prev) => {
      const atual = { ...(prev[alunoId] ?? {}) };
      if (v === undefined) delete atual[criterioId];
      else atual[criterioId] = v;
      return { ...prev, [alunoId]: atual };
    });
  };

  const submit = () => {
    // Quem faltou não tem notas, observação de desempenho nem ponto.
    const limpa = <T,>(m: Record<string, T>) =>
      Object.fromEntries(Object.entries(m).filter(([id]) => presenca[id] === true)) as Record<string, T>;
    const { conquistas } = finalizarAula({
      id: aulaId,
      turmaId,
      data,
      presenca,
      notas: limpa(notas),
      observacao: Object.fromEntries(Object.entries(observacao).filter(([, t]) => t.trim())),
      ponto: limpa(ponto),
      nivel,
      finalizadaEm: new Date().toISOString(),
    });
    toast.success(existing ? "Registro da aula atualizado" : "Aula finalizada");
    const comemoracoes: Comemoracao[] = conquistas.map((c, i) => {
      const a = alunos.find((x) => x.id === c.alunoId);
      return {
        key: `${i}`, nomeAluno: a?.nome ?? "", avatar: a?.avatar, nivel: c.premio.nivel,
        premio: c.premio.nome, tipo: c.premio.tipo, animacao: c.premio.animacao, gifUrl: c.premio.gifUrl,
      };
    });
    if (comemoracoes.length) setFila(comemoracoes);
    else router.push(`/turmas/${turmaId}`);
  };

  const marcarTodos = () => setPresenca(Object.fromEntries(lista.map((a) => [a.id, true])));
  const semChamada = lista.filter((a) => presenca[a.id] === undefined).length;

  return (
    <>
      <FormPage
        title={`Aula · ${turma.nome}`}
        backHref="/dashboard"
        onCancel={() => router.push(`/turmas/${turmaId}`)}
        onSubmit={submit}
        submitLabel={existing ? "Salvar registro" : "Finalizar aula"}
        canSubmit={lista.length > 0 && semChamada === 0}
        description={
          semChamada > 0
            ? `Marque presença ou falta de todos os alunos (${semChamada} pendente${semChamada > 1 ? "s" : ""}). Abra cada aluno para avaliar, lançar os pontos e registrar a bola.`
            : "Chamada completa. Revise os registros e finalize."
        }
      >
        <FormSection title={`${formatDate(data, { weekday: "long", day: "2-digit", month: "long" })} · ${turma.horario}`}>
          {lista.length > 0 && (
            <div className="flex justify-end">
              <Button variant="outline" onClick={marcarTodos}><Check size={14} /> Todos presentes</Button>
            </div>
          )}
          {lista.length === 0 ? (
            <p className="text-sm text-ink-500">Nenhum aluno matriculado nesta turma.</p>
          ) : (
            <div className="space-y-3">
              {lista.map((a) => {
                const presente = presenca[a.id] === true;
                const open = aberto === a.id && presente;
                const media = mediaNotas(notas[a.id], ativos.map((c) => c.id));
                // Nível de gamificação sem esta aula, para a prévia refletir o que está sendo lançado agora.
                const semEsta = programa.unidade === "pontos" ? a.pontos - pontosDaAula(existing, a.id) : progresso(programa.unidade, a, aulas.filter((x) => x.id !== aulaId));
                const pts = ponto[a.id] ?? 0;
                const novo = programa.unidade === "pontos" ? semEsta + (presente ? pts : 0) : semEsta + (presente ? 1 : 0);
                const prox = proximoPremio(tabela, novo);
                const nivelAtual = niveis.find((n) => n.id === nivel[a.id]);
                return (
                  <div key={a.id} className="overflow-hidden rounded-panel border border-line-strong bg-white">
                    {/* Cabeçalho: aluno + presença sempre visíveis */}
                    <div className="flex items-center gap-3 p-4">
                      <button
                        type="button"
                        onClick={() => presente && setAberto(open ? null : a.id)}
                        disabled={!presente}
                        aria-expanded={open}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default"
                      >
                        <Avatar src={a.avatar} alt="" size={44} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold text-ink-900">{a.nome}</div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
                            {presenca[a.id] === false ? (
                              <span className="text-red-600">Faltou</span>
                            ) : presente ? (
                              <>
                                <span className="tabular-nums">Média {media != null ? fmt(media) : "—"}</span>
                                <span className={cn("font-semibold tabular-nums", pts ? "text-brand-green" : "")}>{pts ? `+${pts} ponto${pts > 1 ? "s" : ""}` : "Sem ponto"}</span>
                                {nivelAtual && <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: nivelAtual.cor }} />{nivelAtual.nome}</span>}
                              </>
                            ) : (
                              <span>Presença pendente</span>
                            )}
                          </div>
                        </div>
                        {presente && <ChevronDown size={18} className={cn("shrink-0 text-ink-500 transition-transform", open && "rotate-180")} />}
                      </button>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => marcar(a.id, true)}
                          aria-pressed={presenca[a.id] === true}
                          aria-label={`${a.nome}: presente`}
                          className={cn(
                            "grid h-9 w-9 place-items-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95",
                            presenca[a.id] === true ? "bg-brand-tint text-brand ring-2 ring-brand/40" : "bg-brand-mint2 text-brand"
                          )}
                        >
                          <Check size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => marcar(a.id, false)}
                          aria-pressed={presenca[a.id] === false}
                          aria-label={`${a.nome}: falta`}
                          className={cn(
                            "grid h-9 w-9 place-items-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95",
                            presenca[a.id] === false ? "bg-red-100 text-red-600 ring-2 ring-red-300" : "bg-brand-mint2 text-red-500"
                          )}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    {open && (
                      <div className="divide-y divide-line border-t border-line animate-slide-down">
                        {/* 1. Desempenho */}
                        <div className="space-y-3 p-4">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500"><ClipboardList size={14} /> Desempenho da aula</span>
                            <span className="text-xs tabular-nums text-ink-500">Média: <b className="text-ink-900">{media != null ? fmt(media) : "—"}</b></span>
                          </div>
                          {ativos.length === 0 ? (
                            <p className="text-sm text-ink-500">Nenhum critério ativo. Ative critérios em Avaliações.</p>
                          ) : (
                            ativos.map((c) => (
                              <NotaCriterio key={c.id} label={c.nome} value={notas[a.id]?.[c.id]} onChange={(v) => setNota(a.id, c.id, v)} />
                            ))
                          )}
                          <p className="text-[11px] text-ink-500">Critério em branco não entra na média. Clique na nota de novo para limpar.</p>
                          <label className="label mb-0" htmlFor={`obs-${a.id}`}>Observação (opcional)</label>
                          <textarea
                            id={`obs-${a.id}`}
                            rows={2}
                            value={observacao[a.id] ?? ""}
                            onChange={(e) => { const v = e.target.value; setObservacao((o) => ({ ...o, [a.id]: v })); }}
                            placeholder="Como foi a participação nesta aula?"
                            className="w-full resize-y rounded-input border border-line-strong bg-white p-3 text-base focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 md:text-sm"
                          />
                        </div>

                        {/* 2. Pontos de gamificação */}
                        <div className="space-y-3 p-4">
                          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500"><Award size={14} /> Pontos de gamificação</span>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 rounded-pill border border-line-strong bg-white p-1" role="group" aria-label={`Pontos de ${a.nome} nesta aula`}>
                              <button
                                type="button"
                                onClick={() => setPonto((p) => ({ ...p, [a.id]: Math.max(0, (p[a.id] ?? 0) - 1) }))}
                                disabled={pts === 0}
                                aria-label="Tirar 1 ponto"
                                className="grid h-10 w-10 place-items-center rounded-full text-ink-700 transition-colors hover:bg-soft disabled:opacity-30"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-10 text-center font-display text-xl font-bold tabular-nums text-ink-900" aria-live="polite">{pts}</span>
                              <button
                                type="button"
                                onClick={() => setPonto((p) => ({ ...p, [a.id]: (p[a.id] ?? 0) + 1 }))}
                                aria-label="Dar 1 ponto"
                                className="grid h-10 w-10 place-items-center rounded-full bg-brand-tint text-brand-green transition-colors hover:bg-brand-mint2"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            <p className="min-w-0 text-xs text-ink-500">
                              Pontos conquistados nesta aula. Normalmente 1; mais quando há medalha extra (ex.: rei da quadra). Presença não dá ponto sozinha.
                            </p>
                          </div>
                          <p className="text-xs tabular-nums text-ink-500">
                            {programa.unidade === "pontos" ? (
                              <>Nível de gamificação: <b className="text-ink-900">{semEsta}</b>{pts > 0 && <> → <b className="text-brand-green">{novo}</b></>}</>
                            ) : (
                              <>{novo} aulas frequentadas</>
                            )}
                            {prox && ` · próximo prêmio: ${prox.nome} no nível ${prox.nivel} (faltam ${prox.nivel - novo})`}
                          </p>
                        </div>

                        {/* 3. Nível técnico */}
                        <div className="space-y-3 p-4">
                          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500"><CircleDot size={14} /> Nível técnico</span>
                          <Select
                            label="Bola trabalhada"
                            value={nivel[a.id] ?? ""}
                            onChange={(e) => { const v = e.target.value; setNivel((n) => ({ ...n, [a.id]: v })); }}
                          >
                            <option value="">Sem nível</option>
                            {niveisOrd.map((n) => <option key={n.id} value={n.id}>{n.nome}</option>)}
                          </Select>
                          <p className="text-[11px] text-ink-500">Não altera notas, pontos nem prêmios.</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </FormSection>
      </FormPage>
      {fila && <Celebracao fila={fila} onFim={() => { setFila(null); router.push(`/turmas/${turmaId}`); }} />}
    </>
  );
}
