"use client";
import { PageHeader, Card, Button, KebabMenu, ConfirmDialog } from "@/components/ui";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { Plus, Pencil, Trash2, ClipboardCheck } from "lucide-react";
import { useState } from "react";

export default function AvaliacoesPage() {
  const { criterios, deleteCriterio } = useStore();
  const [delId, setDelId] = useState<string | null>(null);
  const grouped = criterios.reduce((acc, c) => { (acc[c.categoria] ||= []).push(c); return acc; }, {} as Record<string, typeof criterios>);
  return (
    <>
      <PageHeader
        title="Avaliações"
        crumbs={["DASHBOARD","AVALIAÇÕES"]}
        actions={<Link href="/avaliacoes/novo"><Button><Plus size={16} /> Adicionar critério</Button></Link>}
      />
      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(grouped).map(([cat, list]) => (
          <Card key={cat} className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <ClipboardCheck size={18} className="text-brand" />
              <h3 className="font-display text-lg font-bold text-brand">{cat}</h3>
            </div>
            <div className="space-y-2">
              {list.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-card border border-line p-3">
                  <span className="text-sm">{c.nome}</span>
                  <KebabMenu items={[
                    { label: "Excluir", icon: <Trash2 size={14} />, danger: true, onClick: () => setDelId(c.id) },
                  ]} />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <ConfirmDialog open={!!delId} title="Excluir critério?" message="O critério será removido." onCancel={() => setDelId(null)} onConfirm={() => { if (delId) deleteCriterio(delId); setDelId(null); }} />
    </>
  );
}
