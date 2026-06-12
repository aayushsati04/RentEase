import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { label: 'Properties', href: '/properties' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'About', href: '/about' },
];

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [dropOpen, setDropOpen]     = useState(false);
  const { user, logout }            = useAuth();
  const location                    = useLocation();
  const navigate                    = useNavigate();
  const dropRef                     = useRef(null);

  /* scroll listener */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* close mobile menu on route change */
  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => {
    logout();
    setDropOpen(false);
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass border-b border-white/8 shadow-glass py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500/40 rounded-xl blur-md group-hover:blur-lg transition-all" />
              <div className="relative w-9 h-9 bg-gradient-to-br from-primary-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-sm">RE</span>
              </div>
            </div>
            <span className="text-xl font-black gradient-text-brand tracking-tight">
              RentEase
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg group ${
                  location.pathname === link.href
                    ? 'text-primary-700 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                {location.pathname === link.href && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-slate-800 rounded-lg"
                  />
                )}
                <span className="absolute inset-0 bg-slate-800/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                    location.pathname === '/dashboard' ? 'text-primary-700 font-semibold bg-slate-800' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/bookings"
                  className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                    location.pathname === '/bookings' ? 'text-primary-700 font-semibold bg-slate-800' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  Bookings
                </Link>
                <Link
                  to="/chat"
                  className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                    location.pathname === '/chat' ? 'text-primary-700 font-semibold bg-slate-800' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  Messages
                </Link>
              </>
            )}
          </nav>

          {/* ── Auth Section ── */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              /* Avatar Dropdown */
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen((p) => !p)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-2 glass rounded-xl hover:bg-slate-800 transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                    {initials}
                  </div>
                  <div className="text-left">
                    <p className="text-white text-xs font-semibold leading-tight">{user.name?.split(' ')[0]}</p>
                    <p className="text-slate-400 text-xs capitalize">{user.role}</p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {dropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 glass-strong rounded-2xl overflow-hidden shadow-glass border border-white/10 py-1"
                    >
                      <div className="px-4 py-3 border-b border-white/8">
                        <p className="text-white text-sm font-semibold">{user.name}</p>
                        <p className="text-slate-400 text-xs mt-0.5 truncate">{user.email}</p>
                      </div>
                      {[
                        { label: '👤  My Profile', href: '/dashboard' },
                        { label: '🏠  My Listings', href: '/dashboard' },
                        { label: '📋  My Bookings', href: '/bookings' },
                        { label: '💬  Messages',    href: '/chat' },
                      ].map((item) => (
                        <Link
                          key={item.label}
                          to={item.href}
                          onClick={() => setDropOpen(false)}
                          className="block px-4 py-2.5 text-sm text-slate-300 hover:text-primary-700 hover:bg-slate-800 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                      {user.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setDropOpen(false)}
                          className="block px-4 py-2.5 text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-500/5 transition-colors"
                        >
                          ⚙️  Admin Console
                        </Link>
                      )}
                      <div className="border-t border-white/8 mt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-colors"
                        >
                          🚪  Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm px-5 py-2.5"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="md:hidden glass p-2.5 rounded-xl text-white"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <motion.span
                animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 8 : 0 }}
                className="block h-0.5 bg-current rounded-full"
              />
              <motion.span
                animate={{ opacity: menuOpen ? 0 : 1 }}
                className="block h-0.5 bg-current rounded-full"
              />
              <motion.span
                animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -8 : 0 }}
                className="block h-0.5 bg-current rounded-full"
              />
            </div>
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-72 z-50 md:hidden"
              style={{
                background: 'rgba(10, 15, 30, 0.97)',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
                  <span className="text-xl font-black gradient-text-brand">RentEase</span>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Links */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={link.href}
                        className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}

                  {user && (
                    <div className="pt-2 border-t border-white/8 space-y-1">
                      {[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Bookings', href: '/bookings' },
                        { label: 'Messages', href: '/chat' },
                      ].map((item) => (
                        <Link
                          key={item.label}
                          to={item.href}
                          className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </nav>

                {/* Footer */}
                <div className="px-4 py-6 border-t border-white/8 space-y-3">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 px-4 py-3 glass rounded-xl">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          {initials}
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{user.name}</p>
                          <p className="text-slate-400 text-xs capitalize">{user.role}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full py-3 text-center text-sm text-rose-400 font-semibold hover:bg-rose-500/10 rounded-xl transition-colors"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="block w-full py-3 text-center glass rounded-xl text-sm font-semibold text-white">
                        Sign In
                      </Link>
                      <Link to="/register" className="block w-full py-3 text-center bg-primary-600 hover:bg-primary-500 rounded-xl text-sm font-semibold text-white transition-colors">
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
