import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { featuredProperties } from '../data/sampleData';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const months = parseInt(searchParams.get('months')) || 1;
  const total = parseInt(searchParams.get('total')) || 0;
  const moveIn = searchParams.get('in') || '';
  const moveOut = searchParams.get('out') || '';

  const property = useMemo(() => {
    return featuredProperties.find(p => p.id === parseInt(id)) || featuredProperties[0];
  }, [id]);

  // Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [isCVVFocused, setIsCVVFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Card Number Formatter (4-4-4-4)
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.slice(0, 16);
    const matches = val.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(val);
    }
  };

  // Expiry date Formatter (MM/YY)
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 2) {
      setCardExpiry(`${val.slice(0, 2)}/${val.slice(2)}`);
    } else {
      setCardExpiry(val);
    }
  };

  const handlePay = (e) => {
    e.preventDefault();
    if (cardNumber.length < 19 || cardHolder.trim() === '' || cardExpiry.length < 5 || cardCVV.length < 3) {
      toast.error('Please fill in valid payment credentials');
      return;
    }
    setIsSubmitting(true);

    // Simulate Payment processing
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success('Booking Confirmed & RentPaid!');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16 flex items-center justify-center">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div 
              key="checkout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              
              {/* Payment Details Form */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* 3D Flipping Interactive Card Representation */}
                <div className="flex justify-center">
                  <div className="w-[340px] h-[210px] perspective-1000">
                    <motion.div 
                      animate={{ rotateY: isCVVFocused ? 180 : 0 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="w-full h-full relative preserve-3d cursor-default shadow-glow"
                    >
                      {/* FRONT OF THE CARD */}
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-800 rounded-2xl p-6 text-white backface-hidden flex flex-col justify-between border border-white/20">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-black tracking-widest text-indigo-200">RentEase Pay</span>
                          <span className="text-xl">💳</span>
                        </div>
                        <div className="space-y-4">
                          {/* Card Number */}
                          <div className="text-xl font-bold tracking-widest min-h-7">
                            {cardNumber || '•••• •••• •••• ••••'}
                          </div>
                          {/* Card Holder & Expiry */}
                          <div className="flex justify-between items-end">
                            <div>
                              <div className="text-[9px] uppercase tracking-wider text-indigo-300">Card Holder</div>
                              <div className="text-sm font-semibold truncate max-w-44 min-h-5">
                                {cardHolder.toUpperCase() || 'YOUR NAME'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[9px] uppercase tracking-wider text-indigo-300">Expires</div>
                              <div className="text-sm font-semibold min-h-5">
                                {cardExpiry || 'MM/YY'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* BACK OF THE CARD */}
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl text-white backface-hidden rotateY-180 flex flex-col justify-between py-6 border border-white/20">
                        {/* Magnetic Strip */}
                        <div className="w-full h-10 bg-slate-800" />
                        
                        {/* Signature + CVV */}
                        <div className="px-6 space-y-2">
                          <div className="text-[9px] uppercase tracking-wider text-slate-400">Security Code (CVV)</div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-8 bg-white/10 rounded-lg flex items-center justify-end px-3 font-semibold text-slate-300 italic tracking-widest text-xs">
                              {cardHolder ? cardHolder.slice(0, 10).toUpperCase() : 'Signature'}
                            </div>
                            <div className="w-14 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-slate-950 text-sm">
                              {cardCVV || '•••'}
                            </div>
                          </div>
                        </div>
                        <div className="px-6 text-[8px] text-slate-500 text-center">
                          Authorized Signature • Not Transferable • RentEase Guard Security Verified
                        </div>
                      </div>

                    </motion.div>
                  </div>
                </div>

                {/* Form fields */}
                <div className="glass-card rounded-3xl p-6 border border-white/8 space-y-6">
                  <h2 className="text-xl font-bold text-white">Payment Method</h2>
                  <form onSubmit={handlePay} className="space-y-4">
                    
                    {/* Cardholder Name */}
                    <div>
                      <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                        Cardholder Name
                      </label>
                      <input 
                        type="text" 
                        placeholder="John Doe"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>

                    {/* Card Number */}
                    <div>
                      <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                        Card Number
                      </label>
                      <input 
                        type="text" 
                        placeholder="4532 7182 9901 2345"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="input-field"
                        required
                      />
                    </div>

                    {/* Expiry & CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                          Expiration Date
                        </label>
                        <input 
                          type="text" 
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                          CVV Code
                        </label>
                        <input 
                          type="password" 
                          placeholder="•••"
                          maxLength={3}
                          value={cardCVV}
                          onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, ''))}
                          onFocus={() => setIsCVVFocused(true)}
                          onBlur={() => setIsCVVFocused(false)}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>

                    {/* Pay Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-primary py-4 text-sm font-bold flex items-center justify-center gap-2 mt-4"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing Transaction...
                        </>
                      ) : (
                        `⚡ Securely Pay ₹${total.toLocaleString()}`
                      )}
                    </button>

                  </form>
                </div>

              </div>

              {/* Sidebar: Order Summary */}
              <div className="lg:col-span-5">
                <div className="glass-card rounded-3xl p-6 border border-white/8 shadow-glass space-y-6">
                  <h3 className="text-white font-bold text-lg border-b border-white/8 pb-4">Booking Summary</h3>
                  
                  {/* Property short summary */}
                  <div className="flex gap-4 items-center">
                    <img 
                      src={property.image} 
                      alt={property.title} 
                      className="w-20 h-20 object-cover rounded-2xl border border-white/8 shrink-0" 
                    />
                    <div>
                      <h4 className="text-white font-bold text-sm line-clamp-1">{property.title}</h4>
                      <p className="text-slate-400 text-xs mt-1">{property.location}</p>
                      <p className="text-xs text-slate-500 mt-1 capitalize">{property.type}</p>
                    </div>
                  </div>

                  {/* Dates & duration summary */}
                  <div className="bg-white/3 rounded-2xl p-4 text-xs space-y-2.5">
                    <div className="flex justify-between text-slate-400">
                      <span>Rent Period:</span>
                      <span className="text-white font-semibold">{months} Month{months > 1 ? 's' : ''}</span>
                    </div>
                    {moveIn && moveOut && (
                      <>
                        <div className="flex justify-between text-slate-400">
                          <span>Check-in:</span>
                          <span className="text-white font-medium">{moveIn}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Check-out:</span>
                          <span className="text-white font-medium">{moveOut}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Billing Details */}
                  <div className="space-y-3 pt-2 text-sm">
                    <div className="flex justify-between text-slate-400">
                      <span>Monthly Rent</span>
                      <span className="text-white font-medium">₹{property.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Security Deposit (Refundable)</span>
                      <span className="text-white font-medium">₹{Math.round(property.price * 1.5).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Platform Fee</span>
                      <span className="text-white font-medium">₹{Math.round(property.price * 0.05).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-white font-black border-t border-white/8 pt-4 text-base">
                      <span>Final Paid Amount</span>
                      <span className="gradient-text">₹{total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Trust badges */}
                  <div className="flex justify-center gap-6 text-slate-500 text-xs border-t border-white/8 pt-4">
                    <div className="flex items-center gap-1.5">
                      <span>🛡️</span> SSL Secured
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>🤝</span> Trust Guarantee
                    </div>
                  </div>

                </div>
              </div>

            </motion.div>
          ) : (
            
            /* Success confirmation screen */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full mx-auto glass-card rounded-4xl p-8 border border-primary-500/30 text-center shadow-glow space-y-6"
            >
              {/* Checkmark animation */}
              <div className="flex justify-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-green-400 rounded-full flex items-center justify-center shadow-lg border border-emerald-300/30"
                >
                  <svg className="w-10 h-10 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">Booking Confirmed!</h2>
                <p className="text-slate-400 text-sm">
                  Your payment of <span className="text-primary-300 font-bold">₹{total.toLocaleString()}</span> was processed successfully.
                </p>
              </div>

              {/* Transaction ID summary */}
              <div className="bg-white/3 rounded-2xl p-4 text-left space-y-3 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Transaction ID:</span>
                  <span className="text-white font-mono">TXN_RE_982741982749</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Property Name:</span>
                  <span className="text-white font-medium">{property.title}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold">RentPaid & Booked</span>
                </div>
              </div>

              {/* Navigation CTAs */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/bookings')}
                  className="w-full btn-primary py-3.5 text-sm font-bold"
                >
                  📋 View My Bookings
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full glass py-3.5 text-sm font-bold text-slate-300 hover:text-white border border-white/8 hover:bg-white/5 rounded-xl transition-all"
                >
                  🏠 Back to Homepage
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
