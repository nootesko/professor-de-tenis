// Domain types — extracted from mock-data.ts so non-seed consumers
// can import types without pulling in seed data.

export type Nivel = {
  id: string;
  nome: string;
  cor: string;
  descricao: string;
  /** Ordem de progressão técnica (bola vermelha → laranja → ...). Não tem relação com pontos. */
  ordem?: number;
  imagem?: string;
};

export type ResponsavelInfo = {
  nome: string;
  telefone: string;
  parentesco: string;
};

export type Endereco = {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
};

export type Aluno = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  nascimento: string;
  responsavel?: string;
  responsavelInfo?: ResponsavelInfo;
  endereco: Endereco;
  avatar: string;
  turmaId?: string;
  nivelId: string;
  pontos: number;
  status: 'ativo' | 'inativo';
};

export type Turma = {
  id: string;
  nome: string;
  diaSemana: string;
  horario: string;
  professorId: string;
  alunosIds: string[];
  nivelId: string;
  vagas?: number;
};

export type Professor = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  avatar: string;
  especialidade: string;
  status: 'ativo' | 'inativo';
};

/** Unidade que faz a corrida andar: ponto concedido pelo professor ou aula frequentada. */
export type UnidadeProgresso = 'pontos' | 'aulas';

/** Quando comemorar: todo ponto, só marcos marcados para comemorar, ou só o contador. */
export type ModoCelebracao = 'todo-ponto' | 'marcos' | 'contador';

export type AnimacaoConquista = 'confete' | 'fogos' | 'estrelas' | 'nenhuma';

/** Configuração do programa de recompensas (uma por escola/modalidade). */
export type ProgramaRecompensas = {
  nome: string;
  unidade: UnidadeProgresso;
  celebracao: ModoCelebracao;
};

/** O que se ganha ao alcançar um nível de gamificação: nomenclatura, prêmio e comemoração. */
export type PremioNivel = {
  nome: string;
  /** Tipo livre: medalha, troféu, adesivo, faixa, estrela... */
  tipo: string;
  descricao?: string;
  animacao: AnimacaoConquista;
  /** GIF ou imagem própria para a comemoração (substitui a animação padrão). */
  gifUrl?: string;
  /** Usado no modo de celebração "marcos". */
  celebrar: boolean;
  imagem?: string;
};

/** Prêmio resolvido para um nível específico da tabela. */
export type Premio = PremioNivel & {
  id: string;
  /** Nível de gamificação (total acumulado) em que é conquistado. */
  nivel: number;
  /** "bloco": veio da regra de repetição; "nivel": configurado nível a nível. */
  origem: 'bloco' | 'nivel';
};

/** Faixa da regra de repetição: posições 1..`ate` dentro do bloco (ex.: 1–5 medalha pequena). */
export type FaixaBloco = { ate: number; premio: PremioNivel };

/**
 * Tabela de níveis sem limite. Cada nível = 1 ponto acumulado.
 * O prêmio de um nível vem, nesta ordem: da configuração do próprio nível (`niveis`, `null` = sem prêmio)
 * ou da regra do bloco (`faixas`). Posições do bloco sem faixa (ex.: o múltiplo de 16) ficam sem prêmio
 * até serem configuradas.
 */
export type TabelaNiveis = {
  tamanhoBloco: number;
  faixas: FaixaBloco[];
  niveis: Record<number, PremioNivel | null>;
};

export type CriterioAvaliacao = {
  id: string;
  nome: string;
  /** Só critérios ativos aparecem no registro da aula. */
  ativo: boolean;
  categoria?: string;
};

/**
 * Registro de uma aula. Três vertentes separadas por aluno:
 * 1. desempenho (presença, notas por critério 0–5, observação);
 * 2. ponto de gamificação (decisão do professor, não automática);
 * 3. nível técnico trabalhado (bola), que não afeta notas nem pontos.
 */
export type Aula = {
  id: string;
  turmaId: string;
  data: string;
  presenca: Record<string, boolean>;
  /** alunoId → criterioId → nota 0–5. Critério em branco simplesmente não existe no mapa. */
  notas: Record<string, Record<string, number>>;
  observacao: Record<string, string>;
  /** alunoId → pontos conquistados nesta aula (0 ou mais, sem teto). Decisão do professor. */
  ponto: Record<string, number>;
  /** alunoId → nível técnico registrado nesta aula. */
  nivel: Record<string, string>;
  finalizadaEm: string;
};

export type Feedback = {
  id: string;
  alunoId: string;
  data: string;
  texto: string;
  professorId: string;
};

/**
 * Lançamento de pontos. Nunca é apagado: uma correção gera novo lançamento com o valor anterior e o corrigido.
 * - tipo "aula": pontos daquele aluno naquela aula (anterior = valor antes da correção, `null` no 1º lançamento);
 * - tipo "ajuste": total acumulado ajustado fora de aula (ex.: saldo trazido de antes do app).
 */
export type LancamentoPonto = {
  id: string;
  alunoId: string;
  tipo: 'aula' | 'ajuste';
  aulaId?: string;
  /** Data da aula (ou do ajuste). */
  data: string;
  anterior: number | null;
  valor: number;
  registradoEm: string;
};

export type Avaliacao = {
  id: string;
  alunoId: string;
  data: string;
  scores: Record<string, number>;
  observacoes?: string;
};

export type AlunoCred = {
  alunoId: string;
  user: string;
  senha: string;
};
