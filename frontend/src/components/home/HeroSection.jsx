import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { stats } from '../../data/sampleData';

/* ─── Animated Counter ─────────────────────────────────────── */
function Counter({ target, suffix, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref               = useRef(null);
  const started           = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── Hero Section ─────────────────────────────────────────── */
const propertyTypes = ['All Types', 'Apartment', 'Villa', 'Studio', 'PG', 'Commercial'];

export default function HeroSection() {
  const [location, setLocation]         = useState('');
  const [propType, setPropType]         = useState('All Types');
  const [priceRange, setPriceRange]     = useState('Any Price');
  const navigate                         = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location)                      params.set('location', location);
    if (propType !== 'All Types')      params.set('type', propType);
    if (priceRange !== 'Any Price')    params.set('price', priceRange);
    navigate(`/properties?${params.toString()}`);
  };

  const words = ['Find', 'Your', 'Dream', 'Rental', 'Home'];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=85"
          alt="Luxury property"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/60" />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl animate-pulse-slow pointer-events-none"
        style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16 text-center">
        {/* Verified badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8 border border-primary-500/30"
        >
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-sm text-slate-300 font-medium">
            10,000+ Verified Properties Across India
          </span>
        </motion.div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-tight mb-6">
          {words.map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              className="inline-block mr-4"
            >
              {i === 3 ? (
                <span className="gradient-text">{word}</span>
              ) : i === 4 ? (
                <span className="gradient-text">{word}</span>
              ) : word}
            </motion.span>
          ))}
        </h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Discover premium apartments, villas, studios and PG accommodations across India's top cities. Verified listings, instant booking, zero brokerage.
        </motion.p>

        {/* Search Bar */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="glass-strong rounded-2xl p-2 flex flex-col md:flex-row gap-2 max-w-4xl mx-auto shadow-glass mb-12"
        >
          {/* Location */}
          <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl">
            <svg className="w-5 h-5 text-primary-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search city, locality, landmark..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm outline-none"
            />
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-white/10 my-2" />

          {/* Property Type */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl min-w-40">
            <svg className="w-5 h-5 text-primary-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <select
              value={propType}
              onChange={(e) => setPropType(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm outline-none cursor-pointer"
            >
              {propertyTypes.map((t) => (
                <option key={t} value={t} className="bg-slate-900">{t}</option>
              ))}
            </select>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-white/10 my-2" />

          {/* Price Range */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl min-w-40">
            <svg className="w-5 h-5 text-primary-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm outline-none cursor-pointer"
            >
              {['Any Price', 'Under ₹10k', '₹10k–25k', '₹25k–50k', '₹50k–1L', 'Above ₹1L'].map((p) => (
                <option key={p} value={p} className="bg-slate-900">{p}</option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-500 hover:to-violet-500
                       text-white font-bold rounded-xl transition-all duration-200 hover:shadow-glow
                       flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
        </motion.form>

        {/* Popular searches */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex flex-wrap justify-center gap-2 mb-16"
        >
          <span className="text-slate-500 text-sm">Popular:</span>
          {['Mumbai', 'Bangalore', 'Pune', 'Delhi NCR', 'Hyderabad', 'Chennai'].map((city) => (
            <button
              key={city}
              onClick={() => { setLocation(city); }}
              className="text-sm text-primary-400 hover:text-primary-300 underline underline-offset-2 transition-colors"
            >
              {city}
            </button>
          ))}
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3 + i * 0.1 }}
              className="glass rounded-2xl px-4 py-5 border border-white/8 hover:border-primary-500/30 transition-all group"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl md:text-3xl font-black gradient-text">
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-slate-400 text-xs mt-1 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-slate-500 text-xs tracking-widest uppercase">Scroll to explore</span>
        <div className="w-5 h-8 border-2 border-slate-600 rounded-full flex justify-center pt-1.5">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1 h-1.5 bg-primary-400 rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
