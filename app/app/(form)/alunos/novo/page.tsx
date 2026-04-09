"use client";
// TODO: split steps em arquivos e importar via next/dynamic quando crescer
import { FormPage, FormSection, Input, Select, AvatarUpload, useFormValidation, validators as V } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/Toast";
import { cn } from "@/lib/cn";

const STEPS = ["Dados", "Endereço", "Nível", "Foto"] as const;

function Stepper({ step }: { step: number }) {
  return (
    <div className="mb-6 flex items-center justify-center gap-2">
      {STEPS.map((label, i) => {
        const idx = i + 1;
        const active = idx === step;
        const done = idx < step;
        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={cn(
                "grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition-all",
                active ? "bg-brand text-white scale-110" : done ? "bg-brand-lime2 text-brand-dark" : "bg-line text-ink-500"
              )}
            >
              {idx}
            </div>
            <span className={cn("hidden text-xs sm:inline", active ? "font-semibold text-brand" : "text-ink-500")}>{label}</span>
            {idx < STEPS.length && <div className="h-px w-6 bg-line sm:w-10" />}
          </div>
        );
      })}
    </div>
  );
}

export default function CadastrarAlunoPage() {
  const router = useRouter();
  const { addAluno, niveis, turmas, emailExists } = useStore();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);

  const { values, fieldProps, validateAll, setValues } = useFormValidation(
    {
      nome: "", email: "", telefone: "", nascimento: "", responsavel: "",
      respTelefone: "", respParentesco: "Pai/Mãe",
      rua: "", numero: "", bairro: "", cidade: "", uf: "", cep: "", complemento: "",
      nivelId: niveis[0]?.id || "", pontos: "0",
      turmaId: "",
    },
    {
      nome: { validators: [V.required(), V.minLen(2, "Nome muito curto")] },
      email: { validators: [V.required(), V.email()] },
      telefone: { mask: "phone", validators: [V.required(), V.phone()] },
      nascimento: { mask: "date", validators: [V.required(), V.dateBR()] },
      responsavel: { validators: [V.required(), V.minLen(2)] },
      respTelefone: { mask: "phone", validators: [V.phone()] },
      cep: { mask: "cep", validators: [V.required(), V.cep()] },
      rua: { validators: [V.required()] },
      numero: { validators: [V.required()] },
      bairro: { validators: [V.required()] },
      cidade: { validators: [V.required()] },
      uf: { validators: [V.required(), V.minLen(2, "UF inválida")] },
      nivelId: { validators: [V.required()] },
      pontos: { validators: [V.numRange(0, 99999)] },
    }
  );

  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [emailErr, setEmailErr] = useState<string | null>(null);

  const goNext = () => {
    if (step === 1) {
      if (!values.nome || !values.email || !values.telefone || !values.nascimento || !values.responsavel) {
        toast.error("Preencha os dados obrigatórios");
        return;
      }
      if (emailExists(values.email)) {
        setEmailErr("E-mail já cadastrado");
        toast.error("E-mail já cadastrado");
        return;
      }
      setEmailErr(null);
    }
    if (step === 2) {
      if (!values.cep || !values.rua || !values.numero || !values.bairro || !values.cidade || !values.uf) {
        toast.error("Preencha o endereço");
        return;
      }
    }
    setStep((s) => Math.min(4, (s + 1)) as 1 | 2 | 3 | 4);
  };
  const goPrev = () => setStep((s) => Math.max(1, (s - 1)) as 1 | 2 | 3 | 4);

  const submit = () => {
    if (!validateAll()) {
      toast.error("Verifique os campos");
      return;
    }
    if (emailExists(values.email)) {
      toast.error("E-mail já cadastrado");
      setStep(1);
      setEmailErr("E-mail já cadastrado");
      return;
    }
    // Vagas check if turma chosen
    if (values.turmaId) {
      const t = turmas.find((x) => x.id === values.turmaId);
      if (t && typeof t.vagas === "number" && t.alunosIds.length >= t.vagas) {
        toast.error("Turma selecionada sem vagas");
        return;
      }
    }
    setSubmitting(true);
    const id = "a" + Date.now();
    addAluno({
      id,
      nome: values.nome, email: values.email, telefone: values.telefone,
      nascimento: values.nascimento, responsavel: values.responsavel,
      responsavelInfo: { nome: values.responsavel, telefone: values.respTelefone, parentesco: values.respParentesco },
      endereco: { rua: values.rua, numero: values.numero, bairro: values.bairro, cidade: values.cidade, uf: values.uf, cep: values.cep },
      avatar: avatar || "",
      turmaId: values.turmaId || undefined,
      nivelId: values.nivelId, pontos: Number(values.pontos) || 0, status: "ativo",
    });
    toast.success("Aluno cadastrado");
    router.push("/alunos");
  };

  return (
    <FormPage
      title="Cadastrar Aluno"
      backHref="/alunos"
      onCancel={() => router.push("/alunos")}
      onSubmit={step === 4 ? submit : goNext}
      submitLabel={step === 4 ? "Cadastrar Aluno" : "Próximo"}
      submitting={submitting}
      step={{ current: step, total: 4 }}
    >
      <Stepper step={step} />

      {step === 1 && (
        <>
          <FormSection title="Dados do Aluno">
            <Input label="Nome" required placeholder="Nome completo" {...fieldProps("nome")} />
            <Input label="Data de Nascimento" required placeholder="dd/mm/aaaa" inputMode="numeric" {...fieldProps("nascimento")} />
            <Input label="E-mail" required type="email" placeholder="email@dominio.com" {...fieldProps("email")} error={emailErr ?? fieldProps("email").error} />
            <Input label="Telefone" required inputMode="numeric" placeholder="(11) 98888-4474" {...fieldProps("telefone")} />
          </FormSection>
          <FormSection title="Responsável">
            <Input label="Nome do responsável" required {...fieldProps("responsavel")} />
            <Input label="Telefone do responsável" inputMode="numeric" placeholder="(11) 98888-0000" {...fieldProps("respTelefone")} />
            <Select label="Parentesco" value={values.respParentesco} onChange={(e) => setValues({ ...values, respParentesco: e.target.value })}>
              {["Pai/Mãe", "Avô/Avó", "Tio/Tia", "Outro"].map((p) => <option key={p}>{p}</option>)}
            </Select>
          </FormSection>
        </>
      )}

      {step === 2 && (
        <FormSection title="Endereço">
          <Input label="CEP" required inputMode="numeric" placeholder="00000-000" {...fieldProps("cep")} />
          <Input label="Rua" required {...fieldProps("rua")} />
          <Input label="Número" required {...fieldProps("numero")} />
          <Input label="Bairro" required {...fieldProps("bairro")} />
          <Input label="Cidade" required {...fieldProps("cidade")} />
          <Input label="UF" required maxLength={2} {...fieldProps("uf")} />
          <Input label="Complemento" {...fieldProps("complemento")} />
        </FormSection>
      )}

      {step === 3 && (
        <FormSection title="Nível & Turma">
          <Select label="Nível inicial" required value={values.nivelId} onChange={(e) => setValues({ ...values, nivelId: e.target.value })}>
            {niveis.map((n) => <option key={n.id} value={n.id}>{n.nome}</option>)}
          </Select>
          <Select label="Turma (opcional)" value={values.turmaId} onChange={(e) => setValues({ ...values, turmaId: e.target.value })}>
            <option value="">Sem turma</option>
            {turmas.map((t) => {
              const cheia = typeof t.vagas === "number" && t.alunosIds.length >= t.vagas;
              return (
                <option key={t.id} value={t.id} disabled={cheia}>
                  {t.nome} {cheia ? "(sem vagas)" : ""}
                </option>
              );
            })}
          </Select>
          <Input label="Pontos iniciais" type="number" min={0} {...fieldProps("pontos")} />
        </FormSection>
      )}

      {step === 4 && (
        <FormSection title="Foto do Aluno">
          <AvatarUpload value={avatar} onChange={setAvatar} alt="Avatar do aluno" />
          <p className="text-center text-xs text-ink-500">Opcional. Você pode adicionar depois.</p>
        </FormSection>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goPrev}
          disabled={step === 1}
          className="rounded-pill border border-line bg-white px-5 py-2 text-sm font-semibold text-ink-700 hover:bg-brand-mint2 disabled:opacity-40"
        >
          Voltar
        </button>
        <span className="text-xs text-ink-500">Etapa {step} de 4</span>
      </div>
    </FormPage>
  );
}
