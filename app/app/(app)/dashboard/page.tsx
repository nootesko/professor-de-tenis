"use client";
import { PageHeader, Card, AvatarGroup, Button } from "@/components/ui";
import { useStore, selectTurmas, selectAlunos, selectProfessores, selectAulas } from "@/lib/store";
import { Clock, ChevronRight, ChevronLeft, X, CheckCircle2, Pencil } from "lucide-react";
import { DateRangePicker } from "@/components/DateRangePicker";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

const DIAS_SEMANA = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];

export default function DashboardPage() {
  const turmas = useStore(selectTurmas);
  const alunos = useStore(selectAlunos);
  const professores = useStore(selectProfessores);
  const aulas = useStore(selectAulas);
  const router = useRouter();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [profFiltro, setProfFiltro] = useState<string>("");
  const [range, setRange] = useState<{ from: string; to: string }>({ from: "", to: "" });

  const month = new Date(viewYear, viewMonth, 1)
    .toLocaleString("pt-BR", { month: "long", year: "numeric" })
    .toUpperCase();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => {
    const m = viewMonth - 1;
    if (m < 0) { setViewMonth(11); setViewYear(viewYear - 1); } else setViewMonth(m);
  };
  const nextMonth = () => {
    const m = viewMonth + 1;
    if (m > 11) { setViewMonth(0); setViewYear(viewYear + 1); } else setViewMonth(m);
  };

  const turmasFiltradas = useMemo(() => {
    const diaNome = DIAS_SEMANA[selectedDate.getDay()];
    return turmas.filter((t) => {
      const matchDia = t.diaSemana === diaNome;
      const matchProf = !profFiltro || t.professorId === profFiltro;
      return matchDia && matchProf;
    });
  }, [turmas, selectedDate, profFiltro]);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  return (
    <>
      <PageHeader
        title="Boa Tarde,"
        crumbs={["Professor Cássio"]}
        actions={
          <>
            <Link href="/avaliacoes/novo"><Button variant="outline">+ Cadastrar Aula</Button></Link>
            <Link href="/turmas/novo"><Button>+ Cadastrar nova turma</Button></Link>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-semibold text-brand">
              Aulas de {selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
            </div>
            {profFiltro && (
              <div className="text-xs text-ink-500">
                Professor: <span className="font-medium text-brand">{professores.find((p) => p.id === profFiltro)?.nome}</span>
              </div>
            )}
          </div>
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-ink-500">
                  <th className="pb-3 font-medium">Horário</th>
                  <th className="pb-3 font-medium">Turma</th>
                  <th className="pb-3 font-medium">Alunos / Vagas</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {turmasFiltradas.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-sm text-ink-500">Nenhuma aula encontrada para os filtros selecionados.</td></tr>
                )}
                {turmasFiltradas.map((t) => {
                  const ts = alunos.filter((a) => t.alunosIds.includes(a.id));
                  return (
                    <tr key={t.id} onClick={() => router.push(`/aulas/${t.id}/finalizar?data=${selectedDate.toISOString().slice(0,10)}`)} className="cursor-pointer border-t border-line hover:bg-brand-mint2/40">
                      <td className="py-4">
                        <div className="flex items-center gap-2 text-ink-700"><Clock size={14} className="text-brand" /> {t.horario}</div>
                      </td>
                      <td className="py-4 font-medium">{t.nome}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-ink-500">{ts.length}</span>
                          <AvatarGroup srcs={ts.map((a) => a.avatar)} />
                        </div>
                      </td>
                      <td className="py-4 text-right text-ink-300"><ChevronRight size={16} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="space-y-2 md:hidden">
            {turmasFiltradas.length === 0 && (
              <div className="py-8 text-center text-sm text-ink-500">Nenhuma aula encontrada para os filtros selecionados.</div>
            )}
            {turmasFiltradas.map((t) => {
              const ts = alunos.filter((a) => t.alunosIds.includes(a.id));
              return (
                <button
                  key={t.id}
                  onClick={() => router.push(`/aulas/${t.id}/finalizar?data=${selectedDate.toISOString().slice(0,10)}`)}
                  className="flex w-full items-center gap-3 rounded-card border border-line bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-card active:scale-[0.99]"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-card bg-brand-mint2 text-brand">
                    <Clock size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-ink-900">{t.nome}</div>
                    <div className="text-xs text-ink-500">{t.horario}</div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <AvatarGroup srcs={ts.map((a) => a.avatar)} max={3} />
                      <span className="text-[11px] text-ink-500">{ts.length} alunos</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-ink-300" />
                </button>
              );
            })}
          </div>
        </Card>
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <button onClick={prevMonth} className="rounded p-1 transition hover:bg-brand-mint2 hover:scale-110 active:scale-95"><ChevronLeft size={16} /></button>
            <div className="font-display text-sm font-bold text-brand">{month}</div>
            <button onClick={nextMonth} className="rounded p-1 transition hover:bg-brand-mint2 hover:scale-110 active:scale-95"><ChevronRight size={16} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-ink-500">
            {["DOM","SEG","TER","QUA","QUI","SEX","SAB"].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1 text-center text-xs">
            {Array.from({ length: firstDay }).map((_, i) => <div key={"e" + i} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const cellDate = new Date(viewYear, viewMonth, d);
              const isToday = sameDay(cellDate, today);
              const isSelected = sameDay(cellDate, selectedDate);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDate(cellDate)}
                  aria-label={`Dia ${d}${isToday ? ", hoje" : ""}`}
                  aria-current={isToday ? "date" : undefined}
                  aria-pressed={isSelected}
                  className={`grid aspect-square place-items-center rounded-full transition-all duration-150 hover:scale-110 ${
                    isSelected ? "bg-brand text-white font-semibold shadow"
                    : isToday ? "bg-brand-lime2 font-semibold text-brand-dark"
                    : "text-ink-700 hover:bg-brand-mint2"
                  }`}
                >
                  {d.toString().padStart(2, "0")}
                </button>
              );
            })}
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink-500">Filtrar por professor</label>
            <div className="flex items-center gap-2">
              <select
                value={profFiltro}
                onChange={(e) => setProfFiltro(e.target.value)}
                className="w-full rounded-pill border border-line bg-white px-4 py-2 text-xs text-ink-700 focus:border-brand focus:outline-none"
              >
                <option value="">Todos os professores</option>
                {professores.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
              {profFiltro && (
                <button
                  type="button"
                  onClick={() => setProfFiltro("")}
                  aria-label="Limpar filtro"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-ink-500 transition hover:bg-brand-mint2 hover:text-brand"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Aulas Finalizadas */}
      <Card className="mt-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-brand">
            <CheckCircle2 size={18} /> Aulas Finalizadas
          </h3>
          <div className="flex items-center gap-3">
            <DateRangePicker from={range.from} to={range.to} onChange={setRange} />
            <span className="text-xs text-ink-500">{aulas.length} no total</span>
          </div>
        </div>
        {aulas.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-500">
            Nenhuma aula finalizada ainda. Clique em uma aula acima para iniciar a chamada.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {aulas
              .slice()
              .filter((au) => (!range.from || au.data >= range.from) && (!range.to || au.data <= range.to))
              .sort((a, b) => b.finalizadaEm.localeCompare(a.finalizadaEm))
              .map((au) => {
                const t = turmas.find((x) => x.id === au.turmaId);
                if (!t) return null;
                const presentes = Object.values(au.presenca).filter(Boolean).length;
                const totalAlunos = t.alunosIds.length;
                const dataFmt = new Date(au.data + "T00:00:00").toLocaleDateString("pt-BR", {
                  day: "2-digit", month: "short", year: "numeric",
                });
                return (
                  <button
                    key={au.id}
                    onClick={() => router.push(`/aulas/${au.turmaId}/finalizar?data=${au.data}`)}
                    className="flex w-full items-center gap-3 rounded-card border border-line bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-card"
                  >
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-card bg-brand-tint text-brand">
                      <CheckCircle2 size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-ink-900">{t.nome}</div>
                      <div className="text-xs text-ink-500">{dataFmt} · {t.horario}</div>
                      <div className="mt-1 text-[11px] text-ink-500">
                        Presença: <span className="font-semibold text-brand">{presentes}/{totalAlunos}</span>
                      </div>
                    </div>
                    <Pencil size={14} className="shrink-0 text-ink-300" />
                  </button>
                );
              })}
          </div>
        )}
      </Card>
    </>
  );
}
