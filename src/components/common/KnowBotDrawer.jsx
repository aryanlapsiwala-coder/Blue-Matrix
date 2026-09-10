import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { chatService } from '../../services/chatService';
import { Button } from './Button';
import {
  Bot,
  User,
  Sparkles,
  Send,
  X,
  ChevronRight,
  Database,
  Search,
  RotateCcw,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

const QUICK_PROMPTS = [
  { label: '⚡ Fix CUDA Out of Memory on DGX', query: 'How to fix CUDA Out of Memory error on the campus NVIDIA DGX SuperPOD?' },
  { label: '💼 Google SDE-1 Interview Playbook', query: 'What are the interview rounds and compensation for Google SDE-1?' },
  { label: '🔬 Zero-Calibrate Instron UTM', query: 'How do I zero-calibrate the Instron 100kN Tensile Tester?' },
  { label: '📜 Capstone Thesis Guidelines', query: 'What are the formatting and review rubrics for final year capstone thesis?' },
];

export function KnowBotDrawer({ isOpen, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'drawer_welcome',
      sender: 'bot',
      text: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I am **KnowBot**. Ask me any question while you browse, and I'll find the verified answer from campus documents.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: [],
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages, loading]);

  if (!isOpen) return null;

  const executeQuery = async (queryText) => {
    if (!queryText || loading) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatService.askKnowBot(queryText, messages);
      const botMsg = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: res.citations || [],
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: 'Unable to connect to KnowBot. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const query = input.trim();
    if (!query) return;
    executeQuery(query);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 z-50 backdrop-blur-xs animate-in fade-in"
      />

      {/* Right Drawer Panel */}
      <aside className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-brand-500 text-white flex items-center justify-center shadow-sm shadow-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">KnowBot Quick Assistant</h3>
              <p className="text-[10px] text-slate-400">Campus Grounded RAG</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Stream */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                    isUser ? 'bg-slate-900 text-white' : 'bg-indigo-600 text-white'
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div className="max-w-[82%] space-y-2">
                  <div
                    className={`p-3 rounded-2xl ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className="block text-[9px] text-slate-400 mt-1">{msg.timestamp}</span>
                  </div>

                  {/* Drawer Mini Citations */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Source ({msg.citations[0].matchPercentage}% Match):
                      </p>
                      <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px]">
                        <p className="font-bold text-indigo-950 truncate">
                          {msg.citations[0].title}
                        </p>
                        <p className="text-slate-500 text-[9px]">By {msg.citations[0].author}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Quick-Prompt Suggested Chips */}
          {messages.length <= 2 && (
            <div className="pt-2 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Frequently Asked Campus Questions:
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {QUICK_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => executeQuery(p.query)}
                    className="p-2.5 bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-100 rounded-xl text-left text-[11px] font-semibold text-indigo-950 transition flex items-center justify-between group"
                  >
                    <span>{p.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-700 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-[11px] text-indigo-600 font-medium animate-pulse">
              <Sparkles className="w-3 h-3" />
              <span>KnowBot is retrieving campus sources...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a quick question..."
              className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500"
            />
            <Button type="submit" size="sm" disabled={!input.trim() || loading} className="px-3">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </aside>
    </>
  );
}
