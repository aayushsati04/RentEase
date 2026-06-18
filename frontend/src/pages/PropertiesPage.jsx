import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { featuredProperties } from '../data/sampleData';
import { supabase } from '../services/supabase';
import SkeletonCard from '../components/ui/SkeletonCard';

const TYPES   = ['All', 'Apartment', 'Villa', 'Studio', 'PG', 'Commercial'];
const SORTS   = ['Newest', 'Price: Low–High', 'Price: High–Low', 'Rating'];
const PRICES  = [
  { label: 'Any Price',   min: 0,      max: Infinity },
  { label: '< ₹10k',     min: 0,      max: 10000 },
  { label: '₹10k–25k',   min: 10000,  max: 25000 },
  { label: '₹25k–50k',   min: 25000,  max: 50000 },
  { label: '₹50k–1L',    min: 50000,  max: 100000 },
  { label: '> ₹1L',      min: 100000, max: Infinity },
];

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.floor(rating) ? 'text-amber-400' : 'text-slate-700'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function PropertyCard({ p, i }) {
  const [liked, setLiked] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: i * 0.05 }}
      layout
      className="group glass-card rounded-2xl overflow-hidden hover:border-primary-500/30 hover:shadow-card-hover transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <img src={p.image} alt={p.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <div className="flex gap-2">
            <span className={`badge text-xs ${p.tagColor}`}>{p.tag}</span>
          </div>
          {p.virtualTourUrl && (
            <span className="badge bg-violet-500/25 text-violet-300 border border-violet-500/30 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-glow-sm">
              🥽 360° Tour Available
            </span>
          )}
        </div>
        <button
          onClick={() => setLiked((v) => !v)}
          className="absolute top-3 right-3 w-8 h-8 glass rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <svg className={`w-4 h-4 ${liked ? 'text-rose-500' : 'text-slate-400'}`}
            fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-bold text-white text-sm leading-snug group-hover:text-primary-300 transition-colors line-clamp-1">
            {p.title}
          </h3>
          <Stars rating={p.rating} />
        </div>
        <div className="flex items-center gap-1 text-slate-500 text-xs mb-3">
          <svg className="w-3 h-3 text-primary-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span>{p.location}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-white/8">
          <div>
            <span className="text-lg font-black gradient-text">₹{p.price.toLocaleString()}</span>
            <span className="text-slate-500 text-xs">/mo</span>
          </div>
          <Link
            to={`/properties/${p.id}`}
            className="text-xs px-3 py-1.5 bg-primary-600/20 hover:bg-primary-600 text-primary-300 hover:text-white border border-primary-500/30 hover:border-primary-500 rounded-lg transition-all"
          >
            View →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [type,      setType]      = useState('All');
  const [sortBy,    setSortBy]    = useState('Newest');
  const [priceIdx,  setPriceIdx]  = useState(0);
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [sideOpen,  setSideOpen]  = useState(false);
  const [searchParams]            = useSearchParams();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*');
        
        if (error) throw error;
        
        const mapped = (data || []).map(p => ({
          ...p,
          price: Number(p.rent),
          verified: p.is_verified,
          rating: Number(p.average_rating) || 4.5,
          reviews: p.total_reviews || 0,
          image: p.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
          tag: p.type === 'Villa' ? 'Popular' : p.type === 'Apartment' ? 'Premium' : 'Trending',
          tagColor: p.type === 'Villa' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
          virtualTourUrl: p.virtual_tour_url || ''
        }));

        // If no properties are in Supabase, fall back to sample properties
        setProperties(mapped.length > 0 ? mapped : featuredProperties.map(p => ({
          ...p,
          rent: p.price,
          is_verified: p.verified,
          average_rating: p.rating,
          total_reviews: p.reviews,
          images: [p.image],
          virtualTourUrl: p.virtualTourUrl || ''
        })));
      } catch (err) {
        console.error('Error fetching properties from Supabase:', err);
        setProperties(featuredProperties.map(p => ({
          ...p,
          rent: p.price,
          is_verified: p.verified,
          average_rating: p.rating,
          total_reviews: p.reviews,
          images: [p.image],
          virtualTourUrl: p.virtualTourUrl || ''
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Sync state with URL search parameters on mount or changes
  useEffect(() => {
    const loc = searchParams.get('location');
    const t = searchParams.get('type');
    const p = searchParams.get('price');

    if (loc !== null) setSearch(loc);
    if (t !== null && TYPES.includes(t)) setType(t);
    if (p !== null) {
      let idx = 0;
      if (p.includes('10k') && (p.includes('Under') || p.includes('<'))) idx = 1;
      else if (p.includes('10k') && p.includes('25k')) idx = 2;
      else if (p.includes('25k') && p.includes('50k')) idx = 3;
      else if (p.includes('50k') && p.includes('1L')) idx = 4;
      else if (p.includes('1L') && (p.includes('Above') || p.includes('>'))) idx = 5;
      setPriceIdx(idx);
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = [...properties];
    if (type !== 'All')   list = list.filter((p) => p.type === type);
    const pr = PRICES[priceIdx];
    list = list.filter((p) => p.price >= pr.min && p.price <= pr.max);
    if (search) list = list.filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
    );
    if (sortBy === 'Price: Low–High')  list.sort((a, b) => a.price - b.price);
    if (sortBy === 'Price: High–Low')  list.sort((a, b) => b.price - a.price);
    if (sortBy === 'Rating')           list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [properties, type, priceIdx, search, sortBy]);

  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      {/* Page Header */}
      <div className="border-b border-white/8 bg-slate-900/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black text-white mb-2">
              Browse <span className="gradient-text">Properties</span>
            </h1>
            <p className="text-slate-400 text-sm">
              Showing {filtered.length} verified properties across India
            </p>
          </motion.div>

          {/* Search + Sort row */}
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by city, name..."
                className="input-field pl-10 text-sm"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field w-auto text-sm cursor-pointer"
            >
              {SORTS.map((s) => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
            </select>
            <button
              onClick={() => setSideOpen((p) => !p)}
              className="sm:hidden flex items-center gap-2 px-4 py-3 glass rounded-xl text-sm font-medium text-slate-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-7">
        {/* ── Sidebar ── */}
        <aside className={`w-64 shrink-0 ${sideOpen ? 'block' : 'hidden'} sm:block`}>
          <div className="glass-card rounded-2xl p-5 sticky top-24 space-y-7">
            {/* Type filter */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Property Type</h4>
              <div className="space-y-1.5">
                {TYPES.map((t) => (
                  <button key={t} onClick={() => setType(t)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      type === t
                        ? 'bg-primary-100 text-primary-700 border border-primary-300 font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Price filter */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Price Range</h4>
              <div className="space-y-1.5">
                {PRICES.map((p, i) => (
                  <button key={p.label} onClick={() => setPriceIdx(i)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      priceIdx === i
                        ? 'bg-primary-100 text-primary-700 border border-primary-300 font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent'
                    }`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => { setType('All'); setPriceIdx(0); setSearch(''); }}
              className="w-full py-2 text-xs text-slate-500 hover:text-primary-400 transition-colors border border-slate-700 rounded-lg hover:border-primary-500/30"
            >
              Reset all filters
            </button>
          </div>
        </aside>

        {/* ── Results ── */}
        <div className="flex-1 min-w-0">
          {/* Type pills */}
          <div className="flex gap-2 flex-wrap mb-6">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  type === t
                    ? 'bg-primary-600 text-white shadow-sm font-semibold'
                    : 'glass text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-700/60'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-bold text-white mb-2">No properties found</h3>
              <p className="text-slate-400 text-sm mb-6">Try adjusting your filters or search terms.</p>
              <button
                onClick={() => { setType('All'); setPriceIdx(0); setSearch(''); }}
                className="btn-primary"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5" layout>
                {filtered.map((p, i) => (
                  <PropertyCard key={p.id} p={p} i={i} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
