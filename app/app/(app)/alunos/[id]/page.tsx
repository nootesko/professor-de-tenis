"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Trophy, Mail, Phone, MapPin, Cake, Pencil, Send, Trash2, Copy, Eye, EyeOff, ExternalLink, Layers, ClipboardCheck, MessageSquare, Plus, Check, Award, History, LineChart as LineIcon, NotebookPen } from "lucide-react";
import {
  PageHeader, PanelPage, Section, ListRow, InfoRow, StatGrid, StatCard, Avatar, StarRating, Badge,
  Button, ConfirmDialog, EmptyState, NotFoundState, LevelBadge, KebabMenu,
} from "@/components/ui";
import { LineChart } from "@/components/ui/LineChart";
import { TrilhaMarcos } from "@/components/ui/TrilhaMarcos";
import { mediaNotas, progresso, proximoPremio, aulasFrequentadas, conquistasDoAluno, UNIDADE_LABEL } from "@/lib/gamificacao";
import { cn } from "@/lib/cn";
import {
  useStore, selectAlunos, selectNiveis, selectTabela, selectFeedbacks, selectProfessores, selectAulas,
  selectLancamentos, selectAvaliacoes, selectAlunoCreds, selectTurmas, selectPrograma, selectCriterios,
} from "@/lib/store";
import { formatDate, toLocalISODate } from "@/lib/date";
import { toast } from "@/components/Toast";

type Periodo = "30" | "90" | "180" | "tudo";
const PERIODOS: { v: Periodo; l: string }[] = [
  { v: "30", l: "30 dias" },
  { v: "90", l: "3 meses" },
  { v: "180", l: "6 meses" },
  { v: "tudo", l: "Tudo" },
];
const fmt = (v: number) => v.toFixed(1).replace(".", ",");

