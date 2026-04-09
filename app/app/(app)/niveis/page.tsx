"use client";
import { PageHeader, Card, Button, KebabMenu, ConfirmDialog } from "@/components/ui";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

export default function NiveisPage() {
  const { niveis, alunos, deleteNivel } = useStore();
  const [delId, setDelId] = useState<string | null>(null);
  return (
    <>
      <PageHeader
        title="Níveis"
        crumbs={["DASHBOARD","NÍVEIS"]}
        actions={<Link href="/niveis/novo"><Button><Plus size={16} /> Cadastrar nível</Button></Link>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {niveis.map((n) => {
          const count = alunos.filter((a) => a.nivelId === n.id).length;
          return (
            <Card key={n.id} className="overflow-hidden">
              <div className="h-24 relative" style={{ background: n.cor }}>
                <div className="absolute right-3 top-3 rounded-full bg-white/90 shadow-md ring-1 ring-black/5 backdrop-blur">
                  <KebabMenu items={[
                    { label: "Editar", icon: <Pencil size={14} />, href: `/niveis/${n.id}/editar` },
                    { label: "Excluir", icon: <Trash2 size={14} />, danger: true, onClick: () => setDelId(n.id) },
                  ]} />
                </div>
                {n.imagem ? (
                  <img
                    src={n.imagem}
                    alt={n.nome}
                    className="absolute -bottom-6 left-5 h-12 w-12 rounded-full object-cover ring-4 ring-white shadow"
                  />
                ) : (
                  <div className="absolute -bottom-6 left-5 grid h-12 w-12 place-items-center rounded-full ring-4 ring-white shadow" style={{ background: n.cor }} />
                )}
              </div>
              <div className="p-5 pt-8">
                <Link href={`/niveis/${n.id}`} className="font-display text-lg font-bold text-brand hover:underline">{n.nome}</Link>
                <div className="mt-1 text-xs text-ink-500">{n.descricao}</div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-ink-700">{n.pontosMin} - {n.pontosMax} pts</span>
                  <span className="rounded-pill bg-brand-tint px-3 py-1 font-medium text-brand-dark">{count} alunos</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <ConfirmDialog open={!!delId} title="Excluir nível?" message="O nível será removido." onCancel={() => setDelId(null)} onConfirm={() => { if (delId) deleteNivel(delId); setDelId(null); }} />
    </>
  );
}
