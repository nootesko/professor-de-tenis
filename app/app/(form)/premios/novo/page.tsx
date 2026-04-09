"use client";
import { FormPage, FormSection, Input, Select, useFormValidation, validators as V } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function NovoPremioPage() {
  const router = useRouter();
  const { addPremio } = useStore();

  const { values, fieldProps, isValid, validateAll, setValues } = useFormValidation(
    { nome: "", descricao: "", pontosNecessarios: "16", tipo: "medalha-pequena" },
    {
      nome: { validators: [V.required(), V.minLen(2)] },
      descricao: { validators: [V.required()] },
      pontosNecessarios: { validators: [V.required(), V.numRange(1, 99999)] },
    }
  );

  const submit = () => {
    if (!validateAll()) return;
    addPremio({
      id: "pr" + Date.now(),
      nome: values.nome,
      descricao: values.descricao,
      pontosNecessarios: Number(values.pontosNecessarios),
      tipo: values.tipo as any,
    });
    router.push("/premios");
  };

  return (
    <FormPage
      title="Adicionar prêmio"
      backHref="/premios"
      onCancel={() => router.push("/premios")}
      onSubmit={submit}
      submitLabel="Adicionar prêmio"
      canSubmit={isValid}
    >
      <FormSection title="Dados do Prêmio">
        <Input label="Nome" required placeholder="Medalha Bronze" {...fieldProps("nome")} />
        <Input label="Descrição" required {...fieldProps("descricao")} />
        <Input label="Pontos necessários" required type="number" min={1} {...fieldProps("pontosNecessarios")} />
        <Select label="Tipo" value={values.tipo} onChange={(e) => setValues({ ...values, tipo: e.target.value })}>
          <option value="medalha-pequena">Medalha pequena</option>
          <option value="medalha-media">Medalha média</option>
          <option value="medalha-grande">Medalha grande</option>
          <option value="troféu">Troféu</option>
        </Select>
      </FormSection>
    </FormPage>
  );
}
