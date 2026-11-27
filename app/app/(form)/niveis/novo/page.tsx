"use client";
import { FormPage, FormSection, Input, AvatarUpload, useFormValidation, validators as V } from "@/components/ui";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NovoNivelPage() {
  const router = useRouter();
  const { addNivel } = useStore(useShallow((s) => ({ addNivel: s.addNivel })));
  const [imagem, setImagem] = useState<string | undefined>(undefined);

  const { values, fieldProps, isValid, validateAll, setValues } = useFormValidation(
    { nome: "", descricao: "", cor: "#edbe16", ordem: "" },
    {
      nome: { validators: [V.required(), V.minLen(2)] },
      descricao: { validators: [V.required()] },
      ordem: { validators: [V.numRange(0, 99)] },
    }
  );

  const submit = () => {
    if (!validateAll()) return;
    addNivel({
      id: "n" + Date.now(),
      nome: values.nome,
      descricao: values.descricao,
      cor: values.cor,
      ordem: values.ordem ? Number(values.ordem) : undefined,
      imagem,
    });
    router.push("/niveis");
  };

  return (
    <FormPage
      title="Cadastrar bola"
      backHref="/niveis"
      onCancel={() => router.push("/niveis")}
      onSubmit={submit}
      submitLabel="Cadastrar nível"
      canSubmit={isValid}
    >
      <FormSection title="Dados da bola">
        <AvatarUpload value={imagem} onChange={setImagem} alt="Bola" size={96} />
        <p className="-mt-2 text-center text-[11px] text-ink-500">
          Envie uma foto da bola (opcional). Sem foto, será usada a cor escolhida abaixo.
        </p>
        <div className="flex items-center justify-center gap-4">
          <span className="h-12 w-12 rounded-full ring-2 ring-white shadow" style={{ background: values.cor }} />
          <label className="rounded-pill border border-line bg-white px-5 py-2 text-sm font-semibold text-ink-700">
            Selecionar cor
            <input type="color" value={values.cor} onChange={(e) => setValues({ ...values, cor: e.target.value })} className="ml-2 h-5 w-8 cursor-pointer align-middle" />
          </label>
        </div>
        <Input label="Nome" required placeholder="Bola Amarela" {...fieldProps("nome")} />
        <Input label="Descrição" required placeholder="Nível" {...fieldProps("descricao")} />
        <Input label="Ordem na progressão" type="number" min={0} placeholder="1" hint="Só para ordenar as bolas. Não tem relação com pontos." {...fieldProps("ordem")} />
      </FormSection>
    </FormPage>
  );
}
