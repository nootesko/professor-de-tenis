"use client";
import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { PageHeader, PanelPage, EmptyState } from "@/components/ui";
import { useStore, selectNiveis, selectAlunos } from "@/lib/store";

/** Grade de consulta: cards são só navegação; editar/excluir ficam no detalhe do nível. */
export default function NiveisPage() {
  const niveis = useStore(selectNiveis);
  const alunos = useStore(selectAlunos);
  const ordenados = [...niveis].sort((a, b) => (a.ordem ?? 99) - (b.ordem ?? 99) || a.nome.localeCompare(b.nome));
  return (
    <PanelPage>
      <PageHeader
        title="Bolas"
        description="Nível técnico (bola) em que cada aluno está. Independe dos pontos de gamificação."
        actions={<Link href="/niveis/novo" className="btn-primary"><Plus size={16} /> Nova bola</Link>}
      />
      {ordenados.length === 0 ? (
        <EmptyState icon={Star} title="Nenhum nível cadastrado" description="Crie os níveis técnicos, como as bolas vermelha, laranja e verde." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ordenados.map((n) => {
            const count = alunos.filter((a) => a.nivelId === n.id).length;
            return (
              <Link key={n.id} href={`/niveis/${n.id}`} className="group overflow-hidden rounded-card border border-line-strong bg-white transition-colors hover:border-brand focus-visible:border-brand focus-visible:outline-none">
                <div className="relative h-20" style={{ background: n.cor }}>
                  {n.imagem ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={n.imagem} alt="" className="absolute -bottom-6 left-5 h-12 w-12 rounded-full object-cover ring-4 ring-white" />
                  ) : (
                    <div className="absolute -bottom-6 left-5 h-12 w-12 rounded-full ring-4 ring-white" style={{ background: n.cor }} />
                  )}
                </div>
                <div className="p-5 pt-8">
                  <div className="font-display text-lg font-bold text-brand group-hover:underline">{n.nome}</div>
                  <div className="mt-1 line-clamp-2 text-sm text-ink-500">{n.descricao}</div>
                  <div className="mt-3 flex items-center justify-end text-xs">
                    <span className="rounded-pill bg-brand-tint px-3 py-1 font-medium text-brand-dark">{count} {count === 1 ? "aluno" : "alunos"}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </PanelPage>
  );
}
