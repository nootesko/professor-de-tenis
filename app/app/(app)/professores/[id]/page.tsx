"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Pencil, Mail, Phone, Layers, ChevronRight, Award } from "lucide-react";
import { PageHeader, PanelPage, Section, ListRow, InfoRow, StatGrid, StatCard, Avatar, Badge, EmptyState, NotFoundState } from "@/components/ui";
import { useStore, selectProfessores, selectTurmas, selectAulas } from "@/lib/store";

export default function ProfessorDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const professores = useStore(selectProfessores);
  const turmas = useStore(selectTurmas);
  const aulas = useStore(selectAulas);
  const p = professores.find((x) => x.id === id);
  if (!p) return <NotFoundState title="Professor não encontrado" backHref="/professores" backLabel="Voltar para Professores" />;
  const ts = turmas.filter((t) => t.professorId === p.id).sort((a, b) => a.diaSemana.localeCompare(b.diaSemana));
  const totalAlunos = ts.reduce((acc, t) => acc + t.alunosIds.length, 0);
  const aulasDadas = aulas.filter((au) => ts.some((t) => t.id === au.turmaId)).length;

  return (
    <PanelPage width="readable">
      <PageHeader
        back={{ href: "/professores", label: "Professores" }}
        title={p.nome}
        description={p.especialidade}
        actions={<Link href={`/professores/${p.id}/editar`} className="btn-outline"><Pencil size={14} /> Editar</Link>}
      />
      <StatGrid>
        <StatCard label="Turmas" value={ts.length} />
        <StatCard label="Alunos" value={totalAlunos} />
        <StatCard label="Aulas dadas" value={aulasDadas} />
        <StatCard label="Status" value={p.status === "ativo" ? "Ativo" : "Inativo"} />
      </StatGrid>
      <Section flush title="Dados do professor">
        <ListRow>
          <Avatar src={p.avatar} alt="" size={56} />
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-ink-900">{p.nome}</div>
            <Badge color={p.status === "ativo" ? "lime" : "red"}>{p.status === "ativo" ? "Ativo" : "Inativo"}</Badge>
          </div>
        </ListRow>
        <InfoRow label="E-mail" icon={<Mail size={14} />}><a href={`mailto:${p.email}`} className="text-brand hover:underline">{p.email}</a></InfoRow>
        <InfoRow label="Telefone" icon={<Phone size={14} />}>{p.telefone}</InfoRow>
        <InfoRow label="Especialidade" icon={<Award size={14} />}>{p.especialidade}</InfoRow>
      </Section>
      <Section flush title="Turmas" description={`${ts.length} ${ts.length === 1 ? "turma" : "turmas"} sob responsabilidade`}>
        {ts.length === 0 ? (
          <EmptyState compact icon={Layers} title="Nenhuma turma atribuída" />
        ) : (
          ts.map((t) => (
            <Link key={t.id} href={`/turmas/${t.id}`} className="block transition-colors hover:bg-soft">
              <ListRow>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-ink-900">{t.nome}</div>
                  <div className="text-xs text-ink-500">{t.diaSemana} · {t.horario} · {t.alunosIds.length} alunos</div>
                </div>
                <ChevronRight size={16} className="text-ink-300" />
              </ListRow>
            </Link>
          ))
        )}
      </Section>
    </PanelPage>
  );
}
