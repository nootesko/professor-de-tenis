"use client";
// TODO: split steps em arquivos e importar via next/dynamic quando crescer
import { FormPage, FormSection, Avatar, StarRating, NotFoundState, Button } from "@/components/ui";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/lib/store";
import { formatDate, toLocalISODate } from "@/lib/date";
import { toast } from "@/components/Toast";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";


export default function FinalizarAulaPage() {
  const { turmaId } = useParams<{ turmaId: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const data = params.get("data") || toLocalISODate(new Date());
  const { turmas, alunos, aulas, upsertAula, updateAluno } = useStore(useShallow((s) => ({ turmas: s.turmas, alunos: s.alunos, aulas: s.aulas, upsertAula: s.upsertAula, updateAluno: s.updateAluno })));

  const turma = turmas.find((t) => t.id === turmaId);
  const lista = useMemo(
    () => alunos.filter((a) => turma?.alunosIds.includes(a.id)),
    [alunos, turma]
  );

  // Existing aula? (same turma + same date)
  const existing = aulas.find((a) => a.turmaId === turmaId && a.data === data);
  const [aulaId] = useState(() => existing?.id ?? "au" + Date.now());

  const [presenca, setPresenca] = useState<Record<string, boolean>>(existing?.presenca ?? {});
  const [pontos, setPontos] = useState<Record<string, number>>(existing?.pontos ?? {});
  const [stars, setStars] = useState<Record<string, number>>(existing?.stars ?? {});

  if (!turma) return <NotFoundState title="Turma não encontrada" backHref="/dashboard" backLabel="Voltar ao Dashboard" />;

  const submit = () => {
    upsertAula({
      id: aulaId,
      turmaId,
      data,
      presenca,
      pontos,
      stars,
      finalizadaEm: new Date().toISOString(),
    });
    // Aplica delta de pontos: pontosNovos*presença - pontosAntigos*presençaAntiga
    lista.forEach((a) => {
      const novoPts = (presenca[a.id] ? (pontos[a.id] || 0) : 0);
      const antigoPts = existing && existing.presenca[a.id] ? (existing.pontos[a.id] || 0) : 0;
      const delta = novoPts - antigoPts;
      if (delta !== 0) updateAluno(a.id, { pontos: a.pontos + delta });
    });
    toast.success(existing ? "Chamada atualizada" : "Aula finalizada");
    router.push(`/turmas/${turmaId}`);
  };
  const marcarTodos = () => setPresenca(Object.fromEntries(lista.map((a) => [a.id, true])));
  const semChamada = lista.filter((a) => presenca[a.id] === undefined).length;

  return (
    <FormPage
      title={`Chamada · ${turma.nome}`}
      backHref="/dashboard"
      onCancel={() => router.push(`/turmas/${turmaId}`)}
      onSubmit={submit}
      submitLabel={existing ? "Salvar avaliação" : "Finalizar aula"}
      canSubmit={lista.length > 0 && semChamada === 0}
      description={semChamada > 0 ? `Marque presença ou falta de todos os alunos (${semChamada} pendente${semChamada > 1 ? "s" : ""}).` : "Chamada completa. Revise e finalize."}
    >
      <FormSection title={`${formatDate(data, { weekday: "long", day: "2-digit", month: "long" })} · ${turma.horario}`}>
        {lista.length > 0 && (
          <div className="flex justify-end"><Button variant="outline" onClick={marcarTodos}><Check size={14} /> Todos presentes</Button></div>
        )}
        {lista.length === 0 ? (
          <p className="text-sm text-ink-500">Nenhum aluno matriculado nesta turma.</p>
        ) : (
          <div className="space-y-2">
            {lista.map((a) => {
              const presBtns = (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPresenca({ ...presenca, [a.id]: true })}
                    aria-pressed={presenca[a.id] === true}
                    aria-label={`${a.nome}: presente`}
                    className={`grid h-9 w-9 place-items-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95 ${presenca[a.id] === true ? "bg-brand-tint text-brand ring-2 ring-brand/40 scale-105" : "bg-brand-mint2 text-brand"}`}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresenca({ ...presenca, [a.id]: false })}
                    aria-pressed={presenca[a.id] === false}
                    aria-label={`${a.nome}: falta`}
                    className={`grid h-9 w-9 place-items-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95 ${presenca[a.id] === false ? "bg-red-100 text-red-600 ring-2 ring-red-300 scale-105" : "bg-brand-mint2 text-red-500"}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              );
              const pontosInput = (
                <input
                  type="number"
                  value={pontos[a.id] ?? ""}
                  onChange={(e) => setPontos({ ...pontos, [a.id]: Math.max(0, Number(e.target.value) || 0) })}
                  disabled={presenca[a.id] === false}
                  min={0}
                  inputMode="numeric"
                  aria-label={`Pontos de ${a.nome}`}
                  className="w-24 rounded-pill border border-line px-3 py-1.5 text-center text-sm focus:border-brand focus:outline-none"
                  placeholder="0"
                />
              );
              const stars$ = <StarRating value={stars[a.id] || 0} onChange={(v) => setStars({ ...stars, [a.id]: v })} />;
              return (
                <div key={a.id} className="rounded-panel border border-line-strong bg-white p-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <Avatar src={a.avatar} alt={a.nome} size={44} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-ink-900">{a.nome}</div>
                        <div className="text-xs tabular-nums text-ink-500">{a.pontos} pts atuais</div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-3 border-t border-line pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase text-ink-500">Presença</span>
                        {presBtns}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase text-ink-500">Pontos</span>
                        {pontosInput}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase text-ink-500">Avaliação</span>
                        {stars$}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </FormSection>
    </FormPage>
  );
}
