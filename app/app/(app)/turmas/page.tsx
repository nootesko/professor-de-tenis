"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Layers, ChevronRight } from "lucide-react";
import { PageHeader, PanelPage, Section, ListRow, KebabMenu, AvatarGroup, ConfirmDialog, EmptyState, SearchField, norm } from "@/components/ui";
import { useStore, selectTurmas, selectAlunos, selectNiveis, selectProfessores } from "@/lib/store";
import { DIAS_SEMANA } from "@/lib/date";
import { toast } from "@/components/Toast";

export default function TurmasPage() {
  const turmas = useStore(selectTurmas);
  const alunos = useStore(selectAlunos);
  const niveis = useStore(selectNiveis);
  const professores = useStore(selectProfessores);
  const deleteTurma = useStore((s) => s.deleteTurma);
  const [q, setQ] = useState("");
  const [delId, setDelId] = useState<string | null>(null);

  const alunosById = useMemo(() => new Map(alunos.map((a) => [a.id, a])), [alunos]);
  // Agrupa por dia da semana (ordem Seg → Dom) para leitura em agenda.
  const grupos = useMemo(() => {
    const ordem = [...DIAS_SEMANA.slice(1), DIAS_SEMANA[0]];
    const filtradas = turmas.filter((t) => norm(t.nome).includes(norm(q)) || norm(t.diaSemana).includes(norm(q)));
    return ordem
      .map((dia) => ({ dia, itens: filtradas.filter((t) => t.diaSemana === dia).sort((a, b) => a.horario.localeCompare(b.horario)) }))
      .filter((g) => g.itens.length > 0);
  }, [turmas, q]);
  const alvo = turmas.find((t) => t.id === delId);

  return (
    <PanelPage>
      <PageHeader
        title="Turmas"
        description={`${turmas.length} turmas na semana`}
        actions={<Link href="/turmas/novo" className="btn-primary"><Plus size={16} /> Nova turma</Link>}
      />
      <Section flush title="Grade semanal" action={<SearchField value={q} onChange={setQ} label="Buscar turma ou dia" />}>
        {grupos.length === 0 ? (
          <EmptyState compact icon={Layers} title="Nenhuma turma encontrada" description={q ? `Nada corresponde a "${q}".` : "Cadastre a primeira turma."} />
        ) : (
          grupos.map((g) => (
            <div key={g.dia}>
              <div className="caps bg-soft px-5 py-2 sm:px-6">{g.dia}</div>
              <div className="divide-y divide-line">
                {g.itens.map((t) => {
                  const lista = t.alunosIds.map((id) => alunosById.get(id)).filter(Boolean) as typeof alunos;
                  const nivel = niveis.find((n) => n.id === t.nivelId);
                  const prof = professores.find((p) => p.id === t.professorId);
                  return (
                    <ListRow key={t.id} className="transition-colors hover:bg-soft">
                      <Link href={`/turmas/${t.id}`} className="flex min-w-0 flex-1 items-center gap-4 focus-visible:outline-none">
                        <div className="w-24 shrink-0 text-sm font-semibold tabular-nums text-brand">{t.horario}</div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold text-ink-900">{t.nome}</div>
                          <div className="flex items-center gap-1.5 truncate text-xs text-ink-500">
                            <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: nivel?.cor }} />
                            {nivel?.nome ?? "Sem nível"} · {prof?.nome ?? "Sem professor"} · {lista.length} alunos
                          </div>
                        </div>
                        <span className="hidden sm:block"><AvatarGroup srcs={lista.map((a) => a.avatar)} max={4} /></span>
                        <ChevronRight size={16} className="hidden shrink-0 text-ink-300 sm:block" />
                      </Link>
                      <KebabMenu label={`Ações de ${t.nome}`} items={[
                        { label: "Editar", icon: <Pencil size={14} />, href: `/turmas/${t.id}/editar` },
                        { label: "Excluir", icon: <Trash2 size={14} />, danger: true, onClick: () => setDelId(t.id) },
                      ]} />
                    </ListRow>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </Section>
      <ConfirmDialog
        open={!!delId}
        title="Excluir turma?"
        message={`${alvo?.nome ?? "A turma"} será removida permanentemente. Os alunos continuam cadastrados.`}
        onCancel={() => setDelId(null)}
        onConfirm={() => { if (delId) { deleteTurma(delId); toast.success("Turma excluída"); } setDelId(null); }}
      />
    </PanelPage>
  );
}
