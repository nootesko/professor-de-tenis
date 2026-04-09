"use client";
import { PageHeader, Card, Button, KebabMenu, Avatar, ConfirmDialog } from "@/components/ui";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { Plus, Trophy, Trash2, Pencil } from "lucide-react";
import { useState } from "react";

export default function PremiosPage() {
  const { premios, alunos, deletePremio } = useStore();
  const [tab, setTab] = useState<"premios" | "ranking">("premios");
  const [delId, setDelId] = useState<string | null>(null);
  const ranking = [...alunos].sort((a, b) => b.pontos - a.pontos).slice(0, 10);

  return (
    <>
      <PageHeader
        title="Prêmios"
        crumbs={["DASHBOARD","PRÊMIOS"]}
        actions={
          <>
            <Link href="/premios/premiacao/novo"><Button variant="outline">+ Premiação</Button></Link>
            <Link href="/premios/novo"><Button><Plus size={16} /> Adicionar prêmio</Button></Link>
          </>
        }
      />
      <div className="mb-4 inline-flex rounded-pill bg-white p-1 shadow-card">
        <button onClick={() => setTab("premios")} className={`rounded-pill px-5 py-2 text-sm font-semibold ${tab === "premios" ? "bg-brand-lime2 text-brand-dark" : "text-ink-500"}`}>Prêmios</button>
        <button onClick={() => setTab("ranking")} className={`rounded-pill px-5 py-2 text-sm font-semibold ${tab === "ranking" ? "bg-brand-lime2 text-brand-dark" : "text-ink-500"}`}>Ranking</button>
      </div>
      {tab === "premios" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {premios.map((p) => (
            <Card key={p.id} className="p-5 text-center">
              <div className="flex justify-end"><KebabMenu items={[
                { label: "Excluir", icon: <Trash2 size={14} />, danger: true, onClick: () => setDelId(p.id) },
              ]} /></div>
              <Trophy size={48} className="mx-auto text-brand-yellow" />
              <div className="mt-3 font-display text-lg font-bold text-brand">{p.nome}</div>
              <div className="text-xs text-ink-500">{p.descricao}</div>
              <div className="mt-3 inline-block rounded-pill bg-brand-tint px-3 py-1 text-xs font-semibold text-brand-dark">{p.pontosNecessarios} pts</div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6">
          <div className="space-y-2">
            {ranking.map((a, i) => (
              <div key={a.id} className="flex items-center gap-3 rounded-card border border-line p-3">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-tint font-bold text-brand-dark">{i + 1}</div>
                <Avatar src={a.avatar} alt={a.nome} size={40} />
                <div className="flex-1 font-medium">{a.nome}</div>
                <div className="font-display text-lg font-bold text-brand">{a.pontos}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
      <ConfirmDialog open={!!delId} title="Excluir prêmio?" message="O prêmio será removido." onCancel={() => setDelId(null)} onConfirm={() => { if (delId) deletePremio(delId); setDelId(null); }} />
    </>
  );
}
