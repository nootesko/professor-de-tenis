import { LayoutDashboard, Users, GraduationCap, Layers, Trophy, Star, ClipboardCheck, type LucideIcon } from 'lucide-react';

export type NavItem = { href: string; label: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  { label: 'Hoje', items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    label: 'Cadastros',
    items: [
      { href: '/alunos', label: 'Alunos', icon: Users },
      { href: '/professores', label: 'Professores', icon: GraduationCap },
      { href: '/turmas', label: 'Turmas', icon: Layers },
      { href: '/niveis', label: 'Bolas', icon: Star },
    ],
  },
  {
    label: 'Engajamento',
    items: [
      { href: '/premios', label: 'Prêmios', icon: Trophy },
      { href: '/avaliacoes', label: 'Avaliações', icon: ClipboardCheck },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

/** Segmentos de rota que não são entidades (para o breadcrumb). */
export const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  alunos: 'Alunos',
  professores: 'Professores',
  turmas: 'Turmas',
  niveis: 'Bolas',
  premios: 'Prêmios',
  avaliacoes: 'Avaliações',
  perfil: 'Meu perfil',
  aulas: 'Aulas',
  novo: 'Novo',
  editar: 'Editar',
  avaliacao: 'Avaliação',
  premiacao: 'Premiação',
  finalizar: 'Chamada',
};

export const isActive = (path: string, href: string) => path === href || path.startsWith(href + '/');
