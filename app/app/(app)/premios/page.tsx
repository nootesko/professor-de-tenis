"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Trophy, Pencil, PartyPopper, Ban, Undo2 } from "lucide-react";
import { PageHeader, PanelPage, Section, ListRow, KebabMenu, Avatar, EmptyState, Badge } from "@/components/ui";
import { useStore, selectTabela, selectAlunos, selectPrograma, selectAulas } from "@/lib/store";
import { premioDoNivel, ehEspecial, conquistasDoAluno, ANIMACAO_LABEL } from "@/lib/gamificacao";
import type { ModoCelebracao, UnidadeProgresso } from "@/lib/types";
import { formatDate } from "@/lib/date";
import { toast } from "@/components/Toast";
import { cn } from "@/lib/cn";

/** Quantos níveis carregar por vez (a tabela não tem fim). */
const PAGINA = 48;

function Opcao<T extends string>({
  name, value, atual, onChange, titulo, desc,
}: { name: string; value: T; atual: T; onChange: (v: T) => void; titulo: string; desc: string }) {
  return (
    <label className={cn(
      "flex cursor-pointer items-start gap-3 rounded-input border p-3 transition-colors",
      atual === value ? "border-brand-green bg-brand-tint/50" : "border-line-strong hover:border-ink-300"
    )}>
      <input type="radio" name={name} checked={atual === value} onChange={() => onChange(value)} className="mt-0.5 h-4 w-4 accent-[#0f8445]" />
      <span>
        <span className="block text-sm font-semibold text-ink-900">{titulo}</span>
        <span className="block text-xs text-ink-500">{desc}</span>
      </span>
    </label>
  );
}

type Aba = "tabela" | "programa" | "conquistas" | "ranking";

