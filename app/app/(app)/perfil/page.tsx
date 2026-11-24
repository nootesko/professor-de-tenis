"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { PageHeader, PanelPage, FormSection, Button, AvatarUpload, Input, useFormValidation, validators as V } from "@/components/ui";
import { useAuth, ADMIN_PROFILE } from "@/lib/auth";
import { toast } from "@/components/Toast";

export default function PerfilPage() {
  const router = useRouter();
  const logout = useAuth((s) => s.logout);
  const [avatar, setAvatar] = useState<string | undefined>(ADMIN_PROFILE.avatar);

  const { fieldProps, isValid, validateAll } = useFormValidation(
    { nome: ADMIN_PROFILE.nome, email: ADMIN_PROFILE.email, telefone: ADMIN_PROFILE.telefone, especialidade: ADMIN_PROFILE.especialidade },
    {
      nome: { validators: [V.required(), V.minLen(2)] },
      email: { validators: [V.required(), V.email()] },
      telefone: { mask: "phone", validators: [V.required(), V.phone()] },
      especialidade: { validators: [V.required()] },
    },
  );
  const senha = useFormValidation({ atual: "", nova: "" }, { atual: { validators: [V.required()] }, nova: { validators: [V.required(), V.minLen(6)] } });

  const salvar = () => {
    if (!validateAll()) return toast.error("Revise os campos destacados");
    toast.success("Dados atualizados");
  };
  const trocarSenha = () => {
    if (!senha.validateAll()) return toast.error("Preencha a senha atual e a nova (mín. 6 caracteres)");
    toast.success("Senha alterada");
  };
  const sair = () => { logout(); router.push("/login"); };

  return (
    <PanelPage width="readable">
      <PageHeader title="Meu perfil" description="Seus dados de acesso ao painel." />
      <FormSection title="Foto">
        <div className="flex items-center gap-5">
          <AvatarUpload value={avatar} onChange={setAvatar} alt={ADMIN_PROFILE.nome} size={88} />
          <p className="text-sm text-ink-500">JPG ou PNG, quadrada, de preferência com o rosto centralizado.</p>
        </div>
      </FormSection>
      <FormSection title="Dados pessoais">
        <Input label="Nome" required autoComplete="name" {...fieldProps("nome")} />
        <Input label="E-mail" required type="email" autoComplete="email" {...fieldProps("email")} />
        <Input label="Telefone" required inputMode="tel" autoComplete="tel" {...fieldProps("telefone")} />
        <Input label="Especialidade" required {...fieldProps("especialidade")} />
        <div className="flex justify-end"><Button disabled={!isValid} onClick={salvar}>Salvar dados</Button></div>
      </FormSection>
      <FormSection title="Senha">
        <Input label="Senha atual" type="password" autoComplete="current-password" {...senha.fieldProps("atual")} />
        <Input label="Nova senha" type="password" autoComplete="new-password" {...senha.fieldProps("nova")} />
        <div className="flex justify-end"><Button variant="outline" onClick={trocarSenha}>Alterar senha</Button></div>
      </FormSection>
      <section className="flex items-center justify-between gap-4 rounded-card border border-line-strong bg-white p-5 sm:p-6">
        <div>
          <h2 className="font-display text-base font-bold text-brand">Sair da conta</h2>
          <p className="text-xs text-ink-500">Encerra a sessão neste navegador.</p>
        </div>
        <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={sair}><LogOut size={14} /> Sair</Button>
      </section>
    </PanelPage>
  );
}
