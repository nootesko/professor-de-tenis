"use client";
import { PageHeader, Card, Button, Avatar, Badge } from "@/components/ui";
import { Pencil } from "lucide-react";
import { useStore } from "@/lib/store";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";

export default function ProfessorDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const { professores, turmas } = useStore();
  const p = professores.find((x) => x.id === id);
  if (!p) return <div>Professor não encontrado</div>;
  const ts = turmas.filter((t) => t.professorId === p.id);
  return (
    <>
      <PageHeader title={p.nome} crumbs={["DASHBOARD","PROFESSORES",p.nome.toUpperCase()]} actions={
        <Link href={`/professores/${p.id}/editar`}><Button variant="outline"><Pencil size={14} /> Editar</Button></Link>
      } />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 text-center lg:col-span-1">
          <Avatar src={p.avatar} alt={p.nome} size={96} />
          <h2 className="mt-3 font-display text-xl font-bold text-brand">{p.nome}</h2>
          <div className="text-xs text-ink-500">{p.especialidade}</div>
          <div className="mt-2"><Badge color="lime">{p.status}</Badge></div>
          <div className="mt-4 space-y-2 text-left text-sm text-ink-700">
            <div className="flex items-center gap-2"><Mail size={14} className="text-brand" /> {p.email}</div>
            <div className="flex items-center gap-2"><Phone size={14} className="text-brand" /> {p.telefone}</div>
          </div>
        </Card>
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-display text-lg font-bold text-brand">Turmas ({ts.length})</h3>
          <div className="mt-3 space-y-2">
            {ts.map((t) => (
              <Link key={t.id} href={`/turmas/${t.id}`} className="flex items-center justify-between rounded-card border border-line p-3 hover:bg-brand-mint2">
                <span className="font-medium">{t.nome}</span>
                <span className="text-xs text-ink-500">{t.diaSemana} · {t.horario}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
