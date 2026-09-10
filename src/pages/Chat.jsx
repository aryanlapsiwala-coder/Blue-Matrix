import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { chatService } from '../services/chatService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { formatDate } from '../utils/formatters';
import {
  Bot,
  User,
  Sparkles,
  Send,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Copy,
  Check,
  Search,
  Database,
  X,
  FileText,
  ThumbsUp,
  Download,
  Youtube
} from 'lucide-react';

const STARTER_PROMPTS = [
  'How do I submit GPU batch jobs on the campus HPC cluster?',
  'What were the 5 interview rounds in the Google placement drive?',
  'What are the election timeouts and heartbeat rules in Raft CS-402?',
  'How do I configure eduroam Wi-Fi certificates on Linux & Mac?',
  'What are the best practices for Verilog testbenches in VLSI lab?',
];

export function Chat() {
  const { user, role } = useAuth();

  const [messages, setMessages] = useState([
    {
      id: 'msg_welcome',
      sender: 'bot',
      text: `Hello, **${user?.name || 'Scholar'}**! 👋 I am **KnowBot**, your campus AI knowledge assistant.

I am trained on verified **university lecture notes**, **laboratory SOPs**, **equipment manuals**, and **student placement playbooks** from our campus.

Ask me any technical question, and I will synthesize a grounded response with direct source citations from our repository.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: [],
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedCitationDoc, setSelectedCitationDoc] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, searchStatus]);

  const handleSendMessage = async (textToSend = inputValue) => {
    const queryText = textToSend.trim();
    if (!queryText || isTyping) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Multi-stage RAG status animation
    setSearchStatus('Searching campus vector database embeddings...');
    setTimeout(() => {
      setSearchStatus('Retrieving top-3 grounded campus source documents...');
    }, 450);

    try {
      const response = await chatService.askKnowBot(queryText, messages);

      setTimeout(() => {
        const botMsg = {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: response.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: response.citations || [],
          ragMetadata: response.ragMetadata,
        };

        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        setSearchStatus('');
      }, 700);
    } catch {
      setIsTyping(false);
      setSearchStatus('');
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: 'I encountered an error connecting to the knowledge base. Please check the network connection and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: [],
        },
      ]);
    }
  };

  const handleCopyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-brand-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">KnowBot Assistant</h1>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                Grounded on Campus Corpus
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Retrieval-Augmented Generation across verified lecture notes, lab SOPs & placement guides
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setMessages([
              {
                id: 'msg_welcome',
                sender: 'bot',
                text: 'Chat history cleared. How can I assist you with your campus studies or lab work today?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                citations: [],
              },
            ])
          }
          className="text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          Clear Conversation
        </Button>
      </div>

      {/* Main Chat Box */}
      <Card className="flex-1 flex flex-col p-0 overflow-hidden border border-slate-200/80 shadow-md">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-slate-900 text-white'
                      : 'bg-gradient-to-tr from-indigo-600 to-brand-500 text-white shadow-md shadow-indigo-500/30'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Body */}
                <div className={`max-w-2xl space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/80 shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans space-y-2">{msg.text}</div>

                    {/* Bottom Timestamp & Copy Button */}
                    <div className="mt-3 pt-2 border-t border-slate-100/40 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="hover:text-indigo-600 flex items-center gap-1 font-semibold transition"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* SOURCE CITATIONS CARDS (Shown below Bot Responses) */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <div className="space-y-2 pt-1 animate-in fade-in">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <Database className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Referenced Campus Sources ({msg.citations.length}):</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.citations.map((cite) => (
                          <div
                            key={cite.id}
                            onClick={() => setSelectedCitationDoc(cite)}
                            className="p-3 bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-100 rounded-2xl cursor-pointer hover:border-indigo-300 hover:shadow-xs transition group text-left"
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[9px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider">
                                {cite.category}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                {cite.matchPercentage || 95}% Match
                              </span>
                            </div>

                            <h5 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
                              {cite.title}
                            </h5>

                            <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                              By {cite.author} ({cite.authorRole}) • {cite.department?.split('(')[0]}
                            </p>

                            <div className="mt-2 pt-1.5 border-t border-indigo-100/60 flex items-center justify-between text-[10px] text-indigo-600 font-semibold">
                              <span>Read full document</span>
                              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator with RAG Status */}
          {isTyping && (
            <div className="flex items-start gap-3 animate-in fade-in">
              <div className="w-8 h-8 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white rounded-3xl px-5 py-4 rounded-tl-none border border-slate-200/80 shadow-xs space-y-2 max-w-md">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="text-xs font-bold text-slate-800">KnowBot is thinking</span>
                </div>
                {searchStatus && (
                  <p className="text-[11px] text-indigo-600 flex items-center gap-1.5 font-medium animate-pulse">
                    <Search className="w-3 h-3" /> {searchStatus}
                  </p>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Starter Prompts Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
            Suggested:
          </span>
          {STARTER_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="text-xs bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200/80 whitespace-nowrap transition shadow-2xs font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about courses, lab guidelines, HPC commands, or placement questions..."
              className="flex-1 text-xs sm:text-sm px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
            />
            <Button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="px-5 py-3.5 shadow-md shadow-indigo-600/20"
            >
              <Send className="w-4 h-4 mr-1" />
              <span>Ask</span>
            </Button>
          </form>
        </div>
      </Card>

      {/* CITATION DOCUMENT PREVIEW MODAL */}
      {selectedCitationDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white px-2.5 py-0.5 rounded-full">
                  {selectedCitationDoc.category}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-2">
                  {selectedCitationDoc.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Published by {selectedCitationDoc.author} ({selectedCitationDoc.authorRole}) • {selectedCitationDoc.department}
                </p>
              </div>
              <button
                onClick={() => setSelectedCitationDoc(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed">
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <p className="font-bold text-indigo-950 text-xs mb-1">Executive Summary:</p>
                <p className="text-xs text-indigo-900">{selectedCitationDoc.summary}</p>
              </div>

              <div className="font-mono text-xs bg-slate-900 text-slate-100 p-4 rounded-2xl whitespace-pre-wrap">
                {selectedCitationDoc.content}
              </div>

              {selectedCitationDoc.tags && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {selectedCitationDoc.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Verified Campus Knowledge Entry
              </span>
              <Button size="sm" onClick={() => setSelectedCitationDoc(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
