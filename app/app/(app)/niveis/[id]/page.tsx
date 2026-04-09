"use client";
import { PageHeader, Card, Button, LevelBadge, Avatar } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function NivelDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const { niveis, alunos } = useStore();
  const n = niveis.find((x) => x.id === id);
  if (!n) return <div>Nível não encontrado</div>;
  const lista = alunos.filter((a) => a.nivelId === n.id);
  return (
    <>
      <PageHeader title={`Nível: ${n.nome}`} crumbs={["DASHBOARD","NÍVEIS",n.nome.toUpperCase()]} actions={
        <Link href={`/niveis/${n.id}/editar`}><Button variant="outline">Editar</Button></Link>
      } />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1">
          <LevelBadge cor={n.cor} nome={n.nome} size={64} imagem={n.imagem} />
          <p className="mt-3 text-sm text-ink-700">{n.descricao}</p>
          <div className="mt-4 text-xs text-ink-500">Faixa: <strong className="text-ink-900">{n.pontosMin} - {n.pontosMax} pts</strong></div>
          <Link href="/niveis"><Button variant="outline" className="mt-4">Voltar</Button></Link>
        </Card>
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-display text-lg font-bold text-brand">Alunos neste nível ({lista.length})</h3>
          <div className="mt-4 space-y-2">
            {lista.map((a) => (
              <Link key={a.id} href={`/alunos/${a.id}`} className="flex items-center gap-3 rounded-card border border-line p-3 hover:bg-brand-mint2">
                <Avatar src={a.avatar} alt={a.nome} size={40} />
                <div className="flex-1 font-medium">{a.nome}</div>
                <div className="text-xs text-ink-500">{a.pontos} pts</div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
