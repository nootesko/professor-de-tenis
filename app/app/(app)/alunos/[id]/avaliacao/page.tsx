"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { Plus, ClipboardCheck } from "lucide-react";
import { PageHeader, PanelPage, Section, InfoRow, StarRating, EmptyState, NotFoundState } from "@/components/ui";
import { useStore, selectAlunos, selectAvaliacoes } from "@/lib/store";
import { formatDate } from "@/lib/date";

export default function AvaliacoesAlunoPage() {
  const { id } = useParams<{ id: string }>();
  const alunos = useStore(selectAlunos);
  const avaliacoes = useStore(selectAvaliacoes);
  const criterios = useStore((s) => s.criterios);
  const lista = useMemo(
    () => avaliacoes.filter((a) => a.alunoId === id).sort((a, b) => b.data.localeCompare(a.data)),
    [avaliacoes, id],
  );
  const aluno = alunos.find((a) => a.id === id);
  if (!aluno) return <NotFoundState title="Aluno não encontrado" backHref="/alunos" backLabel="Voltar para Alunos" />;
  return (
    <PanelPage width="readable">
      <PageHeader
        back={{ href: `/alunos/${aluno.id}`, label: aluno.nome }}
        title="Avaliações de desempenho"
        description={`${lista.length} ${lista.length === 1 ? "avaliação registrada" : "avaliações registradas"}`}
        actions={<Link href={`/alunos/${aluno.id}/avaliacao/novo`} className="btn-primary"><Plus size={16} /> Nova avaliação</Link>}
      />
      {lista.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="Sem avaliações ainda" description="Registre a primeira avaliação de desempenho deste aluno." />
      ) : (
        lista.map((av) => (
          <Section key={av.id} flush title={formatDate(av.data, { day: "2-digit", month: "long", year: "numeric" })} description={av.observacoes}>
            {criterios.map((c) => (
              <InfoRow key={c.id} label={c.nome}><StarRating value={av.scores[c.id] || 0} /></InfoRow>
            ))}
          </Section>
        ))
      )}
    </PanelPage>
  );
}
