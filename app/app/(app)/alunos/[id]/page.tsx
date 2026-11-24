"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Trophy, Mail, Phone, MapPin, Cake, Pencil, Send, Trash2, Copy, Eye, EyeOff, ExternalLink, Layers, ClipboardCheck, MessageSquare, Plus, Check } from "lucide-react";
import {
  PageHeader, PanelPage, Section, ListRow, InfoRow, StatGrid, StatCard, Avatar, StarRating, Badge,
  Button, ConfirmDialog, EmptyState, NotFoundState,
} from "@/components/ui";
import {
  useStore, selectAlunos, selectNiveis, selectPremios, selectFeedbacks, selectProfessores, selectAulas,
  selectPremiacoes, selectAvaliacoes, selectAlunoCreds, selectTurmas,
} from "@/lib/store";
import { formatDate, toLocalISODate } from "@/lib/date";
import { toast } from "@/components/Toast";

export default function PainelAlunoPage() {
  const { id } = useParams<{ id: string }>();
  const alunos = useStore(selectAlunos);
  const niveis = useStore(selectNiveis);
  const premios = useStore(selectPremios);
  const feedbacks = useStore(selectFeedbacks);
  const professores = useStore(selectProfessores);
  const turmas = useStore(selectTurmas);
  const aulas = useStore(selectAulas);
  const premiacoes = useStore(selectPremiacoes);
  const avaliacoes = useStore(selectAvaliacoes);
  const alunoCreds = useStore(selectAlunoCreds);
  const addFeedback = useStore((s) => s.addFeedback);
  const deleteFeedback = useStore((s) => s.deleteFeedback);

  const [novoTexto, setNovoTexto] = useState("");
  const [profId, setProfId] = useState(professores[0]?.id ?? "");
  const [showSenha, setShowSenha] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [delFeedbackId, setDelFeedbackId] = useState<string | null>(null);

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
  const minhasPremiacoes = useMemo(
    () => premiacoes.filter((p) => p.alunoId === id).sort((a, b) => b.data.localeCompare(a.data)),
    [premiacoes, id],
  );
  const starsReais = useMemo(
    () => aulas.map((au) => au.stars?.[id]).filter((v): v is number => typeof v === "number" && v > 0),
    [aulas, id],
  );

  if (!aluno) return <NotFoundState title="Aluno não encontrado" backHref="/alunos" backLabel="Voltar para Alunos" />;

  const nivel = niveis.find((n) => n.id === aluno.nivelId);
  const proximo = [...niveis].sort((a, b) => a.pontosMin - b.pontosMin).find((n) => n.pontosMin > aluno.pontos);
  const turma = turmas.find((t) => t.alunosIds.includes(aluno.id));
  const mediaStars = starsReais.length ? Math.round(starsReais.reduce((a, b) => a + b, 0) / starsReais.length) : 0;
  const progresso = nivel ? Math.min(100, Math.max(0, ((aluno.pontos - nivel.pontosMin) / Math.max(1, nivel.pontosMax - nivel.pontosMin)) * 100)) : 0;
  const creds = alunoCreds.find((c) => c.alunoId === aluno.id) ?? { user: aluno.email.split("@")[0], senha: "—" };

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
        <StatCard label="Pontos" value={aluno.pontos} hint={proximo ? `${proximo.pontosMin - aluno.pontos} para ${proximo.nome}` : "Nível máximo"} />
        <StatCard label="Média nas aulas" value={mediaStars ? `${mediaStars}/5` : "—"} hint={`${starsReais.length} aulas avaliadas`} />
        <StatCard label="Avaliações" value={minhasAvaliacoes.length} hint="de desempenho" />
        <StatCard label="Premiações" value={minhasPremiacoes.length} hint="recebidas" />
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

      {nivel && (
        <Section title="Evolução no nível" description={`${nivel.nome}: ${nivel.pontosMin}–${nivel.pontosMax} pts`}>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={Math.round(progresso)} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso no nível">
            <div className="h-full rounded-full bg-brand-lime2" style={{ width: `${progresso}%` }} />
          </div>
          <div className="mt-2 text-xs text-ink-500">{Math.round(progresso)}% do nível concluído</div>
        </Section>
      )}

      <Section
        flush
        title="Avaliações de desempenho"
        action={minhasAvaliacoes.length > 0 && <Link href={`/alunos/${aluno.id}/avaliacao`} className="text-sm font-semibold text-brand hover:underline">Ver detalhes</Link>}
      >
        {minhasAvaliacoes.length === 0 ? (
          <EmptyState compact icon={ClipboardCheck} title="Nenhuma avaliação registrada" action={<Link href={`/alunos/${aluno.id}/avaliacao/novo`} className="btn-outline">Registrar avaliação</Link>} />
        ) : (
          minhasAvaliacoes.map((av) => {
            const vals = Object.values(av.scores);
            const media = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
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

      <Section flush title="Prêmios" description="Conquistados pela pontuação atual e premiações recebidas.">
        {premios.length === 0 && minhasPremiacoes.length === 0 ? (
          <EmptyState compact icon={Trophy} title="Nenhum prêmio cadastrado" />
        ) : (
          <>
            {[...premios].sort((a, b) => a.pontosNecessarios - b.pontosNecessarios).map((p) => {
              const got = aluno.pontos >= p.pontosNecessarios;
              return (
                <ListRow key={p.id}>
                  <Trophy size={20} className={got ? "text-brand-yellow" : "text-ink-300"} />
                  <div className="min-w-0 flex-1">
                    <div className={`truncate text-sm font-semibold ${got ? "text-ink-900" : "text-ink-500"}`}>{p.nome}</div>
                    <div className="text-xs tabular-nums text-ink-500">{p.pontosNecessarios} pts</div>
                  </div>
                  {got ? <Badge color="lime"><Check size={12} className="mr-1" /> Conquistado</Badge> : <span className="text-xs tabular-nums text-ink-500">faltam {p.pontosNecessarios - aluno.pontos} pts</span>}
                </ListRow>
              );
            })}
            {minhasPremiacoes.map((pm) => (
              <ListRow key={pm.id}>
                <Trophy size={20} className="text-brand-yellow" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink-900">{premios.find((p) => p.id === pm.premioId)?.nome ?? "Prêmio removido"}</div>
                  <div className="text-xs text-ink-500">Premiação em {formatDate(pm.data)}</div>
                </div>
                <Badge color="yellow">Premiação</Badge>
              </ListRow>
            ))}
          </>
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
