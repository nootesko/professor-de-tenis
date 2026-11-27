"use client";
import { FormPage, FormSection } from "@/components/ui";
import { NotaCriterio } from "@/components/ui/NotaCriterio";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/lib/store";
import { toLocalISODate } from "@/lib/date";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/Toast";

export default function NovaAvaliacaoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { alunos, criterios, addAvaliacao } = useStore(useShallow((s) => ({ alunos: s.alunos, criterios: s.criterios, addAvaliacao: s.addAvaliacao })));
  const aluno = alunos.find((a) => a.id === id);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [obs, setObs] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!aluno) return <div className="p-8">Aluno não encontrado</div>;

  const grouped = criterios.filter((c) => c.ativo).reduce((acc, c) => {
    (acc[c.categoria ?? "Critérios"] ||= []).push(c);
    return acc;
  }, {} as Record<string, typeof criterios>);

  const submit = () => {
    if (Object.keys(scores).length === 0) {
      toast.error("Avalie ao menos um critério");
      return;
    }
    setSubmitting(true);
    addAvaliacao({
      id: "av" + Date.now(),
      alunoId: aluno.id,
      data: toLocalISODate(new Date()),
      scores,
      observacoes: obs.trim() || undefined,
    });
    toast.success("Avaliação registrada");
    router.push(`/alunos/${aluno.id}`);
  };

  return (
    <FormPage
      title={`Avaliação de Desempenho — ${aluno.nome}`}
      backHref={`/alunos/${aluno.id}`}
      onCancel={() => router.push(`/alunos/${aluno.id}`)}
      onSubmit={submit}
      submitLabel="Salvar Avaliação"
      submitting={submitting}
    >
      {Object.entries(grouped).map(([cat, list]) => (
        <FormSection key={cat} title={cat}>
          {list.map((c) => (
            <NotaCriterio
              key={c.id}
              label={c.nome}
              value={scores[c.id]}
              onChange={(v) => {
                const next = { ...scores };
                if (v === undefined) delete next[c.id];
                else next[c.id] = v;
                setScores(next);
              }}
            />
          ))}
        </FormSection>
      ))}
      <FormSection title="Observações">
        <textarea
          value={obs}
          onChange={(e) => setObs(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-card border border-line bg-white p-3 text-sm focus:border-brand focus:outline-none"
          placeholder="Anote pontos fortes, evolução, áreas de melhoria..."
        />
      </FormSection>
    </FormPage>
  );
}
