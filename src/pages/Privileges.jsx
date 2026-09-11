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
    solution: 'When a junior earns enough leaderboard points (by solving bugs in old guides, posting fresh lab tips, or getting upvotes), they unlock a Referral Request Token. This token allows them to request a direct, guaranteed Resume Review or Referral from a top-ranked passed-out alumnus working at their dream company.',
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
                ? 'Passed-Out Alumni Privileges & Referral Pipeline'
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
          <span>Profile: {role === ROLES.ALUMNI ? 'Passed-Out Alumni' : 'Junior Student'}</span>
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

          {/* Passed-Out Alumni Tab (visible ONLY to Alumni or Admin) */}
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
              <span>💼 Passed-Out Alumni Mentors</span>
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
            💼 <strong>Passed-Out Alumni Track:</strong> No college ID required—uses personal or corporate email. Alumni unlock direct <strong>Corporate Referral Bonus Pipelines (₹30k–₹1.5L)</strong> with first-look access to vetted junior talent, plus <strong>Official Convocation Citations & VIP Campus Privileges</strong>.
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
              {activeTab === 'students' ? '🎓 Junior Student Unlocks & Career Privileges' : '💼 Passed-Out Alumni Privileges & Referral Pipeline'}
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

      {/* ========================================================
          PART 3: THE SYMBIOTIC "KNOWLEDGE FLYWHEEL"
      ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border border-indigo-800/40 p-6 sm:p-8 shadow-2xl text-white">
        {/* Ambient Glows */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/40 pb-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black tracking-wider uppercase">
                <Repeat className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span>Closed-Loop Value Engine</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                Part 3: The Symbiotic "Knowledge Flywheel"
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                A self-reinforcing loop where <strong>passed-out seniors</strong> earn corporate referral bonuses (₹30k–₹1.5L+) and <strong>studying juniors</strong> bypass ignored LinkedIn DMs with verified merit credentials.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero-Spam Guarantee</span>
            </div>
          </div>

          {/* Flywheel 4 Stages */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div className="rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 p-5 flex flex-col justify-between space-y-3 transition group">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-lg">
                    📝
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Stage 1 • Senior
                  </span>
                </div>
                <h4 className="text-sm font-black text-white group-hover:text-indigo-200 transition">
                  Senior SOP Contribution
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Passed-out alumni publish real industry playbooks, production system designs, and verified lab tips from their daily tech jobs.
                </p>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-indigo-300 font-semibold">
                <span>Knowledge Seed</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 p-5 flex flex-col justify-between space-y-3 transition group">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-lg">
                    ⚡
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Stage 2 • Junior
                  </span>
                </div>
                <h4 className="text-sm font-black text-white group-hover:text-blue-200 transition">
                  Junior Learning & Point Farming
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Studying juniors study the SOPs, solve code bugs in old guides, reproduce experiments, and climb the verified leaderboard rankings.
                </p>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-300 font-semibold">
                <span>Proof of Work</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 p-5 flex flex-col justify-between space-y-3 transition group">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-lg">
                    🎫
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Stage 3 • Token
                  </span>
                </div>
                <h4 className="text-sm font-black text-white group-hover:text-purple-200 transition">
                  Fast-Track Referral Token Unlocked
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  High-ranking juniors exchange points for guaranteed referral & resume review requests to alumni at their dream tech companies.
                </p>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-purple-300 font-semibold">
                <span>Direct Access</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 p-5 flex flex-col justify-between space-y-3 transition group">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-lg">
                    💰
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Stage 4 • Win-Win
                  </span>
                </div>
                <h4 className="text-sm font-black text-white group-hover:text-emerald-200 transition">
                  Referral Bonus & Placement Win
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Senior vets the pre-qualified candidate, refers them internally, and secures a ₹30,000–₹1,50,000 corporate referral bonus upon hiring.
                </p>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-300 font-semibold">
                <span>Loop Closes</span>
                <Repeat className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Bottom Contrast Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-rose-200/90 flex items-start gap-2.5">
              <span className="text-base mt-0.5">❌</span>
              <div>
                <strong className="text-rose-100 block mb-0.5">The Broken Status Quo (Cold LinkedIn DMs):</strong>
                Juniors spam 200 random alumni on LinkedIn with generic resumes. 99% get deleted. Seniors get annoyed by unvetted inbox spam.
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-200/90 flex items-start gap-2.5">
              <span className="text-base mt-0.5">✅</span>
              <div>
                <strong className="text-emerald-100 block mb-0.5">The KnowPass Flywheel Solution:</strong>
                Seniors only review proven campus contributors. Juniors earn direct access through merit. Senior gets a ₹30k–₹1.5L referral reward.
              </div>
            </div>
          </div>
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
