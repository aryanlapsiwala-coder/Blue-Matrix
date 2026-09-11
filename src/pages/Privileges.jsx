import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../constants/roles';
import { ROUTES } from '../constants/routes';
import { Card } from '../components/common/Card';
import {
  Sparkles,
  Award,
  ShieldCheck,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  GraduationCap,
  ArrowRight,
  Repeat,
  ExternalLink,
  Users,
  Zap,
} from 'lucide-react';

const STUDENT_PRIVILEGES = [
  {
    tier: 'Core Junior Privilege 1',
    rank: 'Points Milestone',
    title: 'The "Fast-Track Referral Token" (Direct Connection to Seniors)',
    subtitle: 'Direct Connection to Verified Seniors',
    icon: '⚡',
    badgeBg: 'bg-indigo-600 text-white',
    ring: 'ring-indigo-100 border-indigo-200',
    problem: 'Juniors message hundreds of alumni on LinkedIn: "Hi sir, please refer me", and 99% get ignored.',
    solution: 'When a junior earns enough leaderboard points (by solving bugs in old guides, posting fresh lab tips, or getting upvotes), they unlock a Referral Request Token. This token allows them to request a direct, guaranteed Resume Review or Referral from a top-ranked alumnus working at their dream company.',
    trustFactor: 'The senior knows this junior earned their way to the top of the leaderboard and isn\'t just a copy-paste spammer.',
  },
  {
    tier: 'Core Junior Privilege 2',
    rank: 'Top 25 Standings',
    title: 'Mock Technical Interview with Seniors in Their Target Role',
    subtitle: '1-on-1 45-Min Role Preparation',
    icon: '🎯',
    badgeBg: 'bg-emerald-600 text-white',
    ring: 'ring-emerald-100 border-emerald-200',
    solution: 'Top 25 juniors get matched for a private 1-on-1 45-minute mock interview with an alumnus working in that exact role (e.g., SDE-1 at Amazon, FPGA Engineer at Texas Instruments).',
    trustFactor: 'Real-world feedback on what current industry hiring bars actually look like.',
  },
];

const ALUMNI_PRIVILEGES = [
  {
    tier: 'Core Alumni Privilege 1',
    rank: 'Direct Financial Urge',
    title: 'The Corporate Referral Bonus Pipeline (Direct Financial Urge)',
    subtitle: '₹30,000 to ₹1,50,000 ($1,000+) Internal Referral Bonus',
    icon: '💰',
    badgeBg: 'bg-emerald-600 text-white',
    ring: 'ring-emerald-100 border-emerald-200',
    reality: 'Almost all tech companies (Amazon, Microsoft, TCS, Infosys, startups) pay their employees ₹30,000 to ₹1,50,000 (or $1,000+) as an internal Referral Bonus if someone they refer gets hired.',
    howItWorks: 'Top-ranked alumni on KnowPass get first-look access to the top-ranked junior talent in their specific domain (e.g., Top 5 backend coders or Top 5 VLSI designers). Instead of getting 200 random DMs on LinkedIn with unvetted resumes, the alumnus can easily find pre-verified, high-ranking juniors to refer to their company.',
    result: 'The senior helps their junior, secures a huge referral bonus from their employer, and strengthens their company\'s hiring pipeline.',
  },
  {
    tier: 'Core Alumni Privilege 2',
    rank: 'Top 10 Contributors',
    title: 'Official Convocation Citation & VIP Campus Privileges',
    subtitle: 'Guest of Honor, Paid Jury & Annual Honorarium',
    icon: '🏛️',
    badgeBg: 'bg-amber-600 text-white',
    ring: 'ring-amber-100 border-amber-200',
    campusPrivileges: 'College invites Top 10 alumni contributors as Guest of Honor / Paid Jury Members for campus hackathons, symposiums, and tech fests.',
    citation: 'Guest lectures with honorariums and an official "Distinguished Alumni Knowledge Builder" citation awarded at the annual alumni meet.',
  },
];

