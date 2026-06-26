'use client';

import { User } from './api';

export function saveAuth(token: string, user: User): void {
  localStorage.setItem('coxbeach_token', token);
  localStorage.setItem('coxbeach_user', JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem('coxbeach_token');
  localStorage.removeItem('coxbeach_user');
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('coxbeach_user');
  return data ? JSON.parse(data) : null;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('coxbeach_token');
}

export function isLoggedIn(): boolean {
  return !!getToken();
}
