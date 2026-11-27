"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Pencil, Clock, Calendar, GraduationCap, X, Users, Star, ClipboardCheck } from "lucide-react";
import { PageHeader, PanelPage, Section, ListRow, InfoRow, StatGrid, StatCard, Avatar, ConfirmDialog, EmptyState, NotFoundState } from "@/components/ui";
import { useStore, selectTurmas, selectAlunos, selectProfessores, selectNiveis, selectAulas } from "@/lib/store";
import { toLocalISODate } from "@/lib/date";
import { toast } from "@/components/Toast";

export default function TurmaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const turmas = useStore(selectTurmas);
  const alunos = useStore(selectAlunos);
  const professores = useStore(selectProfessores);
  const niveis = useStore(selectNiveis);
  const aulas = useStore(selectAulas);
  const assignAlunoToTurma = useStore((s) => s.assignAlunoToTurma);
  const [removerId, setRemoverId] = useState<string | null>(null);

  const turma = turmas.find((t) => t.id === id);
  if (!turma) return <NotFoundState title="Turma não encontrada" backHref="/turmas" backLabel="Voltar para Turmas" />;
  const lista = alunos.filter((a) => turma.alunosIds.includes(a.id)).sort((a, b) => a.nome.localeCompare(b.nome));
  const prof = professores.find((p) => p.id === turma.professorId);
  const nivel = niveis.find((n) => n.id === turma.nivelId);
  const aulasDaTurma = aulas.filter((au) => au.turmaId === turma.id).length;
  const alvo = lista.find((a) => a.id === removerId);

  return (
    <PanelPage width="readable">
      <PageHeader
        back={{ href: "/turmas", label: "Turmas" }}
        title={turma.nome}
        description={`${turma.diaSemana} · ${turma.horario}`}
        actions={
          <>
            <Link href={`/turmas/${turma.id}/editar`} className="btn-outline"><Pencil size={14} /> Editar</Link>
            <Link href={`/aulas/${turma.id}/finalizar?data=${toLocalISODate(new Date())}`} className="btn-primary"><ClipboardCheck size={16} /> Fazer chamada</Link>
          </>
        }
      />
      <StatGrid>
        <StatCard label="Alunos" value={lista.length} hint={`${turma.vagas ?? "—"} vagas`} />
        <StatCard label="Aulas dadas" value={aulasDaTurma} />
        <StatCard label="Bola" value={nivel?.nome ?? "—"} />
        <StatCard label="Média de pontos" value={lista.length ? Math.round(lista.reduce((a, b) => a + b.pontos, 0) / lista.length) : "—"} />
      </StatGrid>
      <Section flush title="Informações">
        <InfoRow label="Dia" icon={<Calendar size={14} />}>{turma.diaSemana}</InfoRow>
        <InfoRow label="Horário" icon={<Clock size={14} />}>{turma.horario}</InfoRow>
        <InfoRow label="Professor" icon={<GraduationCap size={14} />}>
          {prof ? <Link href={`/professores/${prof.id}`} className="text-brand hover:underline">{prof.nome}</Link> : "Sem professor"}
        </InfoRow>
        <InfoRow label="Bola" icon={<Star size={14} />}>{nivel?.nome ?? "—"}</InfoRow>
      </Section>
      <Section flush title="Alunos matriculados" description="Presença e pontos são lançados em “Fazer chamada”.">
        {lista.length === 0 ? (
          <EmptyState compact icon={Users} title="Nenhum aluno matriculado" action={<Link href={`/turmas/${turma.id}/editar`} className="btn-outline">Adicionar alunos</Link>} />
        ) : (
          lista.map((a) => (
            <ListRow key={a.id} className="transition-colors hover:bg-soft">
              <Link href={`/alunos/${a.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                <Avatar src={a.avatar} alt="" size={40} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-ink-900">{a.nome}</div>
                  <div className="text-xs tabular-nums text-ink-500">{a.pontos} pts</div>
                </div>
              </Link>
              <button type="button" onClick={() => setRemoverId(a.id)} aria-label={`Remover ${a.nome} da turma`}
                className="grid h-9 w-9 place-items-center rounded-full text-ink-500 transition hover:bg-red-50 hover:text-red-600">
                <X size={16} />
              </button>
            </ListRow>
          ))
        )}
      </Section>
      <ConfirmDialog
        open={!!removerId}
        title="Remover da turma?"
        message={`${alvo?.nome ?? "O aluno"} sai desta turma, mas continua cadastrado.`}
        confirmLabel="Remover"
        onCancel={() => setRemoverId(null)}
        onConfirm={() => {
          if (removerId) {
            const r = assignAlunoToTurma(removerId, null);
            if (r.ok) toast.success("Aluno removido da turma");
            else toast.error(r.error || "Não foi possível remover");
          }
          setRemoverId(null);
        }}
      />
    </PanelPage>
  );
}
