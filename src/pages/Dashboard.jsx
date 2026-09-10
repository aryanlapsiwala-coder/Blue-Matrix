import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';
import { ROLES, ROLE_CONFIG } from '../constants/roles';
import { Card, CardHeader } from '../components/common/Card';
import { knowledgeService, SAMPLE_KNOWLEDGE_ITEMS } from '../services/knowledgeService';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  BookOpen,
  PlusCircle,
  MessageSquare,
  TrendingUp,
  Award,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  FileCheck,
  Cpu,
  ShieldAlert,
  Flame,
  Star
} from 'lucide-react';

export function Dashboard() {
  const { user, role } = useAuth();
  const roleConfig = role ? ROLE_CONFIG[role] : null;

  const [liveItems, setLiveItems] = useState(SAMPLE_KNOWLEDGE_ITEMS);
  const [contributorCount, setContributorCount] = useState(14);
  const [equipmentCount, setEquipmentCount] = useState(5);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        const res = await knowledgeService.getAll();
        if (isMounted && res && res.items && res.items.length > 0) {
          setLiveItems(res.items);
        }

        if (isSupabaseConfigured && supabase) {
          const { count: profCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
          if (isMounted && profCount) setContributorCount(profCount);

          const { count: eqCount } = await supabase.from('lab_equipment').select('*', { count: 'exact', head: true });
          if (isMounted && eqCount) setEquipmentCount(eqCount);
        }
      } catch (err) {
        console.warn('Dashboard live sync error:', err);
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalResources = liveItems.length;
  const verifiedCount = liveItems.filter((i) => i.isVerified || i.is_verified).length;
  const totalQueriesEstimated = totalResources * 12 + 140;

  const stats = [
    { label: 'Campus Knowledge Assets', value: `${totalResources}`, icon: BookOpen, change: '+100% Real-Time Synced' },
    { label: 'Active Contributors', value: `${contributorCount}`, icon: TrendingUp, change: 'Across All Engineering Depts' },
    { label: 'Verified SOPs & Manuals', value: `${verifiedCount}`, icon: FileCheck, change: 'Faculty & Lead Endorsed' },
    { label: 'Lab Hardware Runbooks', value: `${equipmentCount}`, icon: Cpu, change: 'Central Infrastructure' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs backdrop-blur-md mb-3 border border-white/15">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              KnowPass Campus Node Online
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Scholar'}!
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Connected as <span className="text-white font-semibold">{roleConfig?.label}</span> in {user?.department || 'University Campus'}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={ROUTES.CONTRIBUTE}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              Contribute Document
            </Link>
            <Link
              to={ROUTES.CHAT}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-md transition border border-white/20"
            >
              <MessageSquare className="w-4 h-4" />
              Ask Campus AI
            </Link>
          </div>
        </div>

        {/* Role-Specific Mission Pill */}
        <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-indigo-300">Active Role Scope:</span>
            <span>{roleConfig?.description}</span>
          </div>
          {role === ROLES.ADMIN && (
            <Link to={ROUTES.ADMIN} className="text-amber-300 font-semibold hover:underline flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Admin Portal Active
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} hover className="relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{stat.label}</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                <p className="text-[11px] font-medium text-slate-400 mt-1">{stat.change}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Role-Specific Highlight Panels */}
      {role === ROLES.STUDENT && (
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-950">Student Contribution Rewards</h4>
            <p className="text-xs text-blue-800/80 mt-0.5">
              Submit peer-verified lecture notes or code tutorials to earn KnowPass Campus Karma badges and recognition on university profiles.
            </p>
          </div>
        </div>
      )}

      {role === ROLES.FACULTY && (
        <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
          <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-purple-950">Faculty Verification Hub</h4>
            <p className="text-xs text-purple-800/80 mt-0.5">
              There are 4 pending student courseware uploads awaiting your syllabus endorsement. Endorsed articles appear at top search ranking.
            </p>
          </div>
        </div>
      )}

      {role === ROLES.TECHNICIAN && (
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-950">Lab SOP & Equipment Maintenance</h4>
            <p className="text-xs text-emerald-800/80 mt-0.5">
              New maintenance schedule uploaded for Advanced Computing Cluster 03. Please update troubleshooting guides for CUDA 12.8 upgrade.
            </p>
          </div>
        </div>
      )}

      {/* Main Content Grid: Recent Resources & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Knowledge Articles */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Featured Knowledge Resources</h3>
              <p className="text-xs text-slate-500">Peer-reviewed notes, lab guides, and research materials</p>
            </div>
            <Link
              to={ROUTES.KNOWLEDGE_BASE}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {liveItems.slice(0, 4).map((item) => (
              <Card key={item.id} hover className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {item.category || item.knowledgeType || 'Resource'}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 font-medium">{item.department}</span>
                    </div>
                    <Link
                      to={`${ROUTES.KNOWLEDGE_BASE}?search=${encodeURIComponent(item.title)}`}
                      className="text-base font-bold text-slate-900 hover:text-indigo-600 transition line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.summary}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{item.author}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
                      {item.authorRole || 'STUDENT'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span>{item.views || 18} views</span>
                    <span>{item.upvotes || 0} upvotes</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Quick Shortcuts & Upcoming Campus Events */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Quick Actions" subtitle="Standard daily tasks" />
            <div className="space-y-2">
              <Link
                to={ROUTES.CONTRIBUTE}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 hover:text-indigo-600 border border-slate-100 text-xs font-semibold text-slate-700 transition"
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle className="w-4 h-4 text-indigo-600" />
                  <span>Submit Lab Manual / Notes</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to={ROUTES.CHAT}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 hover:text-indigo-600 border border-slate-100 text-xs font-semibold text-slate-700 transition"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>Query Campus AI Assistant</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to={ROUTES.PROFILE}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 hover:text-indigo-600 border border-slate-100 text-xs font-semibold text-slate-700 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>View Credentials & Roles</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </Card>

          <Card>
            <CardHeader title="Campus Activity Stream" subtitle="Live feed updates" />
            <div className="space-y-3">
              {liveItems.slice(0, 3).map((act, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${idx === 0 ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'}`} />
                  <div>
                    <p className="font-semibold text-slate-800 line-clamp-1">{act.title}</p>
                    <p className="text-[11px] text-slate-500">
                      Published by {act.author} ({act.authorRole || 'STUDENT'})
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Live in Repository</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
