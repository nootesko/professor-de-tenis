"use client";
import { PageHeader, Card, Button, Avatar, StarRating, Badge, LevelBadge } from "@/components/ui";
import {
  useStore,
  selectAlunos,
  selectNiveis,
  selectPremios,
  selectFeedbacks,
  selectProfessores,
  selectAulas,
  selectPremiacoes,
  selectAvaliacoes,
  selectAlunoCreds,
} from "@/lib/store";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Trophy, Mail, Phone, MapPin, Cake, Pencil, Send, Trash2, KeyRound, Copy, Eye, EyeOff, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";

export default function PainelAlunoPage() {
  const { id } = useParams<{ id: string }>();
  const alunos = useStore(selectAlunos);
  const niveis = useStore(selectNiveis);
  const premios = useStore(selectPremios);
  const feedbacks = useStore(selectFeedbacks);
  const professores = useStore(selectProfessores);
  const aulas = useStore(selectAulas);
  const premiacoes = useStore(selectPremiacoes);
  const avaliacoes = useStore(selectAvaliacoes);
  const alunoCreds = useStore(selectAlunoCreds);
  const addFeedback = useStore((s) => s.addFeedback);
  const deleteFeedback = useStore((s) => s.deleteFeedback);
  const aluno = alunos.find((a) => a.id === id);
  const [novoTexto, setNovoTexto] = useState("");
  const [profId, setProfId] = useState(professores[0]?.id ?? "");
  const [showSenha, setShowSenha] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  if (!aluno) return <div>Aluno não encontrado</div>;
  const nivel = niveis.find((n) => n.id === aluno.nivelId);
  const fbs = useMemo(
    () => feedbacks.filter((f) => f.alunoId === aluno.id).sort((a, b) => b.data.localeCompare(a.data)),
    [feedbacks, aluno.id]
  );
  const credEntry = alunoCreds.find((c) => c.alunoId === aluno.id);
  const creds = credEntry ?? { user: aluno.email.split("@")[0], senha: "—" };
  const minhasAvaliacoes = useMemo(
    () => avaliacoes.filter((av) => av.alunoId === aluno.id).sort((a, b) => b.data.localeCompare(a.data)),
    [avaliacoes, aluno.id]
  );
  const minhasPremiacoes = useMemo(
    () => premiacoes.filter((p) => p.alunoId === aluno.id).sort((a, b) => b.data.localeCompare(a.data)),
    [premiacoes, aluno.id]
  );
  // média real de stars das aulas para este aluno
  const starsReais = useMemo(() => {
    const vals: number[] = [];
    for (const au of aulas) {
      const v = au.stars?.[aluno.id];
      if (typeof v === "number" && v > 0) vals.push(v);
    }
    return vals;
  }, [aulas, aluno.id]);
  const mediaStars = starsReais.length ? Math.round(starsReais.reduce((a, b) => a + b, 0) / starsReais.length) : 0;

  const submitFeedback = () => {
    const texto = novoTexto.trim();
    if (!texto || !profId) return;
    addFeedback({
      id: "f" + Date.now(),
      alunoId: aluno.id,
      professorId: profId,
      data: new Date().toISOString().slice(0, 10),
      texto,
    });
    setNovoTexto("");
  };

  const copy = (label: string, value: string) => {
    navigator.clipboard?.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };
  return (
    <>
      <PageHeader
        title={`Painel - ${aluno.nome}`}
        crumbs={["DASHBOARD","ALUNOS",aluno.nome.toUpperCase()]}
        actions={
          <>
            <Link href={`/alunos/${aluno.id}/editar`}><Button variant="outline"><Pencil size={14} /> Editar</Button></Link>
            <Link href={`/alunos/${aluno.id}/avaliacao/novo`}><Button>Nova Avaliação de Desempenho</Button></Link>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <Avatar src={aluno.avatar} alt={aluno.nome} size={96} />
            <h2 className="mt-3 font-display text-xl font-bold text-brand">{aluno.nome}</h2>
            <Badge color={aluno.status === "ativo" ? "lime" : "red"}>{aluno.status}</Badge>
            <div className="mt-4 w-full space-y-2 text-left text-sm text-ink-700">
              <div className="flex items-center gap-2"><Mail size={14} className="text-brand" /> {aluno.email}</div>
              <div className="flex items-center gap-2"><Phone size={14} className="text-brand" /> {aluno.telefone}</div>
              <div className="flex items-center gap-2"><Cake size={14} className="text-brand" /> {aluno.nascimento}</div>
              <div className="flex items-center gap-2"><MapPin size={14} className="text-brand" /> {aluno.endereco.cidade}/{aluno.endereco.uf}</div>
            </div>
          </div>
        </Card>
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h3 className="font-display text-lg font-bold text-brand">Nível & Pontuação</h3>
            <div className="mt-4 flex items-center justify-between">
              {nivel && <LevelBadge cor={nivel.cor} nome={nivel.nome} size={48} />}
              <div className="text-right">
                <div className="font-display text-3xl font-bold text-brand">{aluno.pontos}</div>
                <div className="text-xs text-ink-500">pontos</div>
              </div>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-line">
              <div className="h-full bg-brand-lime2" style={{ width: `${Math.min(100, (aluno.pontos / 160) * 100)}%` }} />
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-display text-lg font-bold text-brand">Avaliação média (das aulas)</h3>
            <div className="mt-4">
              {starsReais.length === 0 ? (
                <p className="text-sm text-ink-500">Sem avaliações ainda</p>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="text-xs text-ink-500">{starsReais.length} aulas avaliadas</div>
                  <StarRating value={mediaStars} />
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-display text-lg font-bold text-brand">Avaliações de Desempenho</h3>
            <div className="mt-4 space-y-2">
              {minhasAvaliacoes.length === 0 && <p className="text-sm text-ink-500">Nenhuma avaliação registrada.</p>}
              {minhasAvaliacoes.map((av) => {
                const total = Object.values(av.scores).reduce((a, b) => a + b, 0);
                const count = Object.keys(av.scores).length;
                const media = count ? Math.round(total / count) : 0;
                return (
                  <div key={av.id} className="flex items-center justify-between rounded-card border border-line p-3">
                    <div>
                      <div className="text-sm font-medium">{new Date(av.data + "T00:00:00").toLocaleDateString("pt-BR")}</div>
                      {av.observacoes && <div className="text-xs text-ink-500">{av.observacoes}</div>}
                    </div>
                    <StarRating value={media} />
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-display text-lg font-bold text-brand">Premiações</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {minhasPremiacoes.length === 0 && <p className="col-span-full text-sm text-ink-500">Sem premiações.</p>}
              {minhasPremiacoes.map((pm) => {
                const premio = premios.find((p) => p.id === pm.premioId);
                return (
                  <div key={pm.id} className="rounded-card border border-line p-3 text-center">
                    <Trophy size={24} className="mx-auto text-brand-yellow" />
                    <div className="mt-1 text-xs font-semibold">{premio?.nome ?? "—"}</div>
                    <div className="text-[10px] text-ink-500">{pm.data}</div>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-display text-lg font-bold text-brand">Prêmios Conquistados</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {premios.map((p) => {
                const got = aluno.pontos >= p.pontosNecessarios;
                return (
                  <div key={p.id} className={`rounded-card border border-line p-4 text-center ${got ? "" : "opacity-40"}`}>
                    <Trophy size={32} className="mx-auto text-brand-yellow" />
                    <div className="mt-2 text-xs font-semibold">{p.nome}</div>
                    <div className="text-[10px] text-ink-500">{p.pontosNecessarios} pts</div>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-display text-lg font-bold text-brand">Feedbacks</h3>

            {/* Novo feedback */}
            <div className="mt-4 rounded-card border border-line bg-brand-mint/30 p-4">
              <div className="mb-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <label className="label">Professor</label>
                  <select
                    value={profId}
                    onChange={(e) => setProfId(e.target.value)}
                    className="w-full rounded-pill border border-line bg-white px-4 py-2 text-sm focus:border-brand focus:outline-none"
                  >
                    {professores.map((p) => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="text-xs text-ink-500 sm:text-right">
                  Data: <span className="font-medium text-brand">{new Date().toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
              <textarea
                value={novoTexto}
                onChange={(e) => setNovoTexto(e.target.value)}
                rows={3}
                placeholder="Escreva o feedback para o aluno..."
                className="w-full resize-none rounded-card border border-line bg-white p-3 text-sm focus:border-brand focus:outline-none"
              />
              <div className="mt-3 flex justify-end">
                <Button onClick={submitFeedback} disabled={!novoTexto.trim() || !profId}>
                  <Send size={14} /> Enviar feedback
                </Button>
              </div>
            </div>

            {/* Histórico */}
            <div className="mt-4 space-y-3">
              {fbs.length === 0 && <p className="text-sm text-ink-500">Nenhum feedback ainda.</p>}
              {fbs.map((f) => {
                const prof = professores.find((p) => p.id === f.professorId);
                return (
                  <div key={f.id} className="rounded-card border border-line bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {prof && <Avatar src={prof.avatar} alt={prof.nome} size={28} />}
                        <div>
                          <div className="text-xs font-semibold text-brand">{prof?.nome ?? "Professor removido"}</div>
                          <div className="text-[10px] text-ink-500">
                            {new Date(f.data + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteFeedback(f.id)}
                        aria-label="Excluir feedback"
                        className="grid h-7 w-7 place-items-center rounded-full text-ink-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-ink-700">{f.texto}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Acesso ao perfil */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-brand">
                <KeyRound size={18} /> Acesso ao perfil
              </h3>
              <Link href={`/perfil-aluno/login?user=${encodeURIComponent(creds.user)}`} target="_blank" className="text-xs font-semibold text-brand-lime2 hover:underline">
                <ExternalLink size={12} className="inline" /> Abrir perfil
              </Link>
            </div>
            <p className="mt-1 text-xs text-ink-500">
              Credenciais que o aluno utiliza para acessar seu próprio painel.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 rounded-pill border border-line bg-white px-4 py-2">
                <span className="text-[10px] uppercase text-ink-500">Usuário</span>
                <span className="flex-1 truncate font-mono text-sm text-ink-900">{creds.user}</span>
                <button onClick={() => copy("user", creds.user)} className="text-ink-400 hover:text-brand" aria-label="Copiar usuário">
                  <Copy size={14} />
                </button>
                {copied === "user" && <span className="text-[10px] text-brand">copiado</span>}
              </div>
              <div className="flex items-center gap-2 rounded-pill border border-line bg-white px-4 py-2">
                <span className="text-[10px] uppercase text-ink-500">Senha</span>
                <span className="flex-1 truncate font-mono text-sm text-ink-900">
                  {showSenha ? creds.senha : "•".repeat(creds.senha.length)}
                </span>
                <button onClick={() => setShowSenha((v) => !v)} className="text-ink-400 hover:text-brand" aria-label="Mostrar/ocultar senha">
                  {showSenha ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => copy("senha", creds.senha)} className="text-ink-400 hover:text-brand" aria-label="Copiar senha">
                  <Copy size={14} />
                </button>
                {copied === "senha" && <span className="text-[10px] text-brand">copiado</span>}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
