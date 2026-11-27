// Regras de gamificação (spec BrincaTênis + resumo prático para o desenvolvedor). Funções puras, sem estado.
//
// Três vertentes independentes por aluno e por aula:
//   1. desempenho: presença + notas 0–5 por critério + observação;
//   2. pontos: o professor registra quantos pontos o aluno conquistou (0 ou mais, sem teto).
//      O total acumulado é o nível de gamificação (10 pontos = nível 10);
//   3. nível técnico (bola): registrado à parte, nunca altera notas, pontos ou prêmios.
//
// As conquistas não são cadastradas: saem do histórico de pontos + tabela de níveis.

import type {
  Aluno,
  Aula,
  FaixaBloco,
  Premio,
  PremioNivel,
  ProgramaRecompensas,
  TabelaNiveis,
  UnidadeProgresso,
} from './types';

/** Média só dos critérios preenchidos; em branco não conta como zero. `null` se nada foi avaliado. */
export function mediaNotas(notas: Record<string, number> | undefined, criteriosIds?: string[]): number | null {
  if (!notas) return null;
  const vals = Object.entries(notas)
    .filter(([id, v]) => typeof v === 'number' && (!criteriosIds || criteriosIds.includes(id)))
    .map(([, v]) => v);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/** Pontos que valem nesta aula: só conta se o aluno estava presente. Presença sozinha não dá ponto. */
export function pontosDaAula(aula: Pick<Aula, 'presenca' | 'ponto'> | undefined, alunoId: string): number {
  if (!aula || aula.presenca[alunoId] !== true) return 0;
  const v = aula.ponto[alunoId];
  return typeof v === 'number' && v > 0 ? Math.floor(v) : 0;
}

export function aulasFrequentadas(aulas: Aula[], alunoId: string): number {
  return aulas.filter((a) => a.presenca[alunoId] === true).length;
}

/** Progresso do aluno na unidade do programa. Em pontos, é o nível de gamificação. */
export function progresso(unidade: UnidadeProgresso, aluno: Pick<Aluno, 'id' | 'pontos'>, aulas: Aula[]): number {
  return unidade === 'pontos' ? aluno.pontos : aulasFrequentadas(aulas, aluno.id);
}

// ---------------------------------------------------------------------------
// Tabela de níveis
// ---------------------------------------------------------------------------

/** Posição do nível dentro do bloco (1..tamanhoBloco). */
export function posicaoNoBloco(tabela: Pick<TabelaNiveis, 'tamanhoBloco'>, nivel: number): number {
  return ((nivel - 1) % tabela.tamanhoBloco) + 1;
}

/** Faixa da regra do bloco para o nível, se houver. */
export function faixaDoNivel(tabela: TabelaNiveis, nivel: number): FaixaBloco | undefined {
  const pos = posicaoNoBloco(tabela, nivel);
  return [...tabela.faixas].sort((a, b) => a.ate - b.ate).find((f) => pos <= f.ate);
}

/** Prêmio do nível (configuração do nível > regra do bloco). `null` = nível sem prêmio, conta sem aviso. */
export function premioDoNivel(tabela: TabelaNiveis, nivel: number): Premio | null {
  if (nivel < 1) return null;
  if (Object.prototype.hasOwnProperty.call(tabela.niveis, nivel)) {
    const p = tabela.niveis[nivel];
    return p ? { ...p, id: `nv${nivel}`, nivel, origem: 'nivel' } : null;
  }
  const f = faixaDoNivel(tabela, nivel);
  return f ? { ...f.premio, id: `nv${nivel}`, nivel, origem: 'bloco' } : null;
}

/** Prêmios dos níveis atravessados ao ir de `de` (exclusivo) para `ate` (inclusivo). Ex.: 46 → 49 inclui o 48. */
export function premiosEntre(tabela: TabelaNiveis, de: number, ate: number): Premio[] {
  const out: Premio[] = [];
  for (let n = Math.max(1, de + 1); n <= ate; n += 1) {
    const p = premioDoNivel(tabela, n);
    if (p) out.push(p);
  }
  return out;
}

/** Próximo nível com prêmio depois de `atual` (procura alguns blocos à frente; a tabela não tem fim). */
export function proximoPremio(tabela: TabelaNiveis, atual: number, alcance = tabela.tamanhoBloco * 8): Premio | undefined {
  for (let n = atual + 1; n <= atual + alcance; n += 1) {
    const p = premioDoNivel(tabela, n);
    if (p) return p;
  }
  return undefined;
}

/** Prêmio especial: configurado nível a nível ou em posição do bloco sem faixa (ex.: múltiplo de 16). */
export function ehEspecial(tabela: TabelaNiveis, p: Premio): boolean {
  return p.origem === 'nivel' || !faixaDoNivel(tabela, p.nivel);
}

/** Intervalo do bloco que contém o próximo nível a alcançar. */
export function blocoAtual(tabela: Pick<TabelaNiveis, 'tamanhoBloco'>, atual: number): { inicio: number; fim: number } {
  const inicio = Math.floor(Math.max(0, atual) / tabela.tamanhoBloco) * tabela.tamanhoBloco + 1;
  return { inicio, fim: inicio + tabela.tamanhoBloco - 1 };
}

// ---------------------------------------------------------------------------
// Conquistas derivadas do histórico
// ---------------------------------------------------------------------------

export type ConquistaDerivada = {
  nivel: number;
  premio: Premio;
  /** Data da aula em que o nível foi alcançado; ausente quando veio do saldo anterior ao app. */
  data?: string;
  aulaId?: string;
};

function aulasEmOrdem(aulas: Aula[]): Aula[] {
  return [...aulas].sort((a, b) => a.data.localeCompare(b.data) || a.finalizadaEm.localeCompare(b.finalizadaEm));
}

/**
 * Conquistas do aluno calculadas a partir do histórico de aulas e da tabela.
 * Em pontos, o que excede a soma das aulas é saldo anterior (ajuste/pontos iniciais) e vem primeiro, sem data.
 * Corrigir um lançamento muda o resultado automaticamente: não há prêmio duplicado nem cadastro manual.
 */
export function conquistasDoAluno(
  tabela: TabelaNiveis,
  unidade: UnidadeProgresso,
  aluno: Pick<Aluno, 'id' | 'pontos'>,
  aulas: Aula[],
): ConquistaDerivada[] {
  const atual = progresso(unidade, aluno, aulas);
  const minhas = aulasEmOrdem(aulas).filter((a) => a.presenca[aluno.id] !== undefined);
  const ganho = (a: Aula) => (unidade === 'pontos' ? pontosDaAula(a, aluno.id) : a.presenca[aluno.id] ? 1 : 0);
  const soma = minhas.reduce((s, a) => s + ganho(a), 0);
  const base = Math.max(0, atual - soma);

  const out: ConquistaDerivada[] = [];
  premiosEntre(tabela, 0, Math.min(base, atual)).forEach((premio) => out.push({ nivel: premio.nivel, premio }));
  let acumulado = base;
  for (const a of minhas) {
    const g = ganho(a);
    if (g === 0) continue;
    const depois = Math.min(atual, acumulado + g);
    premiosEntre(tabela, acumulado, depois).forEach((premio) =>
      out.push({ nivel: premio.nivel, premio, data: a.data, aulaId: a.id }),
    );
    acumulado += g;
    if (acumulado >= atual) break;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Comemoração
// ---------------------------------------------------------------------------

export type Conquista = { alunoId: string; premio: Premio };

/**
 * O que vira comemoração na tela ao finalizar a aula. Níveis sem prêmio contam normalmente, sem aviso.
 * - "todo-ponto": todos os níveis atravessados que têm prêmio;
 * - "marcos": só os prêmios marcados para comemorar;
 * - "contador": nada (o histórico registra normalmente).
 */
export function conquistasParaCelebrar(
  programa: ProgramaRecompensas,
  porAluno: { alunoId: string; premios: Premio[] }[],
): Conquista[] {
  if (programa.celebracao === 'contador') return [];
  return porAluno.flatMap((a) =>
    (programa.celebracao === 'marcos' ? a.premios.filter((p) => p.celebrar) : a.premios).map((premio) => ({
      alunoId: a.alunoId,
      premio,
    })),
  );
}

// ---------------------------------------------------------------------------
// Tabela inicial do BrincaTênis
// ---------------------------------------------------------------------------

const medalha = (nome: string, animacao: PremioNivel['animacao'] = 'confete'): PremioNivel => ({
  nome,
  tipo: nome,
  animacao,
  celebrar: false,
});

const especial = (nome: string, tipo: string): PremioNivel => ({ nome, tipo, animacao: 'fogos', celebrar: true });

/**
 * A cada bloco de 16 níveis: 5 medalhas pequenas, 5 médias, 5 grandes e um especial no múltiplo de 16.
 * Especiais definidos até o 176; os seguintes ficam em branco para o professor configurar.
 */
export function tabelaBrincaTenis(): TabelaNiveis {
  return {
    tamanhoBloco: 16,
    faixas: [
      { ate: 5, premio: medalha('Medalha pequena') },
      { ate: 10, premio: medalha('Medalha média') },
      { ate: 15, premio: medalha('Medalha grande', 'estrelas') },
    ],
    niveis: {
      16: especial('Prêmio gigante 1', 'Prêmio gigante'),
      32: especial('Prêmio gigante 2', 'Prêmio gigante'),
      48: especial('Troféu de forehand', 'Troféu'),
      64: especial('Troféu de backhand', 'Troféu'),
      80: especial('Troféu de saque', 'Troféu'),
      96: especial('Gigante Suprema 1', 'Gigante Suprema'),
      112: especial('Troféu de Taças 1', 'Troféu de Taças'),
      128: especial('Gigante Suprema 2', 'Gigante Suprema'),
      144: especial('Troféu de Taças 2', 'Troféu de Taças'),
      160: especial('Gigante Suprema 3', 'Gigante Suprema'),
      176: especial('Troféu de Taças 3', 'Troféu de Taças'),
    },
  };
}

export const UNIDADE_LABEL: Record<UnidadeProgresso, { curto: string; plural: string; singular: string }> = {
  pontos: { curto: 'pts', plural: 'pontos', singular: 'ponto' },
  aulas: { curto: 'aulas', plural: 'aulas frequentadas', singular: 'aula frequentada' },
};

export const ANIMACAO_LABEL = { confete: 'Confete', fogos: 'Fogos', estrelas: 'Estrelas', nenhuma: 'Sem animação' } as const;
