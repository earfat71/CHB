'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { useState, useEffect, useRef } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, []);

  const navLinks = [
    { href: '/search', label: 'Search Hotels', always: true },
    { href: '/agent/dashboard', label: 'Agent Dashboard', roles: ['AGENT'] },
    { href: '/admin', label: 'Admin', roles: ['ADMIN'] },
    { href: '/manager', label: 'Hotel Manager', roles: ['ADMIN', 'MANAGER'] },
  ];

  const visibleLinks = navLinks.filter(
    (l) => l.always || (user && l.roles?.includes(user.role))
  );

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0" onClick={() => setMobileOpen(false)}>
          <span className="text-2xl">🏖️</span>
          <span className="font-bold text-xl text-brand-700 font-display">CoxBeach</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {visibleLinks.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-gray-600 hover:text-brand-700 font-medium transition">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition text-sm font-medium"
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                <div className="w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block max-w-[100px] truncate">{user.name}</span>
                <svg className={`w-3.5 h-3.5 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border py-1 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="font-medium text-sm text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.phone}</p>
                    <span className="inline-block mt-1 text-[10px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded font-semibold uppercase">{user.role}</span>
                  </div>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50" onClick={() => setMenuOpen(false)}>
                      <span>⚙️</span> Admin Panel
                    </Link>
                  )}
                  {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
                    <Link href="/manager" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50" onClick={() => setMenuOpen(false)}>
                      <span>🏨</span> Hotel Manager
                    </Link>
                  )}
                  {user.role === 'AGENT' && (
                    <Link href="/agent/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50" onClick={() => setMenuOpen(false)}>
                      <span>🤝</span> Agent Dashboard
                    </Link>
                  )}
                  <hr className="my-1" />
                  <Link href="/my-bookings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                    <span>📋</span> My Bookings
                  </Link>
                  <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                    <span>👤</span> Profile
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/auth/login" className="text-sm text-gray-600 hover:text-brand-700 font-medium">Login</Link>
              <Link href="/auth/register" className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-700 transition">Sign Up</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-1">
          {visibleLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {!user && (
            <>
              <Link href="/auth/login" className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link href="/auth/register" className="block px-3 py-2.5 text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg" onClick={() => setMobileOpen(false)}>Sign Up</Link>
            </>
          )}
          {user && (
            <>
              <hr className="my-1" />
              <Link href="/my-bookings" className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(false)}>My Bookings</Link>
              <Link href="/profile" className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(false)}>Profile</Link>
              <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg">Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
