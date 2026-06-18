import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

export default function BookingsDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        if (!user) return;

        if (user.isDemo) {
          if (user.role === 'landlord' || user.role === 'owner') {
            const sampleLandlordBks = [
              {
                id: 'demo-received-bk-1',
                property: {
                  id: 1,
                  title: 'Luxury Penthouse Suite',
                  location: 'Bandra West, Mumbai',
                  price: 85000,
                  image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
                  type: 'Apartment'
                },
                checkIn: '2026-06-01',
                checkOut: '2026-12-01',
                status: 'Paid',
                badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
                totalRent: 85000,
                hostName: 'Rajesh Sharma',
                payUrl: null
              },
              {
                id: 'demo-received-bk-2',
                property: {
                  id: 3,
                  title: 'Contemporary Studio Loft',
                  location: 'Indiranagar, Bangalore',
                  price: 22000,
                  image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
                  type: 'Studio'
                },
                checkIn: '2026-07-10',
                checkOut: '2026-10-10',
                status: 'Approved & Unpaid',
                badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
                totalRent: 22000,
                hostName: 'Rajesh Sharma',
                payUrl: null
              }
            ];
            setBookings(sampleLandlordBks);
          } else {
            const sampleTenantBks = [
              {
                id: 'demo-tenant-bk-1',
                property: {
                  id: 1,
                  title: 'Luxury Penthouse Suite',
                  location: 'Bandra West, Mumbai',
                  price: 85000,
                  image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
                  type: 'Apartment'
                },
                checkIn: '2026-06-01',
                checkOut: '2026-12-01',
                status: 'Paid',
                badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
                totalRent: 85000,
                hostName: 'Rohan Malhotra',
                payUrl: null
              },
              {
                id: 'demo-tenant-bk-2',
                property: {
                  id: 2,
                  title: 'Modern Sea-View Villa',
                  location: 'Koregaon Park, Pune',
                  price: 65000,
                  image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
                  type: 'Villa'
                },
                checkIn: '2026-07-01',
                checkOut: '2026-08-01',
                status: 'Approved & Unpaid',
                badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
                totalRent: 65000,
                hostName: 'Rahul Mehta',
                payUrl: `/payments/checkout/2?months=1&total=163750&in=2026-07-01&out=2026-08-01`
              }
            ];
            setBookings(sampleTenantBks);
          }
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('bookings')
          .select('*, property:property_id(*, owner:owner_id(name))')
          .eq('tenant_id', user.id);
        
        if (error) throw error;

        const mapped = (data || []).map(b => {
          const checkInDate = new Date(b.check_in);
          const checkOutDate = new Date(b.check_out);
          const diffTime = Math.abs(checkOutDate - checkInDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const months = Math.max(1, Math.round(diffDays / 30));
          
          const propertyRent = Number(b.property?.rent) || 0;
          const baseRent = propertyRent * months;
          const securityDeposit = Math.round(propertyRent * 1.5);
          const serviceFee = Math.round(propertyRent * 0.05);
          const total = baseRent + securityDeposit + serviceFee;

          let badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
          if (b.status === 'confirmed') badgeColor = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
          if (b.status === 'cancelled' || b.status === 'rejected') badgeColor = 'bg-rose-500/20 text-rose-300 border border-rose-500/30';

          return {
            id: b.id.toString(),
            property: {
              ...b.property,
              id: b.property?.id,
              price: propertyRent,
              image: b.property?.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
              type: b.property?.type || 'Apartment'
            },
            checkIn: b.check_in.split('T')[0],
            checkOut: b.check_out.split('T')[0],
            status: b.status === 'confirmed' ? 'Paid' : b.status === 'pending' ? 'Approved & Unpaid' : b.status,
            badgeColor,
            totalRent: propertyRent,
            hostName: b.property?.owner?.name || 'Rohan Malhotra',
            payUrl: b.status === 'pending' ? `/payments/checkout/${b.property?.id}?months=${months}&total=${total}&in=${b.check_in.split('T')[0]}&out=${b.check_out.split('T')[0]}` : null
          };
        });

        setBookings(mapped);
      } catch (err) {
        console.error('Error fetching bookings from Supabase:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const handleDownloadInvoice = (id) => {
    toast.success(`Invoice for ${id} downloaded successfully.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 pb-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading your bookings...</p>
        </div>
      </div>
    );
  }

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
          {bookings.length === 0 ? (
            <div className="text-center py-20 bg-white/2 rounded-3xl border border-dashed border-slate-800">
              <p className="text-slate-400 text-sm mb-4">You have no active bookings yet.</p>
              <Link to="/properties" className="btn-primary py-2.5 px-6 font-bold inline-block text-xs">
                Start Browsing Listings
              </Link>
            </div>
          ) : (
            bookings.map((booking, i) => (
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
            ))
          )}
        </div>

      </div>
    </div>
  );
}
