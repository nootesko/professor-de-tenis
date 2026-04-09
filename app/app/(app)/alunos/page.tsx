"use client";
import { PageHeader, Card, Button, KebabMenu, Avatar, ConfirmDialog, Badge } from "@/components/ui";
import { useStore, selectAlunos, selectNiveis } from "@/lib/store";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";

export default function AlunosPage() {
  const router = useRouter();
  const alunos = useStore(selectAlunos);
  const niveis = useStore(selectNiveis);
  const deleteAluno = useStore((s) => s.deleteAluno);
  const [q, setQ] = useState("");
  const [delId, setDelId] = useState<string | null>(null);
  const filtered = alunos.filter((a) => a.nome.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader
        title="Lista de Alunos"
        crumbs={["DASHBOARD", "ALUNOS"]}
        actions={
          <Link href="/alunos/novo"><Button><Plus size={16} /> Cadastrar novo aluno</Button></Link>
        }
      />
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar aluno" className="w-full rounded-pill border border-line bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none" />
          </div>
        </div>
        {/* TODO: usar @tanstack/react-virtual quando lista passar de 100 itens (perf). */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => {
            const nivel = niveis.find((n) => n.id === a.nivelId);
            return (
              <div
                key={a.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/alunos/${a.id}`)}
                onKeyDown={(e) => { if (e.key === "Enter") router.push(`/alunos/${a.id}`); }}
                className="flex cursor-pointer items-center gap-3 rounded-card border border-line p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:shadow-card"
              >
                <Avatar src={a.avatar} alt={a.nome} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="block truncate font-semibold text-ink-900">{a.nome}</div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: nivel?.cor }} />
                    <span className="text-xs text-ink-500">{nivel?.nome} · {a.pontos} pts</span>
                  </div>
                </div>
                <Badge color={a.status === "ativo" ? "lime" : "red"}>{a.status}</Badge>
                <div onClick={(e) => e.stopPropagation()}>
                  <KebabMenu items={[
                    { label: "Visualizar perfil", icon: <Eye size={14} />, href: `/alunos/${a.id}` },
                    { label: "Editar", icon: <Pencil size={14} />, href: `/alunos/${a.id}/editar` },
                    { label: "Excluir", icon: <Trash2 size={14} />, danger: true, onClick: () => setDelId(a.id) },
                  ]} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <ConfirmDialog
        open={!!delId}
        title="Excluir aluno?"
        message="Esta ação não pode ser desfeita. O aluno será removido da lista."
        onCancel={() => setDelId(null)}
        onConfirm={() => { if (delId) deleteAluno(delId); setDelId(null); }}
      />
    </>
  );
}
