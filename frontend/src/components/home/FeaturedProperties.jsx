import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { featuredProperties } from '../../data/sampleData';

/* ─── Star Rating ──────────────────────────────────────────── */
function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.floor(rating) ? 'text-amber-400' : 'text-slate-600'}`}
          fill="currentColor" viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ─── Property Card ────────────────────────────────────────── */
function PropertyCard({ property, index }) {
  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group glass-card rounded-2xl overflow-hidden hover:border-primary-500/30 hover:shadow-card-hover transition-all duration-400"
    >
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent
                        opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <div className="flex gap-2">
            <span className={`badge text-xs ${property.tagColor}`}>
              {property.tag}
            </span>
            {property.verified && (
              <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs">
                ✓ Verified
              </span>
            )}
          </div>
          {property.virtualTourUrl && (
            <span className="badge bg-violet-500/25 text-violet-300 border border-violet-500/30 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-glow-sm">
              🥽 360° Tour Available
            </span>
          )}
        </div>

        {/* Favorite button */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => setLiked((p) => !p)}
          className="absolute top-3 right-3 w-8 h-8 glass rounded-xl flex items-center justify-center
                     hover:bg-white/20 transition-all border border-white/10"
          aria-label="Toggle favourite"
        >
          <motion.svg
            animate={{ scale: liked ? [1, 1.3, 1] : 1, color: liked ? '#f43f5e' : '#94a3b8' }}
            transition={{ duration: 0.2 }}
            className={`w-4 h-4 transition-colors ${liked ? 'text-rose-500' : 'text-slate-400'}`}
            fill={liked ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </motion.svg>
        </motion.button>

        {/* Type badge bottom-left */}
        <div className="absolute bottom-3 left-3">
          <span className="text-xs font-semibold text-white glass px-2.5 py-1 rounded-lg">
            {property.type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title + Rating */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-white text-base leading-tight group-hover:text-primary-300 transition-colors line-clamp-1">
            {property.title}
          </h3>
          <div className="flex flex-col items-end shrink-0">
            <Stars rating={property.rating} />
            <span className="text-slate-500 text-xs mt-0.5">{property.reviews} reviews</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-3">
          <svg className="w-4 h-4 text-primary-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span className="truncate">{property.location}</span>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-slate-500 text-xs mb-4">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              🛏 {property.bedrooms} Bed
            </span>
          )}
          <span className="flex items-center gap-1">
            🚿 {property.bathrooms} Bath
          </span>
          <span className="flex items-center gap-1">
            📐 {property.area.toLocaleString()} sq.ft
          </span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {property.amenities.slice(0, 3).map((a) => (
            <span key={a} className="text-xs px-2 py-0.5 glass rounded-md text-slate-400 border border-white/8">
              {a}
            </span>
          ))}
          {property.amenities.length > 3 && (
            <span className="text-xs px-2 py-0.5 text-slate-500">
              +{property.amenities.length - 3} more
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-white/8">
          <div>
            <span className="text-2xl font-black gradient-text">
              ₹{property.price.toLocaleString()}
            </span>
            <span className="text-slate-500 text-xs">/month</span>
          </div>
          <Link
            to={`/properties/${property.id}`}
            className="px-4 py-2 bg-primary-600/20 hover:bg-primary-600 text-primary-300 hover:text-white
                       border border-primary-500/30 hover:border-primary-500 text-xs font-semibold
                       rounded-xl transition-all duration-200"
          >
            View Details →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Featured Properties Section ──────────────────────────── */
export default function FeaturedProperties() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
      >
        <div>
          <span className="text-primary-400 text-sm font-semibold tracking-wider uppercase mb-3 block">
            ✦ Featured Listings
          </span>
          <h2 className="section-heading">
            Hand-Picked{' '}
            <span className="gradient-text">Premium Properties</span>
          </h2>
          <p className="section-sub mt-3">
            Curated selection of verified, high-quality rental properties across India's top cities.
          </p>
        </div>
        <Link
          to="/properties"
          className="shrink-0 flex items-center gap-2 px-6 py-3 glass rounded-xl text-primary-400 hover:text-white
                     border border-primary-500/30 hover:bg-primary-500/10 transition-all font-semibold text-sm"
        >
          View All Properties
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredProperties.map((p, i) => (
          <PropertyCard key={p.id} property={p} index={i} />
        ))}
      </div>
    </section>
  );
}
