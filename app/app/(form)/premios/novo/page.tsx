"use client";
import { FormPage, FormSection, Input, Select, useFormValidation, validators as V } from "@/components/ui";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/lib/store";
import { premioDoNivel } from "@/lib/gamificacao";
import type { AnimacaoConquista, PremioNivel } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/Toast";

const TIPOS = ["Medalha pequena", "Medalha média", "Medalha grande", "Prêmio gigante", "Troféu", "Gigante Suprema", "Troféu de Taças", "Adesivo", "Estrela", "Faixa"];

/**
 * Configura o prêmio de um nível (?nivel=N), de uma faixa da regra do bloco (?faixa=i),
 * ou de um nível escolhido aqui (sem parâmetro).
 */
export default function ConfigurarNivelPage() {
  const router = useRouter();
  const params = useSearchParams();
  const nivelParam = Number(params.get("nivel")) || null;
  const faixaParam = params.get("faixa");
  const faixaIdx = faixaParam != null ? Number(faixaParam) : null;
  const { tabela, definirNivel, definirFaixa } = useStore(
    useShallow((s) => ({ tabela: s.tabela, definirNivel: s.definirNivelPremio, definirFaixa: s.definirFaixa }))
  );

  const faixa = faixaIdx != null ? tabela.faixas[faixaIdx] : undefined;
  const faixasOrd = [...tabela.faixas].sort((a, b) => a.ate - b.ate);
  const faixaDe = faixa ? (faixasOrd[faixasOrd.indexOf(faixa) - 1]?.ate ?? 0) + 1 : 0;
  const atualNivel = nivelParam ? premioDoNivel(tabela, nivelParam) : null;
  const base: PremioNivel | null = faixa ? faixa.premio : atualNivel;

  const [animacao, setAnimacao] = useState<AnimacaoConquista>(base?.animacao ?? "confete");
  const [celebrar, setCelebrar] = useState(base?.celebrar ?? false);
  const [temPremio, setTemPremio] = useState(faixa ? true : nivelParam ? !!atualNivel : true);

  const { values, fieldProps, isValid, validateAll } = useFormValidation(
    {
      nivel: String(nivelParam ?? ""),
      nome: base?.nome ?? "",
      tipo: base?.tipo ?? "Medalha pequena",
      descricao: base?.descricao ?? "",
      gifUrl: base?.gifUrl ?? "",
    },
    {
      nivel: { validators: faixa ? [] : [V.required(), V.numRange(1, 1000000)] },
      nome: { validators: temPremio ? [V.required(), V.minLen(2)] : [] },
      tipo: { validators: temPremio ? [V.required()] : [] },
    }
  );

  const nivel = Number(values.nivel);

  const submit = () => {
    if (!validateAll()) return;
    const dados: PremioNivel = {
      nome: values.nome.trim(),
      tipo: values.tipo.trim(),
      descricao: values.descricao.trim() || undefined,
      gifUrl: values.gifUrl.trim() || undefined,
      animacao,
      celebrar,
    };
    if (faixa && faixaIdx != null) {
      definirFaixa(faixaIdx, dados);
      toast.success("Regra do bloco atualizada");
    } else {
      definirNivel(nivel, temPremio ? dados : null);
      toast.success(temPremio ? `Nível ${nivel} configurado` : `Nível ${nivel} sem prêmio`);
    }
    router.push("/premios");
  };

  const titulo = faixa
    ? `Níveis ${faixaDe}–${faixa.ate} de cada bloco`
    : nivelParam
      ? `Nível ${nivelParam}`
      : "Configurar nível";

  return (
    <FormPage
      title={titulo}
      description={
        faixa
          ? `Vale para as posições ${faixaDe} a ${faixa.ate} de todo bloco de ${tabela.tamanhoBloco}, exceto níveis configurados um a um.`
          : "O aluno alcança este nível quando o total acumulado chega nele. Nível sem prêmio conta normalmente, sem aviso."
      }
      backHref="/premios"
      onCancel={() => router.push("/premios")}
      onSubmit={submit}
      submitLabel="Salvar"
      canSubmit={isValid && (!!faixa || nivel >= 1)}
    >
      {!faixa && (
        <FormSection title="Nível">
          {!nivelParam && (
            <Input label="Número do nível" required type="number" min={1} placeholder="Ex.: 192" hint="Total acumulado em que o prêmio é conquistado. Não há limite." {...fieldProps("nivel")} />
          )}
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={temPremio} onChange={(e) => setTemPremio(e.target.checked)} className="mt-0.5 h-5 w-5 accent-[#0f8445]" />
            <span>
              <span className="block text-sm font-semibold text-ink-900">Este nível tem prêmio</span>
              <span className="block text-xs text-ink-500">Desmarque para o nível contar sem nomenclatura nem comemoração.</span>
            </span>
          </label>
        </FormSection>
      )}
      {temPremio && (
        <>
          <FormSection title="Prêmio">
            <Input label="Nome" required placeholder="Troféu de forehand" {...fieldProps("nome")} />
            <Input label="Tipo" required list="tipos-premio" hint="Livre: medalha, troféu, adesivo, faixa..." {...fieldProps("tipo")} />
            <datalist id="tipos-premio">{TIPOS.map((t) => <option key={t} value={t} />)}</datalist>
            <Input label="Descrição" placeholder="Opcional" {...fieldProps("descricao")} />
          </FormSection>
          <FormSection title="Comemoração">
            <Input label="GIF ou imagem (URL)" type="url" placeholder="https://..." hint="Aparece com a mensagem de conquista. Se vazio, usa a animação abaixo." {...fieldProps("gifUrl")} />
            <Select label="Animação" value={animacao} onChange={(e) => setAnimacao(e.target.value as AnimacaoConquista)}>
              <option value="confete">Confete</option>
              <option value="fogos">Fogos</option>
              <option value="estrelas">Estrelas</option>
              <option value="nenhuma">Sem animação</option>
            </Select>
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={celebrar} onChange={(e) => setCelebrar(e.target.checked)} className="mt-0.5 h-5 w-5 accent-[#0f8445]" />
              <span>
                <span className="block text-sm font-semibold text-ink-900">Comemorar</span>
                <span className="block text-xs text-ink-500">Usado quando a comemoração do programa está em “Só prêmios selecionados”.</span>
              </span>
            </label>
          </FormSection>
        </>
      )}
    </FormPage>
  );
}
