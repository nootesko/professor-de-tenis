"use client";
import { FormPage, FormSection, Input, AvatarUpload, useFormValidation, validators as V } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function EditarNivelPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { niveis, updateNivel } = useStore();
  const n = niveis.find((x) => x.id === id);
  const [imagem, setImagem] = useState<string | undefined>(n?.imagem);

  const { values, fieldProps, isValid, validateAll, setValues } = useFormValidation(
    {
      nome: n?.nome ?? "",
      descricao: n?.descricao ?? "",
      cor: n?.cor ?? "#edbe16",
      pontosMin: String(n?.pontosMin ?? 0),
      pontosMax: String(n?.pontosMax ?? 100),
    },
    {
      nome: { validators: [V.required(), V.minLen(2)] },
      descricao: { validators: [V.required()] },
      pontosMin: { validators: [V.required(), V.numRange(0, 99999)] },
      pontosMax: { validators: [V.required(), V.numRange(0, 99999)] },
    }
  );

  if (!n) return <div className="p-8">Nível não encontrado</div>;

  const submit = () => {
    if (!validateAll()) return;
    updateNivel(n.id, { ...n, ...values, pontosMin: Number(values.pontosMin), pontosMax: Number(values.pontosMax), imagem });
    router.push("/niveis");
  };

  return (
    <FormPage
      title={`Editar ${n.nome}`}
      backHref={`/niveis/${n.id}`}
      onCancel={() => router.push(`/niveis/${n.id}`)}
      onSubmit={submit}
      submitLabel="Salvar alterações"
      canSubmit={isValid}
    >
      <FormSection title="Dados do Nível">
        <AvatarUpload value={imagem} onChange={setImagem} alt={n.nome} size={96} />
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
        <Input label="Nome" required {...fieldProps("nome")} />
        <Input label="Descrição" required {...fieldProps("descricao")} />
        <Input label="Pontos mínimos" required type="number" min={0} {...fieldProps("pontosMin")} />
        <Input label="Pontos máximos" required type="number" min={0} {...fieldProps("pontosMax")} />
      </FormSection>
    </FormPage>
  );
}
