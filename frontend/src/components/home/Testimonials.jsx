import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { testimonials } from '../../data/sampleData';

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <svg key={s} className={`w-4 h-4 ${s <= rating ? 'text-amber-400' : 'text-slate-700'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [active, setActive]       = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused]       = useState(false);

  const go = useCallback((idx) => {
    setDirection(idx > active ? 1 : -1);
    setActive(idx);
  }, [active]);

  const next = useCallback(() => {
    setDirection(1);
    setActive((p) => (p + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setActive((p) => (p - 1 + testimonials.length) % testimonials.length);
  }, []);

  /* Auto-play */
  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [next, paused]);

  const variants = {
    enter:  (d) => ({ opacity: 0, x: d > 0 ? 60 : -60, scale: 0.96 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit:   (d) => ({ opacity: 0, x: d > 0 ? -60 : 60, scale: 0.96 }),
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/20 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

      {/* Decorative orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-primary-400 text-sm font-semibold tracking-wider uppercase mb-3 block">
            ✦ What Our Users Say
          </span>
          <h2 className="section-heading">
            Loved by{' '}
            <span className="gradient-text">50,000+ People</span>
          </h2>
          <p className="section-sub mx-auto text-center mt-3">
            Real stories from real tenants and landlords who found their perfect match on RentEase.
          </p>
        </motion.div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Main Card */}
          <div className="overflow-hidden min-h-[280px] flex items-center">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={active}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="w-full"
              >
                <div className="glass-card rounded-3xl p-8 md:p-10 border border-white/8 relative overflow-hidden">
                  {/* Quote mark */}
                  <div className="absolute top-6 right-8 text-8xl font-black text-primary-500/10 leading-none select-none">
                    "
                  </div>

                  {/* Stars */}
                  <div className="mb-6">
                    <Stars rating={testimonials[active].rating} />
                  </div>

                  {/* Text */}
                  <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-8 max-w-3xl relative z-10">
                    "{testimonials[active].text}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={testimonials[active].avatar}
                        alt={testimonials[active].name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-primary-500/30"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-bold text-base">{testimonials[active].name}</p>
                      <p className="text-slate-400 text-sm">{testimonials[active].role} · {testimonials[active].city}</p>
                    </div>

                    {/* Verified badge */}
                    <div className="ml-auto">
                      <span className="text-xs glass px-3 py-1.5 rounded-full text-emerald-400 border border-emerald-500/30">
                        ✓ Verified User
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={prev}
              className="w-11 h-11 glass rounded-xl flex items-center justify-center text-slate-400
                         hover:text-white hover:bg-white/10 transition-all border border-white/8"
              aria-label="Previous"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className="relative h-2 transition-all duration-300 rounded-full overflow-hidden"
                  style={{ width: i === active ? 28 : 8, background: i === active ? undefined : 'rgba(255,255,255,0.15)' }}
                >
                  {i === active && (
                    <div className="w-full h-full bg-gradient-to-r from-primary-500 to-violet-500" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={next}
              className="w-11 h-11 glass rounded-xl flex items-center justify-center text-slate-400
                         hover:text-white hover:bg-white/10 transition-all border border-white/8"
              aria-label="Next"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Avatar row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mt-10 gap-1"
        >
          {testimonials.map((t, i) => (
            <button key={t.id} onClick={() => go(i)} className="relative">
              <img
                src={t.avatar}
                alt={t.name}
                className={`w-9 h-9 rounded-xl object-cover border-2 transition-all duration-300 ${
                  i === active
                    ? 'border-primary-500 scale-110 z-10'
                    : 'border-slate-700 opacity-50 hover:opacity-80'
                }`}
              />
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
