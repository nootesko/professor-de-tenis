"use client";
import { PageHeader, Card, Button, Avatar, KebabMenu, Badge, ConfirmDialog } from "@/components/ui";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { Plus, Pencil, Trash2, Mail, Phone, Eye } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfessoresPage() {
  const router = useRouter();
  const { professores, deleteProfessor } = useStore();
  const [delId, setDelId] = useState<string | null>(null);
  return (
    <>
      <PageHeader
        title="Lista de Professores"
        crumbs={["DASHBOARD","PROFESSORES"]}
        actions={<Link href="/professores/novo"><Button><Plus size={16} /> Cadastrar professor</Button></Link>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {professores.map((p) => (
          <Card
            key={p.id}
            className="cursor-pointer p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft"
          >
            <div onClick={() => router.push(`/professores/${p.id}`)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") router.push(`/professores/${p.id}`); }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={p.avatar} alt={p.nome} size={56} />
                <div>
                  <div className="font-display text-base font-bold text-brand">{p.nome}</div>
                  <div className="text-xs text-ink-500">{p.especialidade}</div>
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <KebabMenu items={[
                  { label: "Visualizar perfil", icon: <Eye size={14} />, href: `/professores/${p.id}` },
                  { label: "Editar", icon: <Pencil size={14} />, href: `/professores/${p.id}/editar` },
                  { label: "Excluir", icon: <Trash2 size={14} />, danger: true, onClick: () => setDelId(p.id) },
                ]} />
              </div>
            </div>
            <div className="mt-4 space-y-1 text-xs text-ink-700">
              <div className="flex items-center gap-2"><Mail size={12} className="text-brand" /> {p.email}</div>
              <div className="flex items-center gap-2"><Phone size={12} className="text-brand" /> {p.telefone}</div>
            </div>
            <div className="mt-3"><Badge color="lime">{p.status}</Badge></div>
            </div>
          </Card>
        ))}
      </div>
      <ConfirmDialog open={!!delId} title="Excluir professor?" message="O professor será removido." onCancel={() => setDelId(null)} onConfirm={() => { if (delId) deleteProfessor(delId); setDelId(null); }} />
    </>
  );
}
