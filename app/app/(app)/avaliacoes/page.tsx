"use client";
import Link from "next/link";
import { useState } from "react";
import { Plus, Trash2, ClipboardCheck, Pencil, Check, X } from "lucide-react";
import { PageHeader, PanelPage, Section, ListRow, KebabMenu, ConfirmDialog, EmptyState } from "@/components/ui";
import { useStore, selectCriterios } from "@/lib/store";
import { toast } from "@/components/Toast";
import { cn } from "@/lib/cn";

export default function AvaliacoesPage() {
  const criterios = useStore(selectCriterios);
  const updateCriterio = useStore((s) => s.updateCriterio);
  const deleteCriterio = useStore((s) => s.deleteCriterio);
  const [delId, setDelId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const alvo = criterios.find((c) => c.id === delId);
  const ativos = criterios.filter((c) => c.ativo).length;

  const salvarNome = () => {
    if (editId && nome.trim().length >= 2) {
      updateCriterio(editId, { nome: nome.trim() });
      toast.success("Critério renomeado");
    }
    setEditId(null);
  };

  return (
    <PanelPage width="readable">
      <PageHeader
        title="Avaliações"
        description="Critérios avaliados em cada aula, com nota de 0 a 5 estrelas. A média usa só os critérios ativos e preenchidos."
        actions={<Link href="/avaliacoes/novo" className="btn-primary"><Plus size={16} /> Novo critério</Link>}
      />
      {criterios.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="Nenhum critério cadastrado" description="Crie os critérios do seu programa, como esforço, disciplina e atenção." />
      ) : (
        <Section flush title="Critérios" description={`${ativos} ${ativos === 1 ? "ativo" : "ativos"} de ${criterios.length}. Só os ativos aparecem no registro da aula.`}>
          {criterios.map((c) => (
            <ListRow key={c.id} className="min-h-14">
              <button
                type="button"
                role="switch"
                aria-checked={c.ativo}
                aria-label={`${c.ativo ? "Desativar" : "Ativar"} ${c.nome}`}
                onClick={() => updateCriterio(c.id, { ativo: !c.ativo })}
                className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", c.ativo ? "bg-brand-green" : "bg-line-strong")}
              >
                <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", c.ativo ? "left-[22px]" : "left-0.5")} />
              </button>
              {editId === c.id ? (
                <form className="flex flex-1 items-center gap-2" onSubmit={(e) => { e.preventDefault(); salvarNome(); }}>
                  <input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} className="input h-10" aria-label="Nome do critério" />
                  <button type="submit" className="grid h-9 w-9 place-items-center rounded-full text-brand hover:bg-soft" aria-label="Salvar nome"><Check size={16} /></button>
                  <button type="button" onClick={() => setEditId(null)} className="grid h-9 w-9 place-items-center rounded-full text-ink-500 hover:bg-soft" aria-label="Cancelar"><X size={16} /></button>
                </form>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <div className={cn("truncate text-sm", c.ativo ? "font-semibold text-ink-900" : "text-ink-500")}>{c.nome}</div>
                    {c.categoria && <div className="text-xs text-ink-500">{c.categoria}</div>}
                  </div>
                  <KebabMenu label={`Ações de ${c.nome}`} items={[
                    { label: "Renomear", icon: <Pencil size={14} />, onClick: () => { setNome(c.nome); setEditId(c.id); } },
                    { label: "Remover", icon: <Trash2 size={14} />, danger: true, onClick: () => setDelId(c.id) },
                  ]} />
                </>
              )}
            </ListRow>
          ))}
        </Section>
      )}
      <ConfirmDialog
        open={!!delId}
        title="Remover critério?"
        message={`"${alvo?.nome ?? ""}" deixa de aparecer nas próximas aulas. As notas já registradas continuam no histórico. Para só pausar, desative.`}
        onCancel={() => setDelId(null)}
        onConfirm={() => { if (delId) { deleteCriterio(delId); toast.success("Critério removido"); } setDelId(null); }}
      />
    </PanelPage>
  );
}
