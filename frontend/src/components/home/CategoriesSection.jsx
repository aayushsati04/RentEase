import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categories } from '../../data/sampleData';

export default function CategoriesSection() {
  const [active, setActive] = useState('apartments');
  const navigate            = useNavigate();

  const handleSelect = (cat) => {
    setActive(cat.id);
    navigate(`/properties?type=${cat.label}`);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/30 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary-400 text-sm font-semibold tracking-wider uppercase mb-3 block">
            ✦ Browse by Category
          </span>
          <h2 className="section-heading">
            Find by{' '}
            <span className="gradient-text">Property Type</span>
          </h2>
          <p className="section-sub mx-auto text-center mt-3">
            Whether you're looking for a cozy studio or a spacious villa — we have it all.
          </p>
        </motion.div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.id}
              onClick={() => handleSelect(cat)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              className={`
                relative group rounded-2xl p-6 text-left transition-all duration-300 border
                ${active === cat.id
                  ? `bg-gradient-to-br ${cat.gradient} ${cat.border} shadow-glow-sm`
                  : `glass ${cat.border} hover:bg-gradient-to-br hover:${cat.gradient}`
                }
              `}
            >
              {/* Active indicator */}
              {active === cat.id && (
                <motion.div
                  layoutId="category-glow"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/5 to-violet-500/5"
                />
              )}

              <div className="relative z-10">
                {/* Icon */}
                <div className={`
                  text-3xl mb-4 w-14 h-14 rounded-xl flex items-center justify-center
                  bg-gradient-to-br ${cat.gradient} border ${cat.border}
                  transition-transform duration-200 group-hover:scale-110
                `}>
                  {cat.icon}
                </div>

                {/* Label */}
                <h3 className={`font-bold text-sm mb-1.5 transition-colors ${
                  active === cat.id ? 'text-white' : 'text-slate-300 group-hover:text-white'
                }`}>
                  {cat.label}
                </h3>

                {/* Count */}
                <p className="text-slate-500 text-xs">
                  {cat.count.toLocaleString()} properties
                </p>

                {/* Arrow */}
                <div className={`mt-3 text-xs font-semibold flex items-center gap-1 transition-all duration-200 ${
                  active === cat.id ? 'text-primary-400 translate-x-1' : 'text-slate-600 group-hover:text-primary-400 group-hover:translate-x-1'
                }`}>
                  Explore →
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <button
            onClick={() => navigate('/properties')}
            className="text-sm text-slate-400 hover:text-primary-400 transition-colors underline underline-offset-4"
          >
            Browse all {(12740).toLocaleString()}+ listings across all categories →
          </button>
        </motion.div>
      </div>
    </section>
  );
}
