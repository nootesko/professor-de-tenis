"use client";
import { PageHeader, Card, Button, StarRating } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";

export default function AvaliacoesAlunoPage() {
  const { id } = useParams<{ id: string }>();
  const { alunos, criterios, avaliacoes } = useStore();
  const aluno = alunos.find((a) => a.id === id);
  const lista = useMemo(
    () => avaliacoes.filter((a) => a.alunoId === id).sort((a, b) => b.data.localeCompare(a.data)),
    [avaliacoes, id]
  );
  if (!aluno) return <div>Aluno não encontrado</div>;
  return (
    <>
      <PageHeader
        title={`Avaliações — ${aluno.nome}`}
        crumbs={["DASHBOARD", "ALUNOS", "AVALIAÇÕES"]}
        actions={
          <Link href={`/alunos/${aluno.id}/avaliacao/novo`}>
            <Button>Nova Avaliação</Button>
          </Link>
        }
      />
      {lista.length === 0 ? (
        <Card className="p-8 text-center text-sm text-ink-500">
          Sem avaliações ainda. Clique em "Nova Avaliação" para registrar a primeira.
        </Card>
      ) : (
        <div className="space-y-3">
          {lista.map((av) => (
            <Card key={av.id} className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-display text-sm font-bold text-brand">
                  {new Date(av.data + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {criterios.map((c) => (
                  <div key={c.id} className="flex items-center justify-between border-b border-line pb-1.5 last:border-0">
                    <span className="text-xs">{c.nome}</span>
                    <StarRating value={av.scores[c.id] || 0} />
                  </div>
                ))}
              </div>
              {av.observacoes && (
                <p className="mt-3 rounded-card bg-brand-mint2 p-3 text-xs text-ink-700">{av.observacoes}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
