import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/* ─── Password Strength ────────────────────────────────────── */
function PasswordStrength({ password }) {
  const getStrength = () => {
    if (password.length === 0) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8)           score++;
    if (/[A-Z]/.test(password))         score++;
    if (/[0-9]/.test(password))         score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const map = {
      1: { label: 'Weak',   color: 'bg-rose-500'   },
      2: { label: 'Fair',   color: 'bg-amber-500'   },
      3: { label: 'Good',   color: 'bg-lime-500'    },
      4: { label: 'Strong', color: 'bg-emerald-500' },
    };
    return { level: score, ...map[score] };
  };
  const s = getStrength();
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-all duration-300 ${
              i <= s.level ? s.color : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500">{s.label} password</p>
    </div>
  );
}

const ROLES = [
  { value: 'tenant',   label: '🏠  Tenant',           desc: 'Looking to rent a property' },
  { value: 'landlord', label: '🏢  Landlord / Owner',  desc: 'List your property for rent' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]      = useState({
    name: '', email: '', phone: '', password: '', confirm: '', role: 'tenant'
  });
  const [showPw, setShowPw]     = useState(false);
  const [showCf, setShowCf]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [agreed, setAgreed]     = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    if (!form.name.trim())                      { toast.error('Full name is required');         return false; }
    if (!/^\S+@\S+\.\S+$/.test(form.email))    { toast.error('Enter a valid email');           return false; }
    if (form.phone.replace(/\D/,'').length < 10){ toast.error('Enter a valid phone number');   return false; }
    if (form.password.length < 6)               { toast.error('Password must be 6+ characters'); return false; }
    if (form.password !== form.confirm)         { toast.error('Passwords do not match');       return false; }
    if (!agreed)                                { toast.error('Please accept the terms');      return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await register(form.name, form.email, form.password, form.phone, form.role);
    setLoading(false);
    if (result.success) {
      toast.success('Account created! Welcome to RentEase 🎉');
      navigate('/');
    } else {
      toast.error(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel — Form ── */}
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-950"
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-violet-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">RE</span>
            </div>
            <span className="text-xl font-black gradient-text-brand">RentEase</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Create your account</h1>
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                Sign in →
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, role: r.value }))}
                    className={`p-3.5 rounded-xl border text-left transition-all duration-200 ${
                      form.role === r.value
                        ? 'border-primary-500 bg-primary-500/10 text-white'
                        : 'border-slate-700 glass text-slate-400 hover:border-slate-600 hover:text-slate-300'
                    }`}
                  >
                    <div className="text-base mb-0.5 font-semibold text-sm">{r.label}</div>
                    <div className="text-xs opacity-70">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Name + Phone row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={update('name')}
                  placeholder="Rahul Sharma"
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="+91 98765 43210"
                  required
                  className="input-field"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={update('email')}
                placeholder="you@example.com"
                required
                className="input-field"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  placeholder="Min. 6 characters"
                  required
                  className="input-field pr-12"
                />
                <button type="button" onClick={() => setShowPw((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showCf ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={update('confirm')}
                  placeholder="Re-enter your password"
                  required
                  className={`input-field pr-12 ${
                    form.confirm && form.confirm !== form.password
                      ? 'border-rose-500 focus:ring-rose-500/20'
                      : form.confirm && form.confirm === form.password
                      ? 'border-emerald-500 focus:ring-emerald-500/20'
                      : ''
                  }`}
                />
                <button type="button" onClick={() => setShowCf((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showCf
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
              {form.confirm && form.confirm !== form.password && (
                <p className="text-rose-400 text-xs mt-1.5">Passwords do not match</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2.5">
              <button
                type="button"
                onClick={() => setAgreed((p) => !p)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  agreed ? 'bg-primary-600 border-primary-600' : 'border-slate-600 hover:border-primary-500'
                }`}
              >
                {agreed && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <span className="text-sm text-slate-400 leading-snug">
                I agree to the{' '}
                <a href="#" className="text-primary-400 hover:text-primary-300">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary-400 hover:text-primary-300">Privacy Policy</a>
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-500 hover:to-violet-500
                         text-white font-bold rounded-xl transition-all duration-200 hover:shadow-glow
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating your account...
                </>
              ) : (
                'Create Free Account'
              )}
            </button>
          </form>
        </div>
      </motion.div>

      {/* ── Right Panel — Brand ── */}
      <motion.div
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex flex-col justify-between w-5/12 relative overflow-hidden p-12"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)' }}
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=70"
            alt="Property"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 to-violet-900/80" />
        </div>
        <div className="absolute top-1/4 -right-12 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-12 w-48 h-48 bg-primary-500/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <span className="text-white font-black keep-white">RE</span>
            </div>
            <span className="text-2xl font-black text-white keep-white">RentEase</span>
          </Link>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white leading-tight mb-4 keep-white">
            Start Your<br />
            <span className="text-primary-300">Journey Today</span>
          </h2>
          <p className="text-slate-800 text-base leading-relaxed mb-8">
            Create your free account and get instant access to thousands of verified properties across India.
          </p>

          {/* Feature checklist */}
          {[
            'No brokerage — deal directly with owners',
            'Instant response from verified landlords',
            'Save and compare your favourite listings',
            'Seamless booking and payment workflow',
          ].map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-start gap-3 mb-4"
            >
              <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-slate-700 text-sm">{item}</span>
            </motion.div>
          ))}
        </div>

        {/* Social proof */}
        <div className="relative z-10 glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex -space-x-2">
              {[
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&q=80',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80',
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&q=80',
              ].map((src, i) => (
                <img key={i} src={src} className="w-8 h-8 rounded-full border-2 border-slate-800 object-cover" alt="" />
              ))}
            </div>
            <div className="flex text-amber-400 text-sm">★★★★★</div>
          </div>
          <p className="text-slate-800 text-sm">
            <span className="text-white font-semibold keep-white">50,000+ users</span> have already found their perfect rental on RentEase
          </p>
        </div>
      </motion.div>
    </div>
  );
}
