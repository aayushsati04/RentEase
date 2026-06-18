import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { featuredProperties } from '../../data/sampleData';

// ─── Intelligent Response Engine ─────────────────────────────────────────────
const FAQ_RESPONSES = {
  booking: {
    keywords: ['book', 'booking', 'reserve', 'reservation', 'how to book', 'schedule'],
    response: `To book a property on RentEase:\n\n1. Browse properties and find one you love\n2. Click on the property to view details\n3. Click "Book Now" or "Schedule Visit"\n4. Choose your move-in date and duration\n5. Complete the secure payment\n\nYou can track all your bookings from your Dashboard → Bookings tab.`
  },
  payment: {
    keywords: ['pay', 'payment', 'rent', 'money', 'transaction', 'razorpay', 'refund', 'cost', 'fee', 'charge', 'deposit', 'security deposit'],
    response: `RentEase uses Razorpay for secure payments. Here's what you need to know:\n\n💳 **Payment Methods**: UPI, Cards, Net Banking, Wallets\n🔒 **Security**: Bank-grade encryption on all transactions\n📄 **Receipts**: Auto-generated for every payment\n💰 **Security Deposit**: Typically 1-2 months rent\n🔄 **Refunds**: Processed within 5-7 business days\n\nAll payment details are available in your Dashboard.`
  },
  landlord: {
    keywords: ['landlord', 'owner', 'list property', 'add property', 'listing', 'rent out', 'my property'],
    response: `As a landlord on RentEase, you can:\n\n🏠 **List Properties**: Go to Dashboard → "Add Property"\n📊 **Track Earnings**: View revenue analytics on your dashboard\n📋 **Manage Bookings**: Accept or decline tenant requests\n💬 **Chat with Tenants**: Communicate directly via Messages\n✅ **Verification**: Get your properties verified for higher visibility\n\nSign up as a "Landlord" to access these features.`
  },
  tenant: {
    keywords: ['tenant', 'renter', 'find property', 'search', 'looking for', 'flat', 'apartment', 'house', 'room'],
    response: `As a tenant on RentEase, you can:\n\n🔍 **Search Properties**: Use filters for location, budget, and type\n❤️ **Save Favorites**: Bookmark properties you like\n📅 **Book Visits**: Schedule property tours\n💬 **Chat with Owners**: Communicate directly with landlords\n📋 **Track Bookings**: Manage all your bookings in one place\n\nStart by browsing our Properties page!`
  },
  verification: {
    keywords: ['verify', 'verified', 'verification', 'trust', 'safe', 'genuine', 'authentic', 'real'],
    response: `RentEase verification ensures your safety:\n\n✅ **Property Verification**: Our team physically inspects listings\n🛡️ **Identity Verification**: Both landlords and tenants are verified\n📸 **Photo Verification**: All images are verified as authentic\n⭐ **Rating System**: Transparent reviews from real users\n🔒 **Secure Payments**: Razorpay-powered transactions\n\nLook for the ✓ badge on verified listings.`
  },
  contact: {
    keywords: ['contact', 'support', 'help', 'customer service', 'email', 'phone', 'reach'],
    response: `You can reach RentEase support through:\n\n📧 **Email**: support@rentease.in\n📞 **Phone**: 1800-RENT-EASE (toll-free)\n💬 **Live Chat**: You're using it right now!\n🕐 **Hours**: 24/7 support available\n\nFor urgent issues, call our toll-free number for immediate assistance.`
  },
  pricing: {
    keywords: ['price', 'pricing', 'free', 'commission', 'subscription', 'plan'],
    response: `RentEase pricing is transparent:\n\n🆓 **Tenants**: Free to search, browse, and book\n🏠 **Landlords**: Free listing for up to 3 properties\n💎 **Premium Plan**: ₹999/month for unlimited listings + analytics\n💰 **Commission**: Only 2% on successful bookings\n\nNo hidden fees. No surprises.`
  },
};

