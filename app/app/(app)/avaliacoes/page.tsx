"use client";
import Link from "next/link";
import { useState } from "react";
import { Plus, Trash2, ClipboardCheck } from "lucide-react";
import { PageHeader, PanelPage, Section, ListRow, KebabMenu, ConfirmDialog, EmptyState } from "@/components/ui";
import { useStore } from "@/lib/store";
import { toast } from "@/components/Toast";

export default function AvaliacoesPage() {
  const criterios = useStore((s) => s.criterios);
  const deleteCriterio = useStore((s) => s.deleteCriterio);
  const [delId, setDelId] = useState<string | null>(null);
  const grouped = criterios.reduce((acc, c) => { (acc[c.categoria] ||= []).push(c); return acc; }, {} as Record<string, typeof criterios>);
  const alvo = criterios.find((c) => c.id === delId);
  return (
    <PanelPage>
      <PageHeader
        title="Avaliações"
        description="Critérios usados na avaliação de desempenho dos alunos."
        actions={<Link href="/avaliacoes/novo" className="btn-primary"><Plus size={16} /> Novo critério</Link>}
      />
      {Object.keys(grouped).length === 0 && <EmptyState icon={ClipboardCheck} title="Nenhum critério cadastrado" />}
      {Object.entries(grouped).map(([cat, list]) => (
        <Section key={cat} flush title={cat} description={`${list.length} ${list.length === 1 ? "critério" : "critérios"}`}>
          {list.map((c) => (
            <ListRow key={c.id} className="min-h-14">
              <span className="flex-1 text-sm text-ink-900">{c.nome}</span>
              <KebabMenu label={`Ações de ${c.nome}`} items={[
                { label: "Excluir", icon: <Trash2 size={14} />, danger: true, onClick: () => setDelId(c.id) },
              ]} />
            </ListRow>
          ))}
        </Section>
      ))}
      <ConfirmDialog
        open={!!delId}
        title="Excluir critério?"
        message={`"${alvo?.nome ?? ""}" deixará de aparecer nas próximas avaliações.`}
        onCancel={() => setDelId(null)}
        onConfirm={() => { if (delId) { deleteCriterio(delId); toast.success("Critério excluído"); } setDelId(null); }}
      />
    </PanelPage>
  );
}
