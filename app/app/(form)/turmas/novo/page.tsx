"use client";
import { FormPage, FormSection, Input, Select, Avatar, useFormValidation, validators as V } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Plus, X, Search } from "lucide-react";
import { HORARIOS } from "@/lib/horarios";

export default function NovaTurmaPage() {
  const router = useRouter();
  const { addTurma, niveis, professores, alunos } = useStore();
  const [alunosIds, setAlunosIds] = useState<string[]>([]);
  const [busca, setBusca] = useState("");

  const matriculados = useMemo(() => alunos.filter((a) => alunosIds.includes(a.id)), [alunos, alunosIds]);
  const disponiveis = useMemo(() => {
    const term = busca.trim().toLowerCase();
    return alunos
      .filter((a) => !alunosIds.includes(a.id))
      .filter((a) => !term || a.nome.toLowerCase().includes(term) || a.email?.toLowerCase().includes(term));
  }, [alunos, alunosIds, busca]);
  const adicionar = (id: string) => {
    const cap = Number(values.vagas) || 0;
    if (cap > 0 && alunosIds.length >= cap) return;
    setAlunosIds((ids) => [...ids, id]);
  };
  const remover = (id: string) => setAlunosIds((ids) => ids.filter((x) => x !== id));

  const { values, fieldProps, isValid, validateAll, setValues } = useFormValidation(
    {
      nome: "",
      diaSemana: "Segunda",
      horarioInicio: HORARIOS[2].inicio, // 08:30 default
      vagas: "6",
      professorId: professores[0]?.id || "",
      nivelId: niveis[0]?.id || "",
    },
    {
      nome: { validators: [V.required(), V.minLen(2)] },
      horarioInicio: { validators: [V.required()] },
      vagas: { validators: [V.required(), V.numRange(1, 100)] },
      professorId: { validators: [V.required()] },
      nivelId: { validators: [V.required()] },
    }
  );

  const vagasNum = Number(values.vagas) || 0;
  const overCapacity = vagasNum > 0 && alunosIds.length > vagasNum;

  const submit = () => {
    if (!validateAll()) return;
    if (overCapacity) {
      return;
    }
    const slot = HORARIOS.find((s) => s.inicio === values.horarioInicio) ?? HORARIOS[0];
    addTurma({
      id: "t" + Date.now(),
      nome: values.nome,
      diaSemana: values.diaSemana,
      horario: `${slot.inicio}-${slot.fim}`,
      professorId: values.professorId,
      nivelId: values.nivelId,
      alunosIds,
      vagas: vagasNum,
    });
    router.push("/turmas");
  };

  return (
    <FormPage
      title="Cadastrar nova turma"
      backHref="/turmas"
      onCancel={() => router.push("/turmas")}
      onSubmit={submit}
      submitLabel="Cadastrar nova turma"
      canSubmit={isValid}
    >
      <FormSection title="Dados da Turma">
        <Input label="Nome da Turma" required placeholder="808" {...fieldProps("nome")} />
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
        <Select label="Nível" required value={values.nivelId} onChange={(e) => setValues({ ...values, nivelId: e.target.value })}>
          {niveis.map((n) => <option key={n.id} value={n.id}>{n.nome}</option>)}
        </Select>
      </FormSection>

      <FormSection title={`Alunos da Turma (${matriculados.length}/${values.vagas || "∞"})`}>
        {overCapacity && <p className="rounded bg-red-50 p-2 text-xs font-medium text-red-600">Acima da capacidade ({alunosIds.length}/{vagasNum})</p>}
        {matriculados.length === 0 ? (
          <p className="text-sm text-ink-500">Nenhum aluno adicionado. Selecione abaixo.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
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
                {busca ? "Nenhum aluno encontrado" : "Todos os alunos já foram adicionados"}
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
