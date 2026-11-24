"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, GraduationCap, ChevronRight } from "lucide-react";
import { PageHeader, PanelPage, Section, ListRow, KebabMenu, Avatar, Badge, ConfirmDialog, EmptyState, SearchField, norm } from "@/components/ui";
import { useStore, selectProfessores, selectTurmas } from "@/lib/store";
import { toast } from "@/components/Toast";

export default function ProfessoresPage() {
  const professores = useStore(selectProfessores);
  const turmas = useStore(selectTurmas);
  const deleteProfessor = useStore((s) => s.deleteProfessor);
  const [q, setQ] = useState("");
  const [delId, setDelId] = useState<string | null>(null);

  const filtered = useMemo(
    () => professores.filter((p) => norm(p.nome).includes(norm(q)) || norm(p.especialidade).includes(norm(q))),
    [professores, q],
  );
  const alvo = professores.find((p) => p.id === delId);

  return (
    <PanelPage>
      <PageHeader
        title="Professores"
        description={`${professores.length} cadastrados`}
        actions={<Link href="/professores/novo" className="btn-primary"><Plus size={16} /> Novo professor</Link>}
      />
      <Section flush title="Equipe" action={<SearchField value={q} onChange={setQ} label="Buscar por nome ou especialidade" />}>
        {filtered.length === 0 ? (
          <EmptyState compact icon={GraduationCap} title="Nenhum professor encontrado" description={q ? `Nada corresponde a "${q}".` : "Cadastre o primeiro professor."} />
        ) : (
          filtered.map((p) => {
            const qtd = turmas.filter((t) => t.professorId === p.id).length;
            return (
              <ListRow key={p.id} className="transition-colors hover:bg-soft">
                <Link href={`/professores/${p.id}`} className="flex min-w-0 flex-1 items-center gap-4 focus-visible:outline-none">
                  <Avatar src={p.avatar} alt="" size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-ink-900">{p.nome}</div>
                    <div className="truncate text-xs text-ink-500">{p.especialidade} · {qtd} {qtd === 1 ? "turma" : "turmas"}</div>
                  </div>
                  <Badge color={p.status === "ativo" ? "lime" : "red"}>{p.status === "ativo" ? "Ativo" : "Inativo"}</Badge>
                  <ChevronRight size={16} className="hidden shrink-0 text-ink-300 sm:block" />
                </Link>
                <KebabMenu label={`Ações de ${p.nome}`} items={[
                  { label: "Editar", icon: <Pencil size={14} />, href: `/professores/${p.id}/editar` },
                  { label: "Excluir", icon: <Trash2 size={14} />, danger: true, onClick: () => setDelId(p.id) },
                ]} />
              </ListRow>
            );
          })
        )}
      </Section>
      <ConfirmDialog
        open={!!delId}
        title="Excluir professor?"
        message={`${alvo?.nome ?? "O professor"} será removido. As turmas dele ficarão sem professor.`}
        onCancel={() => setDelId(null)}
        onConfirm={() => { if (delId) { deleteProfessor(delId); toast.success("Professor excluído"); } setDelId(null); }}
      />
    </PanelPage>
  );
}
