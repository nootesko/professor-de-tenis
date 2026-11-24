"use client";
import { FormPage, FormSection, Input, Select, AvatarUpload, useFormValidation, validators as V } from "@/components/ui";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function EditarProfessorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { professores, updateProfessor } = useStore(useShallow((s) => ({ professores: s.professores, updateProfessor: s.updateProfessor })));
  const prof = professores.find((p) => p.id === id);

  const { values, fieldProps, isValid, validateAll, setValues } = useFormValidation(
    {
      nome: prof?.nome ?? "",
      email: prof?.email ?? "",
      telefone: prof?.telefone ?? "",
      especialidade: prof?.especialidade ?? "",
      status: prof?.status ?? "ativo",
    },
    {
      nome: { validators: [V.required(), V.minLen(2)] },
      email: { validators: [V.required(), V.email()] },
      telefone: { mask: "phone", validators: [V.required(), V.phone()] },
      especialidade: { validators: [V.required()] },
    }
  );

  const [avatar, setAvatar] = useState<string | undefined>(prof?.avatar);

  if (!prof) return <div className="p-8">Professor não encontrado</div>;

  const submit = () => {
    if (!validateAll()) return;
    updateProfessor(prof.id, { ...prof, ...values, avatar: avatar ?? "", status: values.status as any });
    router.push(`/professores/${prof.id}`);
  };

  return (
    <FormPage
      title={`Editar ${prof.nome}`}
      backHref={`/professores/${prof.id}`}
      onCancel={() => router.push(`/professores/${prof.id}`)}
      onSubmit={submit}
      submitLabel="Salvar alterações"
      canSubmit={isValid}
    >
      <FormSection title="Dados do Professor">
        <AvatarUpload value={avatar} onChange={setAvatar} alt={prof.nome} fallback={prof.avatar} />
        <Input label="Nome" required {...fieldProps("nome")} />
        <Input label="E-mail" required type="email" {...fieldProps("email")} />
        <Input label="Telefone" required inputMode="numeric" placeholder="(11) 98888-4474" {...fieldProps("telefone")} />
        <Input label="Especialidade" required {...fieldProps("especialidade")} />
        <Select label="Status" value={values.status} onChange={(e) => setValues({ ...values, status: e.target.value as any })}>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </Select>
      </FormSection>
    </FormPage>
  );
}
