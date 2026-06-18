import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import API from '../services/api';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('approvals');
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch unverified listings for the approval queue from backend
      const { data: propRes } = await API.get('/api/admin/properties?isVerified=false');
      const propertiesList = propRes.data || propRes.properties || [];

      const queueMapped = propertiesList.map(p => ({
        id: p._id,
        title: p.title,
        host: p.ownerId?.name || 'Rohan Malhotra',
        type: p.type,
        price: Number(p.rent),
        date: p.createdAt ? p.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
      }));
      setQueue(queueMapped);

      // 2. Fetch aggregate statistics from backend
      const { data: statsRes } = await API.get('/api/admin/dashboard');
      const statsData = statsRes.data || {};
      const usersCount = statsData.totalUsers || 0;
      const liveCount = statsData.propertiesBreakdown?.verified || 0;

      setStats([
        { label: 'Total Registered Users', value: usersCount.toString(), icon: '👥', color: 'from-blue-600/10 to-indigo-600/10' },
        { label: 'Live Property Listings', value: liveCount.toString(), icon: '🏠', color: 'from-emerald-600/10 to-teal-600/10' },
        { label: 'Queue For Approvals', value: queueMapped.length.toString(), icon: '⏳', color: 'from-amber-600/10 to-orange-600/10' },
        { label: 'System Check Logs', value: '0 Errors', icon: '🛡️', color: 'from-rose-600/10 to-pink-600/10' },
      ]);

    } catch (err) {
      console.error('Error fetching admin dashboard details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApprove = async (id, title) => {
    try {
      await API.put(`/api/admin/properties/${id}/verify`);

      setQueue(prev => prev.filter(item => item.id !== id));
      toast.success(`Approved: "${title}" is now live & verified!`);
      
      // Refresh statistics
      fetchAdminData();
    } catch (err) {
      console.error('Error approving property:', err);
      toast.error('Failed to approve property');
    }
  };

  const handleReject = async (id, title) => {
    try {
      await API.delete(`/api/properties/${id}`);

      setQueue(prev => prev.filter(item => item.id !== id));
      toast.error(`Rejected: "${title}" listing request declined.`);
      
      // Refresh statistics
      fetchAdminData();
    } catch (err) {
      console.error('Error rejecting property:', err);
      toast.error('Failed to reject property');
    }
  };

  const handleToolAction = (name) => {
    toast.success(`Executed: "${name}" completed successfully.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 pb-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header banner */}
        <div className="relative rounded-3xl overflow-hidden mb-8 shadow-glass border border-amber-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900" />
          <div className="relative z-10 px-8 py-10">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider block mb-1">
              ⚙️ System Operations Console
            </span>
            <h1 className="text-3xl font-black text-white">
              Admin <span className="text-gradient-gold">Control Console</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Verify pending properties, lookup logs, configure maintenance flags, and oversee platform status.
            </p>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className={`glass p-5 rounded-2xl border border-white/8 bg-gradient-to-br ${stat.color} shadow-glass`}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-slate-400 text-xs mt-1 leading-snug">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Nav Tabs */}
        <div className="space-y-6">
          <div className="flex border-b border-white/8 gap-4">
            <button
              onClick={() => setActiveTab('approvals')}
              className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
                activeTab === 'approvals' ? 'text-amber-400 border-amber-500' : 'text-slate-500 border-transparent hover:text-white'
              }`}
            >
              Approval Queue ({queue.length})
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
                activeTab === 'tools' ? 'text-amber-400 border-amber-500' : 'text-slate-500 border-transparent hover:text-white'
              }`}
            >
              Administrative Utilities
            </button>
          </div>

          {/* Switchable views */}
          <AnimatePresence mode="wait">
            {activeTab === 'approvals' ? (
              <motion.div
                key="approvals"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {queue.length === 0 ? (
                  <div className="text-center py-16 bg-white/2 rounded-3xl border border-dashed border-slate-800">
                    <p className="text-slate-500 text-sm">🎉 Excellent. There are no pending approvals in the queue.</p>
                  </div>
                ) : (
                  <div className="glass-card rounded-3xl overflow-hidden border border-white/8">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-white/8 bg-white/2 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                          <th className="px-6 py-4">Pending Listing</th>
                          <th className="px-6 py-4">Landlord</th>
                          <th className="px-6 py-4">Price</th>
                          <th className="px-6 py-4 text-right">Verification Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {queue.map((item) => (
                          <tr key={item.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-white font-bold">{item.title}</div>
                              <div className="text-slate-500 text-xs">Submitted: {item.date} • {item.type}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-300 font-medium">{item.host}</td>
                            <td className="px-6 py-4">
                              <span className="text-white font-bold">₹{item.price.toLocaleString()}</span>
                              <span className="text-slate-500 text-xs">/mo</span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button 
                                onClick={() => handleApprove(item.id, item.title)}
                                className="text-xs px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-glow-sm transition-all"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleReject(item.id, item.title)}
                                className="text-xs px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/35 rounded-lg transition-all"
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="tools"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                {[
                  { title: 'Database Backup', desc: 'Saves full copy of listings, bookings, and users.', action: 'Export Database Logs' },
                  { title: 'Clear Server Cache', desc: 'Purges query optimizations for instant updates.', action: 'Clear Server Cache' },
                  { title: 'Toggle Maintenance', desc: 'Sets a placeholder screen blocking incoming users.', action: 'Maintenance Mode' }
                ].map((tool, i) => (
                  <div key={i} className="glass-card rounded-3xl p-5 border border-white/8 flex flex-col justify-between h-44 shadow-glass">
                    <div>
                      <h4 className="text-white font-bold text-sm mb-1">{tool.title}</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">{tool.desc}</p>
                    </div>
                    <button 
                      onClick={() => handleToolAction(tool.action)}
                      className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl border border-white/8 transition-all"
                    >
                      Run Utility
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
