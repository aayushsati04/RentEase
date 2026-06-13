import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { featuredProperties } from '../data/sampleData';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

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

  // DB and Razorpay states
  const [dbProperty, setDbProperty] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [txnId, setTxnId] = useState('');

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

  useEffect(() => {
    let active = true;
    const fetchPropertyAndCreateBooking = async () => {
      try {
        setLoading(true);
        if (!user) {
          toast.error('Authentication required for checkout');
          setLoading(false);
          return;
        }

        // Fetch properties from database by ID
        const { data: matched, error: pError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();
        
        if (pError) throw pError;
        
        if (!active) return;
        setDbProperty(matched);
        
        // Create booking in the database
        const checkInDate = moveIn ? new Date(moveIn) : new Date();
        const checkOutDate = moveOut ? new Date(moveOut) : new Date(checkInDate.getTime() + 30 * 24 * 60 * 60 * 1000);

        const { data: newBooking, error: bookingErr } = await supabase
          .from('bookings')
          .insert({
            property_id: matched.id,
            tenant_id: user.id,
            check_in: checkInDate.toISOString(),
            check_out: checkOutDate.toISOString(),
            status: 'pending'
          })
          .select()
          .single();

        if (bookingErr) throw bookingErr;

        if (active) {
          setBooking({
            ...newBooking,
            _id: newBooking.id // Compatibility mapping
          });
        }
      } catch (err) {
        console.error('Checkout initialization error:', err);
        // Fallback simulate booking for offline/test environments
        if (active) {
          setBooking({
            id: 'mock_bk_' + Math.random().toString(36).substring(2, 9),
            _id: 'mock_bk_' + Math.random().toString(36).substring(2, 9)
          });
          toast.error('Using test/sandbox booking fallback.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    
    fetchPropertyAndCreateBooking();

    return () => {
      active = false;
    };
  }, [id, user, moveIn, moveOut]);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!booking) {
      toast.error('Booking not initialized yet');
      return;
    }
    setIsSubmitting(true);

    try {
      // 1. Create Payment Session / Order on backend serverless function
      const sessionRes = await axios.post('/api/payments/create', {
        bookingId: booking._id,
        amount: total,
        paymentMethod: 'card'
      }, { baseURL: '' });

      const paymentSession = sessionRes.data.data;
      if (!paymentSession) {
        throw new Error('No payment session returned from backend');
      }

      // 2. Demo simulation fallback if dummy key is used
      if (paymentSession.razorpayKeyId === 'rzp_test_dummykeyid123') {
        const loadingToastId = toast.loading('Demo Mode: Simulating secure payment...');
        setTimeout(async () => {
          try {
            const mockPaymentId = `pay_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
            const mockSignature = `sig_${Math.random().toString(36).substring(2, 16).toUpperCase()}`;

            const verifyRes = await axios.post('/api/payments/verify', {
              paymentId: paymentSession._id || paymentSession.id,
              razorpay_payment_id: mockPaymentId,
              razorpay_order_id: paymentSession.razorpayOrderId,
              razorpay_signature: mockSignature
            }, { baseURL: '' });

            if (verifyRes.data.success) {
              setTxnId(mockPaymentId);
              setIsSuccess(true);
              toast.success('Payment Verified & Booking Confirmed!', { id: loadingToastId });
            } else {
              toast.error('Payment verification failed.', { id: loadingToastId });
            }
          } catch (err) {
            console.error('Mock verification failed:', err);
            toast.error(err.response?.data?.message || 'Payment verification failed', { id: loadingToastId });
          } finally {
            setIsSubmitting(false);
          }
        }, 2000);
        return;
      }

      // 3. Load Razorpay script (only needed for real checkout)
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setIsSubmitting(false);
        return;
      }

      // 4. Configure and Open Razorpay Checkout Modal
      const options = {
        key: paymentSession.razorpayKeyId,
        amount: Math.round(total * 100),
        currency: 'INR',
        name: 'RentEase Payments',
        description: `Booking Rent Payment - ${property.title}`,
        order_id: paymentSession.razorpayOrderId,
        handler: async function (response) {
          try {
            setIsSubmitting(true);
            // Verify signature on serverless backend
            const verifyRes = await axios.post('/api/payments/verify', {
              paymentId: paymentSession._id || paymentSession.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            }, { baseURL: '' });

            if (verifyRes.data.success) {
              setTxnId(response.razorpay_payment_id);
              setIsSuccess(true);
              toast.success('Payment Verified & Booking Confirmed!');
            } else {
              toast.error('Payment verification failed.');
            }
          } catch (err) {
            console.error('Razorpay verification callback failed:', err);
            toast.error(err.response?.data?.message || 'Payment verification failed');
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#4f62f1'
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            toast.error('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Razorpay initialization flow failed:', err);
      toast.error(err.response?.data?.message || 'Failed to start payment process');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 pb-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Initializing your secure booking...</p>
        </div>
      </div>
    );
  }

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
                  <span className="text-white font-mono">{txnId || 'TXN_RE_982741982749'}</span>
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
