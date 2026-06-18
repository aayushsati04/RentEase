import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { featuredProperties } from '../data/sampleData';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import VirtualTour from '../components/property/VirtualTour';

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [moveOutDate, setMoveOutDate] = useState('');
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        // Supabase select with nested owner profile details
        const { data, error } = await supabase
          .from('properties')
          .select('*, owner:owner_id(id, name, email, phone)')
          .eq('id', id)
          .single();

        if (error) throw error;

        const mapped = {
          ...data,
          price: Number(data.rent),
          verified: data.is_verified,
          rating: Number(data.average_rating) || 4.5,
          reviews: data.total_reviews || 0,
          image: data.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
          tag: data.type === 'Villa' ? 'Popular' : data.type === 'Apartment' ? 'Premium' : 'Trending',
          tagColor: data.type === 'Villa' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
          hostName: data.owner?.name || 'Rohan Malhotra',
          virtualTourUrl: data.virtual_tour_url || ''
        };
        setProperty(mapped);
        setActiveImg(mapped.image);
      } catch (err) {
        console.error('Error fetching property details:', err);
        const found = featuredProperties.find(p => p.id === parseInt(id)) || featuredProperties[0];
        const fallback = {
          ...found,
          price: found.price,
          verified: found.verified,
          rating: found.rating,
          reviews: found.reviews,
          image: found.image,
          hostName: 'Rohan Malhotra',
          virtualTourUrl: found.virtualTourUrl || ''
        };
        setProperty(fallback);
        setActiveImg(fallback.image);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // Gallery images (additional mock images for premium feel)
  const gallery = useMemo(() => {
    if (!property) return [];
    return [
      property.image,
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
      'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800&q=80',
    ];
  }, [property]);

  // Dynamic booking calculations
  const bookingSummary = useMemo(() => {
    if (!property || !moveInDate || !moveOutDate) return null;
    const start = new Date(moveInDate);
    const end = new Date(moveOutDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.max(1, Math.round(diffDays / 30));
    
    const baseRent = property.price * months;
    const securityDeposit = Math.round(property.price * 1.5);
    const serviceFee = Math.round(property.price * 0.05);
    const total = baseRent + securityDeposit + serviceFee;

    return {
      months,
      days: diffDays,
      baseRent,
      securityDeposit,
      serviceFee,
      total,
    };
  }, [moveInDate, moveOutDate, property]);

  const handleBookNow = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to book a property');
      navigate('/login');
      return;
    }
    if (!moveInDate || !moveOutDate) {
      toast.error('Please select move-in and move-out dates');
      return;
    }
    if (new Date(moveInDate) >= new Date(moveOutDate)) {
      toast.error('Move-out date must be after move-in date');
      return;
    }
    
    // Redirect to checkout with calculated details
    toast.success('Redirecting to secure checkout...');
    navigate(`/payments/checkout/${property.id}?months=${bookingSummary.months}&total=${bookingSummary.total}&in=${moveInDate}&out=${moveOutDate}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 pb-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 pb-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Property Not Found</h2>
          <Link to="/properties" className="btn-primary inline-block">Back to Listings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
          <Link to="/" className="hover:text-primary-400">Home</Link>
          <span>/</span>
          <Link to="/properties" className="hover:text-primary-400">Properties</Link>
          <span>/</span>
          <span className="text-white truncate">{property.title}</span>
        </div>

        {/* Dual-column Hero Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Title, Gallery, Host, Specs, Amenities, Reviews */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Title Block */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`badge ${property.tagColor}`}>{property.tag}</span>
                {property.verified && (
                  <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ✓ Verified Listing
                  </span>
                )}
                <span className="text-sm font-semibold text-slate-400">{property.type}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                {property.title}
              </h1>
              <p className="text-slate-400 flex items-center gap-1.5 mt-2.5 text-sm">
                <svg className="w-4 h-4 text-primary-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {property.location}
              </p>
            </div>

            {/* Premium Interactive Photo Gallery */}
            <div className="space-y-3">
              <div className="relative h-[400px] rounded-3xl overflow-hidden border border-white/8 shadow-glass group">
                <img 
                  src={activeImg} 
                  alt={property.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {gallery.map((img, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveImg(img)}
                    className={`h-20 sm:h-24 rounded-2xl overflow-hidden border transition-all ${
                      activeImg === img ? 'border-primary-500 shadow-glow-sm' : 'border-white/8 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Key Specifications Grid */}
            <div className="glass-card rounded-3xl p-6 border border-white/8 space-y-4">
              <h3 className="text-white font-bold text-lg border-b border-white/8 pb-3">
                Property Overview
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl text-center">
                  <div className="text-2xl mb-1">🛏</div>
                  <div className="text-white font-black text-lg">{property.bedrooms}</div>
                  <div className="text-slate-400 text-xs mt-0.5">Bedrooms</div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl text-center">
                  <div className="text-2xl mb-1">🚿</div>
                  <div className="text-white font-black text-lg">{property.bathrooms}</div>
                  <div className="text-slate-400 text-xs mt-0.5">Bathrooms</div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl text-center">
                  <div className="text-2xl mb-1">📐</div>
                  <div className="text-white font-black text-lg">{property.area}</div>
                  <div className="text-slate-400 text-xs mt-0.5">Sq. Ft Area</div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl text-center">
                  <div className="text-2xl mb-1">🔒</div>
                  <div className="text-white font-black text-lg">24/7</div>
                  <div className="text-slate-400 text-xs mt-0.5">Security</div>
                </div>
              </div>
            </div>

            {/* 360° Virtual Tour Section */}
            <VirtualTour virtualTourUrl={property.virtualTourUrl} />

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-white font-bold text-lg">About This Space</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {property.description || `Experience luxury living in this beautifully designed property. Boasting stunning architecture, high-end finishing, and panoramic views, this home offers everything you need for a premium lifestyle. Perfect for families and professionals alike, located in one of the most vibrant areas with easy access to shopping hubs, IT parks, and dining options. Enjoy state-of-the-art facilities, double-height ceilings, and excellent privacy.`}
              </p>
            </div>

            {/* Amenities Section */}
            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg">What This Place Offers</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3 p-3.5 glass rounded-2xl border border-white/8">
                    <span className="text-xl">
                      {amenity === 'Pool' && '🏊'}
                      {amenity === 'Gym' && '💪'}
                      {amenity === 'Parking' && '🚗'}
                      {amenity === 'Security' && '🛡️'}
                      {amenity === 'Garden' && '🏡'}
                      {amenity === 'WiFi' && '📶'}
                      {amenity === 'Meals' && '🍛'}
                      {amenity === 'AC' && '❄️'}
                      {amenity === 'Laundry' && '🧺'}
                      {amenity === 'Club House' && '🏢'}
                      {amenity === 'Cafeteria' && '☕'}
                      {amenity === 'Conference Rooms' && '💻'}
                    </span>
                    <span className="text-slate-300 text-sm font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Host Card */}
            <div className="glass-card rounded-3xl p-6 border border-white/8 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80" 
                  alt="Host Profile" 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-primary-500" 
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-slate-900 rounded-full" />
              </div>
              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="text-white font-bold text-base">{property.hostName}</h4>
                  <span className="text-[10px] px-2 py-0.5 bg-primary-600/35 text-primary-300 font-semibold rounded-full uppercase tracking-wider mt-1.5 capitalize">
                    Superhost
                  </span>
                </div>
                <p className="text-slate-400 text-xs">Hosting on RentEase since October 2024 • Verified Identity</p>
                <p className="text-slate-300 text-sm pt-1.5">
                  "I strive to provide a seamless, comfortable, and luxury rental experience for all my tenants. Direct support is available 24/7."
                </p>
              </div>
              <Link 
                to="/chat" 
                className="px-5 py-2.5 glass text-slate-300 hover:text-white border border-white/8 hover:bg-white/5 rounded-xl text-sm font-semibold transition-all shrink-0"
              >
                Message {property.hostName.split(' ')[0]}
              </Link>
            </div>

            {/* Reviews list */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/8 pb-3">
                <h3 className="text-white font-bold text-lg">Reviews ({property.reviews})</h3>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold text-lg">★ {property.rating}</span>
                  <span className="text-slate-500 text-xs">• Verified ratings</span>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Amit Verma', date: 'May 2026', rating: 5, text: 'Absolutely spectacular! The property looks even better than the photos. Spotless rooms, super host Rohan was responsive, and location is ideal.' },
                  { name: 'Sneha Patel', date: 'April 2026', rating: 4.8, text: 'High quality studio loft with beautiful interior designs. Highly recommend this for young professionals seeking comfort.' },
                  { name: 'Kabir Dev', date: 'March 2026', rating: 5, text: 'Awesome experience renting here. Safe, secure, high-speed internet, and parking space is huge.' },
                ].map((review, i) => (
                  <div key={i} className="glass rounded-2xl p-5 border border-white/4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-bold text-sm">{review.name}</h4>
                        <p className="text-slate-500 text-xs mt-0.5">{review.date}</p>
                      </div>
                      <span className="text-amber-400 text-sm font-bold">★ {review.rating}</span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="lg:col-span-4">
            <div className="glass-card rounded-3xl p-6 border border-white/8 shadow-glass sticky top-24 space-y-6">
              
              {/* Cost header */}
              <div className="flex items-end justify-between border-b border-white/8 pb-4">
                <div>
                  <span className="text-3xl font-black gradient-text">₹{property.price.toLocaleString()}</span>
                  <span className="text-slate-400 text-sm"> / month</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-amber-400">
                  <span>★ {property.rating}</span>
                </div>
              </div>

              {/* Booking form */}
              <form onSubmit={handleBookNow} className="space-y-4">
                
                {/* Dates picker */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                      Move-In
                    </label>
                    <input 
                      type="date" 
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2.5 bg-slate-800/40 border border-slate-700/60 rounded-xl text-white outline-none focus:border-primary-500 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                      Move-Out
                    </label>
                    <input 
                      type="date" 
                      value={moveOutDate}
                      onChange={(e) => setMoveOutDate(e.target.value)}
                      min={moveInDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2.5 bg-slate-800/40 border border-slate-700/60 rounded-xl text-white outline-none focus:border-primary-500 text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Tenants count */}
                <div>
                  <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                    Guests / Tenants
                  </label>
                  <select 
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full px-3.5 py-3 bg-slate-800/40 border border-slate-700/60 rounded-xl text-white outline-none focus:border-primary-500 text-sm cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6].map(g => (
                      <option key={g} value={g} className="bg-slate-900">{g} {g === 1 ? 'tenant' : 'tenants'}</option>
                    ))}
                  </select>
                </div>

                {/* Pricing Summary (shown dynamically when dates are entered) */}
                {bookingSummary ? (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2.5 pt-4 border-t border-white/8 text-sm"
                  >
                    <div className="flex justify-between text-slate-400">
                      <span>Rent (₹{property.price.toLocaleString()} × {bookingSummary.months}m)</span>
                      <span className="text-white">₹{bookingSummary.baseRent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Refundable Security Deposit (1.5x)</span>
                      <span className="text-white">₹{bookingSummary.securityDeposit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>One-time Platform Fee (5%)</span>
                      <span className="text-white">₹{bookingSummary.serviceFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-black text-base pt-3 border-t border-white/8 text-white">
                      <span>Total Amount</span>
                      <span className="gradient-text">₹{bookingSummary.total.toLocaleString()}</span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center p-4 bg-white/2 rounded-xl text-slate-500 text-xs">
                    Select move-in and move-out dates to calculate pricing details.
                  </div>
                )}

                {/* CTA Button */}
                <button
                  type="submit"
                  className="w-full btn-primary py-3.5 text-sm font-bold flex items-center justify-center gap-2 mt-4"
                >
                  ⚡ Reserve Property
                </button>
              </form>

              {/* Badging info */}
              <div className="space-y-3 pt-2 text-center text-xs text-slate-500">
                <p>🔒 Secure payments encryption powered by RentEase SafeGuard.</p>
                <p>⚠️ Zero brokerage. Refundable security deposit managed securely.</p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
