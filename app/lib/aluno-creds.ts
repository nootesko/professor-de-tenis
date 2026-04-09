// Aluno credentials are persisted in the store (seeded in mock-data.ts).
// This file keeps the legacy helper for back-compat AND login attempt control.
// Sensitive session values pass through encrypt/decrypt helpers.
import type { AlunoCred } from './types';
import { setSecureSession, getSecureSession, removeSecureSession } from './crypto';

export const ALUNO_SESSION_KEY = 'aluno_session_id';
export const ALUNO_ATTEMPTS_KEY = 'aluno_login_attempts';
export const ALUNO_LOCK_KEY = 'aluno_login_lock_until';
export const MAX_ATTEMPTS = 5;
export const LOCK_MS = 30 * 1000;

// Legacy: derive deterministically. Kept so older imports do not break.
export function credsFor(alunoId: string, email: string) {
  const user = (email?.split('@')[0] || `aluno-${alunoId}`).toLowerCase();
  const senha = `tn${alunoId.replace(/\D/g, '').padStart(4, '0')}!`;
  return { user, senha };
}

export function findCred(creds: AlunoCred[], alunoId: string): AlunoCred | undefined {
  return creds.find((c) => c.alunoId === alunoId);
}

// ---- Session helpers (encrypted) -------------------------------------------
export function setAlunoSession(alunoId: string): void {
  setSecureSession(ALUNO_SESSION_KEY, alunoId);
}
export function getAlunoSession(): string | null {
  return getSecureSession(ALUNO_SESSION_KEY);
}
export function clearAlunoSession(): void {
  removeSecureSession(ALUNO_SESSION_KEY);
}

// ---- Attempts ---------------------------------------------------------------
export function getAttempts(): number {
  const v = getSecureSession(ALUNO_ATTEMPTS_KEY);
  return Number(v || '0');
}
export function bumpAttempts(): number {
  const next = getAttempts() + 1;
  setSecureSession(ALUNO_ATTEMPTS_KEY, String(next));
  if (next >= MAX_ATTEMPTS) {
    setSecureSession(ALUNO_LOCK_KEY, String(Date.now() + LOCK_MS));
  }
  return next;
}
export function clearAttempts(): void {
  removeSecureSession(ALUNO_ATTEMPTS_KEY);
  removeSecureSession(ALUNO_LOCK_KEY);
}
export function lockedUntil(): number {
  const v = getSecureSession(ALUNO_LOCK_KEY);
  return Number(v || '0');
}
export function isLocked(): boolean {
  return lockedUntil() > Date.now();
}
