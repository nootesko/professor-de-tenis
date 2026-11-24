"use client";
import Link from "next/link";
import { useState } from "react";
import { Plus, Trophy, Trash2, Award } from "lucide-react";
import { PageHeader, PanelPage, Section, ListRow, KebabMenu, Avatar, ConfirmDialog, EmptyState } from "@/components/ui";
import { useStore, selectPremios, selectAlunos } from "@/lib/store";
import { toast } from "@/components/Toast";

export default function PremiosPage() {
  const premios = useStore(selectPremios);
  const alunos = useStore(selectAlunos);
  const deletePremio = useStore((s) => s.deletePremio);
  const [tab, setTab] = useState<"premios" | "ranking">("premios");
  const [delId, setDelId] = useState<string | null>(null);
  const ranking = [...alunos].sort((a, b) => b.pontos - a.pontos).slice(0, 10);
  const lista = [...premios].sort((a, b) => a.pontosNecessarios - b.pontosNecessarios);
  const alvo = premios.find((p) => p.id === delId);

  return (
    <PanelPage>
      <PageHeader
        title="Prêmios"
        description="Recompensas por pontuação e ranking dos alunos."
        actions={
          <>
            <Link href="/premios/premiacao/novo" className="btn-outline"><Award size={16} /> Premiar aluno</Link>
            <Link href="/premios/novo" className="btn-primary"><Plus size={16} /> Novo prêmio</Link>
          </>
        }
      />
      <div className="flex gap-1" role="tablist" aria-label="Visualização">
        {([["premios", "Prêmios"], ["ranking", "Ranking"]] as const).map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`h-10 rounded-pill px-5 text-sm font-semibold transition-colors ${tab === k ? "bg-brand-tint text-brand-dark" : "text-ink-500 hover:bg-white"}`}>
            {l}
          </button>
        ))}
      </div>
      {tab === "premios" ? (
        <Section flush title="Prêmios disponíveis" description="Ordenados pela pontuação necessária.">
          {lista.length === 0 ? (
            <EmptyState compact icon={Trophy} title="Nenhum prêmio cadastrado" />
          ) : (
            lista.map((p) => (
              <ListRow key={p.id}>
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-yellow-50 text-brand-yellow"><Trophy size={20} /></div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-ink-900">{p.nome}</div>
                  {p.descricao && <div className="truncate text-xs text-ink-500">{p.descricao}</div>}
                </div>
                <span className="rounded-pill bg-brand-tint px-3 py-1 text-xs font-semibold tabular-nums text-brand-dark">{p.pontosNecessarios} pts</span>
                <KebabMenu label={`Ações de ${p.nome}`} items={[
                  { label: "Excluir", icon: <Trash2 size={14} />, danger: true, onClick: () => setDelId(p.id) },
                ]} />
              </ListRow>
            ))
          )}
        </Section>
      ) : (
        <Section flush title="Top 10 alunos" description="Por pontuação acumulada.">
          {ranking.map((a, i) => (
            <Link key={a.id} href={`/alunos/${a.id}`} className="block transition-colors hover:bg-soft">
              <ListRow>
                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold tabular-nums ${i < 3 ? "bg-brand-lime text-brand-dark" : "bg-soft text-ink-700"}`}>{i + 1}</div>
                <Avatar src={a.avatar} alt="" size={40} />
                <div className="min-w-0 flex-1 truncate font-medium text-ink-900">{a.nome}</div>
                <div className="font-display text-lg font-bold tabular-nums text-brand">{a.pontos}</div>
              </ListRow>
            </Link>
          ))}
        </Section>
      )}
      <ConfirmDialog
        open={!!delId}
        title="Excluir prêmio?"
        message={`${alvo?.nome ?? "O prêmio"} será removido, junto com as premiações já concedidas.`}
        onCancel={() => setDelId(null)}
        onConfirm={() => { if (delId) { deletePremio(delId); toast.success("Prêmio excluído"); } setDelId(null); }}
      />
    </PanelPage>
  );
}
