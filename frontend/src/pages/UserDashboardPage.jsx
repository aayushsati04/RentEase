import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

export default function UserDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (!user) return;

        if (user.role === 'landlord' || user.role === 'owner') {
          // Fetch landlord listings
          const { data: propData, error: propErr } = await supabase
            .from('properties')
            .select('*')
            .eq('owner_id', user.id);
          
          if (propErr) throw propErr;

          const propIds = (propData || []).map(p => p.id);
          let pendingCount = 0;
          let totalEarnings = 0;

          if (propIds.length > 0) {
            const { data: bkData, error: bkErr } = await supabase
              .from('bookings')
              .select('*')
              .in('property_id', propIds);
            
            if (!bkErr && bkData) {
              pendingCount = bkData.filter(b => b.status === 'pending').length;
              
              const bkIds = bkData.map(b => b.id);
              if (bkIds.length > 0) {
                const { data: payData, error: payErr } = await supabase
                  .from('payments')
                  .select('*')
                  .in('booking_id', bkIds)
                  .eq('payment_status', 'completed');
                if (!payErr && payData) {
                  totalEarnings = payData.reduce((sum, p) => sum + Number(p.amount), 0);
                }
              }
            }
          }

          setProperties((propData || []).map(p => ({
            ...p,
            price: Number(p.rent),
            image: p.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
            rating: p.average_rating || 4.5
          })));

          const formattedEarnings = totalEarnings >= 100000 
            ? `₹${(totalEarnings / 100000).toFixed(2)}L` 
            : `₹${(totalEarnings / 1000).toFixed(1)}k`;

          setStats([
            { label: 'Total Listings', value: propIds.length.toString(), icon: '🏢', color: 'from-blue-600/20 to-indigo-600/20' },
            { label: 'Monthly Earnings', value: formattedEarnings, icon: '📈', color: 'from-emerald-600/20 to-teal-600/20' },
            { label: 'Pending Bookings', value: pendingCount.toString(), icon: '⏳', color: 'from-amber-600/20 to-orange-600/20' },
            { label: 'Average Rating', value: '4.8 ★', icon: '⭐', color: 'from-violet-600/20 to-purple-600/20' },
          ]);

        } else {
          // Fetch tenant bookings
          const { data: bkData, error: bkErr } = await supabase
            .from('bookings')
            .select('*, property:property_id(*)')
            .eq('tenant_id', user.id);
          
          if (bkErr) throw bkErr;

          let paidCount = 0;
          let unpaidCount = 0;
          let totalSpent = 0;

          const bkMapped = (bkData || []).map(b => {
            const propertyRent = Number(b.property?.rent) || 0;
            if (b.status === 'confirmed') {
              paidCount++;
              totalSpent += propertyRent;
            } else if (b.status === 'pending') {
              unpaidCount++;
            }
            return {
              id: b.id.toString(),
              property: {
                ...b.property,
                title: b.property?.title || 'RentEase Property',
                location: b.property?.location || 'India',
                image: b.property?.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
              },
              checkIn: b.check_in.split('T')[0],
              checkOut: b.check_out.split('T')[0],
              status: b.status === 'confirmed' ? 'Paid' : b.status === 'pending' ? 'Approved & Unpaid' : b.status,
              amount: propertyRent
            };
          });

          setBookings(bkMapped);

          const formattedSpent = totalSpent >= 100000 
            ? `₹${(totalSpent / 100000).toFixed(2)}L` 
            : `₹${(totalSpent / 1000).toFixed(1)}k`;

          setStats([
            { label: 'Active Rentals', value: paidCount.toString(), icon: '🏠', color: 'from-blue-600/20 to-indigo-600/20' },
            { label: 'Unpaid Bookings', value: unpaidCount.toString(), icon: '⏳', color: 'from-rose-600/20 to-pink-600/20' },
            { label: 'Unread Chats', value: '0', icon: '💬', color: 'from-emerald-600/20 to-teal-600/20' },
            { label: 'Rent Paid (YTD)', value: formattedSpent, icon: '💳', color: 'from-amber-600/20 to-orange-600/20' },
          ]);
        }
      } catch (err) {
        console.error('Error fetching dashboard details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Guard: If not logged in, redirect (handled by ProtectedRoute, but double safety)
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 text-center">
        <p className="text-slate-400">Loading profile details...</p>
      </div>
    );
  }

  const isLandlord = user.role === 'landlord' || user.role === 'owner';

  const handleEditProfile = () => {
    toast.success('Profile edit settings are disabled in sandbox.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 pb-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner/Header */}
        <div className="relative rounded-3xl overflow-hidden mb-8 shadow-glass border border-white/8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-950 via-slate-900 to-indigo-950" />
          <div className="relative z-10 px-8 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <span className="text-primary-400 text-xs font-bold uppercase tracking-wider block mb-1">
                ✦ Dashboard Workspace
              </span>
              <h1 className="text-3xl font-black text-white">
                Welcome back, <span className="gradient-text">{user.name || 'User'}</span>
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Manage your rentals, messages, and listings from your workspace dashboard.
              </p>
            </div>
            {isLandlord && (
              <Link 
                to="/properties/add"
                className="btn-primary text-sm px-6 py-3 shrink-0"
              >
                ➕ Create New Listing
              </Link>
            )}
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Profile Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-white/8 space-y-6">
              
              {/* User Avatar */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-violet-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-glow mb-4">
                  {user.name ? user.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : 'U'}
                </div>
                <h3 className="text-white font-bold text-lg">{user.name}</h3>
                <span className="text-xs px-2.5 py-0.5 bg-primary-600/25 text-primary-300 font-semibold rounded-full uppercase tracking-wider mt-1.5 capitalize">
                  {user.role} Member
                </span>
              </div>

              {/* Profile Details */}
              <div className="space-y-3 pt-4 border-t border-white/8 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Email</span>
                  <span className="text-slate-300 truncate max-w-44">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone</span>
                  <span className="text-slate-300">{user.phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verified</span>
                  <span className="text-emerald-400 font-semibold">Yes ✓</span>
                </div>
              </div>

              {/* Edit Profile CTA */}
              <button 
                onClick={handleEditProfile}
                className="w-full py-2.5 glass text-slate-300 hover:text-white border border-white/8 hover:bg-white/5 rounded-xl text-xs font-semibold transition-all"
              >
                ✏️ Edit Workspace Settings
              </button>

            </div>
          </div>

          {/* Metrics & Workspaces */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Visual Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`glass p-5 rounded-2xl border border-white/8 bg-gradient-to-br ${item.color} shadow-glass`}
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="text-2xl font-black text-white">{item.value}</div>
                  <div className="text-slate-400 text-xs font-medium mt-1 leading-tight">{item.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Main Tabs */}
            <div className="space-y-5">
              <div className="flex border-b border-white/8 gap-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
                    activeTab === 'overview' ? 'text-primary-400 border-primary-500' : 'text-slate-500 border-transparent hover:text-white'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('listings')}
                  className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
                    activeTab === 'listings' ? 'text-primary-400 border-primary-500' : 'text-slate-500 border-transparent hover:text-white'
                  }`}
                >
                  {isLandlord ? 'My Listed Properties' : 'My Active Bookings'}
                </button>
              </div>

              {/* Tab Contents */}
              <AnimatePresence mode="wait">
                {activeTab === 'overview' ? (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    {/* Activity log */}
                    <div className="glass-card rounded-3xl p-6 border border-white/8 space-y-4">
                      <h4 className="text-white font-bold text-base">Recent Activities</h4>
                      <div className="space-y-4">
                        {[
                          { time: '2 hours ago', icon: '🔑', text: isLandlord ? 'New booking request received for Luxury Penthouse Suite.' : 'Booking confirmation successful for Luxury Penthouse Suite.' },
                          { time: '1 day ago', icon: '💬', text: 'Chat conversation opened with host Rohan Malhotra.' },
                          { time: '3 days ago', icon: '👤', text: 'Account registered successfully.' },
                        ].map((act, i) => (
                          <div key={i} className="flex gap-4 items-start text-sm">
                            <span className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-base shrink-0">{act.icon}</span>
                            <div className="flex-1">
                              <p className="text-slate-300 font-medium">{act.text}</p>
                              <span className="text-slate-500 text-xs">{act.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="listings"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Landlord View */}
                    {isLandlord ? (
                      properties.length === 0 ? (
                        <div className="text-center py-16 bg-white/2 rounded-3xl border border-dashed border-slate-800">
                          <p className="text-slate-400 text-sm mb-4">You haven't listed any properties yet.</p>
                          <Link to="/properties/add" className="btn-primary text-xs py-2 px-4 inline-block font-semibold">
                            Create a Listing
                          </Link>
                        </div>
                      ) : (
                        <div className="glass-card rounded-3xl overflow-hidden border border-white/8">
                          <table className="w-full text-left border-collapse text-sm">
                            <thead>
                              <tr className="border-b border-white/8 bg-white/2 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                                <th className="px-6 py-4">Property</th>
                                <th className="px-6 py-4">Rate</th>
                                <th className="px-6 py-4">Rating</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {properties.map((p) => (
                                <tr key={p.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                                  <td className="px-6 py-4 flex items-center gap-3">
                                    <img src={p.image} alt={p.title} className="w-12 h-12 object-cover rounded-xl border border-white/8 shrink-0" />
                                    <div>
                                      <div className="text-white font-bold">{p.title}</div>
                                      <div className="text-slate-500 text-xs">{p.location}</div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-white font-bold">₹{p.price.toLocaleString()}</span>
                                    <span className="text-slate-500 text-xs">/mo</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-amber-400">★ {p.rating}</span>
                                  </td>
                                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <button onClick={() => navigate(`/properties/${p.id}`)} className="text-xs px-3 py-1.5 bg-primary-600/20 text-primary-300 hover:text-white border border-primary-500/30 rounded-lg transition-all">
                                      View
                                    </button>
                                    <button onClick={() => navigate(`/properties/edit/${p.id}`)} className="text-xs px-3 py-1.5 bg-violet-600/20 text-violet-300 hover:text-white border border-violet-500/30 rounded-lg transition-all">
                                      Edit
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    ) : (
                      /* Tenant View */
                      bookings.length === 0 ? (
                        <div className="text-center py-16 bg-white/2 rounded-3xl border border-dashed border-slate-800">
                          <p className="text-slate-400 text-sm mb-4">You don't have any bookings yet.</p>
                          <Link to="/properties" className="btn-primary text-xs py-2 px-4 inline-block font-semibold">
                            Browse Listings
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {bookings.map((b) => (
                            <div key={b.id} className="glass-card rounded-3xl p-5 border border-white/8 flex flex-col sm:flex-row justify-between items-center gap-4">
                              <div className="flex items-center gap-4 w-full sm:w-auto">
                                <img src={b.property.image} alt={b.property.title} className="w-16 h-16 object-cover rounded-2xl border border-white/8 shrink-0" />
                                <div>
                                  <h4 className="text-white font-bold text-sm leading-snug">{b.property.title}</h4>
                                  <p className="text-slate-400 text-xs mt-0.5">{b.property.location}</p>
                                  <div className="flex gap-2 text-xs text-slate-500 mt-1.5">
                                    <span>In: {b.checkIn}</span>
                                    <span>•</span>
                                    <span>Out: {b.checkOut}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-white/8 pt-3 sm:pt-0">
                                <div>
                                  <span className="text-white font-black">₹{b.amount.toLocaleString()}</span>
                                  <span className="text-slate-500 text-xs">/mo</span>
                                </div>
                                <span className="text-xs px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-bold mt-1 shadow-glow-sm">
                                  {b.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