export default function PainelAlunoPage() {
  const { id } = useParams<{ id: string }>();
  const alunos = useStore(selectAlunos);
  const niveis = useStore(selectNiveis);
  const tabela = useStore(selectTabela);
  const feedbacks = useStore(selectFeedbacks);
  const professores = useStore(selectProfessores);
  const turmas = useStore(selectTurmas);
  const aulas = useStore(selectAulas);
  const lancamentos = useStore(selectLancamentos);
  const avaliacoes = useStore(selectAvaliacoes);
  const alunoCreds = useStore(selectAlunoCreds);
  const programa = useStore(selectPrograma);
  const criterios = useStore(selectCriterios);
  const addFeedback = useStore((s) => s.addFeedback);
  const deleteFeedback = useStore((s) => s.deleteFeedback);

  const [novoTexto, setNovoTexto] = useState("");
  const [profId, setProfId] = useState(professores[0]?.id ?? "");
  const [showSenha, setShowSenha] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [delFeedbackId, setDelFeedbackId] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<Periodo>("90");
  const [verTodasConquistas, setVerTodasConquistas] = useState(false);
  const [verTodoHistorico, setVerTodoHistorico] = useState(false);

  // Hooks sempre antes de qualquer return (regra dos hooks).
  const aluno = alunos.find((a) => a.id === id);
  const fbs = useMemo(
    () => feedbacks.filter((f) => f.alunoId === id).sort((a, b) => b.data.localeCompare(a.data)),
    [feedbacks, id],
  );
  const minhasAvaliacoes = useMemo(
    () => avaliacoes.filter((av) => av.alunoId === id).sort((a, b) => b.data.localeCompare(a.data)),
    [avaliacoes, id],
  );
  const meusLancamentos = useMemo(
    () => lancamentos.filter((l) => l.alunoId === id).sort((a, b) => b.registradoEm.localeCompare(a.registradoEm) || b.id.localeCompare(a.id)),
    [lancamentos, id],
  );
  /** Aulas em que o aluno tem registro (presente ou falta), em ordem cronológica. */
  const minhasAulas = useMemo(
    () => aulas.filter((au) => au.presenca[id] !== undefined).sort((a, b) => a.data.localeCompare(b.data)),
    [aulas, id],
  );
  const noPeriodo = useMemo(() => {
    if (periodo === "tudo") return minhasAulas;
    const d = new Date();
    d.setDate(d.getDate() - Number(periodo));
    const corte = toLocalISODate(d);
    return minhasAulas.filter((au) => au.data >= corte);
  }, [minhasAulas, periodo]);

  if (!aluno) return <NotFoundState title="Aluno não encontrado" backHref="/alunos" backLabel="Voltar para Alunos" />;

  const nivel = niveis.find((n) => n.id === aluno.nivelId);
  const turma = turmas.find((t) => t.alunosIds.includes(aluno.id));
  const creds = alunoCreds.find((c) => c.alunoId === aluno.id) ?? { user: aluno.email.split("@")[0], senha: "—" };

  // Vertente 2: corrida
  const unidade = UNIDADE_LABEL[programa.unidade];
  const atual = progresso(programa.unidade, aluno, aulas);
  const prox = proximoPremio(tabela, atual);
  // Conquistas calculadas do histórico + tabela (mais recentes primeiro). Não há cadastro manual.
  const conquistas = [...conquistasDoAluno(tabela, programa.unidade, aluno, aulas)].reverse();

  // Vertente 1: presença e avaliações (só critérios com nota contam)
  const presencas = aulasFrequentadas(minhasAulas, aluno.id);
  const presentesPeriodo = noPeriodo.filter((au) => au.presenca[aluno.id]);
  const criteriosUsados = criterios.filter((c) => c.ativo || presentesPeriodo.some((au) => au.notas[aluno.id]?.[c.id] !== undefined));
  const ativosIds = criterios.filter((c) => c.ativo).map((c) => c.id);
  const serieMedia = presentesPeriodo.map((au) => ({ data: au.data, valor: mediaNotas(au.notas[aluno.id], ativosIds) }));
  const mediasValidas = serieMedia.map((p) => p.valor).filter((v): v is number => v != null);
  const mediaGeral = mediasValidas.length ? mediasValidas.reduce((a, b) => a + b, 0) / mediasValidas.length : null;
  const observacoes = [...minhasAulas].reverse().filter((au) => au.observacao[aluno.id]);

  // Vertente 3: histórico de nível (só quando muda)
  const historicoNivel: { data: string; nivelId: string }[] = [];
  minhasAulas.forEach((au) => {
    const n = au.nivel[aluno.id];
    if (n && historicoNivel[historicoNivel.length - 1]?.nivelId !== n) historicoNivel.push({ data: au.data, nivelId: n });
  });

  const submitFeedback = () => {
    const texto = novoTexto.trim();
    if (!texto || !profId) return;
    addFeedback({ id: "f" + Date.now(), alunoId: aluno.id, professorId: profId, data: toLocalISODate(new Date()), texto });
    setNovoTexto("");
    toast.success("Feedback enviado");
  };

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Não foi possível copiar. Selecione o texto manualmente.");
    }
  };

  return (
    <PanelPage width="readable">
      <PageHeader
        back={{ href: "/alunos", label: "Alunos" }}
        title={aluno.nome}
        description={<>Aluno {aluno.status === "ativo" ? "ativo" : "inativo"}{nivel && <> · {nivel.nome}</>}</>}
        actions={
          <>
            <Link href={`/alunos/${aluno.id}/editar`} className="btn-outline"><Pencil size={14} /> Editar</Link>
            <Link href={`/alunos/${aluno.id}/avaliacao/novo`} className="btn-primary"><Plus size={16} /> Nova avaliação</Link>
          </>
        }
      />

      <StatGrid>
        <StatCard label={programa.unidade === "pontos" ? "Nível de gamificação" : "Aulas frequentadas"} value={atual} hint={prox ? `faltam ${prox.nivel - atual} para ${prox.nome}` : "sem próximo prêmio configurado"} />
        <StatCard label="Presença" value={minhasAulas.length ? `${Math.round((presencas / minhasAulas.length) * 100)}%` : "—"} hint={`${presencas} de ${minhasAulas.length} aulas`} />
        <StatCard label="Média nas aulas" value={mediaGeral != null ? fmt(mediaGeral) : "—"} hint={PERIODOS.find((p) => p.v === periodo)?.l} />
        <StatCard label="Prêmios" value={conquistas.length} hint="conquistados" />
      </StatGrid>
      <Section flush title="Dados do aluno">
        <ListRow>
          <Avatar src={aluno.avatar} alt="" size={56} />
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-ink-900">{aluno.nome}</div>
            <Badge color={aluno.status === "ativo" ? "lime" : "red"}>{aluno.status === "ativo" ? "Ativo" : "Inativo"}</Badge>
          </div>
        </ListRow>
        <InfoRow label="E-mail" icon={<Mail size={14} />}>{aluno.email || "—"}</InfoRow>
        <InfoRow label="Telefone" icon={<Phone size={14} />}>{aluno.telefone || "—"}</InfoRow>
        <InfoRow label="Nascimento" icon={<Cake size={14} />}>{aluno.nascimento || "—"}</InfoRow>
        <InfoRow label="Cidade" icon={<MapPin size={14} />}>{aluno.endereco.cidade ? `${aluno.endereco.cidade}/${aluno.endereco.uf}` : "—"}</InfoRow>
        <InfoRow label="Turma" icon={<Layers size={14} />}>
          {turma ? <Link href={`/turmas/${turma.id}`} className="text-brand hover:underline">{turma.nome} · {turma.diaSemana} {turma.horario}</Link> : "Sem turma"}
        </InfoRow>
      </Section>

      {/* Vertente 2: nível de gamificação */}
      <Section
        title="Nível de gamificação"
        description={programa.unidade === "pontos" ? `Programa ${programa.nome}: cada ponto acumulado é um nível. Não tem relação com a bola.` : `Programa ${programa.nome}: cada aula frequentada é um nível. Não tem relação com a bola.`}
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-display text-3xl font-bold tabular-nums text-brand">Nível {atual}</span>
          <span className="text-right text-xs text-ink-500">
            {prox ? <>Próximo marco de gamificação: <b className="text-ink-900">{prox.nome}</b> no nível {prox.nivel}</> : "Nenhum prêmio configurado à frente"}
          </span>
        </div>
        <div className="mt-4"><TrilhaMarcos tabela={tabela} atual={atual} /></div>
      </Section>

      <Section flush title="Conquistas" description="Calculadas a partir do histórico de pontos e da tabela de níveis. Se um lançamento for corrigido, a lista se ajusta sozinha.">
        {conquistas.length === 0 ? (
          <EmptyState compact icon={Trophy} title="Nenhuma conquista ainda" />
        ) : (
          <>
            {(verTodasConquistas ? conquistas : conquistas.slice(0, 8)).map((c) => (
              <ListRow key={c.nivel}>
                <Award size={20} className="shrink-0 text-brand-yellow" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink-900">{c.premio.nome}</div>
                  <div className="truncate text-xs text-ink-500">
                    Nível {c.nivel} · {c.data ? formatDate(c.data) : "antes do app"}
                  </div>
                </div>
              </ListRow>
            ))}
            {conquistas.length > 8 && (
              <div className="px-5 py-3 sm:px-6">
                <button type="button" className="text-sm font-semibold text-brand-green hover:underline" onClick={() => setVerTodasConquistas((v) => !v)}>
                  {verTodasConquistas ? "Mostrar menos" : `Ver todas (${conquistas.length})`}
                </button>
              </div>
            )}
          </>
        )}
      </Section>

      <Section flush title="Histórico de pontos" description="Lançamentos por aula e ajustes. Correções guardam o valor anterior e o corrigido.">
        {meusLancamentos.length === 0 ? (
          <EmptyState compact icon={History} title="Nenhum ponto lançado ainda" />
        ) : (
          <>
            {(verTodoHistorico ? meusLancamentos : meusLancamentos.slice(0, 8)).map((l) => {
              const correcao = l.tipo === "aula" && l.anterior !== null;
              return (
                <ListRow key={l.id}>
                  <div className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-sm font-bold tabular-nums",
                    correcao || l.tipo === "ajuste" ? "bg-brand-yellow/15 text-ink-900" : "bg-brand-tint text-brand-dark"
                  )}>
                    {l.tipo === "ajuste" ? "=" : `+${l.valor}`}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink-900">
                      {l.tipo === "ajuste"
                        ? `Ajuste do total: ${l.anterior ?? 0} → ${l.valor}`
                        : correcao
                          ? `Correção: ${l.anterior} → ${l.valor} ponto${l.valor === 1 ? "" : "s"}`
                          : `${l.valor} ponto${l.valor === 1 ? "" : "s"} na aula`}
                    </div>
                    <div className="truncate text-xs text-ink-500">
                      {l.tipo === "aula" ? `Aula de ${formatDate(l.data)}` : formatDate(l.data)}
                      {correcao && ` · corrigido em ${new Date(l.registradoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}`}
                    </div>
                  </div>
                  {correcao && <Badge color="yellow">Corrigido</Badge>}
                </ListRow>
              );
            })}
            {meusLancamentos.length > 8 && (
              <div className="px-5 py-3 sm:px-6">
                <button type="button" className="text-sm font-semibold text-brand-green hover:underline" onClick={() => setVerTodoHistorico((v) => !v)}>
                  {verTodoHistorico ? "Mostrar menos" : `Ver todo o histórico (${meusLancamentos.length})`}
                </button>
              </div>
            )}
          </>
        )}
      </Section>

      {/* Vertente 3: nível técnico */}
      <Section flush title="Nível técnico" description="Bola em que o aluno está. Não altera notas nem pontos.">
        <ListRow>
          {nivel ? <LevelBadge cor={nivel.cor} nome={nivel.nome} imagem={nivel.imagem} /> : <span className="text-sm text-ink-500">Sem nível definido</span>}
        </ListRow>
        {historicoNivel.length > 1 &&
          [...historicoNivel].reverse().map((h) => {
            const n = niveis.find((x) => x.id === h.nivelId);
            return (
              <ListRow key={h.data}>
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: n?.cor ?? "#ccc" }} />
                <span className="min-w-0 flex-1 truncate text-sm text-ink-900">{n?.nome ?? "Nível removido"}</span>
                <span className="text-xs tabular-nums text-ink-500">desde {formatDate(h.data)}</span>
              </ListRow>
            );
          })}
      </Section>

      {/* Vertente 1: evolução das avaliações das aulas */}
      <Section
        title="Evolução nas aulas"
        description="Média calculada só com os critérios ativos e preenchidos. Aulas sem nota quebram a linha."
        action={
          <div className="flex flex-wrap gap-1" role="group" aria-label="Período">
            {PERIODOS.map((p) => (
              <button key={p.v} type="button" aria-pressed={periodo === p.v} onClick={() => setPeriodo(p.v)}
                className={cn("h-8 rounded-pill px-3 text-xs font-semibold transition-colors", periodo === p.v ? "bg-brand-tint text-brand-dark" : "text-ink-500 hover:bg-soft")}>
                {p.l}
              </button>
            ))}
          </div>
        }
      >
        {presentesPeriodo.length === 0 ? (
          <EmptyState compact icon={LineIcon} title="Sem aulas no período" />
        ) : (
          <div className="space-y-8">
            <LineChart titulo="Média da aula" pontos={serieMedia} />
            {criteriosUsados.map((c) => (
              <LineChart
                key={c.id}
                titulo={c.ativo ? c.nome : `${c.nome} (inativo)`}
                pontos={presentesPeriodo.map((au) => ({ data: au.data, valor: au.notas[aluno.id]?.[c.id] ?? null }))}
                formatar={(v) => String(v)}
              />
            ))}
          </div>
        )}
      </Section>

      <Section flush title="Observações das aulas" description="Anotações qualitativas; não entram na média.">
        {observacoes.length === 0 ? (
          <EmptyState compact icon={NotebookPen} title="Nenhuma observação registrada" />
        ) : (
          observacoes.slice(0, 12).map((au) => (
            <div key={au.id} className="px-5 py-3 sm:px-6">
              <div className="text-xs font-semibold text-ink-500">{formatDate(au.data, { day: "2-digit", month: "long", year: "numeric" })}</div>
              <p className="mt-1 text-sm text-ink-700">{au.observacao[aluno.id]}</p>
            </div>
          ))
        )}
      </Section>

      <Section
        flush
        title="Avaliações de desempenho"
        action={minhasAvaliacoes.length > 0 && <Link href={`/alunos/${aluno.id}/avaliacao`} className="text-sm font-semibold text-brand hover:underline">Ver detalhes</Link>}
      >
        {minhasAvaliacoes.length === 0 ? (
          <EmptyState compact icon={ClipboardCheck} title="Nenhuma avaliação registrada" action={<Link href={`/alunos/${aluno.id}/avaliacao/novo`} className="btn-outline">Registrar avaliação</Link>} />
        ) : (
          minhasAvaliacoes.map((av) => {
            const media = Math.round(mediaNotas(av.scores) ?? 0);
            return (
              <ListRow key={av.id}>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-ink-900">{formatDate(av.data)}</div>
                  {av.observacoes && <div className="truncate text-xs text-ink-500">{av.observacoes}</div>}
                </div>
                <StarRating value={media} />
              </ListRow>
            );
          })
        )}
      </Section>

      <Section flush title="Feedbacks" description="Mensagens dos professores para o aluno.">
        <form
          className="flex flex-col gap-3 bg-soft px-5 py-4 sm:px-6"
          onSubmit={(e) => { e.preventDefault(); submitFeedback(); }}
        >
          <label className="label mb-0" htmlFor="fb-prof">Professor</label>
          <select id="fb-prof" value={profId} onChange={(e) => setProfId(e.target.value)} className="input">
            {professores.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
          <label className="label mb-0" htmlFor="fb-texto">Mensagem</label>
          <textarea
            id="fb-texto"
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            rows={3}
            placeholder="Escreva o feedback para o aluno..."
            className="w-full resize-y rounded-input border border-line-strong bg-white p-3 text-base focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 md:text-sm"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={!novoTexto.trim() || !profId}><Send size={14} /> Enviar feedback</Button>
          </div>
        </form>
        {fbs.length === 0 ? (
          <EmptyState compact icon={MessageSquare} title="Nenhum feedback ainda" />
        ) : (
          fbs.map((f) => {
            const prof = professores.find((p) => p.id === f.professorId);
            return (
              <div key={f.id} className="px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  {prof && <Avatar src={prof.avatar} alt="" size={32} />}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-ink-900">{prof?.nome ?? "Professor removido"}</div>
                    <div className="text-xs text-ink-500">{formatDate(f.data, { day: "2-digit", month: "long", year: "numeric" })}</div>
                  </div>
                  <button type="button" onClick={() => setDelFeedbackId(f.id)} aria-label="Excluir feedback"
                    className="grid h-9 w-9 place-items-center rounded-full text-ink-500 transition hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm text-ink-700">{f.texto}</p>
              </div>
            );
          })
        )}
      </Section>

      <Section
        flush
        title="Acesso do aluno"
        description="Credenciais que o aluno usa para entrar no próprio perfil."
        action={
          <Link href={`/perfil-aluno/login?user=${encodeURIComponent(creds.user)}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
            <ExternalLink size={14} /> Abrir perfil
          </Link>
        }
      >
        <InfoRow label="Usuário">
          <span className="flex items-center gap-2">
            <span className="flex-1 truncate font-mono">{creds.user}</span>
            <button type="button" onClick={() => copy("user", creds.user)} className="grid h-9 w-9 place-items-center rounded-full text-ink-500 hover:bg-soft hover:text-brand" aria-label="Copiar usuário">
              {copied === "user" ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </span>
        </InfoRow>
        <InfoRow label="Senha">
          <span className="flex items-center gap-2">
            <span className="flex-1 truncate font-mono">{showSenha ? creds.senha : "•".repeat(Math.max(6, creds.senha.length))}</span>
            <button type="button" onClick={() => setShowSenha((v) => !v)} className="grid h-9 w-9 place-items-center rounded-full text-ink-500 hover:bg-soft hover:text-brand" aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}>
              {showSenha ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button type="button" onClick={() => copy("senha", creds.senha)} className="grid h-9 w-9 place-items-center rounded-full text-ink-500 hover:bg-soft hover:text-brand" aria-label="Copiar senha">
              {copied === "senha" ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </span>
        </InfoRow>
      </Section>

      <ConfirmDialog
        open={!!delFeedbackId}
        title="Excluir feedback?"
        message="O aluno deixará de ver esta mensagem."
        onCancel={() => setDelFeedbackId(null)}
        onConfirm={() => { if (delFeedbackId) { deleteFeedback(delFeedbackId); toast.success("Feedback excluído"); } setDelFeedbackId(null); }}
      />

    </PanelPage>
  );
}