export function Privileges() {
  const { user, role } = useAuth();
  const isStudent = role === ROLES.STUDENT;
  const isAlumni = role === ROLES.ALUMNI;
  const isAdmin = role === ROLES.ADMIN;

  const [activeTab, setActiveTab] = useState(
    isAlumni ? 'alumni' : 'students'
  );

  useEffect(() => {
    if (isAlumni) {
      setActiveTab('alumni');
    } else if (isStudent) {
      setActiveTab('students');
    }
  }, [role, isAlumni, isStudent]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isStudent
                ? 'Junior Student Privileges & Career Unlocks'
                : isAlumni
                ? 'Alumni Privileges & Referral Pipeline'
                : 'Institutional Privileges & Referral Pipeline'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isStudent
              ? 'Fast-Track Referral Request Tokens and 1-on-1 industry mock interviews for enrolled students.'
              : isAlumni
              ? 'Corporate referral bonus pipeline (₹30k–₹1.5L) and official campus convocation honors for alumni.'
              : 'Verified rewards, direct corporate referral bonuses, and mock interview unlocks.'}
          </p>
        </div>

        {/* Current profile indicator */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-indigo-50 border border-indigo-200/80 text-xs font-bold text-indigo-800 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Profile: {role === ROLES.ALUMNI ? 'Alumni' : 'Junior Student'}</span>
        </div>
      </div>

      {/* Profile-Specific Single Tab Header (Strictly shows only the user's role tab) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-slate-100/80 rounded-2xl border border-slate-200/70">
        <div className="flex items-center gap-1.5">
          {/* Junior Student Tab (visible ONLY to Student or Admin) */}
          {(isStudent || isAdmin) && (
            <div
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-2 ${
                activeTab === 'students'
                  ? 'bg-white text-indigo-700 shadow-md shadow-slate-200/60 border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 cursor-pointer'
              }`}
              onClick={() => isAdmin && setActiveTab('students')}
            >
              <GraduationCap className="w-4 h-4" />
              <span>🎓 Junior Studying Students</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800">
                Career Unlocks
              </span>
            </div>
          )}

          {/* Alumni Tab (visible ONLY to Alumni or Admin) */}
          {(isAlumni || isAdmin) && (
            <div
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-2 ${
                activeTab === 'alumni'
                  ? 'bg-white text-emerald-700 shadow-md shadow-slate-200/60 border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 cursor-pointer'
              }`}
              onClick={() => isAdmin && setActiveTab('alumni')}
            >
              <Briefcase className="w-4 h-4" />
              <span>💼 Alumni Mentors</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                Referral Pipeline
              </span>
            </div>
          )}
        </div>

        <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 px-3 py-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {isStudent ? '100% Verified Undergraduate Privileges' : isAlumni ? '100% Verified Alumni Mentor Privileges' : 'Institutional Privileges'}
          </span>
        </div>
      </div>

      {/* Dynamic Track Explainer Note */}
      <div className={`p-4 rounded-2xl border text-xs leading-relaxed transition ${
        activeTab === 'students'
          ? 'bg-blue-50/80 border-blue-200 text-blue-950'
          : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
      }`}>
        {activeTab === 'students' ? (
          <p>
            🎓 <strong>Junior Studying Students Track:</strong> Requires active college enrollment. Points earned from verified lab runbooks, bug fixes, and peer reviews unlock <strong>Fast-Track Referral Request Tokens</strong> and <strong>1-on-1 Mock Technical Interviews</strong> with seniors working at top firms.
          </p>
        ) : (
          <p>
            💼 <strong>Alumni Track:</strong> No college ID required—uses personal or corporate email. Alumni unlock direct <strong>Corporate Referral Bonus Pipelines (₹30k–₹1.5L)</strong> with first-look access to vetted junior talent, plus <strong>Official Convocation Citations & VIP Campus Privileges</strong>.
          </p>
        )}
      </div>

      {/* ========================================================
          PRIVILEGES CARDS
      ======================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-lg font-black text-slate-900">
              {activeTab === 'students' ? '🎓 Junior Student Unlocks & Career Privileges' : '💼 Alumni Privileges & Referral Pipeline'}
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            {activeTab === 'students' ? 'Exclusively for Studying Undergraduates' : 'Exclusively for Graduated Alumni Mentors'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(activeTab === 'students' ? STUDENT_PRIVILEGES : ALUMNI_PRIVILEGES).map((perk, idx) => (
            <div
              key={idx}
              className={`p-6 sm:p-7 rounded-3xl bg-white border shadow-xs flex flex-col justify-between space-y-4 ${perk.ring} hover:shadow-md transition`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0 shadow-2xs">
                      {perk.icon}
                    </span>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                        {perk.title}
                      </h3>
                      {perk.subtitle && (
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">
                          {perk.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shrink-0 ${perk.badgeBg}`}>
                    {perk.rank}
                  </span>
                </div>

                {/* Content Blocks */}
                <div className="space-y-3 text-xs leading-relaxed">
                  {/* For Junior Students: The Problem */}
                  {perk.problem && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-rose-800">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>The Problem</span>
                      </div>
                      <p className="text-rose-950/90">{perk.problem}</p>
                    </div>
                  )}

                  {/* For Junior Students: The Solution */}
                  {perk.solution && (
                    <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-indigo-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>The Solution</span>
                      </div>
                      <p className="text-indigo-950/90">{perk.solution}</p>
                    </div>
                  )}

                  {/* For Junior Students: Trust Factor */}
                  {perk.trustFactor && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="font-medium text-emerald-900">
                        <strong>The Trust Factor:</strong> {perk.trustFactor}
                      </p>
                    </div>
                  )}

                  {/* For Alumni: The Reality */}
                  {perk.reality && (
                    <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>The Reality</span>
                      </div>
                      <p className="text-emerald-950/90">{perk.reality}</p>
                    </div>
                  )}

                  {/* For Alumni: How It Works */}
                  {perk.howItWorks && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-slate-800">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                        <span>How It Works</span>
                      </div>
                      <p className="text-slate-700">{perk.howItWorks}</p>
                    </div>
                  )}

                  {/* For Alumni: Result */}
                  {perk.result && (
                    <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <p className="font-medium text-blue-900">
                        <strong>Result:</strong> {perk.result}
                      </p>
                    </div>
                  )}

                  {/* For Alumni Perk 2: Campus Privileges */}
                  {perk.campusPrivileges && (
                    <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 text-purple-950 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-purple-800">
                        <Award className="w-3.5 h-3.5 text-purple-600" />
                        <span>VIP Campus Privileges</span>
                      </div>
                      <p className="text-purple-900">{perk.campusPrivileges}</p>
                    </div>
                  )}

                  {/* For Alumni Perk 2: Citation */}
                  {perk.citation && (
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-800">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                        <span>Convocation Citation & Honorarium</span>
                      </div>
                      <p className="text-amber-900">{perk.citation}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                <span>{perk.tier}</span>
                <span className="text-indigo-600 font-bold flex items-center gap-1">
                  Active Privilege <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Nav Card to Leaderboard & Placements */}
      <div className="p-6 bg-gradient-to-r from-indigo-50 via-white to-indigo-50 border border-indigo-100 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm font-bold text-slate-900">
            Ready to climb the ranks and earn referral tokens?
          </h3>
          <p className="text-xs text-slate-500">
            Publish high-impact lab SOPs or check current campus leaderboard standings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.LEADERBOARD}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
          >
            <span>View Campus Standings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to={ROUTES.PLACEMENTS}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            <span>Alumni Directory</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
