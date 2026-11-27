"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2, Users, ChevronRight } from "lucide-react";
import { PageHeader, PanelPage, Section, ListRow, InfoRow, StatGrid, StatCard, LevelBadge, Avatar, Button, ConfirmDialog, EmptyState, NotFoundState } from "@/components/ui";
import { useStore, selectNiveis, selectAlunos } from "@/lib/store";
import { toast } from "@/components/Toast";

export default function NivelDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const niveis = useStore(selectNiveis);
  const alunos = useStore(selectAlunos);
  const deleteNivel = useStore((s) => s.deleteNivel);
  const [confirm, setConfirm] = useState(false);
  const n = niveis.find((x) => x.id === id);
  if (!n) return <NotFoundState title="Nível não encontrado" backHref="/niveis" backLabel="Voltar para Bolas" />;
  const lista = alunos.filter((a) => a.nivelId === n.id).sort((a, b) => a.nome.localeCompare(b.nome));

  return (
    <PanelPage width="readable">
      <PageHeader
        back={{ href: "/niveis", label: "Bolas" }}
        title={n.nome}
        description={n.descricao}
        actions={
          <>
            <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => setConfirm(true)}><Trash2 size={14} /> Excluir</Button>
            <Link href={`/niveis/${n.id}/editar`} className="btn-outline"><Pencil size={14} /> Editar</Link>
          </>
        }
      />
      <StatGrid>
        <StatCard label="Alunos" value={lista.length} />
        <StatCard label="Ordem" value={n.ordem ?? "—"} hint="na progressão técnica" />
      </StatGrid>
      <Section flush title="Sobre o nível">
        <ListRow>
          <LevelBadge cor={n.cor} nome={n.nome} size={48} imagem={n.imagem} />
        </ListRow>
        <InfoRow label="Descrição">{n.descricao || "—"}</InfoRow>
        <InfoRow label="Cor"><span className="inline-flex items-center gap-2"><span className="h-4 w-4 rounded-full border border-line-strong" style={{ background: n.cor }} />{n.cor}</span></InfoRow>
      </Section>
      <Section flush title="Alunos neste nível" description="Ordenados por pontuação.">
        {lista.length === 0 ? (
          <EmptyState compact icon={Users} title="Nenhum aluno neste nível" />
        ) : (
          lista.map((a) => (
            <Link key={a.id} href={`/alunos/${a.id}`} className="block transition-colors hover:bg-soft">
              <ListRow>
                <Avatar src={a.avatar} alt="" size={40} />
                <div className="min-w-0 flex-1 truncate font-semibold text-ink-900">{a.nome}</div>
                <div className="text-sm tabular-nums text-ink-500">{a.pontos} pts</div>
                <ChevronRight size={16} className="text-ink-300" />
              </ListRow>
            </Link>
          ))
        )}
      </Section>
      <ConfirmDialog
        open={confirm}
        title="Excluir nível?"
        message={lista.length ? `${lista.length} aluno(s) estão neste nível e ficarão sem nível.` : "O nível será removido."}
        onCancel={() => setConfirm(false)}
        onConfirm={() => { deleteNivel(n.id); toast.success("Nível excluído"); router.push("/niveis"); }}
      />
    </PanelPage>
  );
}
