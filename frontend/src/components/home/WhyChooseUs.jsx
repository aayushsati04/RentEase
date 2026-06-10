import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { features, achievements } from '../../data/sampleData';

/* ─── Animated Counter ─────────────────────────────────────── */
function AnimCounter({ target, suffix, duration = 2000, isDecimal = false }) {
  const [val, setVal]   = useState(0);
  const ref             = useRef(null);
  const started         = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * target;
            setVal(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration, isDecimal]);

  return (
    <span ref={ref}>
      {isDecimal ? val.toFixed(1) : val.toLocaleString()}{suffix}
    </span>
  );
}

/* ─── Feature Card ─────────────────────────────────────────── */
function FeatureCard({ feature, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12 }}
      whileHover={{ y: -5 }}
      className={`relative p-7 rounded-2xl border transition-all duration-300 cursor-default
                  bg-gradient-to-br ${feature.color} ${feature.border}
                  hover:shadow-card-hover group`}
    >
      {/* Icon */}
      <div className="text-4xl mb-5 transition-transform duration-300 group-hover:scale-110 inline-block">
        {feature.icon}
      </div>

      {/* Title */}
      <h3 className="text-white font-bold text-lg mb-3 group-hover:text-primary-200 transition-colors">
        {feature.title}
      </h3>

      {/* Description */}
      <p className="text-slate-400 text-sm leading-relaxed">
        {feature.desc}
      </p>

      {/* Decorative corner */}
      <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/3 group-hover:scale-150 transition-transform duration-500" />
    </motion.div>
  );
}

/* ─── Why Choose Us ────────────────────────────────────────── */
export default function WhyChooseUs() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-primary-400 text-sm font-semibold tracking-wider uppercase mb-3 block">
          ✦ Why RentEase
        </span>
        <h2 className="section-heading">
          The Smarter Way to{' '}
          <span className="gradient-text">Rent in India</span>
        </h2>
        <p className="section-sub mx-auto text-center mt-3">
          We've reimagined the rental experience from the ground up — making it faster, safer, and entirely stress-free.
        </p>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
        {features.map((f, i) => (
          <FeatureCard key={f.title} feature={f} index={i} />
        ))}
      </div>

      {/* Achievement Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative rounded-3xl overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/60 via-violet-900/40 to-primary-900/60" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=60')] bg-cover bg-center opacity-10" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent" />

        {/* Content */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-white/10">
          {achievements.map((a, i) => (
            <motion.div
              key={a.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="py-10 px-8 text-center group hover:bg-primary-500/5 transition-colors"
            >
              <div className="text-4xl md:text-5xl font-black gradient-text mb-2">
                <AnimCounter
                  target={a.value}
                  suffix={a.suffix}
                  isDecimal={a.isDecimal}
                />
              </div>
              <div className="text-slate-400 text-sm font-medium">{a.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Block */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 text-center"
      >
        <div className="glass-card inline-flex flex-col sm:flex-row items-center gap-6 px-8 py-6 rounded-2xl border border-primary-500/20">
          <div className="text-left">
            <h3 className="text-white font-bold text-xl">Ready to find your perfect home?</h3>
            <p className="text-slate-400 text-sm mt-1">Join 50,000+ happy tenants and landlords on RentEase.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <a
              href="/register"
              className="btn-primary"
            >
              Get Started Free
            </a>
            <a
              href="/properties"
              className="btn-secondary"
            >
              Browse Properties
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