export default function PremiosPage() {
  const tabela = useStore(selectTabela);
  const alunos = useStore(selectAlunos);
  const aulas = useStore(selectAulas);
  const programa = useStore(selectPrograma);
  const setPrograma = useStore((s) => s.setPrograma);
  const definirNivel = useStore((s) => s.definirNivelPremio);
  const usarRegra = useStore((s) => s.usarRegraNoNivel);
  const [tab, setTab] = useState<Aba>("tabela");
  const [limite, setLimite] = useState(PAGINA);

  const ranking = [...alunos].sort((a, b) => b.pontos - a.pontos).slice(0, 10);
  // Até onde há algo configurado nível a nível, para o professor ver a sequência especial inteira.
  const ultimoConfigurado = Math.max(0, ...Object.keys(tabela.niveis).map(Number));

  const recentes = useMemo(
    () =>
      alunos
        .flatMap((a) => conquistasDoAluno(tabela, programa.unidade, a, aulas).filter((c) => c.data).map((c) => ({ ...c, aluno: a })))
        .sort((x, y) => (y.data ?? "").localeCompare(x.data ?? "") || y.nivel - x.nivel)
        .slice(0, 40),
    [alunos, aulas, tabela, programa.unidade]
  );

  const niveis = Array.from({ length: limite }, (_, i) => i + 1);

  return (
    <PanelPage width="readable">
      <PageHeader
        title="Prêmios"
        description={`Programa ${programa.nome}: cada ${programa.unidade === "pontos" ? "ponto acumulado" : "aula frequentada"} é um nível de gamificação. A tabela não tem fim.`}
        actions={<Link href="/premios/novo" className="btn-primary"><Plus size={16} /> Configurar nível</Link>}
      />
      <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Visualização">
        {([["tabela", "Tabela de níveis"], ["programa", "Programa"], ["conquistas", "Conquistas"], ["ranking", "Ranking"]] as const).map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`h-10 shrink-0 rounded-pill px-5 text-sm font-semibold transition-colors ${tab === k ? "bg-brand-tint text-brand-dark" : "text-ink-500 hover:bg-white"}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === "tabela" && (
        <>
          <Section flush title="Regra do bloco" description={`Repete a cada ${tabela.tamanhoBloco} níveis. O último nível do bloco é o prêmio especial, configurado nível a nível.`}>
            {[...tabela.faixas].sort((a, b) => a.ate - b.ate).map((f, i, arr) => {
              const de = (arr[i - 1]?.ate ?? 0) + 1;
              const indice = tabela.faixas.indexOf(f);
              return (
                <ListRow key={indice}>
                  <div className="w-16 shrink-0 text-xs font-semibold tabular-nums text-ink-500">{de}–{f.ate}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-ink-900">{f.premio.nome}</div>
                    <div className="truncate text-xs text-ink-500">{f.premio.tipo} · {f.premio.gifUrl ? "GIF próprio" : ANIMACAO_LABEL[f.premio.animacao]}</div>
                  </div>
                  <Link href={`/premios/novo?faixa=${indice}`} className="btn-ghost h-9 px-3 text-sm"><Pencil size={14} /> Editar</Link>
                </ListRow>
              );
            })}
            <ListRow>
              <div className="w-16 shrink-0 text-xs font-semibold tabular-nums text-ink-500">{tabela.tamanhoBloco}</div>
              <div className="min-w-0 flex-1 text-sm text-ink-700">Prêmio especial: definido em cada múltiplo de {tabela.tamanhoBloco}. Sem configuração, o nível conta normalmente, sem prêmio.</div>
            </ListRow>
          </Section>

          <Section flush title="Níveis" description={`Mostrando 1 a ${limite}. Edite qualquer nível ou deixe-o sem prêmio.`}>
            {niveis.map((n) => {
              const p = premioDoNivel(tabela, n);
              const configurado = Object.prototype.hasOwnProperty.call(tabela.niveis, n);
              const especial = !!p && ehEspecial(tabela, p);
              const items = [
                { label: "Editar", icon: <Pencil size={14} />, href: `/premios/novo?nivel=${n}` },
                ...(p ? [{ label: "Deixar sem prêmio", icon: <Ban size={14} />, onClick: () => { definirNivel(n, null); toast.success(`Nível ${n} sem prêmio`); } }] : []),
                ...(configurado ? [{ label: "Remover configuração", icon: <Undo2 size={14} />, onClick: () => { usarRegra(n); toast.success(`Nível ${n} volta à regra do bloco`); } }] : []),
              ];
              return (
                <ListRow key={n} className="py-2.5">
                  <div className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-xs font-bold tabular-nums",
                    especial ? "bg-brand-yellow text-white" : p ? "bg-brand-tint text-brand-dark" : "bg-soft text-ink-500"
                  )}>{n}</div>
                  <div className="min-w-0 flex-1">
                    <div className={cn("truncate text-sm font-semibold", p ? "text-ink-900" : "text-ink-500")}>{p ? p.nome : "Sem prêmio"}</div>
                    <div className="truncate text-xs text-ink-500">
                      {p ? `${p.tipo} · ${p.gifUrl ? "GIF próprio" : ANIMACAO_LABEL[p.animacao]}` : "Conta normalmente, sem aviso"}
                      {configurado ? " · configurado" : p ? " · regra do bloco" : ""}
                    </div>
                  </div>
                  {p?.celebrar && <span className="hidden items-center gap-1 text-xs font-semibold text-brand-green sm:inline-flex"><PartyPopper size={14} /> Comemorar</span>}
                  <KebabMenu label={`Ações do nível ${n}`} items={items} />
                </ListRow>
              );
            })}
            <div className="flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6">
              <button type="button" className="btn-outline" onClick={() => setLimite((l) => l + PAGINA)}>Carregar mais {PAGINA} níveis</button>
              {ultimoConfigurado > limite && (
                <button type="button" className="text-sm font-semibold text-brand-green hover:underline" onClick={() => setLimite(Math.ceil(ultimoConfigurado / PAGINA) * PAGINA)}>
                  Ir até o último configurado ({ultimoConfigurado})
                </button>
              )}
            </div>
          </Section>
        </>
      )}

      {tab === "programa" && (
        <>
          <Section title="Unidade de progresso" description="O que faz o nível subir. Conquistar um prêmio não zera a contagem.">
            <div className="space-y-2">
              <Opcao<UnidadeProgresso> name="unidade" value="pontos" atual={programa.unidade} onChange={(v) => { setPrograma({ unidade: v }); toast.success("Unidade alterada"); }}
                titulo="Pontos de gamificação" desc="O professor registra, em cada aula, quantos pontos o aluno conquistou." />
              <Opcao<UnidadeProgresso> name="unidade" value="aulas" atual={programa.unidade} onChange={(v) => { setPrograma({ unidade: v }); toast.success("Unidade alterada"); }}
                titulo="Aulas frequentadas" desc="Cada presença conta. Ex.: uma faixa depois de 100 aulas." />
            </div>
          </Section>

          <Section title="Comemoração" description="O que aparece na tela ao finalizar a aula. Níveis sem prêmio nunca geram aviso.">
            <div className="space-y-2">
              <Opcao<ModoCelebracao> name="celebracao" value="todo-ponto" atual={programa.celebracao} onChange={(v) => setPrograma({ celebracao: v })}
                titulo="Todo prêmio alcançado" desc="GIF e mensagem em cada nível com prêmio, inclusive vários na mesma aula." />
              <Opcao<ModoCelebracao> name="celebracao" value="marcos" atual={programa.celebracao} onChange={(v) => setPrograma({ celebracao: v })}
                titulo="Só prêmios selecionados" desc="Apenas os níveis marcados com “Comemorar”." />
              <Opcao<ModoCelebracao> name="celebracao" value="contador" atual={programa.celebracao} onChange={(v) => setPrograma({ celebracao: v })}
                titulo="Só o contador" desc="Sem animação; as conquistas aparecem no perfil normalmente." />
            </div>
          </Section>
        </>
      )}

      {tab === "conquistas" && (
        <Section flush title="Conquistas recentes" description="Calculadas do histórico de pontos e da tabela. Para corrigir, ajuste os pontos da aula.">
          {recentes.length === 0 ? (
            <EmptyState compact icon={Trophy} title="Nenhuma conquista ainda" />
          ) : (
            recentes.map((c) => (
              <Link key={`${c.aluno.id}-${c.nivel}`} href={`/alunos/${c.aluno.id}`} className="block transition-colors hover:bg-soft">
                <ListRow>
                  <Avatar src={c.aluno.avatar} alt="" size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink-900">{c.aluno.nome} · {c.premio.nome}</div>
                    <div className="truncate text-xs text-ink-500">Nível {c.nivel} · {formatDate(c.data!)}</div>
                  </div>
                  {ehEspecial(tabela, c.premio) && <Badge color="yellow">Especial</Badge>}
                </ListRow>
              </Link>
            ))
          )}
        </Section>
      )}

      {tab === "ranking" && (
        <Section flush title="Top 10 alunos" description="Por nível de gamificação (pontos acumulados).">
          {ranking.map((a, i) => (
            <Link key={a.id} href={`/alunos/${a.id}`} className="block transition-colors hover:bg-soft">
              <ListRow>
                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold tabular-nums ${i < 3 ? "bg-brand-lime text-brand-dark" : "bg-soft text-ink-700"}`}>{i + 1}</div>
                <Avatar src={a.avatar} alt="" size={40} />
                <div className="min-w-0 flex-1 truncate font-medium text-ink-900">{a.nome}</div>
                <div className="text-right">
                  <div className="font-display text-lg font-bold tabular-nums text-brand">{a.pontos}</div>
                  <div className="text-[10px] uppercase tracking-wide text-ink-500">nível</div>
                </div>
              </ListRow>
            </Link>
          ))}
        </Section>
      )}
    </PanelPage>
  );
}
