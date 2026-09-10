import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { DotPattern } from '../components/ui/dot-pattern';
import {
  Trophy,
  Award,
  Medal,
  Sparkles,
  Star,
  Users,
  Flame,
  TrendingUp,
  Share2,
  CheckCircle2,
  Search,
  Filter,
  ShieldCheck,
  Zap,
  Gift,
  X,
  Send,
  Copy,
  Check,
  ChevronRight,
  GraduationCap,
  FileText,
  ThumbsUp,
  BookOpen,
} from 'lucide-react';

// ==========================================
// 1. DATASETS & RULES
// ==========================================

const POINT_RULES = [
  { action: 'Submit a Knowledge Entry', points: '+50 pts', icon: FileText, desc: 'Publish a project retro, lab tip, SOP or placement insight', bg: 'bg-indigo-50 text-indigo-700' },
  { action: 'Receive an Upvote', points: '+10 pts', icon: ThumbsUp, desc: 'Earned every time a peer or faculty upvotes your work', bg: 'bg-emerald-50 text-emerald-700' },
  { action: 'AI-Quality Score > 80%', points: '+25 pts', icon: Sparkles, desc: 'Awarded when KnowBot AI scores your documentation structure above 80%', bg: 'bg-purple-50 text-purple-700' },
  { action: 'Complete User Profile', points: '+20 pts', icon: ShieldCheck, desc: 'Fill department, academic year, and research bio', bg: 'bg-blue-50 text-blue-700' },
  { action: 'Refer a Contributor', points: '+30 pts', icon: Gift, desc: 'Invite a classmate or junior who submits their first note', bg: 'bg-amber-50 text-amber-700' },
];

const BADGE_DEFINITIONS = [
  {
    id: 'pioneer',
    name: 'Pioneer',
    icon: '🌟',
    color: 'from-amber-400 to-amber-600 text-white',
    border: 'border-amber-200 bg-amber-50 text-amber-900',
    criteria: 'First contributor from a department',
    holders: 14,
  },
  {
    id: 'mentor',
    name: 'Mentor',
    icon: '🛡️',
    color: 'from-indigo-500 to-indigo-700 text-white',
    border: 'border-indigo-200 bg-indigo-50 text-indigo-900',
    criteria: '10+ published knowledge entries',
    holders: 28,
  },
  {
    id: 'verified_expert',
    name: 'Verified Expert',
    icon: '🏆',
    color: 'from-emerald-500 to-emerald-700 text-white',
    border: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    criteria: '3+ entries with 10+ upvotes each',
    holders: 19,
  },
];