const CITY_DATA = {
  mumbai: { name: 'Mumbai', areas: ['Bandra West', 'Andheri', 'Powai', 'Lower Parel', 'Juhu'], avgRent: '₹25,000 - ₹1,50,000' },
  pune: { name: 'Pune', areas: ['Koregaon Park', 'Hinjewadi', 'Viman Nagar', 'Kothrud', 'Wakad'], avgRent: '₹12,000 - ₹65,000' },
  bangalore: { name: 'Bangalore', areas: ['Indiranagar', 'Whitefield', 'Koramangala', 'HSR Layout', 'JP Nagar'], avgRent: '₹15,000 - ₹80,000' },
  delhi: { name: 'Delhi', areas: ['Hauz Khas', 'Greater Kailash', 'Dwarka', 'Rohini', 'Saket'], avgRent: '₹15,000 - ₹1,00,000' },
  noida: { name: 'Noida', areas: ['Sector 62', 'Sector 18', 'Sector 137', 'Greater Noida West'], avgRent: '₹8,000 - ₹45,000' },
  gurugram: { name: 'Gurugram', areas: ['Cyber City', 'Golf Course Road', 'Sohna Road', 'Sector 56'], avgRent: '₹15,000 - ₹1,20,000' },
  hyderabad: { name: 'Hyderabad', areas: ['Madhapur', 'Gachibowli', 'Banjara Hills', 'Jubilee Hills'], avgRent: '₹10,000 - ₹60,000' },
  chennai: { name: 'Chennai', areas: ['T. Nagar', 'Adyar', 'Anna Nagar', 'OMR', 'Velachery'], avgRent: '₹10,000 - ₹50,000' },
};

const BUDGET_RANGES = [
  { max: 10000, label: 'budget-friendly', types: ['PG', 'Shared Room'] },
  { max: 20000, label: 'affordable', types: ['Studio', 'PG', '1BHK'] },
  { max: 40000, label: 'mid-range', types: ['1BHK', '2BHK', 'Apartment'] },
  { max: 80000, label: 'premium', types: ['2BHK', '3BHK', 'Villa'] },
  { max: Infinity, label: 'luxury', types: ['Penthouse', 'Villa', 'Luxury Apartment'] },
];

