import React from 'react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-slate-950 pt-28 pb-16"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Hero Banner Section */}
        <div className="text-center space-y-4">
          <span className="text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-100 px-3.5 py-1.5 rounded-full inline-block">
            ✦ Our Mission
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-100 tracking-tight leading-none">
            About <span className="gradient-text">RentEase</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Simplifying residential and commercial property rentals across India with absolute transparency, zero brokerage, and robust security.
          </p>
        </div>

        {/* Company Vision & Story Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card rounded-3xl p-8 border border-white/8 space-y-4">
            <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-xl">💡</div>
            <h3 className="text-xl font-bold text-slate-100">Why RentEase?</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Traditional rental workflows are fragmented across calls, spreadsheets, and brokers, leading to high transaction costs and security concerns. RentEase solves this by providing a unified portal for JWT verified profiles, instant rent booking, secure payments, and landlord-tenant messaging in real time.
            </p>
          </div>
          <div className="glass-card rounded-3xl p-8 border border-white/8 space-y-4">
            <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-xl">🤝</div>
            <h3 className="text-xl font-bold text-slate-100">Our Commitments</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              We verify every single property listed on our platform to ensure it matches the actual conditions. We manage refundable security deposits securely, facilitate real-time chat with hosts, and maintain 100% transparency with zero hidden charges.
            </p>
          </div>
        </div>

        {/* Core Values Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black text-slate-100 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '🛡️', title: 'Security First', desc: 'Simulated and encrypted secure checkout payment flows protect landlords and tenants.' },
              { icon: '🏠', title: 'Verified Listings', desc: 'Our administrators verify every property layout, spec, and location mark.' },
              { icon: '⚡', title: 'Zero Brokerage', desc: 'Connect directly landlord-to-tenant. No brokers, no commissions, no extra fees.' }
            ].map((v, i) => (
              <div key={i} className="bg-slate-900 rounded-2xl p-6 border border-white/6 text-center space-y-2">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h4 className="text-base font-bold text-slate-100">{v.title}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Contact Card */}
        <div className="glass-card rounded-3xl p-8 border border-white/8 text-center max-w-3xl mx-auto space-y-5">
          <h3 className="text-xl font-bold text-slate-100">Have Questions? Get in Touch</h3>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Our support desk is open 24/7 to handle property listings, booking approvals, payment queries, or general landlord-tenant disputes.
          </p>
          <div className="flex flex-wrap justify-center gap-6 pt-2 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-2">📧 support@rentease.in</span>
            <span className="flex items-center gap-2">📞 +91 98765 43210</span>
            <span className="flex items-center gap-2">📍 Mumbai, India</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
