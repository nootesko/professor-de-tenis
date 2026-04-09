"use client";
import { PageHeader, Card, Button, KebabMenu, AvatarGroup, ConfirmDialog } from "@/components/ui";
import { useStore, selectTurmas, selectAlunos, selectNiveis, selectProfessores } from "@/lib/store";
import Link from "next/link";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";
import { useState } from "react";

export default function TurmasPage() {
  const turmas = useStore(selectTurmas);
  const alunos = useStore(selectAlunos);
  const niveis = useStore(selectNiveis);
  const professores = useStore(selectProfessores);
  const deleteTurma = useStore((s) => s.deleteTurma);
  const [delId, setDelId] = useState<string | null>(null);
  return (
    <>
      <PageHeader
        title="Turmas"
        crumbs={["DASHBOARD","TURMAS"]}
        actions={<Link href="/turmas/novo"><Button><Plus size={16} /> Cadastrar nova turma</Button></Link>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {turmas.map((t) => {
          const ts = alunos.filter((a) => t.alunosIds.includes(a.id));
          const nivel = niveis.find((n) => n.id === t.nivelId);
          const prof = professores.find((p) => p.id === t.professorId);
          return (
            <Card key={t.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <Link href={`/turmas/${t.id}`} className="font-display text-lg font-bold text-brand hover:underline">{t.nome}</Link>
                  <div className="mt-1 text-xs text-ink-500">Prof. {prof?.nome}</div>
                </div>
                <KebabMenu items={[
                  { label: "Editar", icon: <Pencil size={14} />, href: `/turmas/${t.id}/editar` },
                  { label: "Excluir", icon: <Trash2 size={14} />, danger: true, onClick: () => setDelId(t.id) },
                ]} />
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-ink-700">
                <Clock size={14} className="text-brand" /> {t.diaSemana} · {t.horario}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: nivel?.cor }} />
                <span className="text-xs text-ink-500">{nivel?.nome}</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <AvatarGroup srcs={ts.map((a) => a.avatar)} max={4} />
                <span className="text-xs text-ink-500">{ts.length} alunos</span>
              </div>
            </Card>
          );
        })}
      </div>
      <ConfirmDialog open={!!delId} title="Excluir turma?" message="A turma será removida permanentemente." onCancel={() => setDelId(null)} onConfirm={() => { if (delId) deleteTurma(delId); setDelId(null); }} />
    </>
  );
}
