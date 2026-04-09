'use client';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { clearAlunoSession } from '@/lib/aluno-creds';

export default function AlunoLogoutButton() {
  const router = useRouter();
  const authLogout = useAuth.getState().logout;
  const logout = () => {
    clearAlunoSession();
    authLogout();
    router.replace('/perfil-aluno/login');
  };
  return (
    <button
      onClick={logout}
      aria-label="Sair"
      className="ml-1 grid h-9 w-9 place-items-center rounded-full text-red-600 transition hover:bg-red-50"
    >
      <LogOut size={16} />
    </button>
  );
}
