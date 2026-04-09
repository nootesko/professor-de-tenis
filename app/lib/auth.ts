'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'admin' | 'aluno' | null;

type AuthState = {
  role: Role;
  userId: string | null;
  login: (role: Exclude<Role, null>, userId: string) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      userId: null,
      login: (role, userId) => set({ role, userId }),
      logout: () => set({ role: null, userId: null }),
    }),
    { name: 'pdt_auth' },
  ),
);

// Mock admin credential
export const ADMIN_USER = 'admin';
export const ADMIN_PASS = 'admin';

/**
 * Validates that the authenticated session matches the entity ID being accessed.
 * Returns true when ownership is valid, false otherwise.
 */
export function assertOwnership(sessionUserId: string | null | undefined, paramsId: string | null | undefined): boolean {
  if (!sessionUserId || !paramsId) return false;
  return sessionUserId === paramsId;
}
