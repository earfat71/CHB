'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl">🏖️</span>
          <span className="font-bold text-xl text-brand-700">CoxBeach</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link href="/search" className="text-gray-600 hover:text-brand-600 transition">Search Hotels</Link>
          {user?.role === 'AGENT' && (
            <Link href="/agent/dashboard" className="text-gray-600 hover:text-brand-600 transition">Agent Dashboard</Link>
          )}
          {(user?.role === 'ADMIN') && (
            <Link href="/admin" className="text-gray-600 hover:text-brand-600 transition">Admin</Link>
          )}
          {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
            <Link href="/manager" className="text-gray-600 hover:text-brand-600 transition">Manager</Link>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center space-x-2 bg-brand-50 text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition"
              >
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs bg-brand-700 text-white px-1.5 py-0.5 rounded">{user.role}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border py-1 z-50">
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" className="block px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50" onClick={() => setMenuOpen(false)}>⚙️ Admin Panel</Link>
                  )}
                  {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
                    <Link href="/manager" className="block px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50" onClick={() => setMenuOpen(false)}>🏨 Hotel Manager</Link>
                  )}
                  {user.role === 'AGENT' && (
                    <Link href="/agent/dashboard" className="block px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50" onClick={() => setMenuOpen(false)}>🤝 Agent Dashboard</Link>
                  )}
                  {(user.role === 'ADMIN' || user.role === 'MANAGER' || user.role === 'AGENT') && <hr className="my-1" />}
                  <Link href="/my-bookings" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>My Bookings</Link>
                  <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Profile</Link>
                  <hr className="my-1" />
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-600 hover:text-brand-600 text-sm">Login</Link>
              <Link href="/auth/register" className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-700 transition">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
