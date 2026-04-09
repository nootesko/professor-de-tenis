// Seed data only. All type definitions live in ./types.
// Types are re-exported here for backward compatibility with older imports.
import type {
  Nivel,
  Aluno,
  Turma,
  Professor,
  Premio,
  CriterioAvaliacao,
  Aula,
  Feedback,
  Premiacao,
  Avaliacao,
  AlunoCred,
} from './types';

export type {
  Nivel,
  Aluno,
  Turma,
  Professor,
  Premio,
  CriterioAvaliacao,
  Aula,
  Feedback,
  Premiacao,
  Avaliacao,
  AlunoCred,
  ResponsavelInfo,
  Endereco,
} from './types';

export const niveis: Nivel[] = [
  { id: 'n1', nome: 'Bola Roxa', cor: '#241957', descricao: 'Iniciantes absolutos', pontosMin: 0, pontosMax: 79 },
  { id: 'n2', nome: 'Bola Vermelha', cor: '#dc2626', descricao: 'Fundamentos básicos', pontosMin: 80, pontosMax: 159 },
  { id: 'n3', nome: 'Bola Laranja', cor: '#f97316', descricao: 'Em desenvolvimento', pontosMin: 160, pontosMax: 239 },
  { id: 'n4', nome: 'Bola Verde', cor: '#16a34a', descricao: 'Intermediário', pontosMin: 240, pontosMax: 319 },
  { id: 'n5', nome: 'Bola Amarela', cor: '#edbe16', descricao: 'Avançado', pontosMin: 320, pontosMax: 999 },
];

const nomes = [
  'William Prado', 'Camila Souza', 'Bruno Carvalho', 'Letícia Almeida',
  'Rafael Oliveira', 'Marina Lopes', 'Thiago Mendes', 'Beatriz Ferreira',
  'Lucas Pereira', 'Júlia Santos', 'Pedro Henrique', 'Sophia Costa',
];

export const alunos: Aluno[] = nomes.map((nome, i) => ({
  id: `a${i + 1}`,
  nome,
  email: nome.toLowerCase().replace(/\s+/g, '.') + '@email.com',
  telefone: `(11) 9${(8000 + i).toString()}-${(1000 + i * 7).toString()}`,
  nascimento: `200${i % 9}-0${(i % 9) + 1}-1${i % 9}`,
  responsavel: i % 3 === 0 ? 'Maria ' + nome.split(' ')[1] : undefined,
  endereco: { rua: 'Rua das Quadras', numero: `${100 + i}`, bairro: 'Centro', cidade: 'São Paulo', uf: 'SP', cep: '01000-000' },
  avatar: `https://i.pravatar.cc/150?img=${i + 5}`,
  turmaId: `t${(i % 4) + 1}`,
  nivelId: niveis[i % niveis.length].id,
  pontos: 16 * ((i % 10) + 1),
  status: i % 7 === 0 ? 'inativo' : 'ativo',
}));

export const professores: Professor[] = [
  { id: 'p1', nome: 'Cássio Lima', email: 'cassio@noot.com.br', telefone: '(11) 99999-1111', avatar: 'https://i.pravatar.cc/150?img=12', especialidade: 'Técnica', status: 'ativo' },
  { id: 'p2', nome: 'Marcelo Dias', email: 'marcelo@noot.com.br', telefone: '(11) 99999-2222', avatar: 'https://i.pravatar.cc/150?img=33', especialidade: 'Físico', status: 'ativo' },
  { id: 'p3', nome: 'Renata Castro', email: 'renata@noot.com.br', telefone: '(11) 99999-3333', avatar: 'https://i.pravatar.cc/150?img=47', especialidade: 'Tática', status: 'ativo' },
];

export const turmas: Turma[] = [
  { id: 't1', nome: 'Turma 808', diaSemana: 'Segunda', horario: '08:00-09:00', professorId: 'p1', alunosIds: ['a1', 'a2', 'a3', 'a4'], nivelId: 'n2' },
  { id: 't2', nome: 'Turma 9/B', diaSemana: 'Terça', horario: '09:00-10:00', professorId: 'p1', alunosIds: ['a5', 'a6', 'a7'], nivelId: 'n3' },
  { id: 't3', nome: 'Turma 10/A', diaSemana: 'Quarta', horario: '10:00-11:00', professorId: 'p2', alunosIds: ['a8', 'a9'], nivelId: 'n4' },
  { id: 't4', nome: 'Turma 11/B', diaSemana: 'Quinta', horario: '11:00-12:00', professorId: 'p3', alunosIds: ['a10', 'a11', 'a12'], nivelId: 'n5' },
];

export const premios: Premio[] = [
  { id: 'pr1', nome: 'Medalha Bronze', descricao: 'Primeiros passos', pontosNecessarios: 16, tipo: 'medalha-pequena' },
  { id: 'pr2', nome: 'Medalha Prata', descricao: 'Segundo nível', pontosNecessarios: 32, tipo: 'medalha-pequena' },
  { id: 'pr3', nome: 'Medalha Ouro', descricao: 'Top desempenho', pontosNecessarios: 48, tipo: 'medalha-media' },
  { id: 'pr4', nome: 'Troféu Quadra', descricao: 'Conquista épica', pontosNecessarios: 96, tipo: 'troféu' },
];

export const criterios: CriterioAvaliacao[] = [
  { id: 'c1', nome: 'Empunhadura', categoria: 'Movimentos' },
  { id: 'c2', nome: 'Forehand', categoria: 'Movimentos' },
  { id: 'c3', nome: 'Backhand', categoria: 'Movimentos' },
  { id: 'c4', nome: 'Saque', categoria: 'Movimentos' },
  { id: 'c5', nome: 'Postura em quadra', categoria: 'Comportamento' },
  { id: 'c6', nome: 'Respeito aos colegas', categoria: 'Comportamento' },
  { id: 'c7', nome: 'Pontualidade', categoria: 'Comportamento' },
  { id: 'c8', nome: 'Evolução técnica', categoria: 'Evolução' },
  { id: 'c9', nome: 'Evolução tática', categoria: 'Evolução' },
];

export const aulas: Aula[] = [];
export const premiacoes: Premiacao[] = [];
export const avaliacoes: Avaliacao[] = [];

function randomSenha(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let s = '';
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export const alunoCreds: AlunoCred[] = alunos.map((a) => ({
  alunoId: a.id,
  user: (a.email?.split('@')[0] || `aluno-${a.id}`).toLowerCase(),
  senha: randomSenha(),
}));

export const feedbacks: Feedback[] = [
  { id: 'f1', alunoId: 'a1', data: '2026-04-01', texto: 'Ótima evolução no forehand essa semana.', professorId: 'p1' },
  { id: 'f2', alunoId: 'a1', data: '2026-03-25', texto: 'Precisa melhorar a postura no saque.', professorId: 'p1' },
  { id: 'f3', alunoId: 'a2', data: '2026-04-02', texto: 'Excelente comportamento em quadra.', professorId: 'p1' },
];
