"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, Layers, Plus, Users } from "lucide-react";
import { AvatarGroup, Badge, EmptyState, ListRow, PageHeader, PanelPage, Section, StatCard, StatGrid } from "@/components/ui";
import { DateRangePicker } from "@/components/DateRangePicker";
import { useStore, selectTurmas, selectAlunos, selectProfessores, selectAulas } from "@/lib/store";
import { ADMIN_PROFILE } from "@/lib/auth";
import { DIAS_SEMANA, formatDate, fromLocalISODate, greeting, toLocalISODate } from "@/lib/date";

export default function DashboardPage() {
  const turmas = useStore(selectTurmas);
  const alunos = useStore(selectAlunos);
  const professores = useStore(selectProfessores);
  const aulas = useStore(selectAulas);

  const hoje = toLocalISODate(new Date());
  const [dia, setDia] = useState(hoje);
  const [profFiltro, setProfFiltro] = useState("");
  const [range, setRange] = useState({ from: "", to: "" });

  const shiftDia = (delta: number) => {
    const d = fromLocalISODate(dia);
    d.setDate(d.getDate() + delta);
    setDia(toLocalISODate(d));
  };

  const alunosById = useMemo(() => new Map(alunos.map((a) => [a.id, a])), [alunos]);
  const turmasById = useMemo(() => new Map(turmas.map((t) => [t.id, t])), [turmas]);
  const profById = useMemo(() => new Map(professores.map((p) => [p.id, p])), [professores]);

  const turmasDoDia = (iso: string) => {
    const nome = DIAS_SEMANA[fromLocalISODate(iso).getDay()];
    return turmas.filter((t) => t.diaSemana === nome);
  };

  const agenda = useMemo(
    () =>
      turmasDoDia(dia)
        .filter((t) => !profFiltro || t.professorId === profFiltro)
        .sort((a, b) => a.horario.localeCompare(b.horario)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [turmas, dia, profFiltro],
  );

  const finalizadas = useMemo(
    () =>
      aulas
        .filter((au) => (!range.from || au.data >= range.from) && (!range.to || au.data <= range.to))
        .sort((a, b) => b.finalizadaEm.localeCompare(a.finalizadaEm)),
    [aulas, range],
  );

  const aulaFinalizada = (turmaId: string) => aulas.some((au) => au.turmaId === turmaId && au.data === dia);
  const ativos = alunos.filter((a) => a.status === "ativo").length;

  return (
    <PanelPage>
      <PageHeader
        title={`${greeting()}, ${ADMIN_PROFILE.nome.split(" ")[0]}`}
        description={formatDate(hoje, { weekday: "long", day: "2-digit", month: "long" })}
        actions={
          <Link href="/turmas/novo" className="btn-primary">
            <Plus size={16} /> Nova turma
          </Link>
        }
      />

      <StatGrid>
        <StatCard label="Alunos ativos" value={ativos} hint={`${alunos.length} cadastrados`} icon={<Users size={16} />} />
        <StatCard label="Turmas" value={turmas.length} hint={`${professores.length} professores`} icon={<Layers size={16} />} />
        <StatCard label="Aulas hoje" value={turmasDoDia(hoje).length} icon={<CalendarDays size={16} />} />
        <StatCard label="Aulas finalizadas" value={aulas.length} icon={<CheckCircle2 size={16} />} />
      </StatGrid>

      <Section
        flush
        title="Agenda do dia"
        description="Toque em uma aula para fazer a chamada e pontuar os alunos."
        action={
          <select
            value={profFiltro}
            onChange={(e) => setProfFiltro(e.target.value)}
            aria-label="Filtrar por professor"
            className="h-10 rounded-pill border border-line-strong bg-white px-4 text-sm text-ink-700 focus:border-brand focus:outline-none"
          >
            <option value="">Todos os professores</option>
            {professores.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        }
      >
        <div className="flex flex-wrap items-center gap-2 bg-soft px-5 py-3 sm:px-6">
          <button type="button" onClick={() => shiftDia(-1)} aria-label="Dia anterior" className="grid h-9 w-9 place-items-center rounded-full border border-line-strong bg-white hover:border-brand">
            <ChevronLeft size={16} />
          </button>
          <input
            type="date"
            value={dia}
            onChange={(e) => e.target.value && setDia(e.target.value)}
            aria-label="Data da agenda"
            className="h-9 rounded-pill border border-line-strong bg-white px-3 text-sm focus:border-brand focus:outline-none"
          />
          <button type="button" onClick={() => shiftDia(1)} aria-label="Próximo dia" className="grid h-9 w-9 place-items-center rounded-full border border-line-strong bg-white hover:border-brand">
            <ChevronRight size={16} />
          </button>
          <span className="ml-1 text-sm font-medium capitalize text-ink-700">
            {formatDate(dia, { weekday: "long", day: "2-digit", month: "long" })}
          </span>
          {dia !== hoje && (
            <button type="button" onClick={() => setDia(hoje)} className="ml-auto text-sm font-semibold text-brand hover:underline">
              Voltar para hoje
            </button>
          )}
        </div>

        {agenda.length === 0 ? (
          <EmptyState compact icon={CalendarDays} title="Nenhuma aula neste dia" description={profFiltro ? "Tente remover o filtro de professor." : "Não há turmas programadas para este dia da semana."} />
        ) : (
          agenda.map((t) => {
            const lista = t.alunosIds.map((id) => alunosById.get(id)).filter(Boolean) as typeof alunos;
            const feita = aulaFinalizada(t.id);
            return (
              <Link key={t.id} href={`/aulas/${t.id}/finalizar?data=${dia}`} className="block transition-colors hover:bg-soft focus-visible:bg-soft focus-visible:outline-none">
                <ListRow>
                  <div className="flex w-16 shrink-0 items-center gap-1.5 text-sm font-semibold tabular-nums text-brand">
                    <Clock size={14} /> {t.horario.split("-")[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-ink-900">{t.nome}</div>
                    <div className="truncate text-xs text-ink-500">{profById.get(t.professorId)?.nome ?? "Sem professor"} · {lista.length} alunos</div>
                  </div>
                  <span className="hidden sm:block"><AvatarGroup srcs={lista.map((a) => a.avatar)} max={4} /></span>
                  {feita ? <Badge color="lime">Finalizada</Badge> : <Badge>Pendente</Badge>}
                  <ChevronRight size={16} className="shrink-0 text-ink-300" />
                </ListRow>
              </Link>
            );
          })
        )}
      </Section>

      <Section
        flush
        title="Aulas finalizadas"
        description={`${finalizadas.length} ${finalizadas.length === 1 ? "aula" : "aulas"} no período`}
        action={<DateRangePicker from={range.from} to={range.to} onChange={setRange} />}
      >
        {finalizadas.length === 0 ? (
          <EmptyState compact icon={CheckCircle2} title="Nenhuma aula finalizada" description="Faça a chamada de uma aula na agenda acima para ela aparecer aqui." />
        ) : (
          finalizadas.map((au) => {
            const t = turmasById.get(au.turmaId);
            if (!t) return null;
            const presentes = Object.values(au.presenca).filter(Boolean).length;
            return (
              <Link key={au.id} href={`/aulas/${au.turmaId}/finalizar?data=${au.data}`} className="block transition-colors hover:bg-soft">
                <ListRow>
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-tint text-brand">
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-ink-900">{t.nome}</div>
                    <div className="text-xs text-ink-500">{formatDate(au.data)} · {t.horario}</div>
                  </div>
                  <div className="text-right text-xs text-ink-500">
                    Presença
                    <div className="text-sm font-semibold tabular-nums text-brand">{presentes}/{t.alunosIds.length}</div>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-ink-300" />
                </ListRow>
              </Link>
            );
          })
        )}
      </Section>
    </PanelPage>
  );
}
