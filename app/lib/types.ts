// Domain types — extracted from mock-data.ts so non-seed consumers
// can import types without pulling in seed data.

export type Nivel = {
  id: string;
  nome: string;
  cor: string;
  descricao: string;
  pontosMin: number;
  pontosMax: number;
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

export type Premio = {
  id: string;
  nome: string;
  descricao: string;
  pontosNecessarios: number;
  tipo: 'medalha-pequena' | 'medalha-media' | 'medalha-grande' | 'troféu';
  imagem?: string;
};

export type CriterioAvaliacao = {
  id: string;
  nome: string;
  categoria: 'Movimentos' | 'Comportamento' | 'Evolução';
};

export type Aula = {
  id: string;
  turmaId: string;
  data: string;
  presenca: Record<string, boolean>;
  pontos: Record<string, number>;
  stars: Record<string, number>;
  finalizadaEm: string;
};

export type Feedback = {
  id: string;
  alunoId: string;
  data: string;
  texto: string;
  professorId: string;
};

export type Premiacao = {
  id: string;
  alunoId: string;
  premioId: string;
  data: string;
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
