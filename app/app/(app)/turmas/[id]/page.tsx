"use client";
import { PageHeader, Card, Button, Avatar, Badge } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Pencil, Clock, Calendar, GraduationCap, X } from "lucide-react";
import { toast } from "@/components/Toast";

export default function TurmaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const { turmas, alunos, professores, niveis, assignAlunoToTurma } = useStore();
  const turma = turmas.find((t) => t.id === id);
  if (!turma) return <div>Turma não encontrada</div>;
  const lista = alunos.filter((a) => turma.alunosIds.includes(a.id));
  const prof = professores.find((p) => p.id === turma.professorId);
  const nivel = niveis.find((n) => n.id === turma.nivelId);

  return (
    <>
      <PageHeader
        title={turma.nome}
        crumbs={["DASHBOARD", "TURMAS", turma.nome.toUpperCase()]}
        actions={
          <Link href={`/turmas/${turma.id}/editar`}>
            <Button variant="outline"><Pencil size={14} /> Editar Turma</Button>
          </Link>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1">
          <h3 className="font-display text-base font-bold text-brand">Informações</h3>
          <div className="mt-4 space-y-3 text-sm text-ink-700">
            <div className="flex items-center gap-2"><Calendar size={14} className="text-brand" /> {turma.diaSemana}</div>
            <div className="flex items-center gap-2"><Clock size={14} className="text-brand" /> {turma.horario}</div>
            {prof && (
              <Link href={`/professores/${prof.id}`} className="flex items-center gap-2 text-ink-700 hover:text-brand">
                <GraduationCap size={14} className="text-brand" /> {prof.nome}
              </Link>
            )}
            {nivel && <Badge color="lime">{nivel.nome}</Badge>}
          </div>
          <div className="mt-4 rounded-card bg-brand-mint2 p-3 text-xs text-brand">
            A presença e a avaliação dos alunos são feitas ao <strong>finalizar a aula</strong> pelo Dashboard.
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-brand">Alunos matriculados</h3>
            <Badge color="lime">{lista.length} alunos</Badge>
          </div>
          {lista.length === 0 ? (
            <p className="text-sm text-ink-500">Nenhum aluno matriculado. Use Editar Turma para adicionar.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {lista.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-card border border-line bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-card">
                  <Link href={`/alunos/${a.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar src={a.avatar} alt={a.nome} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-ink-900">{a.nome}</div>
                      <div className="text-xs text-ink-500">{a.pontos} pts</div>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      const r = assignAlunoToTurma(a.id, null);
                      if (r.ok) toast.success(`${a.nome} removido da turma`);
                      else toast.error(r.error || "Erro");
                    }}
                    aria-label={`Remover ${a.nome} da turma`}
                    className="grid h-8 w-8 place-items-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
