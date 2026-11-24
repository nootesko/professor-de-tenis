"use client";
import { FormPage, FormSection, Input, AvatarUpload, useFormValidation, validators as V } from "@/components/ui";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NovoProfessorPage() {
  const router = useRouter();
  const { addProfessor } = useStore(useShallow((s) => ({ addProfessor: s.addProfessor })));

  const { values, fieldProps, isValid, validateAll } = useFormValidation(
    {
      nome: "", email: "", telefone: "", especialidade: "",
      cpf: "", nascimento: "",
      cep: "", rua: "", numero: "", bairro: "", cidade: "", uf: "", complemento: "",
    },
    {
      nome: { validators: [V.required(), V.minLen(2)] },
      email: { validators: [V.required(), V.email()] },
      telefone: { mask: "phone", validators: [V.required(), V.phone()] },
      cpf: { mask: "cpf", validators: [V.required(), V.cpf()] },
      nascimento: { mask: "date", validators: [V.required(), V.dateBR()] },
      especialidade: { validators: [V.required()] },
      cep: { mask: "cep", validators: [V.required(), V.cep()] },
      rua: { validators: [V.required()] },
      numero: { validators: [V.required()] },
      bairro: { validators: [V.required()] },
      cidade: { validators: [V.required()] },
      uf: { validators: [V.required(), V.minLen(2, "UF inválida")] },
    }
  );

  const [avatar, setAvatar] = useState<string | undefined>(undefined);

  const submit = () => {
    if (!validateAll()) return;
    addProfessor({
      id: "p" + Date.now(),
      nome: values.nome,
      email: values.email,
      telefone: values.telefone,
      especialidade: values.especialidade || "Técnica",
      avatar: avatar || "",
      status: "ativo",
    });
    router.push("/professores");
  };

  return (
    <FormPage
      title="Cadastrar Professor"
      backHref="/professores"
      onCancel={() => router.push("/professores")}
      onSubmit={submit}
      submitLabel="Cadastrar professor"
      canSubmit={isValid}
    >
      <FormSection title="Dados do Professor">
        <AvatarUpload value={avatar} onChange={setAvatar} alt="Avatar do professor" />
        <Input label="Nome" required {...fieldProps("nome")} />
        <Input label="Data de Nascimento" required inputMode="numeric" placeholder="dd/mm/aaaa" {...fieldProps("nascimento")} />
        <Input label="Especialidade" required placeholder="Técnica" {...fieldProps("especialidade")} />
      </FormSection>

      <FormSection title="Informações">
        <Input label="E-mail" required type="email" {...fieldProps("email")} />
        <Input label="CPF" required inputMode="numeric" placeholder="000.000.000-00" {...fieldProps("cpf")} />
        <Input label="Telefone" required inputMode="numeric" placeholder="(11) 98888-4474" {...fieldProps("telefone")} />
      </FormSection>

      <FormSection title="Endereço">
        <Input label="CEP" required inputMode="numeric" placeholder="00000-000" {...fieldProps("cep")} />
        <Input label="Rua" required {...fieldProps("rua")} />
        <Input label="Número" required {...fieldProps("numero")} />
        <Input label="Bairro" required {...fieldProps("bairro")} />
        <Input label="Cidade" required {...fieldProps("cidade")} />
        <Input label="UF" required maxLength={2} {...fieldProps("uf")} />
        <Input label="Complemento" {...fieldProps("complemento")} />
      </FormSection>
    </FormPage>
  );
}
