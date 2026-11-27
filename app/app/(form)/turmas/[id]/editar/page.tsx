"use client";
import { FormPage, FormSection, Input, Select, Avatar, useFormValidation, validators as V } from "@/components/ui";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Plus, X, Search } from "lucide-react";
import { HORARIOS, slotFromHorario } from "@/lib/horarios";

export default function EditarTurmaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { turmas, niveis, professores, alunos, updateTurma } = useStore(useShallow((s) => ({ turmas: s.turmas, niveis: s.niveis, professores: s.professores, alunos: s.alunos, updateTurma: s.updateTurma })));
  const turma = turmas.find((t) => t.id === id);
  const [alunosIds, setAlunosIds] = useState<string[]>(turma?.alunosIds ?? []);
  const [busca, setBusca] = useState("");

  const matriculados = useMemo(
    () => alunos.filter((a) => alunosIds.includes(a.id)),
    [alunos, alunosIds]
  );
  const disponiveis = useMemo(() => {
    const term = busca.trim().toLowerCase();
    return alunos
      .filter((a) => !alunosIds.includes(a.id))
      .filter((a) => !term || a.nome.toLowerCase().includes(term) || a.email?.toLowerCase().includes(term));
  }, [alunos, alunosIds, busca]);

  const remover = (alunoId: string) => setAlunosIds((ids) => ids.filter((x) => x !== alunoId));

  const { values, fieldProps, isValid, validateAll, setValues } = useFormValidation(
    {
      nome: turma?.nome ?? "",
      diaSemana: turma?.diaSemana ?? "Segunda",
      horarioInicio: slotFromHorario(turma?.horario ?? "").inicio,
      vagas: String(turma?.vagas ?? 6),
      professorId: turma?.professorId ?? "",
      nivelId: turma?.nivelId ?? "",
    },
    {
      nome: { validators: [V.required(), V.minLen(2)] },
      horarioInicio: { validators: [V.required()] },
      professorId: { validators: [V.required()] },
      nivelId: { validators: [V.required()] },
    }
  );

  const adicionar = (alunoId: string) => {
    const cap = Number(values.vagas) || 0;
    if (cap > 0 && alunosIds.length >= cap) return;
    setAlunosIds((ids) => [...ids, alunoId]);
  };

  if (!turma) return <div className="p-8">Turma não encontrada</div>;

  const submit = () => {
    if (!validateAll()) return;
    const slot = HORARIOS.find((s) => s.inicio === values.horarioInicio) ?? HORARIOS[1];
    updateTurma(turma.id, {
      ...turma,
      nome: values.nome,
      diaSemana: values.diaSemana,
      professorId: values.professorId,
      nivelId: values.nivelId,
      horario: `${slot.inicio}-${slot.fim}`,
      vagas: Number(values.vagas) || undefined,
      alunosIds,
    });
    router.push(`/turmas/${turma.id}`);
  };

  return (
    <FormPage
      title={`Editar ${turma.nome}`}
      backHref={`/turmas/${turma.id}`}
      onCancel={() => router.push(`/turmas/${turma.id}`)}
      onSubmit={submit}
      submitLabel="Salvar alterações"
      canSubmit={isValid}
    >
      <FormSection title="Dados da Turma">
        <Input label="Nome da Turma" required {...fieldProps("nome")} />
        <Select label="Professor" required value={values.professorId} onChange={(e) => setValues({ ...values, professorId: e.target.value })}>
          {professores.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </Select>
        <Select label="Dia" value={values.diaSemana} onChange={(e) => setValues({ ...values, diaSemana: e.target.value })}>
          {["Segunda","Terça","Quarta","Quinta","Sexta","Sábado"].map((d) => <option key={d}>{d}</option>)}
        </Select>
        <Select label="Horário (aulas de 45 min)" required value={values.horarioInicio} onChange={(e) => setValues({ ...values, horarioInicio: e.target.value })}>
          {HORARIOS.map((s) => <option key={s.inicio} value={s.inicio}>{s.label}</option>)}
        </Select>
        <Input label="Vagas Disponíveis" required type="number" min={1} max={100} {...fieldProps("vagas")} />
        <Select label="Bola" required value={values.nivelId} onChange={(e) => setValues({ ...values, nivelId: e.target.value })}>
          {niveis.map((n) => <option key={n.id} value={n.id}>{n.nome}</option>)}
        </Select>
      </FormSection>

      <FormSection title={`Alunos da Turma (${matriculados.length})`}>
        {matriculados.length === 0 ? (
          <p className="text-sm text-ink-500">Nenhum aluno matriculado ainda. Adicione abaixo.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {matriculados.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-card border border-line bg-white p-2.5 transition-all hover:border-brand">
                <Avatar src={a.avatar} alt={a.nome} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-ink-900">{a.nome}</div>
                  {a.email && <div className="truncate text-xs text-ink-500">{a.email}</div>}
                </div>
                <button
                  type="button"
                  onClick={() => remover(a.id)}
                  aria-label={`Remover ${a.nome}`}
                  className="grid h-8 w-8 place-items-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100 hover:scale-110 active:scale-95"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-2">
          <label className="label">Adicionar alunos</label>
          <div className="relative mb-2">
            <Search size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar aluno por nome ou email"
              className="w-full rounded-pill border border-line bg-white py-2 pl-10 pr-4 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-card border border-line bg-brand-mint/30 p-2">
            {disponiveis.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-ink-500">
                {busca ? "Nenhum aluno encontrado" : "Todos os alunos já estão matriculados"}
              </p>
            ) : (
              disponiveis.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => adicionar(a.id)}
                  className="flex w-full items-center gap-3 rounded-card bg-white p-2 text-left transition-all hover:bg-brand-mint2 hover:shadow-sm"
                >
                  <Avatar src={a.avatar} alt={a.nome} size={32} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-ink-900">{a.nome}</div>
                    {a.email && <div className="truncate text-xs text-ink-500">{a.email}</div>}
                  </div>
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-brand-lime2 text-brand-dark">
                    <Plus size={14} />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </FormSection>
    </FormPage>
  );
}
