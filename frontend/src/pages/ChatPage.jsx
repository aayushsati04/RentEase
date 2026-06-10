import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CONTACTS = [
  {
    id: 1,
    name: 'Rohan Malhotra',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    property: 'Luxury Penthouse Suite',
    online: true,
    lastMsg: 'Let me know your preferred move-in schedule.',
    unread: 1,
    history: [
      { sender: 'them', text: 'Hello! Thanks for showing interest in the Luxury Penthouse.', time: '10:04 AM' },
      { sender: 'me', text: 'Hi Rohan! Is the parking space suitable for SUVs?', time: '10:15 AM' },
      { sender: 'them', text: 'Yes, we have 2 designated basement slots suitable for large SUVs.', time: '10:17 AM' },
      { sender: 'them', text: 'Let me know your preferred move-in schedule.', time: '10:18 AM' }
    ]
  },
  {
    id: 2,
    name: 'Rahul Mehta',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    property: 'Modern Sea-View Villa',
    online: true,
    lastMsg: "Sure, let's schedule a site visit tomorrow.",
    unread: 0,
    history: [
      { sender: 'me', text: 'Hi Rahul, is the sea-view villa available from next month?', time: 'Yesterday' },
      { sender: 'them', text: "Sure, let's schedule a site visit tomorrow.", time: 'Yesterday' }
    ]
  },
  {
    id: 3,
    name: 'Sumit Sharma',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    property: 'Furnished PG with Meals',
    online: false,
    lastMsg: 'Your booking has been completed.',
    unread: 0,
    history: [
      { sender: 'them', text: 'Your booking has been completed.', time: 'June 5' }
    ]
  }
];

export default function ChatPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState(CONTACTS);
  const [activeContactId, setActiveContactId] = useState(1);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const activeContact = contacts.find(c => c.id === activeContactId);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeContact?.history, isTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      sender: 'me',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update active contact message history
    const updated = contacts.map(c => {
      if (c.id === activeContactId) {
        return {
          ...c,
          lastMsg: inputText,
          history: [...c.history, newMsg]
        };
      }
      return c;
    });

    setContacts(updated);
    setInputText('');

    // Simulate dynamic auto-reply typing effect
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply = {
        sender: 'them',
        text: `Thanks for the update! I've received your message. I am currently out of office, but I will get back to you shortly regarding this.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      const addedReply = updated.map(c => {
        if (c.id === activeContactId) {
          return {
            ...c,
            lastMsg: reply.text,
            history: [...c.history, reply]
          };
        }
        return c;
      });
      setContacts(addedReply);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16 flex items-center justify-center">
      <div className="max-w-6xl w-full h-[600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Chat Wrapper */}
        <div className="glass-card w-full h-full rounded-3xl overflow-hidden border border-white/8 shadow-glass grid grid-cols-12">
          
          {/* Contacts Sidebar */}
          <div className="col-span-12 md:col-span-4 border-r border-white/8 flex flex-col h-full bg-slate-900/40">
            {/* Search Header */}
            <div className="p-4 border-b border-white/8">
              <h3 className="text-white font-black text-lg mb-3">Conversations</h3>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search contacts..." 
                  className="input-field py-2 text-xs pl-8"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
              </div>
            </div>

            {/* Contacts list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
              {contacts.map((c) => {
                const active = c.id === activeContactId;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveContactId(c.id);
                      // Clear unread badge
                      setContacts(contacts.map(item => item.id === c.id ? { ...item, unread: 0 } : item));
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left ${
                      active ? 'bg-primary-600/20 border border-primary-500/20' : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-xl object-cover" />
                      {c.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-white font-bold text-sm truncate">{c.name}</h4>
                        {c.unread > 0 && (
                          <span className="w-2.5 h-2.5 bg-primary-500 rounded-full shrink-0 shadow-glow-sm" />
                        )}
                      </div>
                      <p className="text-slate-500 text-xs truncate mt-0.5">{c.property}</p>
                      <p className="text-slate-400 text-xs truncate mt-1 leading-snug">{c.lastMsg}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Messages Chat Area */}
          <div className="col-span-12 md:col-span-8 flex flex-col h-full bg-slate-950/20">
            {activeContact ? (
              <>
                {/* Active contact header */}
                <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between bg-slate-900/20">
                  <div className="flex items-center gap-3">
                    <img src={activeContact.avatar} alt={activeContact.name} className="w-9 h-9 rounded-xl object-cover" />
                    <div>
                      <h4 className="text-white font-bold text-sm leading-tight">{activeContact.name}</h4>
                      <p className="text-slate-500 text-[10px] mt-0.5">{activeContact.property}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-slate-400 text-xs">Active Now</span>
                  </div>
                </div>

                {/* Messages stream */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                  {activeContact.history.map((msg, idx) => {
                    const isMe = msg.sender === 'me';
                    return (
                      <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl p-4 text-sm leading-relaxed border ${
                          isMe 
                            ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white border-primary-500/25 shadow-glow-sm rounded-tr-none' 
                            : 'bg-white/5 text-slate-300 border-white/8 rounded-tl-none'
                        }`}>
                          <p>{msg.text}</p>
                          <span className="text-[9px] text-slate-400/80 block text-right mt-1.5 font-medium">{msg.time}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-none p-4 text-slate-400 text-xs flex items-center gap-1.5">
                        <span>{activeContact.name} is typing</span>
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input action footer */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-white/8 flex gap-3 bg-slate-900/20">
                  <input 
                    type="text" 
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="input-field py-3 text-sm flex-1"
                  />
                  <button 
                    type="submit"
                    className="px-5 py-3 bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all duration-200 hover:shadow-glow flex items-center justify-center shrink-0"
                  >
                    Send ⚡
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm">
                <p>Select a contact thread to begin messaging.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