function getIntelligentResponse(message, navigate) {
  const lower = message.toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|howdy|sup|greetings|good (morning|afternoon|evening))/.test(lower)) {
    return {
      text: `Hello! 👋 Welcome to RentEase AI Assistant.\n\nI can help you with:\n🏠 Finding properties by budget, city, or type\n❓ Answering questions about bookings & payments\n🧭 Navigating the platform\n\nWhat would you like to know?`,
      suggestions: ['Find properties in Mumbai', 'How to book?', 'Pricing info']
    };
  }

  // Thanks
  if (/^(thanks|thank you|thx|ty|appreciate)/.test(lower)) {
    return {
      text: `You're welcome! 😊 Happy to help. Is there anything else you'd like to know about RentEase?`,
      suggestions: ['Browse properties', 'How payments work', 'Contact support']
    };
  }

  // Goodbye
  if (/^(bye|goodbye|see you|exit|quit|close)/.test(lower)) {
    return {
      text: `Goodbye! 👋 Feel free to come back anytime. Happy house hunting! 🏡`,
      suggestions: []
    };
  }

  // Budget-based property recommendation
  const budgetMatch = lower.match(/(\d[\d,]*)\s*(k|thousand|lakh|lac)?/);
  if (budgetMatch && (lower.includes('budget') || lower.includes('under') || lower.includes('within') || lower.includes('below') || lower.includes('afford') || lower.includes('max') || lower.includes('range') || lower.includes('rent'))) {
    let amount = parseInt(budgetMatch[1].replace(/,/g, ''));
    const unit = budgetMatch[2]?.toLowerCase();
    if (unit === 'k' || unit === 'thousand') amount *= 1000;
    if (unit === 'lakh' || unit === 'lac') amount *= 100000;

    const range = BUDGET_RANGES.find(r => amount <= r.max);
    const matchingProps = featuredProperties.filter(p => p.price <= amount);

    let response = `For a budget of ₹${amount.toLocaleString('en-IN')}, here are my recommendations:\n\n`;
    response += `📊 **Category**: ${range.label} properties\n`;
    response += `🏠 **Suggested Types**: ${range.types.join(', ')}\n\n`;

    if (matchingProps.length > 0) {
      response += `**Available Properties:**\n`;
      matchingProps.forEach(p => {
        response += `• ${p.title} — ${p.location} — ₹${p.price.toLocaleString('en-IN')}/mo\n`;
      });
      response += `\nClick "Browse Properties" to see all options!`;
    } else {
      response += `We have many properties in this range. Visit our Properties page to explore with detailed filters.`;
    }

    return {
      text: response,
      suggestions: ['Browse Properties', 'Show cheaper options', 'Premium properties'],
      action: matchingProps.length > 0 ? () => navigate('/properties') : null
    };
  }

  // City-based recommendations
  for (const [key, city] of Object.entries(CITY_DATA)) {
    if (lower.includes(key) || lower.includes(city.name.toLowerCase())) {
      const cityProps = featuredProperties.filter(p =>
        p.location.toLowerCase().includes(key) || p.location.toLowerCase().includes(city.name.toLowerCase())
      );

      let response = `🌆 **Properties in ${city.name}**\n\n`;
      response += `📍 **Popular Areas**: ${city.areas.join(', ')}\n`;
      response += `💰 **Rent Range**: ${city.avgRent}/month\n\n`;

      if (cityProps.length > 0) {
        response += `**Featured in ${city.name}:**\n`;
        cityProps.forEach(p => {
          response += `• ${p.title} — ${p.location} — ₹${p.price.toLocaleString('en-IN')}/mo ⭐${p.rating}\n`;
        });
      }

      response += `\nWant to explore all properties in ${city.name}?`;

      return {
        text: response,
        suggestions: [`Properties under ₹30K in ${city.name}`, 'Browse all properties', 'Other cities'],
        action: () => navigate('/properties')
      };
    }
  }

  // Property type queries
  const typeMap = {
    'apartment': 'Apartment', 'flat': 'Apartment', 'bhk': 'Apartment',
    'villa': 'Villa', 'bungalow': 'Villa',
    'studio': 'Studio', 'loft': 'Studio',
    'pg': 'PG', 'paying guest': 'PG', 'hostel': 'PG',
    'commercial': 'Commercial', 'office': 'Commercial', 'shop': 'Commercial',
  };

  for (const [keyword, type] of Object.entries(typeMap)) {
    if (lower.includes(keyword)) {
      const typeProps = featuredProperties.filter(p => p.type === type);
      let response = `🏠 **${type} Properties on RentEase**\n\n`;

      if (typeProps.length > 0) {
        typeProps.forEach(p => {
          response += `• **${p.title}**\n  📍 ${p.location} | 💰 ₹${p.price.toLocaleString('en-IN')}/mo | ⭐ ${p.rating}\n`;
        });
      }

      response += `\nWe have many more ${type.toLowerCase()} listings. Use our advanced filters to find the perfect match!`;

      return {
        text: response,
        suggestions: [`${type}s under ₹25K`, 'Browse properties', 'Compare types'],
        action: () => navigate('/properties')
      };
    }
  }

  // Navigation help
  if (lower.includes('navigate') || lower.includes('where') || lower.includes('find') || lower.includes('go to') || lower.includes('how do i get')) {
    return {
      text: `Here's a quick navigation guide for RentEase:\n\n🏠 **Home**: Browse featured properties and categories\n🔍 **Properties**: Search with advanced filters\n📊 **Dashboard**: Your profile, listings & analytics\n📋 **Bookings**: Track all your reservations\n💬 **Messages**: Chat with landlords/tenants\n\nWhat page would you like to visit?`,
      suggestions: ['Go to Properties', 'Go to Dashboard', 'Go to Bookings']
    };
  }

  // FAQ matching
  for (const [, faq] of Object.entries(FAQ_RESPONSES)) {
    if (faq.keywords.some(kw => lower.includes(kw))) {
      return {
        text: faq.response,
        suggestions: ['Browse properties', 'More questions', 'Contact support']
      };
    }
  }

  // Navigation action suggestions
  if (lower.includes('go to properties') || lower.includes('browse properties') || lower.includes('show properties') || lower.includes('see properties')) {
    return {
      text: `Taking you to our Properties page where you can explore all available listings with advanced filters! 🏠`,
      suggestions: [],
      action: () => navigate('/properties')
    };
  }
  if (lower.includes('go to dashboard') || lower.includes('my dashboard')) {
    return {
      text: `Redirecting to your Dashboard! 📊`,
      suggestions: [],
      action: () => navigate('/dashboard')
    };
  }
  if (lower.includes('go to bookings') || lower.includes('my bookings')) {
    return {
      text: `Taking you to your Bookings page! 📋`,
      suggestions: [],
      action: () => navigate('/bookings')
    };
  }

  // Default fallback
  return {
    text: `I appreciate your question! While I may not have a specific answer for that, I can help with:\n\n🏠 **Property Search**: "Find apartments in Mumbai under ₹30K"\n💳 **Payments**: "How do payments work?"\n📋 **Bookings**: "How to book a property?"\n🧭 **Navigation**: "Where do I find my bookings?"\n📞 **Support**: "How to contact support?"\n\nTry asking about any of these topics!`,
    suggestions: ['Properties in Mumbai', 'How to book?', 'Payment info', 'Contact support']
  };
}

