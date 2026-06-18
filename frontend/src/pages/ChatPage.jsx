import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import API from '../services/api';

export default function ChatPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [activeContactId, setActiveContactId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Fallback contacts list if no other registered users are found in database
  const fallbackContacts = useMemo(() => [
    {
      id: 'rohan-malhotra-mock-uuid',
      name: 'Rohan Malhotra',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
      property: 'Luxury Penthouse Suite',
      online: true,
      lastMsg: 'Let me know your preferred move-in schedule.'
    },
    {
      id: 'rahul-mehta-mock-uuid',
      name: 'Rahul Mehta',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      property: 'Modern Sea-View Villa',
      online: true,
      lastMsg: "Sure, let's schedule a site visit tomorrow."
    }
  ], []);

  // 1. Fetch other profiles to populate the sidebar contacts list
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        if (!user) return;

        if (user.isDemo) {
          const isLandlord = user.role === 'landlord' || user.role === 'owner';
          const contactsList = isLandlord ? [
            {
              id: 'priya-sharma-demo-uuid',
              name: 'Priya Sharma',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
              property: 'Luxury Penthouse Suite',
              online: true,
              lastMsg: 'Is the deposit negotiable?'
            },
            {
              id: 'vikram-singh-demo-uuid',
              name: 'Vikram Singh',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
              property: 'Modern Sea-View Villa',
              online: false,
              lastMsg: 'Let me check my calendar.'
            }
          ] : [
            {
              id: 'rohan-malhotra-demo-uuid',
              name: 'Rohan Malhotra',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
              property: 'Luxury Penthouse Suite',
              online: true,
              lastMsg: 'Let me know your preferred move-in schedule.'
            },
            {
              id: 'rahul-mehta-demo-uuid',
              name: 'Rahul Mehta',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
              property: 'Modern Sea-View Villa',
              online: true,
              lastMsg: "Sure, let's schedule a site visit tomorrow."
            }
          ];
          setProfiles(contactsList);
          setActiveContactId(contactsList[0].id);
          return;
        }

        const { data: response } = await API.get('/api/auth/users');
        const data = response.data || [];

        const contactsList = data.map(p => ({
          id: p._id,
          name: p.name,
          avatar: `https://images.unsplash.com/photo-${p.role === 'landlord' ? '1507003211169-0a1dd7228f2d' : '1494790108377-be9c29b29330'}?w=100&q=80`,
          property: p.role === 'landlord' ? 'Landlord / Partner' : 'Renter / Tenant',
          online: Math.random() > 0.4,
          lastMsg: 'Select thread to chat'
        }));

        if (contactsList.length > 0) {
          setProfiles(contactsList);
          setActiveContactId(contactsList[0].id);
        } else {
          setProfiles(fallbackContacts);
          setActiveContactId(fallbackContacts[0].id);
        }
      } catch (err) {
        console.error('Error loading profiles:', err);
        setProfiles(fallbackContacts);
        setActiveContactId(fallbackContacts[0].id);
      }
    };

    fetchProfiles();
  }, [user, fallbackContacts]);

  // 2. Fetch messages for selected contact thread
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!user || !activeContactId) return;

        if (user.isDemo) {
          const nowStr = new Date();
          const t1 = new Date(nowStr - 600000).toISOString();
          const t2 = new Date(nowStr - 300000).toISOString();
          const t3 = new Date(nowStr - 60000).toISOString();

          let mockMsgs = [];
          if (activeContactId === 'rohan-malhotra-demo-uuid') {
            mockMsgs = [
              { sender_id: 'rohan-malhotra-demo-uuid', receiver_id: user.id, message: 'Hello! Welcome to RentEase. Are you interested in the Luxury Penthouse Suite?', created_at: t1 },
              { sender_id: user.id, receiver_id: 'rohan-malhotra-demo-uuid', message: 'Yes, it looks amazing. What is the minimum lease term?', created_at: t2 },
              { sender_id: 'rohan-malhotra-demo-uuid', receiver_id: user.id, message: 'We require a minimum 6-month lease. Let me know your preferred move-in schedule.', created_at: t3 }
            ];
          } else if (activeContactId === 'rahul-mehta-demo-uuid') {
            mockMsgs = [
              { sender_id: 'rahul-mehta-demo-uuid', receiver_id: user.id, message: 'Hey there! I saw you liked the Modern Sea-View Villa.', created_at: t1 },
              { sender_id: user.id, receiver_id: 'rahul-mehta-demo-uuid', message: 'Yes! Can we schedule a viewing this weekend?', created_at: t2 },
              { sender_id: 'rahul-mehta-demo-uuid', receiver_id: user.id, message: "Sure, let's schedule a site visit tomorrow.", created_at: t3 }
            ];
          } else if (activeContactId === 'priya-sharma-demo-uuid') {
            mockMsgs = [
              { sender_id: 'priya-sharma-demo-uuid', receiver_id: user.id, message: 'Hello! I am very interested in your Penthouse.', created_at: t1 },
              { sender_id: user.id, receiver_id: 'priya-sharma-demo-uuid', message: 'Hi Priya! Thanks for reaching out. Do you have any questions?', created_at: t2 },
              { sender_id: 'priya-sharma-demo-uuid', receiver_id: user.id, message: 'Yes, is the deposit negotiable?', created_at: t3 }
            ];
          } else if (activeContactId === 'vikram-singh-demo-uuid') {
            mockMsgs = [
              { sender_id: 'vikram-singh-demo-uuid', receiver_id: user.id, message: 'Hi, is this Sea-view Villa still available for July?', created_at: t1 },
              { sender_id: user.id, receiver_id: 'vikram-singh-demo-uuid', message: 'Yes, it is available. Would you like to schedule a call?', created_at: t2 },
              { sender_id: 'vikram-singh-demo-uuid', receiver_id: user.id, message: 'Let me check my calendar.', created_at: t3 }
            ];
          }
          setMessages(mockMsgs);
          return;
        }

        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeContactId}),and(sender_id.eq.${activeContactId},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [user, activeContactId]);

  // 3. Subscribe to Realtime database inserts for instant chat synchronization
  useEffect(() => {
    if (!user || !activeContactId || user.isDemo) return;

    const channel = supabase
      .channel(`chat-room-${activeContactId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chats'
        },
        (payload) => {
          const newMsg = payload.new;
          if (
            (newMsg.sender_id === user.id && newMsg.receiver_id === activeContactId) ||
            (newMsg.sender_id === activeContactId && newMsg.receiver_id === user.id)
          ) {
            setMessages(prev => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeContactId]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const activeContact = profiles.find(c => c.id === activeContactId);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !activeContactId) return;

    const messageText = inputText;
    setInputText('');

    try {
      if (user.isDemo || activeContactId.includes('demo') || activeContactId.includes('mock')) {
        const userMsg = {
          sender_id: user.id,
          receiver_id: activeContactId,
          message: messageText,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMsg]);

        // Update contacts lastMsg locally
        setProfiles(prev => prev.map(p => p.id === activeContactId ? { ...p, lastMsg: messageText } : p));

        // Simulate auto-reply typing effect
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const replyText = `Thanks for your message: "${messageText}". I am currently away, but I will review this shortly! Let me know if you would like to schedule a call.`;
          const replyMsg = {
            sender_id: activeContactId,
            receiver_id: user.id,
            message: replyText,
            created_at: new Date().toISOString()
          };
          setMessages(prev => [...prev, replyMsg]);

          // Update contacts lastMsg locally for the reply
          setProfiles(prev => prev.map(p => p.id === activeContactId ? { ...p, lastMsg: replyText } : p));
        }, 1500);

        return;
      }

      const { error } = await supabase
        .from('chats')
        .insert({
          sender_id: user.id,
          receiver_id: activeContactId,
          message: messageText
        });

      if (error) throw error;

      // Local append if realtime is slower or for mock users
      if (activeContactId.includes('mock')) {
        setMessages(prev => [...prev, {
          sender_id: user.id,
          receiver_id: activeContactId,
          message: messageText,
          created_at: new Date().toISOString()
        }]);

        // Simulate auto-reply typing effect for mock landlords
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, {
            sender_id: activeContactId,
            receiver_id: user.id,
            message: `Hi! Thanks for reaching out about the listing. I have received your message. I am currently away, but I will get back to you shortly.`,
            created_at: new Date().toISOString()
          }]);
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message');
    }
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
              {profiles.map((c) => {
                const active = c.id === activeContactId;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveContactId(c.id);
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
                  {messages.map((msg, idx) => {
                    const isMe = msg.sender_id === user.id;
                    const timeFormatted = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl p-4 text-sm leading-relaxed border ${
                          isMe 
                            ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white border-primary-500/25 shadow-glow-sm rounded-tr-none' 
                            : 'bg-white/5 text-slate-300 border-white/8 rounded-tl-none'
                        }`}>
                          <p>{msg.message}</p>
                          <span className="text-[9px] text-slate-400/80 block text-right mt-1.5 font-medium">{timeFormatted}</span>
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
