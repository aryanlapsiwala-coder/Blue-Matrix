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
  Briefcase,
  Building2,
  ExternalLink,
  ArrowRight,
  Repeat,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

// ==========================================
// 1. DATASETS FOR JUNIOR STUDENTS
// ==========================================

const STUDENT_POINT_RULES = [
  { action: 'Publish Lab SOP / Note', points: '+50 pts', icon: FileText, desc: 'Author a verified lab runbook, project retro, or placement insight', bg: 'bg-indigo-50 text-indigo-700' },
  { action: 'Receive Peer / Senior Upvote', points: '+10 pts', icon: ThumbsUp, desc: 'Earned every time a classmate or senior upvotes your guide', bg: 'bg-emerald-50 text-emerald-700' },
  { action: 'Faculty Verification Endorsement', points: '+40 pts', icon: ShieldCheck, desc: 'Awarded when a professor certifies your SOP as syllabus-grade', bg: 'bg-blue-50 text-blue-700' },
  { action: 'AI Structure Score > 85%', points: '+25 pts', icon: Sparkles, desc: 'Earned when KnowBot validates Markdown formatting & completeness', bg: 'bg-purple-50 text-purple-700' },
  { action: 'Refer a Junior Contributor', points: '+30 pts', icon: Gift, desc: 'Invite a campus peer who publishes their first approved guide', bg: 'bg-amber-50 text-amber-700' },
];