// ─── Chat Bubble Component ───────────────────────────────────────────────────
function ChatMessage({ message, isBot, isTyping }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-3`}
    >
      {isBot && (
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0 mr-2 mt-1 shadow-md">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
          isBot
            ? 'bg-white border border-slate-200 text-slate-700 rounded-tl-md shadow-sm'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-md shadow-md'
        }`}
      >
        {isTyping ? (
          <div className="flex items-center gap-1.5 py-1 px-1">
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <span dangerouslySetInnerHTML={{
            __html: message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          }} />
        )}
      </div>
    </motion.div>
  );
}

// ─── Suggestion Pill ─────────────────────────────────────────────────────────
function SuggestionPill({ text, onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-full hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 whitespace-nowrap"
    >
      {text}
    </motion.button>
  );
}

// ─── Main AI Chatbot Component ───────────────────────────────────────────────
export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi, I'm RentEase AI. How can I help you find a property today? 🏡",
      isBot: true,
      suggestions: ['Find properties in Mumbai', 'How to book?', 'Pricing info', 'Contact support'],
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = useCallback((text) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      text: messageText,
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking delay
    const delay = 600 + Math.random() * 800;
    setTimeout(() => {
      const response = getIntelligentResponse(messageText, navigate);

      const botMsg = {
        id: Date.now() + 1,
        text: response.text,
        isBot: true,
        suggestions: response.suggestions || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);

      // Execute navigation action if present
      if (response.action) {
        setTimeout(() => response.action(), 1500);
      }

      // Increment unread if chat is closed
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    }, delay);
  }, [input, navigate, isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* ── Floating Chat Button ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center text-white hover:shadow-xl hover:shadow-blue-600/40 transition-shadow duration-300"
            aria-label="Open AI Assistant"
            id="ai-chatbot-toggle"
          >
            {/* Chat icon */}
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>

            {/* Unread badge */}
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}

            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-2xl bg-blue-500/30 animate-ping opacity-30 pointer-events-none" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-4rem)] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/20 border border-slate-200"
            style={{ background: '#f8fafc' }}
            id="ai-chatbot-window"
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-indigo-700 rounded-full" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold leading-tight keep-white">RentEase AI</h3>
                  <p className="text-[11px] text-blue-200 leading-tight">Always here to help</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Minimize */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close chat"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close chat"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ── Messages Area ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-hide" style={{ background: 'linear-gradient(180deg, #f0f4ff 0%, #f8fafc 100%)' }}>
              {messages.map((msg) => (
                <React.Fragment key={msg.id}>
                  <ChatMessage
                    message={msg.text}
                    isBot={msg.isBot}
                  />
                  {/* Suggestions */}
                  {msg.isBot && msg.suggestions && msg.suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex flex-wrap gap-1.5 ml-9 mb-3"
                    >
                      {msg.suggestions.map((s, i) => (
                        <SuggestionPill key={i} text={s} onClick={() => handleSend(s)} />
                      ))}
                    </motion.div>
                  )}
                </React.Fragment>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <ChatMessage message="" isBot isTyping />
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Area ── */}
            <div className="flex-shrink-0 border-t border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about properties, bookings..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  id="ai-chatbot-input"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Send message"
                  id="ai-chatbot-send"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </motion.button>
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-2">Powered by RentEase AI · Always here to help</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
