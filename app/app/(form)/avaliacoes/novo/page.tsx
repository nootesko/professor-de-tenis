"use client";
import { FormPage, FormSection, Input, useFormValidation, validators as V } from "@/components/ui";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function NovoCriterioPage() {
  const router = useRouter();
  const { addCriterio } = useStore(useShallow((s) => ({ addCriterio: s.addCriterio })));

  const { values, fieldProps, isValid, validateAll } = useFormValidation(
    { nome: "", categoria: "" },
    { nome: { validators: [V.required(), V.minLen(2)] } }
  );

  const submit = () => {
    if (!validateAll()) return;
    addCriterio({ id: "c" + Date.now(), nome: values.nome.trim(), ativo: true, categoria: values.categoria.trim() || undefined });
    router.push("/avaliacoes");
  };

  return (
    <FormPage
      title="Novo critério"
      backHref="/avaliacoes"
      onCancel={() => router.push("/avaliacoes")}
      onSubmit={submit}
      submitLabel="Criar critério"
      canSubmit={isValid}
    >
      <FormSection title="Critério avaliativo">
        <Input label="Nome" required placeholder="Esforço" hint="Recebe nota de 0 a 5 estrelas em cada aula. Começa ativo." {...fieldProps("nome")} />
        <Input label="Categoria" placeholder="Opcional (ex.: Comportamento)" {...fieldProps("categoria")} />
      </FormSection>
    </FormPage>
  );
}
