import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const locations = [
  {
    city: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80',
    count: '4,280+ Properties',
    avgRent: '₹45,000/mo',
    cols: 'md:col-span-2 h-72',
  },
  {
    city: 'Bangalore',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&q=80',
    count: '3,890+ Properties',
    avgRent: '₹28,000/mo',
    cols: 'h-72',
  },
  {
    city: 'Pune',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
    count: '2,150+ Properties',
    avgRent: '₹22,000/mo',
    cols: 'h-72',
  },
  {
    city: 'Delhi NCR',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80',
    count: '4,840+ Properties',
    avgRent: '₹32,000/mo',
    cols: 'md:col-span-2 h-72',
  },
  {
    city: 'Hyderabad',
    image: 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?w=600&q=80',
    count: '1,960+ Properties',
    avgRent: '₹25,000/mo',
    cols: 'h-72',
  },
  {
    city: 'Chennai',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=80',
    count: '1,780+ Properties',
    avgRent: '₹24,000/mo',
    cols: 'h-72',
  },
];

export default function PopularLocations() {
  const navigate = useNavigate();

  const handleLocationClick = (city) => {
    navigate(`/properties?location=${encodeURIComponent(city)}`);
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12"
      >
        <span className="text-primary-400 text-sm font-semibold tracking-wider uppercase mb-3 block">
          ✦ Premium Hubs
        </span>
        <h2 className="section-heading">
          Explore Popular{' '}
          <span className="gradient-text">Rental Hotspots</span>
        </h2>
        <p className="section-sub mt-3">
          Find your next home in India's fastest-growing cities.
        </p>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {locations.map((loc, i) => (
          <motion.div
            key={loc.city}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            whileHover={{ y: -6 }}
            onClick={() => handleLocationClick(loc.city)}
            className={`relative rounded-3xl overflow-hidden cursor-pointer shadow-glass border border-white/8 group ${loc.cols}`}
          >
            {/* Background image */}
            <img
              src={loc.image}
              alt={loc.city}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent group-hover:via-slate-950/20 transition-all duration-300" />

            {/* Content overlay */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <span className="text-slate-400 text-xs font-semibold tracking-widest uppercase mb-1">
                ✦ {loc.count}
              </span>
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-white text-2xl font-black group-hover:text-primary-300 transition-colors">
                    {loc.city}
                  </h3>
                  <p className="text-slate-400 text-sm mt-0.5">
                    Avg. Rent: <span className="text-primary-400 font-bold">{loc.avgRent}</span>
                  </p>
                </div>
                {/* Arrow indicator */}
                <div className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-white border border-white/10 group-hover:bg-primary-600 group-hover:border-primary-500 transition-all shadow-lg">
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Glowing borders on hover */}
            <div className="absolute inset-0 border border-primary-500/0 group-hover:border-primary-500/35 rounded-3xl transition-all duration-300 pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