const LEADERBOARD_CONTRIBUTORS = [
  {
    rank: 1,
    id: 'c1',
    name: 'Alex Chen',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    year: '4th Year (Senior)',
    knowPoints: 2480,
    level: 'Grandmaster Level 8',
    entriesCount: 14,
    upvotesReceived: 312,
    badges: ['Pioneer', 'Mentor', 'Verified Expert'],
    topContribution: 'Google & Microsoft Campus Placement: System Design Playbook',
  },
  {
    rank: 2,
    id: 'c2',
    name: 'Dr. Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    role: 'FACULTY',
    department: 'Information Technology & AI',
    year: 'Associate Professor',
    knowPoints: 2150,
    level: 'Master Level 7',
    entriesCount: 22,
    upvotesReceived: 284,
    badges: ['Pioneer', 'Mentor', 'Verified Expert'],
    topContribution: 'Distributed Systems: Raft Consensus & Microservices (CS-402)',
  },
  {
    rank: 3,
    id: 'c3',
    name: 'Marcus Ramirez',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'TECHNICIAN',
    department: 'Central Computing & Hardware Labs',
    year: 'Lead Systems Admin',
    knowPoints: 1940,
    level: 'Master Level 7',
    entriesCount: 19,
    upvotesReceived: 245,
    badges: ['Pioneer', 'Mentor', 'Verified Expert'],
    topContribution: 'High Performance Computing Cluster (HPC) Setup & SLURM Guidelines',
  },
  {
    rank: 4,
    id: 'c4',
    name: 'Priya Sundaram',
    avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150',
    role: 'FACULTY',
    department: 'Electronics & Communication (ECE)',
    year: 'Assistant Professor',
    knowPoints: 1420,
    level: 'Expert Level 5',
    entriesCount: 11,
    upvotesReceived: 180,
    badges: ['Mentor', 'Verified Expert'],
    topContribution: 'VLSI Digital Design: CMOS Circuit Simulation & Verilog Testbenches',
  },
  {
    rank: 5,
    id: 'c5',
    name: 'David Kim',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    year: '4th Year (Senior)',
    knowPoints: 1180,
    level: 'Expert Level 4',
    entriesCount: 8,
    upvotesReceived: 140,
    badges: ['Verified Expert'],
    topContribution: 'Kubernetes Cluster Provisioning on Bare-Metal Linux SOP',
  },
  {
    rank: 6,
    id: 'c6',
    name: 'Sneha Reddy',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    role: 'STUDENT',
    department: 'Information Technology & AI',
    year: '3rd Year (Junior)',
    knowPoints: 920,
    level: 'Advocate Level 3',
    entriesCount: 6,
    upvotesReceived: 95,
    badges: ['Pioneer'],
    topContribution: 'Vector Database (ChromaDB) Embeddings for Semantic RAG',
  },
  {
    rank: 7,
    id: 'c7',
    name: 'Rohan Sharma',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    role: 'STUDENT',
    department: 'Mechanical Engineering (ME)',
    year: '4th Year (Senior)',
    knowPoints: 780,
    level: 'Advocate Level 3',
    entriesCount: 5,
    upvotesReceived: 82,
    badges: ['Pioneer'],
    topContribution: 'ANSYS Fluent CFD Aerodynamic Meshing Tutorial',
  },
];

const RECENT_POINTS_FEED = [
  { user: 'Alex Chen', points: '+10 pts', reason: 'Upvote received on Raft Consensus Guide', time: '5m ago' },
  { user: 'Sneha Reddy', points: '+50 pts', reason: 'Published placement note for Microsoft', time: '18m ago' },
  { user: 'Marcus Ramirez', points: '+25 pts', reason: 'AI Quality Score 94% on GPU Cluster SOP', time: '42m ago' },
  { user: 'David Kim', points: '+30 pts', reason: 'Referred Vikram Malhotra (+30 pts)', time: '1h ago' },
  { user: 'Rohan Sharma', points: '+20 pts', reason: 'Completed campus user profile', time: '3h ago' },
];

// ==========================================
// 2. MAIN COMPONENT
// ==========================================

