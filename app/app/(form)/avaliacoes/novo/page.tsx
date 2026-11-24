"use client";
import { FormPage, FormSection, Input, Select, useFormValidation, validators as V } from "@/components/ui";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function NovoCriterioPage() {
  const router = useRouter();
  const { addCriterio } = useStore(useShallow((s) => ({ addCriterio: s.addCriterio })));

  const { values, fieldProps, isValid, validateAll, setValues } = useFormValidation(
    { nome: "", categoria: "Movimentos" as "Movimentos" | "Comportamento" | "Evolução" },
    { nome: { validators: [V.required(), V.minLen(2)] } }
  );

  const submit = () => {
    if (!validateAll()) return;
    addCriterio({ id: "c" + Date.now(), nome: values.nome, categoria: values.categoria });
    router.push("/avaliacoes");
  };

  return (
    <FormPage
      title="Cadastrar avaliações"
      backHref="/avaliacoes"
      onCancel={() => router.push("/avaliacoes")}
      onSubmit={submit}
      submitLabel="Cadastrar avaliação"
      canSubmit={isValid}
    >
      <FormSection title="Dados da Avaliação">
        <Input label="Nome da Avaliação" required placeholder="Saque" {...fieldProps("nome")} />
        <Select label="Categoria" value={values.categoria} onChange={(e) => setValues({ ...values, categoria: e.target.value as any })}>
          <option>Movimentos</option><option>Comportamento</option><option>Evolução</option>
        </Select>
      </FormSection>
    </FormPage>
  );
}
