"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Users, ChevronRight } from "lucide-react";
import { PageHeader, PanelPage, Section, ListRow, KebabMenu, Avatar, ConfirmDialog, Badge, EmptyState, SearchField, norm } from "@/components/ui";
import { useStore, selectAlunos, selectNiveis } from "@/lib/store";
import { toast } from "@/components/Toast";

type Filtro = "todos" | "ativo" | "inativo";

export default function AlunosPage() {
  const alunos = useStore(selectAlunos);
  const niveis = useStore(selectNiveis);
  const deleteAluno = useStore((s) => s.deleteAluno);
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [delId, setDelId] = useState<string | null>(null);

  const nivelById = useMemo(() => new Map(niveis.map((n) => [n.id, n])), [niveis]);
  const filtered = useMemo(
    () =>
      alunos
        .filter((a) => (filtro === "todos" || a.status === filtro) && (norm(a.nome).includes(norm(q)) || norm(a.email).includes(norm(q))))
        .sort((a, b) => a.nome.localeCompare(b.nome)),
    [alunos, q, filtro],
  );
  const alvo = alunos.find((a) => a.id === delId);

  return (
    <PanelPage>
      <PageHeader
        title="Alunos"
        description={`${alunos.length} cadastrados`}
        actions={<Link href="/alunos/novo" className="btn-primary"><Plus size={16} /> Novo aluno</Link>}
      />
      <Section
        flush
        title={
          <div className="flex gap-1" role="tablist" aria-label="Filtrar por status">
            {(["todos", "ativo", "inativo"] as Filtro[]).map((f) => (
              <button key={f} role="tab" aria-selected={filtro === f} type="button" onClick={() => setFiltro(f)}
                className={`h-9 rounded-pill px-4 text-sm font-semibold capitalize transition-colors ${filtro === f ? "bg-brand-tint text-brand-dark" : "text-ink-500 hover:bg-soft"}`}>
                {f === "todos" ? "Todos" : f === "ativo" ? "Ativos" : "Inativos"}
              </button>
            ))}
          </div>
        }
        action={<SearchField value={q} onChange={setQ} label="Buscar por nome ou e-mail" />}
      >
        {filtered.length === 0 ? (
          <EmptyState compact icon={Users} title={q ? "Nenhum aluno encontrado" : "Nenhum aluno aqui"} description={q ? `Nada corresponde a "${q}".` : "Cadastre um aluno para começar."} />
        ) : (
          filtered.map((a) => {
            const nivel = nivelById.get(a.nivelId);
            return (
              <ListRow key={a.id} className="transition-colors hover:bg-soft">
                <Link href={`/alunos/${a.id}`} className="flex min-w-0 flex-1 items-center gap-4 focus-visible:outline-none">
                  <Avatar src={a.avatar} alt="" size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-ink-900">{a.nome}</div>
                    <div className="flex items-center gap-1.5 truncate text-xs text-ink-500">
                      <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: nivel?.cor }} />
                      {nivel?.nome ?? "Sem nível"} · <span className="tabular-nums">{a.pontos} pts</span>
                    </div>
                  </div>
                  <Badge color={a.status === "ativo" ? "lime" : "red"}>{a.status === "ativo" ? "Ativo" : "Inativo"}</Badge>
                  <ChevronRight size={16} className="hidden shrink-0 text-ink-300 sm:block" />
                </Link>
                <KebabMenu label={`Ações de ${a.nome}`} items={[
                  { label: "Editar", icon: <Pencil size={14} />, href: `/alunos/${a.id}/editar` },
                  { label: "Excluir", icon: <Trash2 size={14} />, danger: true, onClick: () => setDelId(a.id) },
                ]} />
              </ListRow>
            );
          })
        )}
      </Section>
      <ConfirmDialog
        open={!!delId}
        title="Excluir aluno?"
        message={`${alvo?.nome ?? "O aluno"} será removido, junto com o vínculo às turmas. Esta ação não pode ser desfeita.`}
        onCancel={() => setDelId(null)}
        onConfirm={() => { if (delId) { deleteAluno(delId); toast.success("Aluno excluído"); } setDelId(null); }}
      />
    </PanelPage>
  );
}
