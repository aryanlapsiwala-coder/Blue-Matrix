import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../constants/roles';
import { ROUTES } from '../constants/routes';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { alumniService, VERIFIED_ALUMNI_MENTORS } from '../services/alumniService';
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
  Calendar,
  X,
  Clock,
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
  const { user, role, awardPoints } = useAuth();
  const isStudent = role === ROLES.STUDENT;
  const isAlumni = role === ROLES.ALUMNI;
  const isAdmin = role === ROLES.ADMIN;

  const [activeTab, setActiveTab] = useState(
    isAlumni ? 'alumni' : 'students'
  );

  // Referral Token & Mock Interview Interactive States
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [mockModalOpen, setMockModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(VERIFIED_ALUMNI_MENTORS[0]);
  const [referralCompany, setReferralCompany] = useState('Google Cloud');
  const [referralRole, setReferralRole] = useState('Software Engineer (SDE-1)');
  const [referralResumeLink, setReferralResumeLink] = useState('https://drive.google.com/knowpass-candidate-resume');
  const [referralNotes, setReferralNotes] = useState('');
  const [referralToast, setReferralToast] = useState(false);

  // Mock Interview State
  const [mockMentor, setMockMentor] = useState(VERIFIED_ALUMNI_MENTORS[0]);
  const [mockTargetRole, setMockTargetRole] = useState('Software Engineer (SDE-1)');
  const [mockDate, setMockDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [mockSlot, setMockSlot] = useState(VERIFIED_ALUMNI_MENTORS[0].availableSlots[0]);
  const [mockFocus, setMockFocus] = useState('Algorithms, Concurrency & System Design Bar Raiser');
  const [mockToast, setMockToast] = useState(false);

  // Active Applications & Schedules Tracker
  const [myReferralRequests, setMyReferralRequests] = useState([]);
  const [myMockInterviews, setMyMockInterviews] = useState([]);

  const loadMentorshipData = () => {
    if (user?.email) {
      setMyReferralRequests(alumniService.getReferralRequests(user.email));
      setMyMockInterviews(alumniService.getMockInterviewRequests(user.email));
    }
  };

  useEffect(() => {
    loadMentorshipData();
    const handleRef = () => loadMentorshipData();
    const handleMock = () => loadMentorshipData();
    window.addEventListener('knowpass-referral-created', handleRef);
    window.addEventListener('knowpass-mock-interview-created', handleMock);
    return () => {
      window.removeEventListener('knowpass-referral-created', handleRef);
      window.removeEventListener('knowpass-mock-interview-created', handleMock);
    };
  }, [user?.email]);

  const handleSubmitReferral = (e) => {
    e.preventDefault();
    const currentPts = Number(user?.knowPoints) || 20;
    if (currentPts < 50) {
      alert(`Insufficient KnowPoints! A Fast-Track Referral Token requires 50 pts. Your current balance is ${currentPts} pts. Publish a lab SOP or solve campus bugs to earn more points!`);
      return;
    }

    if (awardPoints) {
      awardPoints(-50, `Redeemed Fast-Track Referral Token for ${selectedMentor.name} (${referralCompany})`);
    }

    alumniService.submitReferralRequest({
      student: user,
      mentor: selectedMentor,
      targetCompany: referralCompany,
      targetRole: referralRole,
      resumeUrl: referralResumeLink,
      notes: referralNotes,
    });

    setReferralModalOpen(false);
    setReferralToast(true);
    setReferralNotes('');
    loadMentorshipData();
    setTimeout(() => setReferralToast(false), 5000);
  };

  const handleSubmitMockInterview = (e) => {
    e.preventDefault();
    alumniService.scheduleMockInterview({
      student: user,
      mentor: mockMentor,
      targetRole: mockTargetRole,
      preferredDate: mockDate,
      timeSlot: mockSlot,
      interviewFocus: mockFocus,
    });

    setMockModalOpen(false);
    setMockToast(true);
    loadMentorshipData();
    setTimeout(() => setMockToast(false), 5000);
  };

  // Alumni Talent Scout & Citation Modals State
  const [scoutModalOpen, setScoutModalOpen] = useState(false);
  const [juniorCandidates, setJuniorCandidates] = useState([]);
  const [corporateReferrals, setCorporateReferrals] = useState([]);
  const [scoutReferToast, setScoutReferToast] = useState(false);
  const [lastReferredJunior, setLastReferredJunior] = useState('');

  const loadAlumniScoutData = () => {
    setJuniorCandidates(alumniService.getTopJuniorCandidates());
    if (user?.email) {
      setCorporateReferrals(alumniService.getCorporateReferrals(user.email));
    }
  };

  useEffect(() => {
    loadAlumniScoutData();
    const handleCorp = () => loadAlumniScoutData();
    window.addEventListener('knowpass-corporate-referral-created', handleCorp);
    return () => window.removeEventListener('knowpass-corporate-referral-created', handleCorp);
  }, [user?.email]);

  const handleReferJuniorCandidate = (candidate) => {
    const bonus = user?.currentCompany?.toLowerCase().includes('google')
      ? '₹1,20,000'
      : user?.currentCompany?.toLowerCase().includes('nvidia')
      ? '₹1,50,000'
      : '₹1,00,000';

    alumniService.referCandidate({
      alumnus: user,
      candidate,
      referralBonus: bonus,
    });

    if (awardPoints) {
      awardPoints(50, `Submitted direct corporate referral for ${candidate.name} at ${user?.currentCompany || 'Tech Corp'}`);
    }

    setLastReferredJunior(candidate.name);
    setScoutReferToast(true);
    loadAlumniScoutData();
    setTimeout(() => setScoutReferToast(false), 4500);
  };

  const handleDownloadAlumniCitation = () => {
    const certId = `ALUMNI-VIP-${user?.graduationYear ? user.graduationYear.replace(/\s+/g, '') : '2023'}-${Math.floor(10000 + Math.random() * 90000)}`;
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const citationDoc = `# 🏛️ INSTITUTIONAL BOARD OF TRUSTEES & GLOBAL ALUMNI SENATE
## OFFICIAL DISTINGUISHED ALUMNI KNOWLEDGE BUILDER CITATION & VIP CAMPUS CREDENTIAL

**Citation UID:** \`${certId}\`  
**Date of Issuance:** ${dateStr}  
**Accreditation Framework:** National Institutional Ranking & Global Academic Continuity Charter

---

### TO WHOMSOEVER IT MAY CONCERN

The University Senate and Directorate of Corporate Relations hereby officially confers upon:

## **${(user?.name || 'Distinguished Alumnus').toUpperCase()}**
**Class Batch:** ${user?.graduationYear || 'Class of 2023'}  
**Affiliated Corporation:** ${user?.currentCompany || 'NVIDIA / High-Tech Industry'}  
**Industry Designatory Role:** Senior Engineering / Technical Mentor  
**Department of Heritage:** ${user?.department || 'Computer Science & Engineering'}

the official honorific of:
### 🎖️ **"DISTINGUISHED CAMPUS KNOWLEDGE BUILDER & CORPORATE PATRON"**

---

### 🌟 Endorsed VIP Campus Privileges & Rights:
1. **VIP Guest of Honor & Paid Jury Accreditation:** Priority invitation with official honorariums as Hackathon / Final-Year Capstone Jury Chairman.
2. **First-Look Corporate Referral Pipeline:** Direct talent scout privileges to review and refer top 10 percentile pre-vetted campus scholars into corporate hiring pipelines (Referral bonus eligibility: ₹30,000 – ₹1,50,000 per placed candidate).
3. **Institutional Research & Library Proxy:** Lifetime access to IEEE, ACM Digital Library proxies, and university research facilities.
4. **Annual Convocation Stage Citation:** Permanent commemorative roll of honor in the University Auditorium Hall of Fame.

---

### Certified Institutional Signatories:

**Prof. (Dr.) Sarah Jenkins**  
*Chancellor & Chair of Academic Council*  
KnowPass Global Academic Continuity Network

**Dr. Rajesh Verma**  
*Director of Alumni Affairs & Corporate Relations*

*Official Seal of Heritage & Distinguished Alumni Registry Verification.*
`;

    const blob = new Blob([citationDoc], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Alumni_Convocation_Citation_${(user?.name || 'Alumnus').replace(/\s+/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-400 font-semibold">
                <span>{perk.tier}</span>
                {activeTab === 'students' ? (
                  idx === 0 ? (
                    <Button
                      size="sm"
                      onClick={() => setReferralModalOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-1.5 px-3 rounded-xl gap-1 shadow-xs"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Redeem Referral Token</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setMockModalOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded-xl gap-1 shadow-xs"
                    >
                      <Calendar className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Schedule Mock Interview</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  )
                ) : (
                  idx === 0 ? (
                    <Button
                      size="sm"
                      onClick={() => setScoutModalOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded-xl gap-1 shadow-xs"
                    >
                      <span>Scout Top Juniors</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleDownloadAlumniCitation}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-1.5 px-3 rounded-xl gap-1.5 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Alumni Citation (.md)</span>
                    </Button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Corporate Referrals Tracker Drawer for Alumni */}
        {activeTab === 'alumni' && corporateReferrals.length > 0 && (
          <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950">
                  My Active Corporate Referrals Pipeline ({corporateReferrals.length} Juniors Referred)
                </h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-white border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                Referral Bonus Pool: ₹{corporateReferrals.length * 1.5} Lakhs Potential
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {corporateReferrals.map((cr) => (
                <div key={cr.id} className="p-3 bg-white border border-emerald-100 rounded-xl shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800">
                      💰 {cr.referralBonus}
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      ROUTED TO HR
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{cr.candidateName}</p>
                    <p className="text-[10px] text-slate-500">{cr.candidateDomain}</p>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1.5 border-t border-slate-50">
                    <span>Score: {cr.candidatePoints} pts</span>
                    <span>{new Date(cr.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Real-Time Mentorship & Referrals Pipeline Tracker (shown when on students tab) */}
        {activeTab === 'students' && (myReferralRequests.length > 0 || myMockInterviews.length > 0) && (
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  My Active Referral Requests & Interview Bookings ({myReferralRequests.length + myMockInterviews.length})
                </h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Synced
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myReferralRequests.map((req) => (
                <div key={req.id} className="p-4 bg-white border border-indigo-100 rounded-2xl shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                      ⚡ Referral Token
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">{req.targetCompany} &bull; {req.targetRole}</p>
                    <p className="text-[11px] text-slate-500">Alumnus Mentor: {req.mentorName} ({req.mentorRole})</p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-50">
                    <span>Token: -50 pts</span>
                    <span>Submitted: {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}

              {myMockInterviews.map((m) => (
                <div key={m.id} className="p-4 bg-white border border-emerald-100 rounded-2xl shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                      🎯 1-on-1 Mock Interview
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      CONFIRMED
                    </span>
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">{m.targetRole}</p>
                    <p className="text-[11px] text-slate-500">Alumnus: {m.mentorName} ({m.mentorCompany})</p>
                    <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">📅 {m.preferredDate} &bull; {m.timeSlot}</p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-50">
                    <a
                      href={m.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>Join Meeting</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-slate-400">Duration: 45m</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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

      {/* ========================================================
          FAST-TRACK REFERRAL TOKEN MODAL (CONNECT WITH ALUMNI)
      ======================================================== */}
      {referralModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl p-2 rounded-xl bg-white/10 border border-white/20">⚡</span>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">
                    Redeem Fast-Track Referral Token
                  </h3>
                  <p className="text-[11px] text-indigo-200">
                    Direct Resume Review & Referral from Verified Industry Alumni
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReferralModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReferral} className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-amber-900">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="font-bold">Token Cost: 50 KnowPoints</span>
                </div>
                <span className="font-semibold text-[11px]">
                  Your Balance: <strong>{user?.knowPoints || 20} pts</strong>
                </span>
              </div>

              {/* Select Mentor */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Verified Senior / Alumni Mentor *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {VERIFIED_ALUMNI_MENTORS.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedMentor(m);
                        setReferralCompany(m.currentCompany);
                        setReferralRole(m.targetRoles[0]);
                      }}
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2.5 transition ${
                        selectedMentor?.id === m.id
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-900 truncate leading-tight">{m.name}</h4>
                        <p className="text-[10px] text-indigo-700 font-semibold truncate">{m.currentCompany}</p>
                        <p className="text-[9px] text-slate-400 truncate">{m.currentRole}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Company and Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Company</label>
                  <input
                    type="text"
                    required
                    value={referralCompany}
                    onChange={(e) => setReferralCompany(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Role</label>
                  <input
                    type="text"
                    required
                    value={referralRole}
                    onChange={(e) => setReferralRole(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              {/* Resume / Portfolio Link */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Resume or Portfolio Link (Google Drive / GitHub / PDF) *
                </label>
                <input
                  type="url"
                  required
                  value={referralResumeLink}
                  onChange={(e) => setReferralResumeLink(e.target.value)}
                  placeholder="https://drive.google.com/your-resume"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-mono text-xs"
                />
              </div>

              {/* Message to Alumnus */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Brief Message & Specific Areas for Review
                </label>
                <textarea
                  rows={3}
                  value={referralNotes}
                  onChange={(e) => setReferralNotes(e.target.value)}
                  placeholder="Hi senior, I have authored lab SOPs in distributed systems and would love your referral or feedback!"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              {/* Trust Badge */}
              <div className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-[11px] text-indigo-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Anti-Spam Guaranteed:</strong> Your verified KnowPass merit score ({user?.knowPoints || 20} pts) and published articles will be attached automatically so the alumnus knows this is a genuine high-achiever request.
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setReferralModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Redeem Token & Send Request (-50 pts)</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          1-ON-1 MOCK TECHNICAL INTERVIEW SCHEDULING MODAL
      ======================================================== */}
      {mockModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl p-2 rounded-xl bg-white/10 border border-white/20">🎯</span>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">
                    Schedule 1-on-1 Mock Technical Interview
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    45-Minute Live Problem Solving & Hiring Bar Assessment with Alumni
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMockModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitMockInterview} className="p-5 sm:p-6 space-y-4 text-xs">
              {/* Select Mentor */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Alumnus Interviewer *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {VERIFIED_ALUMNI_MENTORS.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setMockMentor(m);
                        setMockTargetRole(m.targetRoles[0]);
                        setMockSlot(m.availableSlots[0]);
                      }}
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2.5 transition ${
                        mockMentor?.id === m.id
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-900 truncate leading-tight">{m.name}</h4>
                        <p className="text-[10px] text-emerald-700 font-semibold truncate">{m.currentCompany}</p>
                        <p className="text-[9px] text-slate-400 truncate">{m.currentRole}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Interview Role */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Interview Role *</label>
                <select
                  value={mockTargetRole}
                  onChange={(e) => setMockTargetRole(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-semibold"
                >
                  {mockMentor?.targetRoles?.map((r, i) => (
                    <option key={i} value={r}>{r}</option>
                  ))}
                  <option value="General SDE-1 / Software Engineering">General SDE-1 / Software Engineering</option>
                  <option value="Cloud & Systems Infrastructure">Cloud & Systems Infrastructure</option>
                  <option value="Embedded Systems & FPGA">Embedded Systems & FPGA</option>
                  <option value="AI / ML Systems Engineering">AI / ML Systems Engineering</option>
                </select>
              </div>

              {/* Date and Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Date *</label>
                  <input
                    type="date"
                    required
                    value={mockDate}
                    onChange={(e) => setMockDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Interviewer Available Slot *</label>
                  <select
                    value={mockSlot}
                    onChange={(e) => setMockSlot(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-medium"
                  >
                    {mockMentor?.availableSlots?.map((s, i) => (
                      <option key={i} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interview Focus */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Primary Preparation Focus *
                </label>
                <input
                  type="text"
                  required
                  value={mockFocus}
                  onChange={(e) => setMockFocus(e.target.value)}
                  placeholder="e.g. Low-Level Design & Concurrency Mutexes / LeetCode Hard Graphs"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-950 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Confirmed 45-Min Video Session:</strong> Includes live whiteboard coding, system architecture evaluation, and 10 minutes of direct rubric scoring feedback.
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setMockModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Confirm & Schedule Mock Interview</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Success Toasts */}
      {referralToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-indigo-700 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <Zap className="w-5 h-5 text-amber-300" />
          <div>
            <p className="text-xs font-bold">Fast-Track Referral Token Redeemed! (-50 pts)</p>
            <p className="text-[11px] text-indigo-200">
              Request routed to {selectedMentor?.name} at {referralCompany}.
            </p>
          </div>
        </div>
      )}

      {mockToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-emerald-700 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <div>
            <p className="text-xs font-bold">1-on-1 Mock Interview Confirmed!</p>
            <p className="text-[11px] text-emerald-200">
              Meeting link generated for {mockDate} with {mockMentor?.name}.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================
          ALUMNI TALENT SCOUT MODAL (DIRECT CORPORATE REFERRALS)
      ======================================================== */}
      {scoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl p-2 rounded-xl bg-white/10 border border-white/20">💰</span>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">
                    Corporate Talent Scout & Referral Pipeline
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    Direct access to pre-vetted campus talent • Potential Internal Bonus: ₹30k–₹1.5L per hire
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setScoutModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">
                    Referring For: <strong>{user?.currentCompany || 'NVIDIA'}</strong>
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Internal Employee Referral Program: <strong>₹1,00,000 – ₹1,50,000</strong> on successful candidate onboarding.
                  </p>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-2xs shrink-0">
                  Pre-Vetted
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Top-Ranked Merit Scholars Qualified for Industry Referral ({juniorCandidates.length})</span>
                </h4>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {juniorCandidates.map((candidate) => {
                    const isAlreadyReferred = corporateReferrals.some((cr) => cr.candidateId === candidate.id);
                    return (
                      <div
                        key={candidate.id}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-300 transition shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={candidate.avatar}
                            alt={candidate.name}
                            className="w-11 h-11 rounded-full object-cover border-2 border-emerald-200 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-extrabold text-slate-900 text-sm">{candidate.name}</h5>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                Rank #{candidate.rank}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-semibold">{candidate.domain} &bull; {candidate.department}</p>
                            <p className="text-[10px] text-emerald-700 font-medium line-clamp-1 mt-0.5">
                              ⭐ {candidate.topContribution}
                            </p>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                          <span className="text-[11px] font-bold text-slate-600">
                            {candidate.knowPoints} KnowPoints
                          </span>
                          {isAlreadyReferred ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-xl flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Referred to HR</span>
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleReferJuniorCandidate(candidate)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1 px-3 rounded-xl gap-1 shadow-xs"
                            >
                              <DollarSign className="w-3.5 h-3.5 text-amber-200" />
                              <span>Refer Candidate (+50 pts)</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Direct candidate dossiers are cryptographically verified via KnowPass Academic Index.
                </span>
                <Button variant="outline" size="sm" onClick={() => setScoutModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Success Toast for Corporate Referral */}
      {scoutReferToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-emerald-700 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <DollarSign className="w-5 h-5 text-amber-300" />
          <div>
            <p className="text-xs font-bold">Referral Submitted to Corporate HR! (+50 pts)</p>
            <p className="text-[11px] text-emerald-200">
              {lastReferredJunior} has been queued into the {user?.currentCompany || 'NVIDIA'} talent pipeline.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
