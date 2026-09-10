import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { knowledgeService } from '../../services/knowledgeService';
import {
  Search,
  BookOpen,
  Wrench,
  Briefcase,
  Bot,
  PlusCircle,
  Trophy,
  ShieldAlert,
  User,
  ArrowRight,
  Sparkles,
  Command,
  X
} from 'lucide-react';

const STATIC_QUICK_ACTIONS = [
  {
    id: 'act_contribute',
    title: 'Publish New Knowledge Document (+50 pts)',
    category: 'Actions',
    icon: PlusCircle,
    color: 'text-indigo-600 bg-indigo-50',
    action: (navigate) => navigate(ROUTES.CONTRIBUTE),
  },
  {
    id: 'act_knowbot',
    title: 'Ask KnowBot AI Assistant',
    category: 'Actions',
    icon: Bot,
    color: 'text-purple-600 bg-purple-50',
    action: (navigate, onOpenKnowBot) => {
      if (onOpenKnowBot) onOpenKnowBot();
      else navigate(ROUTES.CHAT);
    },
  },
  {
    id: 'act_leaderboard',
    title: 'View Campus Leaderboard & KnowKarma Podium',
    category: 'Actions',
    icon: Trophy,
    color: 'text-amber-600 bg-amber-50',
    action: (navigate) => navigate(ROUTES.LEADERBOARD),
  },
  {
    id: 'act_equipment',
    title: 'Explore Central Lab Equipment Wiki & SOPs',
    category: 'Actions',
    icon: Wrench,
    color: 'text-sky-600 bg-sky-50',
    action: (navigate) => navigate(ROUTES.EQUIPMENT),
  },
  {
    id: 'act_placements',
    title: 'Placement Playbooks & Alumni Mentorship',
    category: 'Actions',
    icon: Briefcase,
    color: 'text-emerald-600 bg-emerald-50',
    action: (navigate) => navigate(ROUTES.PLACEMENTS),
  },
  {
    id: 'act_profile',
    title: 'My Profile, Authored Notes & Access Permissions',
    category: 'Actions',
    icon: User,
    color: 'text-slate-600 bg-slate-100',
    action: (navigate) => navigate(ROUTES.PROFILE),
  },
];

export function CommandPalette({ isOpen, onClose, onOpenKnowBot }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [articles, setArticles] = useState([]);
  const inputRef = useRef(null);

  // Load articles for fast fuzzy search
  useEffect(() => {
    let isMounted = true;
    knowledgeService.getAll().then((res) => {
      if (isMounted && res && res.items) {
        setArticles(res.items);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filtered Results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return STATIC_QUICK_ACTIONS;
    }

    const matchedActions = STATIC_QUICK_ACTIONS.filter((a) =>
      a.title.toLowerCase().includes(q)
    );

    const matchedArticles = articles
      .filter(
        (art) =>
          (art.title || '').toLowerCase().includes(q) ||
          (art.summary || '').toLowerCase().includes(q) ||
          (art.department || '').toLowerCase().includes(q) ||
          (Array.isArray(art.tags) && art.tags.some((t) => (t || '').toLowerCase().includes(q)))
      )
      .slice(0, 5)
      .map((art) => ({
        id: `art_${art.id}`,
        title: art.title,
        subtitle: `${art.department} • By ${art.author}`,
        category: 'Knowledge Base',
        icon: BookOpen,
        color: 'text-indigo-600 bg-indigo-50',
        action: (navigate) => navigate(`${ROUTES.KNOWLEDGE_BASE}?search=${encodeURIComponent(art.title)}`),
      }));

    return [...matchedActions, ...matchedArticles];
  }, [query, articles]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (results.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (results.length || 1)) % (results.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          results[selectedIndex].action(navigate, onOpenKnowBot);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, navigate, onOpenKnowBot, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Spotlight Search Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, search articles, lab SOPs, or placement playbooks..."
            className="w-full text-sm sm:text-base font-semibold text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-1">
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-md">
              ESC
            </kbd>
          </div>
        </div>

        {/* Search Results List */}
        <div className="overflow-y-auto p-2 space-y-1 divide-y divide-slate-50 flex-1">
          {results.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No matching campus knowledge found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Try searching "CUDA", "Google", "Raft", or "Oscilloscope"</p>
            </div>
          ) : (
            results.map((item, index) => {
              const Icon = item.icon || Sparkles;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id || index}
                  onClick={() => {
                    item.action(navigate, onOpenKnowBot);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition text-xs ${
                    isSelected
                      ? 'bg-indigo-50/80 border border-indigo-200/80 text-indigo-950'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color || 'bg-slate-100 text-slate-600'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-slate-900 truncate">{item.title}</p>
                      {item.subtitle ? (
                        <p className="text-[11px] text-slate-400 truncate">{item.subtitle}</p>
                      ) : (
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{item.category}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {isSelected && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                        <span>Select</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Palette Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium px-4">
          <div className="flex items-center gap-3">
            <span><strong className="text-slate-700">↑↓</strong> Navigate</span>
            <span><strong className="text-slate-700">↵</strong> Open</span>
            <span><strong className="text-slate-700">ESC</strong> Close</span>
          </div>
          <span className="text-indigo-600 font-bold">KnowPass Spotlight Search</span>
        </div>
      </div>
    </div>
  );
}
