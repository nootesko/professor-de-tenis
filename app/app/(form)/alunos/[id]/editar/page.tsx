"use client";
import { FormPage, FormSection, Input, Select, AvatarUpload, useFormValidation, validators as V } from "@/components/ui";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/Toast";

export default function EditarAlunoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { alunos, niveis, updateAluno, emailExists } = useStore(useShallow((s) => ({ alunos: s.alunos, niveis: s.niveis, updateAluno: s.updateAluno, emailExists: s.emailExists })));
  const aluno = alunos.find((a) => a.id === id);
  const [submitting, setSubmitting] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);

  const { values, fieldProps, isValid, validateAll, setValues } = useFormValidation(
    {
      nome: aluno?.nome ?? "",
      email: aluno?.email ?? "",
      telefone: aluno?.telefone ?? "",
      nascimento: aluno?.nascimento ?? "",
      pontos: String(aluno?.pontos ?? 0),
      nivelId: aluno?.nivelId ?? "",
      status: aluno?.status ?? "ativo",
      cep: aluno?.endereco?.cep ?? "",
      rua: aluno?.endereco?.rua ?? "",
      numero: aluno?.endereco?.numero ?? "",
      bairro: aluno?.endereco?.bairro ?? "",
      cidade: aluno?.endereco?.cidade ?? "",
      uf: aluno?.endereco?.uf ?? "",
      responsavel: aluno?.responsavelInfo?.nome ?? aluno?.responsavel ?? "",
      respTelefone: aluno?.responsavelInfo?.telefone ?? "",
      respParentesco: aluno?.responsavelInfo?.parentesco ?? "Pai/Mãe",
    },
    {
      nome: { validators: [V.required(), V.minLen(2)] },
      email: { validators: [V.required(), V.email()] },
      telefone: { mask: "phone", validators: [V.required(), V.phone()] },
      nascimento: { validators: [] },
      pontos: { validators: [V.numRange(0, 99999)] },
      cep: { mask: "cep", validators: [V.cep()] },
      uf: { validators: [V.minLen(2, "UF inválida")] },
    }
  );

  const [avatar, setAvatar] = useState<string | undefined>(aluno?.avatar);

  if (!aluno) return <div className="p-8">Aluno não encontrado</div>;

  const submit = () => {
    if (!validateAll()) return;
    if (emailExists(values.email, aluno.id)) {
      setEmailErr("E-mail já cadastrado");
      toast.error("E-mail já cadastrado");
      return;
    }
    setEmailErr(null);
    setSubmitting(true);
    updateAluno(aluno.id, {
      ...aluno,
      nome: values.nome,
      email: values.email,
      telefone: values.telefone,
      nascimento: values.nascimento,
      pontos: Number(values.pontos) || 0,
      nivelId: values.nivelId,
      status: values.status as any,
      avatar: avatar ?? "",
      endereco: { rua: values.rua, numero: values.numero, bairro: values.bairro, cidade: values.cidade, uf: values.uf, cep: values.cep },
      responsavel: values.responsavel,
      responsavelInfo: { nome: values.responsavel, telefone: values.respTelefone, parentesco: values.respParentesco },
    });
    toast.success("Aluno atualizado");
    router.push(`/alunos/${aluno.id}`);
  };

  return (
    <FormPage
      title={`Editar ${aluno.nome}`}
      backHref={`/alunos/${aluno.id}`}
      onCancel={() => router.push(`/alunos/${aluno.id}`)}
      onSubmit={submit}
      submitLabel="Salvar alterações"
      canSubmit={isValid}
      submitting={submitting}
    >
      <FormSection title="Dados do Aluno">
        <AvatarUpload value={avatar} onChange={setAvatar} alt={aluno.nome} fallback={aluno.avatar} />
        <Input label="Nome" required {...fieldProps("nome")} />
        <Input label="E-mail" required type="email" {...fieldProps("email")} error={emailErr ?? fieldProps("email").error} />
        <Input label="Telefone" required inputMode="numeric" placeholder="(11) 98888-4474" {...fieldProps("telefone")} />
        <Input label="Data de Nascimento" type="date" {...fieldProps("nascimento")} />
        <Input label="Pontos" type="number" min={0} {...fieldProps("pontos")} />
        <Select label="Nível" value={values.nivelId} onChange={(e) => setValues({ ...values, nivelId: e.target.value })}>
          {niveis.map((n) => <option key={n.id} value={n.id}>{n.nome}</option>)}
        </Select>
        <Select label="Status" value={values.status} onChange={(e) => setValues({ ...values, status: e.target.value as any })}>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </Select>
      </FormSection>

      <FormSection title="Responsável">
        <Input label="Nome do responsável" {...fieldProps("responsavel")} />
        <Input label="Telefone do responsável" inputMode="numeric" placeholder="(11) 98888-0000" {...fieldProps("respTelefone")} />
        <Select label="Parentesco" value={values.respParentesco} onChange={(e) => setValues({ ...values, respParentesco: e.target.value })}>
          {["Pai/Mãe", "Avô/Avó", "Tio/Tia", "Outro"].map((p) => <option key={p}>{p}</option>)}
        </Select>
      </FormSection>

      <FormSection title="Endereço">
        <Input label="CEP" inputMode="numeric" placeholder="00000-000" {...fieldProps("cep")} />
        <Input label="Rua" {...fieldProps("rua")} />
        <Input label="Número" {...fieldProps("numero")} />
        <Input label="Bairro" {...fieldProps("bairro")} />
        <Input label="Cidade" {...fieldProps("cidade")} />
        <Input label="UF" maxLength={2} {...fieldProps("uf")} />
      </FormSection>
    </FormPage>
  );
}