const STUDENT_PERK_TIERS = [
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

const STUDENT_CONTRIBUTORS = [
  {
    rank: 1,
    id: 's1',
    name: 'Alex Chen',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    year: '4th Year (Senior)',
    knowPoints: 2480,
    level: 'Grandmaster Scholar',
    entriesCount: 14,
    upvotesReceived: 312,
    badges: ['T&P Star', 'NEP 2020 Honors', 'Verified Expert'],
    topContribution: 'Google & Microsoft Campus Placement: System Design Playbook',
    tpStatus: 'Tier-1 Recruiter Spotlight',
  },
  {
    rank: 2,
    id: 's2',
    name: 'Sneha Reddy',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    role: 'STUDENT',
    department: 'Information Technology & AI',
    year: '3rd Year (Junior)',
    knowPoints: 2120,
    level: 'Master Scholar',
    entriesCount: 11,
    upvotesReceived: 275,
    badges: ['T&P Star', 'Pioneer', 'Verified Expert'],
    topContribution: 'RISC-V 5-Stage Core in Verilog with Branch Prediction on Artix-7',
    tpStatus: 'Tier-1 Recruiter Spotlight',
  },
  {
    rank: 3,
    id: 's3',
    name: 'David Kim',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    year: '4th Year (Senior)',
    knowPoints: 1780,
    level: 'Master Scholar',
    entriesCount: 9,
    upvotesReceived: 198,
    badges: ['Lab Pioneer', 'Verified Expert'],
    topContribution: 'Bare-Metal Kubernetes Cluster Provisioning & SLURM Setup SOP',
    tpStatus: 'Dean LOR Candidate',
  },
  {
    rank: 4,
    id: 's4',
    name: 'Rohan Sharma',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    role: 'STUDENT',
    department: 'Mechanical Engineering (ME)',
    year: '4th Year (Senior)',
    knowPoints: 1460,
    level: 'Senior Contributor',
    entriesCount: 8,
    upvotesReceived: 165,
    badges: ['Pioneer', 'Peer Leader'],
    topContribution: 'ANSYS Fluent CFD Aerodynamic Meshing & Formula Student Chassis',
    tpStatus: 'Alumni Referral Qualified',
  },
  {
    rank: 5,
    id: 's5',
    name: 'Ananya Iyer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    role: 'STUDENT',
    department: 'Electronics & Communication (ECE)',
    year: '2nd Year (Sophomore)',
    knowPoints: 1190,
    level: 'Rising Scholar',
    entriesCount: 6,
    upvotesReceived: 130,
    badges: ['Pioneer'],
    topContribution: 'Cadence Virtuoso CMOS Analog Amplifier Simulation Guide',
    tpStatus: 'NEP 2020 Eligible',
  },
  {
    rank: 6,
    id: 's6',
    name: 'Kabir Mehta',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'STUDENT',
    department: 'Information Technology & AI',
    year: '3rd Year (Junior)',
    knowPoints: 940,
    level: 'Advocate',
    entriesCount: 5,
    upvotesReceived: 98,
    badges: ['Peer Leader'],
    topContribution: 'ChromaDB Vector Embeddings with LangChain RAG Pipelines',
    tpStatus: 'Active Contributor',
  },
  {
    rank: 7,
    id: 's7',
    name: 'Tanvi Deshmukh',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    year: '1st Year (Freshman)',
    knowPoints: 720,
    level: 'Apprentice',
    entriesCount: 4,
    upvotesReceived: 76,
    badges: ['Pioneer'],
    topContribution: 'CS101 Memory Management & Pointer Arithmetic Demystified',
    tpStatus: 'Rising Freshman',
  },
];

// ==========================================
// 2. DATASETS FOR PASSED-OUT ALUMNI MENTORS
// ==========================================

const ALUMNI_POINT_RULES = [
  { action: 'Publish Production / Interview Playbook', points: '+75 pts', icon: Briefcase, desc: 'Real industry system design, interview rounds, or production runbook', bg: 'bg-indigo-50 text-indigo-700' },
  { action: 'Conduct 1-on-1 Junior Mock / Resume Review', points: '+50 pts', icon: Users, desc: 'Verified session helping a student prepare for campus or off-campus hiring', bg: 'bg-emerald-50 text-emerald-700' },
  { action: 'Junior Placed via Your Referral', points: '+150 pts', icon: Award, desc: 'Awarded when your referred junior lands an internship or full-time offer', bg: 'bg-purple-50 text-purple-700' },
  { action: 'Resolve a Junior Tech Inquiry', points: '+20 pts', icon: Sparkles, desc: 'Provide professional architectural guidance on a student inquiry', bg: 'bg-blue-50 text-blue-700' },
  { action: 'Endorse a Campus Lab SOP', points: '+30 pts', icon: ShieldCheck, desc: 'Validate that a college lab experiment reflects actual industry workflows', bg: 'bg-amber-50 text-amber-700' },
];

const ALUMNI_PERK_TIERS = [
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

const ALUMNI_CONTRIBUTORS = [
  {
    rank: 1,
    id: 'a1',
    name: 'Vikram Malhotra',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    role: 'ALUMNI',
    graduationYear: 'Class of 2023',
    currentCompany: 'NVIDIA',
    currentRole: 'Senior Robotics Software Engineer',
    department: 'Mechanical & Robotics',
    knowPoints: 4850,
    level: 'Distinguished Fellow',
    entriesCount: 18,
    upvotesReceived: 340,
    referralsOffered: 12,
    badges: ['Top 1% Mentor', 'Talent Scout', 'Distinguished Fellow'],
    topContribution: 'ROS2 Humble Real-Time Kinematics & GPU Ray-Tracing Simulation Runbook',
    alumniPrivilege: 'Lifetime IEEE/ACM Library Proxy + Convocation Jury',
  },
  {
    rank: 2,
    id: 'a2',
    name: 'Priya Sundaram',
    avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150',
    role: 'ALUMNI',
    graduationYear: 'Class of 2022',
    currentCompany: 'Microsoft',
    currentRole: 'Cloud Systems Architect (Azure Core)',
    department: 'Electronics & Communication',
    knowPoints: 4320,
    level: 'Distinguished Fellow',
    entriesCount: 15,
    upvotesReceived: 295,
    referralsOffered: 9,
    badges: ['Top 1% Mentor', 'Talent Scout', 'Verified Fellow'],
    topContribution: 'Distributed Systems & High-Scale Microservices: Azure Production Retro',
    alumniPrivilege: 'Lifetime IEEE/ACM Library Proxy + Convocation Jury',
  },
  {
    rank: 3,
    id: 'a3',
    name: 'Marcus Ramirez',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'ALUMNI',
    graduationYear: 'Class of 2021',
    currentCompany: 'Google Cloud',
    currentRole: 'Principal Infrastructure Engineer',
    department: 'Computer Science & Engineering',
    knowPoints: 3790,
    level: 'Master Industry Mentor',
    entriesCount: 13,
    upvotesReceived: 250,
    referralsOffered: 14,
    badges: ['Talent Scout', 'Master Mentor'],
    topContribution: 'Terraform & Kubernetes Multi-Region Cluster Fault-Tolerance Playbook',
    alumniPrivilege: 'Direct Talent Scout Access (Referral Bonus $$)',
  },
  {
    rank: 4,
    id: 'a4',
    name: 'Neha Kapoor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    role: 'ALUMNI',
    graduationYear: 'Class of 2023',
    currentCompany: 'Qualcomm',
    currentRole: 'ASIC Digital Verification Engineer',
    department: 'Electronics & Communication',
    knowPoints: 2950,
    level: 'Senior Industry Mentor',
    entriesCount: 9,
    upvotesReceived: 185,
    referralsOffered: 7,
    badges: ['Talent Scout', 'Verified Fellow'],
    topContribution: 'SystemVerilog UVM Testbench Frameworks for Silicon Tape-Out',
    alumniPrivilege: 'Direct Talent Scout Access (Referral Bonus $$)',
  },
  {
    rank: 5,
    id: 'a5',
    name: 'Rahul Saxena',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    role: 'ALUMNI',
    graduationYear: 'Class of 2022',
    currentCompany: 'Zomato / Blinkit',
    currentRole: 'Staff Backend Engineer',
    department: 'Information Technology & AI',
    knowPoints: 2410,
    level: 'Industry Mentor',
    entriesCount: 7,
    upvotesReceived: 145,
    referralsOffered: 5,
    badges: ['Master Mentor'],
    topContribution: 'Ultra-Low Latency Geohash Indexing with Redis & Kafka Event Streams',
    alumniPrivilege: 'LinkedIn Verified Industry Fellow Credential',
  },
  {
    rank: 6,
    id: 'a6',
    name: 'Aisha Patel',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'ALUMNI',
    graduationYear: 'Class of 2024',
    currentCompany: 'Texas Instruments',
    currentRole: 'Embedded Firmware Specialist',
    department: 'Electronics & Communication',
    knowPoints: 1850,
    level: 'Associate Mentor',
    entriesCount: 5,
    upvotesReceived: 98,
    referralsOffered: 3,
    badges: ['Verified Fellow'],
    topContribution: 'FreeRTOS Task Scheduling & Memory Protection on ARM Cortex-M4',
    alumniPrivilege: 'LinkedIn Verified Industry Fellow Credential',
  },
];

const RECENT_POINTS_FEED = [
  { user: 'Vikram Malhotra (NVIDIA)', points: '+75 pts', reason: 'Published ROS2 Simulation Playbook', time: '4m ago', isAlumni: true },
  { user: 'Alex Chen (4th Year)', points: '+50 pts', reason: 'Authored System Design Guide (Google/Microsoft)', time: '12m ago', isAlumni: false },
  { user: 'Sneha Reddy (3rd Year)', points: '+40 pts', reason: 'Faculty endorsed RISC-V Verilog Runbook', time: '28m ago', isAlumni: false },
  { user: 'Priya Sundaram (Microsoft)', points: '+150 pts', reason: 'Junior placed at Microsoft Azure Core via referral', time: '1h ago', isAlumni: true },
  { user: 'David Kim (4th Year)', points: '+25 pts', reason: 'AI Quality score 94% on Kubernetes SOP', time: '2h ago', isAlumni: false },
];

// ==========================================
// 3. MAIN COMPONENT
// ==========================================

export function Leaderboard() {
  const { user } = useAuth();

  // Active Leaderboard Track: 'students' or 'alumni'
  const [activeBoard, setActiveBoard] = useState('students');

  // Filters & Search
  const [deptFilter, setDeptFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Live data holders
  const [liveStudents, setLiveStudents] = useState(STUDENT_CONTRIBUTORS);
  const [liveAlumni, setLiveAlumni] = useState(ALUMNI_CONTRIBUTORS);

  // Modals
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [referralEmail, setReferralEmail] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [referralSuccessToast, setReferralSuccessToast] = useState(false);

  // 1-on-1 Alumni Referral Request Modal
  const [alumniReferralModalOpen, setAlumniReferralModalOpen] = useState(false);
  const [selectedAlumnus, setSelectedAlumnus] = useState(null);
  const [referralForm, setReferralForm] = useState({
    requestType: 'Direct Company Referral',
    targetRole: 'Software Development Engineer (SDE-1)',
    resumeLink: '',
    note: '',
  });
  const [requestSentToast, setRequestSentToast] = useState(false);

  // Live profile fetch from Supabase if connected
  useEffect(() => {
    const fetchLiveProfiles = async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('know_points', { ascending: false });

          if (!error && data && data.length > 0) {
            // Partition by role
            const dbStudents = data
              .filter((p) => p.role === 'STUDENT' || !p.role)
              .map((p) => ({
                id: p.id || p.email,
                name: p.name || p.email?.split('@')[0] || 'Campus Scholar',
                avatar: p.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                role: 'STUDENT',
                department: p.department || 'Computer Science & Engineering',
                year: p.year_of_study || '4th Year',
                knowPoints: Number(p.know_points) || 20,
                level: `Level ${Math.max(1, Math.floor((Number(p.know_points) || 20) / 250) + 1)}`,
                entriesCount: 1,
                upvotesReceived: 5,
                badges: p.badges || ['Pioneer'],
                topContribution: p.bio || 'Verified Student Contributor',
                tpStatus: 'Active Contributor',
              }));

            const dbAlumni = data
              .filter((p) => p.role === 'ALUMNI')
              .map((p) => ({
                id: p.id || p.email,
                name: p.name || p.email?.split('@')[0] || 'Alumni Mentor',
                avatar: p.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
                role: 'ALUMNI',
                graduationYear: p.graduation_year || 'Class of 2023',
                currentCompany: p.current_company || 'Tech Industry',
                currentRole: p.job_title || 'Software Engineer',
                department: p.department || 'Engineering',
                knowPoints: Number(p.know_points) || 50,
                level: 'Industry Mentor',
                entriesCount: 2,
                upvotesReceived: 15,
                referralsOffered: 2,
                badges: ['Verified Fellow'],
                topContribution: p.bio || 'Industry Runbook Contributor',
                alumniPrivilege: 'LinkedIn Verified Fellow',
              }));

            if (dbStudents.length > 0) {
              const existingS = new Set(dbStudents.map((s) => s.name.toLowerCase()));
              const combinedS = [...dbStudents, ...STUDENT_CONTRIBUTORS.filter((s) => !existingS.has(s.name.toLowerCase()))];
              combinedS.sort((a, b) => (b.knowPoints || 0) - (a.knowPoints || 0));
              setLiveStudents(combinedS.map((item, idx) => ({ ...item, rank: idx + 1 })));
            }

            if (dbAlumni.length > 0) {
              const existingA = new Set(dbAlumni.map((a) => a.name.toLowerCase()));
              const combinedA = [...dbAlumni, ...ALUMNI_CONTRIBUTORS.filter((a) => !existingA.has(a.name.toLowerCase()))];
              combinedA.sort((a, b) => (b.knowPoints || 0) - (a.knowPoints || 0));
              setLiveAlumni(combinedA.map((item, idx) => ({ ...item, rank: idx + 1 })));
            }
          }
        } catch (err) {
          console.warn('Leaderboard sync notice:', err);
        }
      }
    };

    fetchLiveProfiles();
  }, [user?.knowPoints, user?.name]);

  // Current active list based on selected track
  const currentList = useMemo(() => {
    const list = activeBoard === 'students' ? liveStudents : liveAlumni;
    return list.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.currentCompany && c.currentCompany.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchDept = deptFilter === 'All' || c.department.includes(deptFilter);
      return matchSearch && matchDept;
    });
  }, [activeBoard, liveStudents, liveAlumni, searchQuery, deptFilter]);

  const top3 = currentList.slice(0, 3);

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

  const handleOpenAlumniRequest = (alumnus) => {
    setSelectedAlumnus(alumnus);
    setReferralForm({
      requestType: 'Direct Company Referral',
      targetRole: `Software Engineer / Intern at ${alumnus.currentCompany}`,
      resumeLink: '',
      note: `Hi ${alumnus.name}, I reviewed your "${alumnus.topContribution}" guide on KnowPass. I would love your guidance and a potential referral for our campus batch!`,
    });
    setAlumniReferralModalOpen(true);
  };

  const handleSubmitAlumniRequest = (e) => {
    e.preventDefault();
    setAlumniReferralModalOpen(false);
    setRequestSentToast(true);
    setTimeout(() => setRequestSentToast(false), 5000);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      {/* ========================================================
          HERO BANNER
      ======================================================== */}
      <div className="bg-gradient-to-r from-neutral-950 via-[#0a0a0d] to-black rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden border border-white/10 ring-1 ring-white/5">
        <DotPattern
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={1.25}
          className="fill-white/50 opacity-90 [mask-image:radial-gradient(ellipse_at_center,white,transparent_85%)]"
        />
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/15">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            DUAL-TRACK INSTITUTIONAL LEADERBOARD
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Campus Recognition & Impact Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Fair, segregated rankings for <strong>Current Junior Students</strong> and <strong>Passed-Out Working Alumni</strong> with tailored real-world rewards
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Button
            onClick={() => setReferralModalOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-lg shadow-amber-500/20 px-4 py-2.5 flex items-center gap-2"
          >
            <Gift className="w-4 h-4" />
            <span>Invite Peer / Alumni (+30 pts)</span>
          </Button>
        </div>
      </div>

      {/* Toast Notifications */}
      {referralSuccessToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-800 animate-in slide-in-from-top duration-200 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Referral invitation sent! You will receive +30 KnowPoints when they publish their first approved guide.</span>
          </div>
          <button onClick={() => setReferralSuccessToast(false)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {requestSentToast && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs font-bold text-indigo-900 animate-in slide-in-from-top duration-200 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>
              1-on-1 Referral Request successfully dispatched to <strong>{selectedAlumnus?.name} ({selectedAlumnus?.currentCompany})</strong>! Notification routed to their verified email.
            </span>
          </div>
          <button onClick={() => setRequestSentToast(false)} className="text-indigo-600 hover:text-indigo-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================
          DUAL-TRACK LEADERBOARD TOGGLE TABS
      ======================================================== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1.5 border border-slate-200 shadow-inner">
            <button
              onClick={() => setActiveBoard('students')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-2 ${
                activeBoard === 'students'
                  ? 'bg-white text-indigo-700 shadow-md shadow-slate-200/50 border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>🎓 Junior Studying Students</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeBoard === 'students' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {liveStudents.length}
              </span>
            </button>

            <button
              onClick={() => setActiveBoard('alumni')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-2 ${
                activeBoard === 'alumni'
                  ? 'bg-white text-emerald-700 shadow-md shadow-slate-200/50 border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>💼 Passed-Out Alumni Mentors</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeBoard === 'alumni' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {liveAlumni.length}
              </span>
            </button>
          </div>

          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Points partition guarantees 100% fair evaluation</span>
          </div>
        </div>

        {/* Dynamic Track Explainer Note */}
        <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed transition ${
          activeBoard === 'students'
            ? 'bg-blue-50/70 border-blue-200/80 text-blue-900'
            : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900'
        }`}>
          {activeBoard === 'students' ? (
            <p>
              🎓 <strong>Junior Studying Students Track:</strong> Requires active college enrollment ID. Points earned from verified lab runbooks, course tips, and peer reviews unlock <strong>T&P Recruiter Spotlight</strong>, <strong>Dean LORs</strong>, and <strong>1-on-1 Alumni Referral Tokens</strong>.
            </p>
          ) : (
            <p>
              💼 <strong>Passed-Out Alumni Track:</strong> No college ID needed—uses personal/work email. Points earned from publishing production playbooks, system design architectures, and junior mentorship unlock <strong>Lifetime IEEE/ACM Library Proxy Passes</strong>, <strong>Talent Scout referral bonuses</strong>, and <strong>Convocation citations</strong>.
            </p>
          )}
        </div>
      </div>

      {/* ========================================================
          INSTITUTIONAL UTILITY & REWARDS MATRIX (WHAT YOU UNLOCK)
      ======================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-base font-black text-slate-900">
              {activeBoard === 'students' ? '🎓 Junior Student Unlocks & Career Privileges' : '💼 Passed-Out Alumni Privileges & Referral Pipeline'}
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            {activeBoard === 'students' ? 'Exclusively for Studying Undergraduates' : 'Exclusively for Graduated Alumni Mentors'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {(activeBoard === 'students' ? STUDENT_PERK_TIERS : ALUMNI_PERK_TIERS).map((perk, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-3xl bg-white border shadow-xs flex flex-col justify-between space-y-4 ${perk.ring} hover:shadow-md transition`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0 shadow-2xs">
                      {perk.icon}
                    </span>
                    <div>
                      <h4 className="text-base font-black text-slate-900 leading-snug">
                        {perk.title}
                      </h4>
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
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-rose-800">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>The Problem</span>
                      </div>
                      <p className="text-rose-950/90">{perk.problem}</p>
                    </div>
                  )}

                  {/* For Junior Students: The Solution */}
                  {perk.solution && (
                    <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/70 text-indigo-950 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-indigo-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>The Solution</span>
                      </div>
                      <p className="text-indigo-950/90">{perk.solution}</p>
                    </div>
                  )}

                  {/* For Junior Students: Trust Factor */}
                  {perk.trustFactor && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-950 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="font-medium text-emerald-900">
                        <strong>The Trust Factor:</strong> {perk.trustFactor}
                      </p>
                    </div>
                  )}

                  {/* For Alumni: The Reality */}
                  {perk.reality && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>The Reality</span>
                      </div>
                      <p className="text-emerald-950/90">{perk.reality}</p>
                    </div>
                  )}

                  {/* For Alumni: How It Works */}
                  {perk.howItWorks && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-slate-800">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                        <span>How It Works</span>
                      </div>
                      <p className="text-slate-700">{perk.howItWorks}</p>
                    </div>
                  )}

                  {/* For Alumni: Result */}
                  {perk.result && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/70 text-blue-950 flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <p className="font-medium text-blue-900">
                        <strong>Result:</strong> {perk.result}
                      </p>
                    </div>
                  )}

                  {/* For Alumni Perk 2: Campus Privileges */}
                  {perk.campusPrivileges && (
                    <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 text-purple-950 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-purple-800">
                        <Award className="w-3.5 h-3.5 text-purple-600" />
                        <span>VIP Campus Privileges</span>
                      </div>
                      <p className="text-purple-900">{perk.campusPrivileges}</p>
                    </div>
                  )}

                  {/* For Alumni Perk 2: Citation */}
                  {perk.citation && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-1">
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
            <div className="rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 p-4 sm:p-5 flex flex-col justify-between space-y-3 transition group">
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
            <div className="rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 p-4 sm:p-5 flex flex-col justify-between space-y-3 transition group">
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
            <div className="rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 p-4 sm:p-5 flex flex-col justify-between space-y-3 transition group">
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
            <div className="rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 p-4 sm:p-5 flex flex-col justify-between space-y-3 transition group">
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
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-rose-200/90 flex items-start gap-2.5">
              <span className="text-sm mt-0.5">❌</span>
              <div>
                <strong className="text-rose-100 block mb-0.5">The Broken Status Quo (Cold DMs):</strong>
                Juniors spam 200 random alumni on LinkedIn with generic resumes. 99% get deleted. Seniors get annoyed by unvetted inbox spam.
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-200/90 flex items-start gap-2.5">
              <span className="text-sm mt-0.5">✅</span>
              <div>
                <strong className="text-emerald-100 block mb-0.5">The KnowPass Flywheel Solution:</strong>
                Seniors only review proven campus contributors. Juniors earn direct access through merit. Senior gets a ₹30k–₹1.5L referral reward.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          TOP PODIUM: 1ST, 2ND, 3RD PLACE
      ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-black text-slate-900">
              {activeBoard === 'students' ? 'Current Semester Student Champions' : 'Top Alumni Industry Mentors'}
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500">Live Institutional Standings</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
          {/* 2nd Place */}
          {top3[1] && (
            <Card className="p-6 order-2 md:order-1 flex flex-col justify-between border-slate-200 bg-gradient-to-b from-slate-50/80 to-white relative hover:shadow-md transition">
              <div className="text-center space-y-3">
                <div className="relative inline-block">
                  <img
                    src={top3[1].avatar}
                    alt={top3[1].name}
                    className="w-20 h-20 rounded-2xl mx-auto object-cover ring-4 ring-slate-300 shadow-md"
                  />
                  <span className="absolute -bottom-2.5 -right-2.5 w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center border-2 border-white shadow">
                    🥈
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{top3[1].name}</h3>
                  {activeBoard === 'alumni' ? (
                    <p className="text-xs font-bold text-emerald-700 mt-0.5">
                      {top3[1].currentCompany} • {top3[1].currentRole}
                    </p>
                  ) : (
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {top3[1].year} • {top3[1].department}
                    </p>
                  )}
                  <span className="inline-block mt-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                    {top3[1].level}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {activeBoard === 'alumni' ? 'Mentored' : 'Approved SOPs'}: <strong>{top3[1].upvotesReceived || top3[1].entriesCount}</strong>
                </span>
                <span className="font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl">
                  {top3[1].knowPoints.toLocaleString()} pts
                </span>
              </div>
            </Card>
          )}

          {/* 1st Place Champion */}
          {top3[0] && (
            <Card className="p-6 order-1 md:order-2 flex flex-col justify-between border-amber-300 bg-gradient-to-b from-amber-50/50 via-white to-white relative shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/40">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow flex items-center gap-1">
                <Trophy className="w-3 h-3 text-white" /> Rank #1 Champion
              </div>

              <div className="text-center space-y-3 pt-2">
                <div className="relative inline-block">
                  <img
                    src={top3[0].avatar}
                    alt={top3[0].name}
                    className="w-24 h-24 rounded-2xl mx-auto object-cover ring-4 ring-amber-400 shadow-xl"
                  />
                  <span className="absolute -bottom-2.5 -right-2.5 w-9 h-9 rounded-full bg-amber-400 text-white font-black text-sm flex items-center justify-center border-2 border-white shadow">
                    👑
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">{top3[0].name}</h3>
                  {activeBoard === 'alumni' ? (
                    <div className="mt-1">
                      <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        <Briefcase className="w-3 h-3" /> {top3[0].currentCompany} ({top3[0].graduationYear})
                      </span>
                      <p className="text-xs text-slate-600 font-semibold mt-1">{top3[0].currentRole}</p>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <span className="inline-flex items-center gap-1 text-xs font-black text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                        <GraduationCap className="w-3 h-3" /> {top3[0].year}
                      </span>
                      <p className="text-xs text-slate-600 font-semibold mt-1">{top3[0].department}</p>
                    </div>
                  )}
                  <span className="inline-block mt-2 text-xs font-black text-amber-700 bg-amber-100 border border-amber-200 px-3 py-0.5 rounded-full">
                    {top3[0].level}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-amber-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">
                  {activeBoard === 'alumni' ? 'Juniors Mentored' : 'Approved SOPs'}: <strong className="text-slate-800">{top3[0].upvotesReceived || top3[0].entriesCount}</strong>
                </span>
                <span className="font-black text-base text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                  {top3[0].knowPoints.toLocaleString()} pts
                </span>
              </div>
            </Card>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <Card className="p-6 order-3 flex flex-col justify-between border-slate-200 bg-gradient-to-b from-slate-50/80 to-white relative hover:shadow-md transition">
              <div className="text-center space-y-3">
                <div className="relative inline-block">
                  <img
                    src={top3[2].avatar}
                    alt={top3[2].name}
                    className="w-20 h-20 rounded-2xl mx-auto object-cover ring-4 ring-amber-700/40 shadow-md"
                  />
                  <span className="absolute -bottom-2.5 -right-2.5 w-8 h-8 rounded-full bg-amber-700/20 text-amber-900 font-black text-xs flex items-center justify-center border-2 border-white shadow">
                    🥉
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{top3[2].name}</h3>
                  {activeBoard === 'alumni' ? (
                    <p className="text-xs font-bold text-emerald-700 mt-0.5">
                      {top3[2].currentCompany} • {top3[2].currentRole}
                    </p>
                  ) : (
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {top3[2].year} • {top3[2].department}
                    </p>
                  )}
                  <span className="inline-block mt-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                    {top3[2].level}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {activeBoard === 'alumni' ? 'Mentored' : 'Approved SOPs'}: <strong>{top3[2].upvotesReceived || top3[2].entriesCount}</strong>
                </span>
                <span className="font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl">
                  {top3[2].knowPoints.toLocaleString()} pts
                </span>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* ========================================================
          RULES & SCORING BREAKDOWN
      ======================================================== */}
      <Card className="p-6 border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900">
              {activeBoard === 'students' ? 'How Current Students Earn KnowPoints' : 'How Passed-Out Alumni Earn Impact Points'}
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-400">Rules & Point Mechanics</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {(activeBoard === 'students' ? STUDENT_POINT_RULES : ALUMNI_POINT_RULES).map((rule, idx) => {
            const Icon = rule.icon;
            return (
              <div key={idx} className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-lg ${rule.bg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-emerald-600">{rule.points}</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 leading-tight">{rule.action}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{rule.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ========================================================
          LEADERBOARD TABLE & SEARCH FILTER
      ======================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {activeBoard === 'students' ? '🎓 Junior Student Rankings Table' : '💼 Passed-Out Alumni Mentors Table'}
            </h2>
            <p className="text-xs text-slate-500">
              {activeBoard === 'students'
                ? 'Filtered for current 1st-4th year campus scholars'
                : 'Filtered for graduated seniors, working professionals & industry fellows'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeBoard === 'students' ? 'Search student or branch...' : 'Search alumni or company (NVIDIA, Google)...'}
                className="text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 shadow-2xs w-44 sm:w-60"
              />
            </div>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 outline-none shadow-2xs"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science">Computer Science (CSE)</option>
              <option value="Information Technology">Information Technology (IT)</option>
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
                  <th className="py-3.5 px-4">{activeBoard === 'students' ? 'Junior Contributor' : 'Alumni Industry Mentor'}</th>
                  <th className="py-3.5 px-4">{activeBoard === 'students' ? 'Department & Year' : 'Current Organization & Batch'}</th>
                  <th className="py-3.5 px-4 text-center">{activeBoard === 'students' ? 'SOPs Authored' : 'Playbooks'}</th>
                  <th className="py-3.5 px-4 text-center">{activeBoard === 'students' ? 'Upvotes' : 'Mentored'}</th>
                  <th className="py-3.5 px-4">{activeBoard === 'students' ? 'Badges & T&P Status' : 'Badges & Privileges'}</th>
                  <th className="py-3.5 px-4 text-right">Points</th>
                  {activeBoard === 'alumni' && <th className="py-3.5 px-4 text-center">Referral Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentList.map((c) => (
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
                      {activeBoard === 'students' ? (
                        <>
                          <p className="font-semibold text-slate-700">{c.department}</p>
                          <p className="text-[10px] text-slate-400">{c.year}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-slate-900 flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-emerald-600" /> {c.currentCompany}
                          </p>
                          <p className="text-[10px] text-slate-500">{c.currentRole} • {c.graduationYear}</p>
                        </>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {c.entriesCount}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                      👍 {c.upvotesReceived}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 items-center">
                        {c.badges.map((b) => (
                          <span key={b} className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                            {b}
                          </span>
                        ))}
                        {c.tpStatus && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                            🎯 {c.tpStatus}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="text-sm font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl">
                        {c.knowPoints.toLocaleString()} pts
                      </span>
                    </td>

                    {activeBoard === 'alumni' && (
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpenAlumniRequest(c)}
                          className="px-2.5 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition flex items-center gap-1.5 mx-auto"
                          title="Ask senior for referral or mock interview"
                        >
                          <Send className="w-3 h-3" />
                          <span>Request Referral</span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ========================================================
          RECENT ACTIVITY FEED (STUDENTS & ALUMNI)
      ======================================================== */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Recent Campus & Industry Mentorship Stream</h3>
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
          MODAL 1: REFERRAL INVITATION (+30 pts)
      ======================================================== */}
      {referralModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold bg-amber-500 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  +30 Points Reward
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Invite a Junior or Alumni Contributor
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
                <label className="block font-bold text-slate-700 mb-1">Send Invite via Email *</label>
                <input
                  type="email"
                  required
                  value={referralEmail}
                  onChange={(e) => setReferralEmail(e.target.value)}
                  placeholder="peer.name@campus.edu or alumni@company.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl text-amber-900 text-[11px] space-y-1">
                <p className="font-bold">How points are awarded:</p>
                <p>When your invited classmate or senior authors their first approved lab note or placement guide, +30 KnowPoints are credited to your account.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" type="button" onClick={() => setReferralModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
                  <Send className="w-3.5 h-3.5 mr-1" />
                  Send Invite
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: REQUEST 1-ON-1 ALUMNI REFERRAL / MOCK INTERVIEW
      ======================================================== */}
      {alumniReferralModalOpen && selectedAlumnus && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedAlumnus.avatar}
                  alt={selectedAlumnus.name}
                  className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-400"
                />
                <div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {selectedAlumnus.currentCompany} • {selectedAlumnus.graduationYear}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">
                    Request Mentorship from {selectedAlumnus.name}
                  </h3>
                </div>
              </div>
              <button onClick={() => setAlumniReferralModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAlumniRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Type of Assistance Requested *</label>
                <select
                  value={referralForm.requestType}
                  onChange={(e) => setReferralForm({ ...referralForm, requestType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-500"
                >
                  <option value="Direct Company Referral">🎯 Direct Job / Internship Referral at {selectedAlumnus.currentCompany}</option>
                  <option value="45-Min Technical Mock Interview">🗣️ 45-Min Technical Mock Interview (System Design / Coding)</option>
                  <option value="Resume & Portfolio Critique">📄 Resume & Portfolio Roast / Critique</option>
                  <option value="SOP Technical Guidance">💡 Guidance on Lab Project / Final Year Thesis</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Target Role & Batch *</label>
                <input
                  type="text"
                  required
                  value={referralForm.targetRole}
                  onChange={(e) => setReferralForm({ ...referralForm, targetRole: e.target.value })}
                  placeholder="e.g. SDE-1 / Robotics Intern (Batch of 2026)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Resume or GitHub Profile URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={referralForm.resumeLink}
                  onChange={(e) => setReferralForm({ ...referralForm, resumeLink: e.target.value })}
                  placeholder="https://github.com/yourname or Google Drive resume link"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Personal Note to Senior</label>
                <textarea
                  rows={3}
                  value={referralForm.note}
                  onChange={(e) => setReferralForm({ ...referralForm, note: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 leading-relaxed"
                  placeholder="Mention any specific project or question you want to discuss..."
                />
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-indigo-900 text-[11px] space-y-1">
                <p className="font-bold">✨ Two-Way Ecosystem Guarantee:</p>
                <p>
                  Because you reached the required points threshold on KnowPass, this request is prioritized in <strong>{selectedAlumnus.name}</strong>'s referral inbox. If you get hired, your senior also receives their corporate referral bonus!
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" type="button" onClick={() => setAlumniReferralModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Request to Senior</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
