"use client";
import { FormPage, FormSection, Input, Select, useFormValidation, validators as V } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/Toast";

function brToISO(br: string): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br);
  if (!m) return new Date().toISOString().slice(0, 10);
  return `${m[3]}-${m[2]}-${m[1]}`;
}

export default function NovaPremiacaoPage() {
  const router = useRouter();
  const { alunos, premios, addPremiacao } = useStore();
  const [submitting, setSubmitting] = useState(false);

  const { values, fieldProps, isValid, validateAll, setValues } = useFormValidation(
    { alunoId: alunos[0]?.id || "", premioId: premios[0]?.id || "", data: "" },
    {
      alunoId: { validators: [V.required()] },
      premioId: { validators: [V.required()] },
      data: { mask: "date", validators: [V.required(), V.dateBR()] },
    }
  );

  const submit = () => {
    if (!validateAll()) return;
    setSubmitting(true);
    addPremiacao({
      id: "pm" + Date.now(),
      alunoId: values.alunoId,
      premioId: values.premioId,
      data: brToISO(values.data),
    });
    toast.success("Premiação registrada");
    router.push("/premios");
  };

  return (
    <FormPage
      title="Adicionar premiação"
      backHref="/premios"
      onCancel={() => router.push("/premios")}
      onSubmit={submit}
      submitLabel="Premiar aluno"
      canSubmit={isValid}
      submitting={submitting}
    >
      <FormSection title="Premiação">
        <Select label="Aluno" required value={values.alunoId} onChange={(e) => setValues({ ...values, alunoId: e.target.value })}>
          {alunos.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
        </Select>
        <Select label="Prêmio" required value={values.premioId} onChange={(e) => setValues({ ...values, premioId: e.target.value })}>
          {premios.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </Select>
        <Input label="Data" required inputMode="numeric" placeholder="dd/mm/aaaa" {...fieldProps("data")} />
      </FormSection>
    </FormPage>
  );
}