export function Leaderboard() {
  const { user } = useAuth();

  // State
  const [timeFilter, setTimeFilter] = useState('This Semester');
  const [deptFilter, setDeptFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveContributors, setLiveContributors] = useState(LEADERBOARD_CONTRIBUTORS);

  // Referral Modal
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [referralEmail, setReferralEmail] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [referralSuccessToast, setReferralSuccessToast] = useState(false);

  // Dynamic live fetch from Supabase PostgreSQL profiles table
  useEffect(() => {
    const fetchLiveLeaderboard = async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('know_points', { ascending: false });

          if (!error && data && data.length > 0) {
            const dbProfiles = data.map((p) => ({
              id: p.id || p.email,
              name: p.name || p.email?.split('@')[0] || 'Campus Scholar',
              avatar: p.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
              role: p.role || 'STUDENT',
              department: p.department || 'Computer Science & Engineering',
              year: p.year_of_study || '4th Year',
              knowPoints: Number(p.know_points) || 20,
              level: `Level ${Math.max(1, Math.floor((Number(p.know_points) || 20) / 250) + 1)}`,
              entriesCount: 1,
              upvotesReceived: 5,
              badges: p.badges || ['Pioneer'],
              topContribution: p.bio || 'Verified Campus Contributor',
            }));

            // Merge with standard benchmarks and sort by knowPoints
            const existingNames = new Set(dbProfiles.map((p) => p.name.toLowerCase()));
            const benchmarks = LEADERBOARD_CONTRIBUTORS.filter((b) => !existingNames.has(b.name.toLowerCase()));
            const combined = [...dbProfiles, ...benchmarks];
            combined.sort((a, b) => (b.knowPoints || 0) - (a.knowPoints || 0));

            // Assign real dynamic ranks 1, 2, 3...
            const ranked = combined.map((item, idx) => ({ ...item, rank: idx + 1 }));
            setLiveContributors(ranked);
          }
        } catch (err) {
          console.warn('Leaderboard live sync fallback:', err);
        }
      }
    };

    fetchLiveLeaderboard();
  }, [user?.knowPoints, user?.name]);

  // Filtered contributors
  const filteredContributors = useMemo(() => {
    return liveContributors.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = deptFilter === 'All' || c.department.includes(deptFilter);
      return matchSearch && matchDept;
    });
  }, [liveContributors, searchQuery, deptFilter]);

  const top3 = filteredContributors.slice(0, 3);

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(`https://knowpass.campus.edu/join?ref=${user?.name?.toLowerCase().replace(/\s+/g, '_') || 'scholar'}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendReferral = (e) => {
    e.preventDefault();
    if (!referralEmail.trim()) return;
    setReferralSuccessToast(true);
    setReferralModalOpen(false);
    setReferralEmail('');
    setTimeout(() => setReferralSuccessToast(false), 4000);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      {/* ========================================================
          HERO BANNER
      ======================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden border border-indigo-500/20">
        <DotPattern
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={1}
          className="fill-indigo-400/25 opacity-70 [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]"
        />
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/15">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            CAMPUS GAMIFICATION & REWARDS HUB
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            KnowPass Semester Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Earn KnowPoints, unlock exclusive verified badges, and climb the institutional rankings by sharing knowledge
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Button
            onClick={() => setReferralModalOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-lg shadow-amber-500/20 px-4 py-2.5 flex items-center gap-2"
          >
            <Gift className="w-4 h-4" />
            <span>Refer a Contributor (+30 pts)</span>
          </Button>
        </div>
      </div>

      {/* Toast Notification */}
      {referralSuccessToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-800 animate-in slide-in-from-top duration-200 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Referral invitation sent! You will automatically receive +30 KnowPoints when your peer submits their first entry.</span>
          </div>
          <button onClick={() => setReferralSuccessToast(false)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================
          TOP PODIUM: 1ST, 2ND, 3RD PLACE
      ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-black text-slate-900">Semester Top Champions</h2>
          </div>
          <span className="text-xs font-bold text-slate-500">Updated Real-Time</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
          {/* 2nd Place */}
          {top3[1] && (
            <Card className="p-6 order-2 md:order-1 flex flex-col justify-between border-slate-200 bg-gradient-to-b from-slate-50/80 to-white relative hover:shadow-md transition">
              <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-slate-300 text-slate-800 text-xs font-black border border-slate-400 flex items-center gap-1 shadow-sm">
                🥈 2nd Place
              </div>
              <div className="mt-2 text-center space-y-2">
                <img
                  src={top3[1].avatar}
                  alt={top3[1].name}
                  className="w-16 h-16 rounded-2xl object-cover mx-auto ring-4 ring-slate-200 shadow-md"
                />
                <div>
                  <h3 className="text-base font-black text-slate-900">{top3[1].name}</h3>
                  <p className="text-[11px] text-slate-500">{top3[1].department}</p>
                </div>
                <div className="p-2.5 bg-slate-100 rounded-xl">
                  <span className="text-xl font-black text-slate-900">{top3[1].knowPoints.toLocaleString()}</span>
                  <span className="text-xs text-slate-500 font-bold ml-1">KnowPoints</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap justify-center gap-1">
                {top3[1].badges.map((b) => (
                  <span key={b} className="text-[10px] font-bold bg-white border px-2 py-0.5 rounded-md shadow-2xs">
                    {b === 'Pioneer' ? '🌟' : b === 'Mentor' ? '🛡️' : '🏆'} {b}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* 1st Place (Center Gold) */}
          {top3[0] && (
            <Card className="p-6 order-1 md:order-2 flex flex-col justify-between border-amber-300 bg-gradient-to-b from-amber-50/70 via-white to-white relative shadow-md ring-2 ring-amber-400/30 md:-translate-y-2 transition">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-black border border-amber-300 flex items-center gap-1.5 shadow-md">
                <Trophy className="w-3.5 h-3.5 text-yellow-100" />
                <span>🥇 1st Place Champion</span>
              </div>
              <div className="mt-3 text-center space-y-2">
                <div className="relative inline-block">
                  <img
                    src={top3[0].avatar}
                    alt={top3[0].name}
                    className="w-20 h-20 rounded-3xl object-cover mx-auto ring-4 ring-amber-400 shadow-lg"
                  />
                  <span className="absolute -bottom-2 -right-2 text-xl">👑</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{top3[0].name}</h3>
                  <p className="text-xs text-indigo-600 font-bold">{top3[0].department}</p>
                </div>
                <div className="p-3 bg-amber-100/70 border border-amber-200 rounded-2xl">
                  <span className="text-2xl font-black text-amber-950">{top3[0].knowPoints.toLocaleString()}</span>
                  <span className="text-xs text-amber-800 font-bold ml-1.5">KnowPoints</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-amber-100 flex flex-wrap justify-center gap-1.5">
                {top3[0].badges.map((b) => (
                  <span key={b} className="text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                    {b === 'Pioneer' ? '🌟' : b === 'Mentor' ? '🛡️' : '🏆'} {b}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <Card className="p-6 order-3 flex flex-col justify-between border-slate-200 bg-gradient-to-b from-slate-50/80 to-white relative hover:shadow-md transition">
              <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-amber-700 text-white text-xs font-black border border-amber-800 flex items-center gap-1 shadow-sm">
                🥉 3rd Place
              </div>
              <div className="mt-2 text-center space-y-2">
                <img
                  src={top3[2].avatar}
                  alt={top3[2].name}
                  className="w-16 h-16 rounded-2xl object-cover mx-auto ring-4 ring-amber-700/20 shadow-md"
                />
                <div>
                  <h3 className="text-base font-black text-slate-900">{top3[2].name}</h3>
                  <p className="text-[11px] text-slate-500">{top3[2].department}</p>
                </div>
                <div className="p-2.5 bg-slate-100 rounded-xl">
                  <span className="text-xl font-black text-slate-900">{top3[2].knowPoints.toLocaleString()}</span>
                  <span className="text-xs text-slate-500 font-bold ml-1">KnowPoints</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap justify-center gap-1">
                {top3[2].badges.map((b) => (
                  <span key={b} className="text-[10px] font-bold bg-white border px-2 py-0.5 rounded-md shadow-2xs">
                    {b === 'Pioneer' ? '🌟' : b === 'Mentor' ? '🛡️' : '🏆'} {b}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* ========================================================
          POINTS RULES & BADGES SHOWCASE
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KnowPoints Rules Card */}
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Scoring Mechanism
            </span>
            <h3 className="text-base font-black text-slate-900 mt-1.5">How to Earn KnowPoints</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {POINT_RULES.map((rule, idx) => {
              const Icon = rule.icon;
              return (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className={`p-2 rounded-xl flex-shrink-0 ${rule.bg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900">{rule.action}</h4>
                      <span className="text-xs font-black text-emerald-600">{rule.points}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{rule.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Badges Showcase Card */}
        <Card className="p-6 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Institutional Badges
            </span>
            <h3 className="text-base font-black text-slate-900 mt-1.5">Earnable Badges</h3>
          </div>

          <div className="space-y-2.5">
            {BADGE_DEFINITIONS.map((badge) => (
              <div key={badge.id} className={`p-3 rounded-2xl border flex items-center gap-3 ${badge.border}`}>
                <span className="text-2xl">{badge.icon}</span>
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black">{badge.name}</h4>
                    <span className="text-[10px] opacity-80 font-bold">{badge.holders} Holders</span>
                  </div>
                  <p className="text-[11px] opacity-90 mt-0.5">{badge.criteria}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ========================================================
          SEMESTER LEADERBOARD TABLE & SEARCH
      ======================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900">Institutional Contributor Rankings</h2>
            <p className="text-xs text-slate-500">Live verified point tallies & departmental breakdown</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contributor..."
                className="text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 shadow-2xs w-44 sm:w-56"
              />
            </div>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 outline-none shadow-2xs"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Central Computing">Central Labs</option>
              <option value="Electronics">Electronics (ECE)</option>
              <option value="Mechanical">Mechanical (ME)</option>
            </select>
          </div>
        </div>

        <Card className="p-0 overflow-hidden border border-slate-200/80 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4 text-center w-12">Rank</th>
                  <th className="py-3.5 px-4">Contributor</th>
                  <th className="py-3.5 px-4">Department & Level</th>
                  <th className="py-3.5 px-4 text-center">Entries</th>
                  <th className="py-3.5 px-4 text-center">Upvotes</th>
                  <th className="py-3.5 px-4">Badges Earned</th>
                  <th className="py-3.5 px-4 text-right">KnowPoints</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContributors.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 text-center font-black text-sm">
                      {c.rank === 1 ? '🥇' : c.rank === 2 ? '🥈' : c.rank === 3 ? '🥉' : `#${c.rank}`}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200" />
                        <div>
                          <p className="font-bold text-slate-900">{c.name}</p>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {c.level}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-700">{c.department}</p>
                      <p className="text-[10px] text-slate-400">{c.year}</p>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {c.entriesCount}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                      👍 {c.upvotesReceived}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {c.badges.map((b) => (
                          <span key={b} className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                            {b === 'Pioneer' ? '🌟' : b === 'Mentor' ? '🛡️' : '🏆'} {b}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="text-sm font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl">
                        {c.knowPoints.toLocaleString()} pts
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ========================================================
          RECENT POINTS ACTIVITY STREAM
      ======================================================== */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Recent Campus Point Transactions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {RECENT_POINTS_FEED.map((item, idx) => (
            <div key={idx} className="p-3 bg-white border border-slate-200/80 rounded-2xl space-y-1 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 truncate">{item.user}</span>
                <span className="text-[11px] font-black text-emerald-600">{item.points}</span>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-1">{item.reason}</p>
              <span className="text-[9px] text-slate-400 block">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          REFERRAL MODAL (+30 pts)
      ======================================================== */}
      {referralModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold bg-amber-500 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  +30 KnowPoints Reward
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Refer a Peer or Contributor
                </h3>
              </div>
              <button onClick={() => setReferralModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendReferral} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Unique Invite Link</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://knowpass.campus.edu/join?ref=${user?.name?.toLowerCase().replace(/\s+/g, '_') || 'scholar'}`}
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-600 outline-none"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={handleCopyInviteLink} className="font-bold">
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Or Send Invite via Campus Email *</label>
                <input
                  type="email"
                  required
                  value={referralEmail}
                  onChange={(e) => setReferralEmail(e.target.value)}
                  placeholder="classmate.name@campus.edu"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl text-amber-900 text-[11px] space-y-1">
                <p className="font-bold">How the referral bonus works:</p>
                <p>When your referred peer joins and authors their first approved lab tip or placement insight, +30 KnowPoints are credited to your account instantly.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" type="button" onClick={() => setReferralModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
                  <Send className="w-3.5 h-3.5 mr-1" />
                  Send Invitation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
