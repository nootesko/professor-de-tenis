// ⚠️  MOCK CRYPTO ONLY — NOT FOR PRODUCTION.
// This module XOR-obfuscates session values with a fixed key and base64-encodes
// the result. Its sole purpose is to discourage casual tampering of values
// stored in sessionStorage during local development.
//
// For production deployments, replace these helpers with the Web Crypto API
// (e.g. AES-GCM with a server-issued key) or use server-side sessions.

const KEY = 'pdt.session.v1.do-not-trust';

function xor(input: string): string {
  let out = '';
  for (let i = 0; i < input.length; i++) {
    out += String.fromCharCode(input.charCodeAt(i) ^ KEY.charCodeAt(i % KEY.length));
  }
  return out;
}

function toBase64(s: string): string {
  if (typeof window === 'undefined') return Buffer.from(s, 'binary').toString('base64');
  return window.btoa(unescape(encodeURIComponent(s)));
}

function fromBase64(s: string): string {
  if (typeof window === 'undefined') return Buffer.from(s, 'base64').toString('binary');
  try {
    return decodeURIComponent(escape(window.atob(s)));
  } catch {
    return '';
  }
}

export function encryptSession(value: string): string {
  if (!value) return '';
  return toBase64(xor(value));
}

export function decryptSession(value: string): string {
  if (!value) return '';
  const decoded = fromBase64(value);
  if (!decoded) return '';
  return xor(decoded);
}

// Convenience helpers for sessionStorage with encrypt/decrypt baked in.
export function setSecureSession(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(key, encryptSession(value));
}

export function getSecureSession(key: string): string | null {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(key);
  if (!raw) return null;
  const dec = decryptSession(raw);
  return dec || null;
}

export function removeSecureSession(key: string): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(key);
}
