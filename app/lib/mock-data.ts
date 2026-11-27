// Seed data only. All type definitions live in ./types.
// Types are re-exported here for backward compatibility with older imports.
import type {
  Nivel,
  Aluno,
  Turma,
  Professor,
  CriterioAvaliacao,
  Aula,
  Feedback,
  LancamentoPonto,
  Avaliacao,
  AlunoCred,
  ProgramaRecompensas,
  TabelaNiveis,
} from './types';
import { tabelaBrincaTenis } from './gamificacao';
import { toLocalISODate, DIAS_SEMANA } from './date';

export type {
  Nivel,
  Aluno,
  Turma,
  Professor,
  Premio,
  CriterioAvaliacao,
  Aula,
  Feedback,
  LancamentoPonto,
  Avaliacao,
  AlunoCred,
  ResponsavelInfo,
  Endereco,
} from './types';

export const niveis: Nivel[] = [
  { id: 'n1', nome: 'Bola Roxa', cor: '#241957', descricao: 'Iniciantes absolutos', ordem: 1 },
  { id: 'n2', nome: 'Bola Vermelha', cor: '#dc2626', descricao: 'Fundamentos básicos', ordem: 2 },
  { id: 'n3', nome: 'Bola Laranja', cor: '#f97316', descricao: 'Em desenvolvimento', ordem: 3 },
  { id: 'n4', nome: 'Bola Verde', cor: '#16a34a', descricao: 'Intermediário', ordem: 4 },
  { id: 'n5', nome: 'Bola Amarela', cor: '#edbe16', descricao: 'Avançado', ordem: 5 },
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
  pontos: 0, // saldo anterior ao app + histórico de aulas (abaixo)
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

export const programa: ProgramaRecompensas = {
  nome: 'BrincaTênis',
  unidade: 'pontos',
  celebracao: 'todo-ponto',
};

export const tabela: TabelaNiveis = tabelaBrincaTenis();

export const criterios: CriterioAvaliacao[] = [
  { id: 'c-esforco', nome: 'Esforço', ativo: true },
  { id: 'c-disciplina', nome: 'Disciplina', ativo: true },
  { id: 'c-atencao', nome: 'Atenção', ativo: true },
  { id: 'c2', nome: 'Forehand', ativo: false, categoria: 'Movimentos' },
  { id: 'c3', nome: 'Backhand', ativo: false, categoria: 'Movimentos' },
  { id: 'c4', nome: 'Saque', ativo: false, categoria: 'Movimentos' },
];

// ---------------------------------------------------------------------------
// Histórico de aulas de demonstração (determinístico, para os gráficos terem dados).
// ---------------------------------------------------------------------------
function rand(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const OBS = [
  'Participou bem das atividades em dupla.',
  'Dispersou no aquecimento, mas voltou no jogo.',
  'Mostrou muita vontade no saque.',
  'Ajudou os colegas a recolher as bolas.',
];

function seedAulas(): { aulas: Aula[]; lancamentos: LancamentoPonto[] } {
  const out: Aula[] = [];
  const lancamentosSeed: LancamentoPonto[] = [];
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const SEMANAS = 14;
  // Alunos veteranos trazem saldo de antes do app (lançado como ajuste), para a demo mostrar níveis altos.
  const SALDO: Record<string, number> = { a1: 34, a5: 79, a8: 18, a10: 158 };
  const inicio = new Date(hoje);
  inicio.setDate(hoje.getDate() - 7 * (SEMANAS + 1));
  for (const [alunoId, saldo] of Object.entries(SALDO)) {
    const aluno = alunos.find((x) => x.id === alunoId);
    if (!aluno) continue;
    aluno.pontos = saldo;
    lancamentosSeed.push({
      id: `lp-seed-saldo-${alunoId}`, alunoId, tipo: 'ajuste', data: toLocalISODate(inicio),
      anterior: 0, valor: saldo, registradoEm: toLocalISODate(inicio) + 'T12:00:00.000Z',
    });
  }
  let n = 0;
  for (const t of turmas) {
    const dow = DIAS_SEMANA.indexOf(t.diaSemana as (typeof DIAS_SEMANA)[number]);
    for (let w = SEMANAS; w >= 1; w -= 1) {
      // Última ocorrência do dia da turma antes de hoje, recuando (w - 1) semanas.
      const d = new Date(hoje);
      const back = ((hoje.getDay() - dow + 7) % 7) || 7;
      d.setDate(hoje.getDate() - back - 7 * (w - 1));
      const data = toLocalISODate(d);
      const aula: Aula = { id: `au-seed-${t.id}-${w}`, turmaId: t.id, data, presenca: {}, notas: {}, observacao: {}, ponto: {}, nivel: {}, finalizadaEm: data + 'T12:00:00.000Z' };
      for (const alunoId of t.alunosIds) {
        n += 1;
        const idx = Number(alunoId.slice(1));
        const presente = rand(n) > 0.15;
        aula.presenca[alunoId] = presente;
        const aluno = alunos.find((x) => x.id === alunoId);
        if (aluno) aula.nivel[alunoId] = aluno.nivelId;
        if (!presente) continue;
        // Notas que melhoram devagar com o tempo, com ruído; às vezes um critério fica em branco.
        const base = 2 + ((SEMANAS - w) / SEMANAS) * 1.6 + (idx % 3) * 0.3;
        const notas: Record<string, number> = {};
        ['c-esforco', 'c-disciplina', 'c-atencao'].forEach((c, k) => {
          if (rand(n * 7 + k) < 0.08) return;
          notas[c] = Math.max(0, Math.min(5, Math.round(base + (rand(n * 13 + k) - 0.5) * 2)));
        });
        aula.notas[alunoId] = notas;
        // Quase sempre 1 ponto; às vezes 0; raramente 2 (medalha extra, ex.: rei da quadra); 3 é muito raro.
        const r = rand(n * 3);
        const pts = r < 0.2 ? 0 : r < 0.9 ? 1 : r < 0.985 ? 2 : 3;
        aula.ponto[alunoId] = pts;
        if (rand(n * 5) > 0.8) aula.observacao[alunoId] = OBS[n % OBS.length];
        if (pts > 0 && aluno) {
          aluno.pontos += pts;
          lancamentosSeed.push({
            id: `lp-seed-${lancamentosSeed.length + 1}`, alunoId, tipo: 'aula', aulaId: aula.id, data,
            anterior: null, valor: pts, registradoEm: aula.finalizadaEm,
          });
        }
      }
      out.push(aula);
    }
  }
  return { aulas: out, lancamentos: lancamentosSeed };
}

const seeded = seedAulas();
export const aulas: Aula[] = seeded.aulas;
export const lancamentos: LancamentoPonto[] = seeded.lancamentos;
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
