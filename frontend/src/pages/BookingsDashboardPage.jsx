import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { featuredProperties } from '../data/sampleData';
import toast from 'react-hot-toast';

export default function BookingsDashboardPage() {
  const navigate = useNavigate();

  // Mock list of user bookings
  const bookings = [
    {
      id: 'B_928174',
      property: featuredProperties[0],
      checkIn: '2026-07-01',
      checkOut: '2027-06-30',
      status: 'Paid',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      totalRent: 85000,
      hostName: 'Rohan Malhotra',
    },
    {
      id: 'B_381204',
      property: featuredProperties[2],
      checkIn: '2026-08-15',
      checkOut: '2027-02-14',
      status: 'Approved & Unpaid',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      totalRent: 22000,
      hostName: 'Karan Malhotra',
      payUrl: `/payments/checkout/${featuredProperties[2].id}?months=6&total=${22000 * 6 + 33000 + 1100}&in=2026-08-15&out=2027-02-14`,
    },
    {
      id: 'B_108249',
      property: featuredProperties[3],
      checkIn: '2025-01-01',
      checkOut: '2025-12-31',
      status: 'Completed',
      badgeColor: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
      totalRent: 12000,
      hostName: 'Sumit Sharma',
    }
  ];

  const handleDownloadInvoice = (id) => {
    toast.success(`Invoice for ${id} downloaded successfully.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <span className="text-primary-400 text-xs font-bold uppercase tracking-wider block mb-1">
              ✦ Rental History
            </span>
            <h1 className="text-3xl font-black text-white">
              My <span className="gradient-text">Bookings</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Track invoices, payments, schedules, and host information for your bookings.
            </p>
          </div>
          <Link to="/properties" className="btn-secondary text-sm">
            Browse More Properties
          </Link>
        </div>

        {/* Bookings list */}
        <div className="space-y-6">
          {bookings.map((booking, i) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-3xl p-6 border border-white/8 hover:border-primary-500/20 transition-all flex flex-col md:flex-row items-center gap-6 shadow-glass"
            >
              {/* Property Image */}
              <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden border border-white/8 shrink-0 relative">
                <img 
                  src={booking.property.image} 
                  alt={booking.property.title} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] bg-slate-900/90 text-white font-bold px-2 py-0.5 rounded-lg border border-white/10">
                    {booking.property.type}
                  </span>
                </div>
              </div>

              {/* Core Information */}
              <div className="flex-1 space-y-3 w-full">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-white font-bold text-lg leading-tight hover:text-primary-300 transition-colors">
                    <Link to={`/properties/${booking.property.id}`}>{booking.property.title}</Link>
                  </h3>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${booking.badgeColor}`}>
                    {booking.status}
                  </span>
                </div>
                
                <p className="text-slate-400 text-xs flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-primary-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {booking.property.location}
                </p>

                {/* Timing & Host Row */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs pt-2 border-t border-white/4 text-slate-500">
                  <div>
                    <span className="text-slate-400">Duration: </span>
                    <span className="text-slate-300 font-semibold">{booking.checkIn} to {booking.checkOut}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Host: </span>
                    <span className="text-slate-300 font-semibold">{booking.hostName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Monthly Rent: </span>
                    <span className="text-primary-400 font-black">₹{booking.totalRent.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Right-Aligned */}
              <div className="flex md:flex-col gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 border-white/8 pt-4 md:pt-0">
                {booking.payUrl ? (
                  <Link 
                    to={booking.payUrl}
                    className="flex-1 md:w-40 text-center btn-primary text-xs py-2.5 font-bold"
                  >
                    💳 Pay Now
                  </Link>
                ) : (
                  <button 
                    onClick={() => handleDownloadInvoice(booking.id)}
                    className="flex-1 md:w-40 glass text-slate-300 hover:text-white border border-white/8 hover:bg-white/5 text-xs py-2.5 font-bold rounded-xl transition-all"
                  >
                    📄 Invoice
                  </button>
                )}
                
                <Link 
                  to="/chat"
                  className="flex-1 md:w-40 text-center glass text-slate-300 hover:text-white border border-white/8 hover:bg-white/5 text-xs py-2.5 font-semibold rounded-xl transition-all"
                >
                  💬 Message Host
                </Link>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
