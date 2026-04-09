"use client";
import { PageHeader, Card, Button, AvatarUpload, Input, useFormValidation, validators as V } from "@/components/ui";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PerfilPage() {
  const router = useRouter();
  const [avatar, setAvatar] = useState<string | undefined>("https://i.pravatar.cc/150?img=12");

  const { fieldProps, isValid, validateAll } = useFormValidation(
    {
      nome: "Cássio Lima",
      email: "cassio@noot.com.br",
      telefone: "(11) 99999-1111",
      especialidade: "Técnica",
      senhaAtual: "",
      novaSenha: "",
    },
    {
      nome: { validators: [V.required(), V.minLen(2)] },
      email: { validators: [V.required(), V.email()] },
      telefone: { mask: "phone", validators: [V.required(), V.phone()] },
      especialidade: { validators: [V.required()] },
    }
  );

  return (
    <>
      <PageHeader title="Meu Perfil" crumbs={["DASHBOARD","PERFIL"]} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 text-center lg:col-span-1">
          <AvatarUpload value={avatar} onChange={setAvatar} alt="Cássio" size={120} />
          <h2 className="mt-4 font-display text-xl font-bold text-brand">Prof. Cássio Lima</h2>
          <div className="text-xs text-ink-500">cassio@noot.com.br</div>
          <button onClick={() => router.push("/login")} className="mt-3 inline-flex items-center justify-center gap-2 rounded-pill bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100">
            <LogOut size={14} /> Sair da conta
          </button>
        </Card>
        <Card className="p-8 lg:col-span-2">
          <h3 className="font-display text-lg font-bold text-brand">Dados Pessoais</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input label="Nome" required {...fieldProps("nome")} />
            <Input label="E-mail" required type="email" {...fieldProps("email")} />
            <Input label="Telefone" required inputMode="numeric" {...fieldProps("telefone")} />
            <Input label="Especialidade" required {...fieldProps("especialidade")} />
            <Input label="Senha atual" type="password" {...fieldProps("senhaAtual")} />
            <Input label="Nova senha" type="password" {...fieldProps("novaSenha")} />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline">Cancelar</Button>
            <Button disabled={!isValid} onClick={() => validateAll()}>Salvar alterações</Button>
          </div>
        </Card>
      </div>
    </>
  );
}
