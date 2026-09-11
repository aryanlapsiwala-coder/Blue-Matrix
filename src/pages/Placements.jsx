import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { DotPattern } from '../components/ui/dot-pattern';
import { CompanyLogo } from '../components/common/CompanyLogo';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../constants/roles';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { knowledgeService } from '../services/knowledgeService';
import { pushCampusNotification } from '../services/notificationService';
import {
  Briefcase,
  Search,
  Building2,
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Send,
  UserCheck,
  ChevronRight,
  ExternalLink,
  Filter,
  PlusCircle,
  X,
  FileText,
  Star,
  Users,
  Sparkles,
  MessageSquare,
  Clock,
  Code2,
  Check,
  HelpCircle,
  GraduationCap,
  ThumbsUp,
  Trash2,
  Copy,
  Download,
  Plus,
  Minus,
} from 'lucide-react';

// ==========================================
// 1. DATASETS
// ==========================================

const INITIAL_COMPANY_INSIGHTS = [
  {
    id: 'comp_01',
    company: 'Google',
    logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100',
    color: 'border-blue-200 bg-blue-50/40 text-blue-700',
    role: 'Software Development Engineer (SDE-1)',
    department: 'Computer Science & Engineering',
    batchYear: '2025 Placed (Senior)',
    author: 'Alex Chen',
    authorRole: 'STUDENT',
    ctcRange: '₹44.5 LPA (₹28L Base + RSUs + Bonus)',
    roundsCount: 5,
    rounds: [
      { name: 'Round 1: Online Assessment', desc: '2 Graph DFS/BFS questions + 1 DP matrix problem on HackerEarth (90 mins).' },
      { name: 'Round 2: Data Structures & Algorithms', desc: 'Trie-based prefix matching and sliding window string compression.' },
      { name: 'Round 3: Low-Level Design (LLD)', desc: 'Thread-safe parking lot rate limiter with concurrent mutex locks.' },
      { name: 'Round 4: High-Level System Design (HLD)', desc: 'Distributed URL Shortener with Redis token-bucket caching & database sharding.' },
      { name: 'Round 5: Googleyness & Behavioral', desc: 'STAR format leadership stories, conflict handling, and peer mentorship examples.' },
    ],
    topTips: 'Focus deeply on edge cases during coding rounds. Always communicate time & space complexity before writing single line of code. Practice LeetCode Hard Trees & Graphs.',
    questionsAsked: ['Design a Distributed Rate Limiter with 50k RPS', 'Course Schedule IV (Topological Sort)', 'Implement LRU Cache with O(1) eviction'],
    views: 1840,
    likes: 312,
  },
  {
    id: 'comp_02',
    company: 'NVIDIA',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100',
    color: 'border-emerald-200 bg-emerald-50/40 text-emerald-700',
    role: 'Systems Software & CUDA Kernel Engineer',
    department: 'Central Computing & Hardware Labs',
    batchYear: '2025 Placed',
    author: 'Marcus Ramirez',
    authorRole: 'ALUMNI',
    ctcRange: '₹38.0 LPA (₹24L Base + Equity)',
    roundsCount: 4,
    rounds: [
      { name: 'Round 1: C/C++ & OS Fundamentals', desc: 'Pointer arithmetic, virtual memory paging, cache lines, and memory barrier synchronization.' },
      { name: 'Round 2: GPU Architecture & CUDA', desc: 'Thread block hierarchy, shared memory bank conflicts, and warp divergence profiling.' },
      { name: 'Round 3: Parallel Matrix Multiplication', desc: 'Implementing tiled matrix multiplication using CUDA shared memory.' },
      { name: 'Round 4: Technical Bar Raiser', desc: 'Linux kernel device driver architecture and PCI-e DMA transfers.' },
    ],
    topTips: 'Understanding GPU hardware architecture (SMs, warps, registers) is just as critical as raw code. Be comfortable explaining memory hierarchy bottlenecks.',
    questionsAsked: ['How do you resolve shared memory bank conflicts in CUDA?', 'Implement lock-free circular ring buffer in C++17', 'Explain virtual address translation via TLB'],
    views: 1420,
    likes: 245,
  },
  {
    id: 'comp_03',
    company: 'Microsoft',
    logo: 'https://images.unsplash.com/photo-1583321500900-82807e458f3c?w=100',
    color: 'border-cyan-200 bg-cyan-50/40 text-cyan-700',
    role: 'Cloud & Distributed Systems Engineer (Azure)',
    department: 'Computer Science & Engineering',
    batchYear: '2024 Alumni',
    author: 'Sneha Reddy',
    authorRole: 'ALUMNI',
    ctcRange: '₹42.0 LPA (₹26L Base + Stock)',
    roundsCount: 4,
    rounds: [
      { name: 'Round 1: Codility Coding Screen', desc: '3 LeetCode Medium/Hard DP and Tree recursion problems (75 mins).' },
      { name: 'Round 2: Data Structures & System Locks', desc: 'Binary search over rotated arrays and multi-threaded consumer queue implementation.' },
      { name: 'Round 3: Distributed Microservices Design', desc: 'Designing an idempotent payment webhook processor using Azure Service Bus.' },
      { name: 'Round 4: Partner / Director Round', desc: 'Deep dive into final year project, architecture trade-offs, and microservices failure recovery.' },
    ],
    topTips: 'Microsoft interviewers love clean OOP principles, modular design, and clear unit-testing mentality. Master concurrency locks and gRPC.',
    questionsAsked: ['Design distributed notification system handling 10M pushes/sec', 'Lowest Common Ancestor in Binary Tree', 'Implement Circuit Breaker pattern'],
    views: 1680,
    likes: 289,
  },
  {
    id: 'comp_04',
    company: 'Texas Instruments',
    logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100',
    color: 'border-rose-200 bg-rose-50/40 text-rose-700',
    role: 'Digital VLSI Design & Verification Engineer',
    department: 'Electronics & Communication (ECE)',
    batchYear: '2025 Placed',
    author: 'Priya Sundaram',
    authorRole: 'FACULTY',
    ctcRange: '₹31.5 LPA (₹20L Base + Performance Bonus)',
    roundsCount: 3,
    rounds: [
      { name: 'Round 1: Written Technical & Aptitude', desc: 'CMOS inverter delay calculations, state machine diagrams, and Verilog timing assertions.' },
      { name: 'Round 2: Setup/Hold Time & Static Timing (STA)', desc: 'Clock skew analysis, multi-cycle paths, and metastablity resolution with double-flop synchronizers.' },
      { name: 'Round 3: SystemVerilog & UVM Testbench', desc: 'Writing constrained-random verification testbenches with functional coverage bins.' },
    ],
    topTips: 'Be 100% crystal clear on Setup & Hold time violation equations and how to fix them with clock buffers or combinational logic restructuring.',
    questionsAsked: ['Calculate maximum operating frequency given clock-to-q and setup delays', 'Write synthesizable FSM in Verilog for sequence detector 1011', 'Explain asynchronous FIFO pointer synchronization with Gray code'],
    views: 1190,
    likes: 198,
  },
];

const SKILL_GAP_DATA = [
  {
    id: 'sg_01',
    domain: 'Distributed Systems & Cloud Architecture',
    department: 'Computer Science & Engineering (CSE)',
    alumniDemand: '88% of alumni interviews required hands-on Raft Consensus, gRPC, and Redis Rate-Limiting architectures.',
    collegeCurriculum: 'Curriculum covers theoretical Paxos overview and single-server OS semaphores (CS-402).',
    gapSeverity: 'CRITICAL GAP',
    gapScore: 85,
    recommendation: 'Incorporate live Dockerized Raft consensus labs and gRPC client-server projects in 6th semester.',
    resourceLink: 'Distributed Systems: Raft Consensus Playbook (CS-402)',
  },
  {
    id: 'sg_02',
    domain: 'Vector Databases & Production RAG AI',
    department: 'Information Technology & AI',
    alumniDemand: '76% of modern AI/ML engineering roles required vector embeddings, cosine retrieval, and LLM grounding experience.',
    collegeCurriculum: 'Current syllabus focuses purely on classical NLP (TF-IDF, N-grams, Naive Bayes).',
    gapSeverity: 'CRITICAL GAP',
    gapScore: 90,
    recommendation: 'Add hands-on vector store modules (Chroma/FAISS) and LLM API grounding to AI coursework.',
    resourceLink: 'KnowBot Semantic Search & Vector Embeddings Architecture SOP',
  },
  {
    id: 'sg_03',
    domain: 'Static Timing Analysis (STA) & UVM Verification',
    department: 'Electronics & Communication (ECE)',
    alumniDemand: '92% of hardware interviews at Qualcomm, NVIDIA & TI tested Setup/Hold clock jitter and SystemVerilog UVM testbenches.',
    collegeCurriculum: 'Covers basic 8051 assembly and 2-input CMOS inverter layout DRC checks.',
    gapSeverity: 'CRITICAL GAP',
    gapScore: 88,
    recommendation: 'Introduce Cadence Virtuoso Parasitic Extraction and Synopsys PrimeTime STA workshops.',
    resourceLink: 'VLSI Digital Design: CMOS Circuit Simulation & Verilog Testbench Guide',
  },
  {
    id: 'sg_04',
    domain: 'Production Linux Kernel & High-Performance HPC',
    department: 'Central Computing & Hardware Labs',
    alumniDemand: '65% of systems infrastructure roles require SLURM batch execution, CUDA profiling, and Linux namespaces.',
    collegeCurriculum: 'Basic shell scripting and process scheduling algorithms.',
    gapSeverity: 'MODERATE GAP',
    gapScore: 55,
    recommendation: 'Provide student access tokens to the campus 32-node A100 GPU cluster during final-year projects.',
    resourceLink: 'HPC Cluster Setup & SLURM Access Guidelines',
  },
  {
    id: 'sg_05',
    domain: 'Microservices Low-Level Design (LLD) & Design Patterns',
    department: 'Computer Science & Engineering (CSE)',
    alumniDemand: '94% of SDE-1 placement rounds tested Factory, Strategy, Observer patterns and thread-safe queues.',
    collegeCurriculum: 'Basic Object Oriented Programming in C++ with polymorphism.',
    gapSeverity: 'MODERATE GAP',
    gapScore: 60,
    recommendation: 'Hold 4th-year LLD mock interview marathons covering real-world concurrency lock architectures.',
    resourceLink: 'Google & Microsoft Campus Placement: System Design Playbook',
  },
];

const ALUMNI_DIRECTORY = [
  {
    id: 'alm_01',
    name: 'David Kim',
    batch: 'Batch of 2024',
    company: 'Google',
    role: 'Software Engineer (Search Infrastructure)',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    skills: ['Distributed Systems', 'C++', 'System Design', 'Go', 'LeetCode Hard'],
    bio: 'Former campus CP club lead. Happy to conduct mock interviews and resume reviews for 3rd and 4th-year students.',
    sessionsCompleted: 18,
    rating: 4.9,
    status: 'Open for Mentorship',
  },
  {
    id: 'alm_02',
    name: 'Sneha Reddy',
    batch: 'Batch of 2024',
    company: 'Microsoft',
    role: 'Cloud Engineer (Azure Storage Core)',
    department: 'Information Technology',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    skills: ['Azure', 'Distributed Locks', 'Microservices', 'C#', 'SQL'],
    bio: 'Specialized in microservice resilience, system design frameworks, and behavioral STAR stories.',
    sessionsCompleted: 24,
    rating: 5.0,
    status: 'Open for Mentorship',
  },
  {
    id: 'alm_03',
    name: 'Vikram Malhotra',
    batch: 'Batch of 2023',
    company: 'NVIDIA',
    role: 'Senior CUDA Architect',
    department: 'Central Hardware & HPC Labs',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    skills: ['CUDA', 'GPU Architecture', 'C++20', 'Linux Drivers', 'HPC'],
    bio: 'Helped 6 juniors secure semiconductor and systems roles. Available on weekends for technical deep dives.',
    sessionsCompleted: 31,
    rating: 5.0,
    status: 'Open for Mentorship',
  },
  {
    id: 'alm_04',
    name: 'Fatima Al-Mansoor',
    batch: 'Batch of 2024',
    company: 'Texas Instruments',
    role: 'Silicon Validation Engineer',
    department: 'Electronics & Communication (ECE)',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    skills: ['STA', 'Verilog', 'UVM', 'FPGA', 'Cadence Virtuoso'],
    bio: 'Core hardware interview mentor. Can review STA setups and digital testbench architectures.',
    sessionsCompleted: 14,
    rating: 4.8,
    status: 'Open for Mentorship',
  },
  {
    id: 'alm_05',
    name: 'Karan Singhania',
    batch: 'Batch of 2023',
    company: 'Goldman Sachs',
    role: 'Quantitative Developer',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    skills: ['Low Latency C++', 'Algorithms', 'Linear Algebra', 'Multi-Threading'],
    bio: 'Focuses on financial engineering, probability puzzles, and high-frequency trading interview preparation.',
    sessionsCompleted: 22,
    rating: 4.9,
    status: 'Open for Mentorship',
  },
];

// ==========================================
// 2. MAIN PAGE COMPONENT
// ==========================================

export function Placements() {
  const { user, role, awardPoints } = useAuth();

  // Active Tab: 'insights' | 'skills' | 'alumni'
  const [activeTab, setActiveTab] = useState('insights');

  // State for Company Insights with persistent custom storage
  const [companyInsights, setCompanyInsights] = useState(() => {
    try {
      const saved = localStorage.getItem('knowpass_placement_insights_custom');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existing = new Set(parsed.map((i) => i.id));
          const benchmarks = INITIAL_COMPANY_INSIGHTS.filter((b) => !existing.has(b.id));
          return [...parsed, ...benchmarks];
        }
      }
    } catch {}
    return INITIAL_COMPANY_INSIGHTS;
  });

  const [companySearch, setCompanySearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');
  const [selectedPlaybookModal, setSelectedPlaybookModal] = useState(null);
  const [copiedQuestions, setCopiedQuestions] = useState(false);

  // Upvoted / Liked playbooks
  const [likedInsights, setLikedInsights] = useState(() => {
    try {
      const saved = localStorage.getItem(`knowpass_liked_insights_${user?.email || 'guest'}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // State for Skill Gap Report & Voting
  const [skillGapDepartmentFilter, setSkillGapDepartmentFilter] = useState('All');
  const [skillGaps, setSkillGaps] = useState(() => {
    const defaultGaps = [
      { ...SKILL_GAP_DATA[0], votes: 142 },
      { ...SKILL_GAP_DATA[1], votes: 118 },
      { ...SKILL_GAP_DATA[2], votes: 96 },
      { ...SKILL_GAP_DATA[3], votes: 64 },
      { ...SKILL_GAP_DATA[4], votes: 85 },
    ];
    try {
      const saved = localStorage.getItem('knowpass_skill_gaps_custom');
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultGaps;
  });

  const [userVotedGaps, setUserVotedGaps] = useState(() => {
    try {
      const saved = localStorage.getItem(`knowpass_voted_gaps_${user?.email || 'guest'}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Request Missing Skill Modal
  const [requestSkillModalOpen, setRequestSkillModalOpen] = useState(false);
  const [reqDomain, setReqDomain] = useState('');
  const [reqDept, setReqDept] = useState('Computer Science & Engineering (CSE)');
  const [reqDemand, setReqDemand] = useState('');
  const [reqCurriculum, setReqCurriculum] = useState('');
  const [reqRec, setReqRec] = useState('');
  const [reqSuccessToast, setReqSuccessToast] = useState(false);

  const handleVoteSkillGap = (id) => {
    const isVoted = userVotedGaps.includes(id);
    const updatedVoted = isVoted
      ? userVotedGaps.filter((v) => v !== id)
      : [...userVotedGaps, id];
    setUserVotedGaps(updatedVoted);
    localStorage.setItem(`knowpass_voted_gaps_${user?.email || 'guest'}`, JSON.stringify(updatedVoted));

    setSkillGaps((prev) => {
      const updated = prev.map((sg) => {
        if (sg.id === id) {
          return { ...sg, votes: (sg.votes || 0) + (isVoted ? -1 : 1) };
        }
        return sg;
      });
      localStorage.setItem('knowpass_skill_gaps_custom', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRequestSkillSubmit = (e) => {
    e.preventDefault();
    if (!reqDomain.trim() || !reqDemand.trim()) return;

    const newGap = {
      id: `sg_custom_${Date.now()}`,
      domain: reqDomain.trim(),
      department: reqDept,
      alumniDemand: reqDemand.trim(),
      collegeCurriculum: reqCurriculum.trim() || 'Not currently covered in core syllabus.',
      gapSeverity: 'HIGH DEMAND GAP',
      gapScore: 92,
      votes: 1,
      recommendation: reqRec.trim() || 'Incorporate elective workshop or hands-on mini-project.',
      resourceLink: `${reqDomain.trim()} Learning Blueprint`,
    };

    const updated = [newGap, ...skillGaps];
    setSkillGaps(updated);
    localStorage.setItem('knowpass_skill_gaps_custom', JSON.stringify(updated));

    if (awardPoints) {
      awardPoints(25, `Submitted Curriculum Gap for "${reqDomain.trim()}"`);
    }

    pushCampusNotification(user?.email, {
      title: 'Curriculum Skill Gap Proposed 🎓',
      desc: `Your feedback on "${reqDomain.trim()}" has been routed to Academic Deans & HODs! (+25 pts)`,
      type: 'points',
      link: '/placements',
    });

    setUserVotedGaps((prev) => [...prev, newGap.id]);
    setRequestSkillModalOpen(false);
    setReqSuccessToast(true);
    setReqDomain('');
    setReqDemand('');
    setReqCurriculum('');
    setReqRec('');
    setTimeout(() => setReqSuccessToast(false), 4000);
  };

  // State for Alumni Directory
  const [alumniSearch, setAlumniSearch] = useState('');
  const [selectedAlumniForMentor, setSelectedAlumniForMentor] = useState(null);
  const [mentorSessionType, setMentorSessionType] = useState('Mock Technical Interview & DSA');
  const [mentorDate, setMentorDate] = useState('2026-09-05');
  const [mentorTime, setMentorTime] = useState('18:00');
  const [mentorAgenda, setMentorAgenda] = useState('');
  const [mentorSuccessToast, setMentorSuccessToast] = useState(false);

  // State for "Share your placement experience" quick form modal
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareCompany, setShareCompany] = useState('');
  const [shareRole, setShareRole] = useState('Software Development Engineer (SDE-1)');
  const [shareCTC, setShareCTC] = useState('');
  const [shareDept, setShareDept] = useState('Computer Science & Engineering (CSE)');
  const [shareBatch, setShareBatch] = useState('2026 Batch');
  const [shareDifficulty, setShareDifficulty] = useState('Medium');
  const [shareOfferStatus, setShareOfferStatus] = useState('Offer Accepted & Placed');
  const [customRounds, setCustomRounds] = useState([
    { name: 'Round 1: Online Assessment / Screening', desc: '2 LeetCode Medium/Hard DP and Tree recursion problems (90 mins).' },
    { name: 'Round 2: Data Structures & Algorithms', desc: 'Live coding on Trie prefix matching and sliding window string compression.' },
    { name: 'Round 3: Low-Level / System Architecture', desc: 'Thread-safe parking lot or distributed rate limiter design.' },
    { name: 'Round 4: Managerial & Cultural Fit', desc: 'STAR format behavioral stories, conflict resolution, and leadership examples.' },
  ]);
  const [shareQuestions, setShareQuestions] = useState('');
  const [shareTips, setShareTips] = useState('');
  const [shareSuccessToast, setShareSuccessToast] = useState(false);

  const handleAddRound = () => {
    setCustomRounds((prev) => [
      ...prev,
      { name: `Round ${prev.length + 1}: Technical / Domain Assessment`, desc: '' },
    ]);
  };

  const handleRemoveRound = (index) => {
    setCustomRounds((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRoundChange = (index, field, value) => {
    setCustomRounds((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const handleToggleLike = (insightId) => {
    const isLiked = likedInsights.includes(insightId);
    const updatedLiked = isLiked
      ? likedInsights.filter((id) => id !== insightId)
      : [...likedInsights, insightId];
    setLikedInsights(updatedLiked);
    localStorage.setItem(`knowpass_liked_insights_${user?.email || 'guest'}`, JSON.stringify(updatedLiked));

    setCompanyInsights((prev) => {
      const updated = prev.map((item) => {
        if (item.id === insightId) {
          return { ...item, likes: Math.max(0, (item.likes || 0) + (isLiked ? -1 : 1)) };
        }
        return item;
      });
      try {
        const customSaved = localStorage.getItem('knowpass_placement_insights_custom');
        if (customSaved) {
          const customParsed = JSON.parse(customSaved);
          const updatedCustom = customParsed.map((it) => {
            if (it.id === insightId) {
              return { ...it, likes: Math.max(0, (it.likes || 0) + (isLiked ? -1 : 1)) };
            }
            return it;
          });
          localStorage.setItem('knowpass_placement_insights_custom', JSON.stringify(updatedCustom));
        }
      } catch {}
      return updated;
    });
  };

  const handleDeleteInsight = (insightId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this interview playbook?')) return;

    setCompanyInsights((prev) => {
      const updated = prev.filter((i) => i.id !== insightId);
      try {
        const customSaved = localStorage.getItem('knowpass_placement_insights_custom');
        if (customSaved) {
          const customParsed = JSON.parse(customSaved);
          const updatedCustom = customParsed.filter((it) => it.id !== insightId);
          localStorage.setItem('knowpass_placement_insights_custom', JSON.stringify(updatedCustom));
        }
      } catch {}
      return updated;
    });
  };

  const handleCopyQuestions = (questions) => {
    if (!questions || !questions.length) return;
    navigator.clipboard.writeText(questions.join('\n'));
    setCopiedQuestions(true);
    setTimeout(() => setCopiedQuestions(false), 2000);
  };

  const handleDownloadPlaybook = (playbook) => {
    if (!playbook) return;
    const content = `# 💼 ${playbook.company} Interview Playbook
**Role:** ${playbook.role}
**Department:** ${playbook.department || 'N/A'}
**Batch / Year:** ${playbook.batchYear}
**Author:** ${playbook.author}
**Verified CTC / Package:** ${playbook.ctcRange}
**Difficulty:** ${playbook.difficulty || 'Medium'}
**Status:** ${playbook.offerStatus || 'Verified'}

---

## 🎯 Interview Rounds Breakdown (${playbook.rounds?.length || 0} Rounds)
${playbook.rounds?.map((r, i) => `### ${r.name}\n${r.desc}`).join('\n\n') || 'N/A'}

---

## ❓ Questions Asked in Interview
${playbook.questionsAsked?.map((q, i) => `${i + 1}. ${q}`).join('\n') || 'N/A'}

---

## 💡 Preparation Advice & High-Yield Tips
${playbook.topTips || 'N/A'}

---
*Generated via KnowPass Global Placement Intelligence Hub*
`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${playbook.company.replace(/\s+/g, '_')}_Interview_Playbook.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Live Supabase query for placement insights
  useEffect(() => {
    const fetchLivePlacementInsights = async () => {
      let customLocals = [];
      try {
        const saved = localStorage.getItem('knowpass_placement_insights_custom');
        if (saved) customLocals = JSON.parse(saved);
      } catch {}

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('placement_insights')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            const dbInsights = data.map((d) => ({
              id: d.id,
              company: d.company,
              logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100',
              color: 'border-indigo-200 bg-indigo-50/40 text-indigo-700',
              role: d.role,
              department: d.department || 'Computer Science & Engineering',
              batchYear: d.batch || '2026 Batch',
              author: d.author_name || 'Placed Senior',
              authorEmail: d.author_email || '',
              authorRole: 'STUDENT',
              ctcRange: d.ctc || '₹18 - ₹32 LPA',
              roundsCount: Array.isArray(d.rounds) ? d.rounds.length : 4,
              rounds: Array.isArray(d.rounds)
                ? d.rounds.map((r, i) => ({ name: r.name || `Round ${i + 1}: ${r.roundName || 'Technical'}`, desc: r.desc || r.details || 'Interview assessment' }))
                : [
                    { name: 'Round 1: Screening & Coding Test', desc: 'Online coding and domain fundamentals.' },
                    { name: 'Round 2: Technical Interview', desc: 'Data Structures and Algorithms.' },
                  ],
              topTips: d.tips || 'Master core fundamentals and past projects.',
              questionsAsked: Array.isArray(d.interview_questions) ? d.interview_questions : ['Explain past capstone project architecture', 'Solve dynamic programming problem'],
              views: 45,
              likes: 12,
            }));

            const seenIds = new Set();
            const combined = [];
            for (const item of [...customLocals, ...dbInsights, ...INITIAL_COMPANY_INSIGHTS]) {
              const key = item.id || `${item.company}_${item.role}`;
              if (!seenIds.has(key)) {
                seenIds.add(key);
                combined.push(item);
              }
            }
            setCompanyInsights(combined);
            return;
          }
        } catch (err) {
          console.warn('Placement live sync error:', err);
        }
      }

      if (customLocals.length > 0) {
        const existingIds = new Set(customLocals.map((c) => c.id));
        const benchmarks = INITIAL_COMPANY_INSIGHTS.filter((b) => !existingIds.has(b.id));
        setCompanyInsights([...customLocals, ...benchmarks]);
      }
    };

    fetchLivePlacementInsights();
  }, []);

  // Filtered Company Insights
  const filteredCompanyInsights = useMemo(() => {
    return companyInsights.filter((item) => {
      const matchSearch =
        item.company.toLowerCase().includes(companySearch.toLowerCase()) ||
        item.role.toLowerCase().includes(companySearch.toLowerCase()) ||
        item.topTips.toLowerCase().includes(companySearch.toLowerCase());
      const matchRole =
        selectedRoleFilter === 'All' || item.role.includes(selectedRoleFilter);
      return matchSearch && matchRole;
    });
  }, [companyInsights, companySearch, selectedRoleFilter]);

  // Filtered Skill Gaps
  const filteredSkillGaps = useMemo(() => {
    return skillGaps.filter((sg) => {
      if (skillGapDepartmentFilter === 'All') return true;
      return sg.department.includes(skillGapDepartmentFilter);
    });
  }, [skillGaps, skillGapDepartmentFilter]);

  // Filtered Alumni Directory
  const filteredAlumni = useMemo(() => {
    return ALUMNI_DIRECTORY.filter((alm) => {
      return (
        alm.name.toLowerCase().includes(alumniSearch.toLowerCase()) ||
        alm.company.toLowerCase().includes(alumniSearch.toLowerCase()) ||
        alm.role.toLowerCase().includes(alumniSearch.toLowerCase()) ||
        alm.skills.some((s) => s.toLowerCase().includes(alumniSearch.toLowerCase()))
      );
    });
  }, [alumniSearch]);

  // Handle Mentor Booking Submit
  const handleBookMentorSession = async (e) => {
    e.preventDefault();
    if (!selectedAlumniForMentor) return;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('mentorship_sessions').insert([
          {
            mentor_name: selectedAlumniForMentor.name,
            mentor_company: selectedAlumniForMentor.company,
            student_name: user?.name || 'Campus Scholar',
            student_email: user?.email || 'scholar@campus.edu',
            session_date: `${mentorDate} ${mentorTime}`,
            topic: `${mentorSessionType}: ${mentorAgenda || '1-on-1 career guidance'}`,
            status: 'CONFIRMED',
          },
        ]);
        console.log('[Supabase] Mentorship session recorded in PostgreSQL!');
      } catch (err) {
        console.warn('Error saving mentorship booking:', err);
      }
    }

    pushCampusNotification(user?.email, {
      title: 'Mentorship Session Confirmed 💼',
      desc: `1-on-1 session confirmed with ${selectedAlumniForMentor.name} (${selectedAlumniForMentor.company}) for ${mentorDate} at ${mentorTime}.`,
      type: 'placement',
      link: '/placements',
    });

    setMentorSuccessToast(true);
    setSelectedAlumniForMentor(null);
    setTimeout(() => setMentorSuccessToast(false), 4000);
  };

  // Handle Share Placement Experience Form Submit
  const handleSharePlacementSubmit = async (e) => {
    e.preventDefault();
    if (!shareCompany.trim() || !shareCTC.trim() || !shareTips.trim()) return;

    const filteredRounds = customRounds.filter((r) => r.name.trim().length > 0);
    const roundsToUse =
      filteredRounds.length > 0
        ? filteredRounds
        : [
            { name: 'Round 1: Online Assessment / Screening', desc: 'Coding test on DSA and fundamental problem solving.' },
            { name: 'Round 2: Technical Interview (DSA & Core)', desc: 'Live coding on data structures, algorithms, and complexity analysis.' },
            { name: 'Round 3: Low-Level / System Architecture', desc: 'Low-level / high-level architecture and edge cases.' },
            { name: 'Round 4: Managerial & Behavioral', desc: 'Cultural fit, team collaboration, and past project retro.' },
          ];

    const questionsList = shareQuestions
      .split('\n')
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    const newInsight = {
      id: `comp_${Date.now()}`,
      company: shareCompany.trim(),
      logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100',
      color: 'border-indigo-200 bg-indigo-50/40 text-indigo-700',
      role: shareRole.trim(),
      department: shareDept,
      batchYear: shareBatch,
      author: user?.name || 'Placed Scholar',
      authorEmail: user?.email || '',
      authorRole: user?.role || 'STUDENT',
      ctcRange: shareCTC.trim(),
      difficulty: shareDifficulty,
      offerStatus: shareOfferStatus,
      roundsCount: roundsToUse.length,
      rounds: roundsToUse,
      topTips: shareTips.trim(),
      questionsAsked: questionsList.length > 0 ? questionsList : ['Design a scalable modular system', 'Solve graph traversal problem with edge cases'],
      views: 1,
      likes: 1,
      createdAt: new Date().toISOString(),
    };

    // 1. Save to local storage for persistence across refreshes
    try {
      const saved = localStorage.getItem('knowpass_placement_insights_custom');
      const existing = saved ? JSON.parse(saved) : [];
      localStorage.setItem('knowpass_placement_insights_custom', JSON.stringify([newInsight, ...existing]));
    } catch (err) {
      console.warn('Failed to save placement insight locally:', err);
    }

    // 2. Save to Supabase PostgreSQL placement_insights
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('placement_insights').insert([
          {
            company: shareCompany.trim(),
            role: shareRole.trim(),
            tier: 'Tier-1 High Priority',
            ctc: shareCTC.trim(),
            batch: shareBatch,
            author_name: user?.name || 'Placed Scholar',
            author_email: user?.email || '',
            department: shareDept,
            rounds: roundsToUse,
            interview_questions: newInsight.questionsAsked,
            tips: shareTips.trim(),
          },
        ]);
        console.log('[Supabase] Saved placement insight to PostgreSQL:', shareCompany);
      } catch (err) {
        console.warn('Error saving placement insight to Supabase:', err);
      }
    }

    // 3. Index into Knowledge Base with category 'Placement Insight' & KnowBot AI
    try {
      await knowledgeService.create({
        title: `${shareCompany.trim()} Interview Playbook & Questions (${shareRole.trim()})`,
        category: 'Placement Insight',
        knowledgeType: 'Placement Insight',
        department: shareDept,
        author: user?.name || 'Placed Scholar',
        authorRole: user?.role || 'STUDENT',
        summary: `Comprehensive interview experience for ${shareCompany.trim()} (${shareRole.trim()}). CTC: ${shareCTC.trim()}. Tips: ${shareTips.trim()}`,
        content: `### Company Overview\n**Company:** ${shareCompany.trim()}\n**Role:** ${shareRole.trim()}\n**CTC Offered:** ${shareCTC.trim()}\n**Department:** ${shareDept}\n**Offer Status:** ${shareOfferStatus}\n**Difficulty:** ${shareDifficulty}\n\n### Interview Process\n${roundsToUse.map((r, i) => `**Round ${i + 1}:** ${r.name}\n${r.desc}`).join('\n\n')}\n\n### Candidate Tips & Advice\n${shareTips.trim()}\n\n### Sample Questions Asked\n${newInsight.questionsAsked.map((q) => `- ${q}`).join('\n')}`,
        tags: ['Placement', shareCompany.trim(), 'Interview-Experience', shareRole.trim(), 'DSA'],
      });
    } catch (e) {
      console.warn('Error syncing placement insight to knowledge base:', e);
    }

    // 4. Award points with celebration modal
    if (awardPoints) {
      awardPoints(150, `Shared ${shareCompany.trim()} placement playbook`);
    }

    // 5. Dispatch reactive window event for Admin metrics
    window.dispatchEvent(new CustomEvent('knowpass-document-created', { detail: newInsight }));

    pushCampusNotification(user?.email, {
      title: 'Placement Playbook Published 💼',
      desc: `Your ${shareCompany.trim()} interview playbook is live in the knowledge repository! (+150 pts)`,
      type: 'placement',
      link: `/knowledge-base?search=${encodeURIComponent(shareCompany.trim())}`,
    });

    setCompanyInsights((prev) => [newInsight, ...prev]);
    setShareModalOpen(false);
    setShareSuccessToast(true);
    setShareCompany('');
    setShareCTC('');
    setShareTips('');
    setShareQuestions('');
    setShareDifficulty('Medium');
    setShareOfferStatus('Offer Accepted & Placed');
    setCustomRounds([
      { name: 'Round 1: Online Assessment / Screening', desc: '2 LeetCode Medium/Hard DP and Tree recursion problems (90 mins).' },
      { name: 'Round 2: Data Structures & Algorithms', desc: 'Live coding on Trie prefix matching and sliding window string compression.' },
      { name: 'Round 3: Low-Level / System Architecture', desc: 'Thread-safe parking lot or distributed rate limiter design.' },
      { name: 'Round 4: Managerial & Cultural Fit', desc: 'STAR format behavioral stories, conflict resolution, and leadership examples.' },
    ]);
    setTimeout(() => setShareSuccessToast(false), 4000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* ========================================================
          TOP HERO HEADER WITH QUICK ACTION
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-bold border border-white/15">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            GLOBAL TECH PLACEMENTS & ALUMNI NETWORK
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Global Placement Intelligence & Alumni Mentorship
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Verified interview round playbooks, international CTC compensation benchmarks, curriculum skill gap analytics, and global 1-on-1 mentorship
          </p>
        </div>

        {role === ROLES.ALUMNI && (
          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <Button
              variant="white"
              onClick={() => setShareModalOpen(true)}
              className="!text-black hover:!text-black font-bold text-xs shadow-lg shadow-black/20 flex items-center gap-2 px-4 py-2.5 transition"
            >
              <PlusCircle className="w-4 h-4 !text-black stroke-[2.5]" />
              <span className="!text-black font-bold">Share Placement Playbook</span>
            </Button>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      {mentorSuccessToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-800 animate-in slide-in-from-top duration-200 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Mentorship request sent! The alumni mentor will receive your booking invitation in their inbox.</span>
          </div>
          <button onClick={() => setMentorSuccessToast(false)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {shareSuccessToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-800 animate-in slide-in-from-top duration-200 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Placement experience published and indexed into Company Insights! You earned +150 Karma Points.</span>
          </div>
          <button onClick={() => setShareSuccessToast(false)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================
          NAVIGATION TABS
      ======================================================== */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'insights', label: '1. Company Insights', icon: Building2, count: companyInsights.length },
          { id: 'skills', label: '2. Skill Gap Report', icon: TrendingUp, count: SKILL_GAP_DATA.length },
          { id: 'alumni', label: '3. Alumni Network & Mentors', icon: Users, count: ALUMNI_DIRECTORY.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          TAB 1: COMPANY INSIGHTS
      ======================================================== */}
      {activeTab === 'insights' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Search & Filters */}
          <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                placeholder="Search by company (Google, NVIDIA, Microsoft, TI...), role, or questions asked..."
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 outline-none"
              >
                <option value="All">All Job Roles</option>
                <option value="Software Development">Software Development (SDE)</option>
                <option value="Systems">Systems & CUDA</option>
                <option value="Cloud">Cloud & Microservices</option>
                <option value="VLSI">VLSI & Hardware</option>
              </select>
            </div>
          </Card>

          {/* Quick Company Logo Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Top Recruiters:</span>
            {['All', 'Google', 'NVIDIA', 'Microsoft', 'Texas Instruments'].map((cName) => {
              const isSelected = (cName === 'All' && !companySearch) || (companySearch && companySearch.toLowerCase() === cName.toLowerCase());
              return (
                <button
                  key={cName}
                  onClick={() => setCompanySearch(cName === 'All' ? '' : cName)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  {cName !== 'All' && <CompanyLogo company={cName} className="w-4 h-4" />}
                  <span>{cName}</span>
                </button>
              );
            })}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredCompanyInsights.map((comp) => {
              const canDelete =
                user &&
                (comp.author === user?.name ||
                  comp.authorEmail === user?.email ||
                  user?.role === 'ADMIN');
              const isLiked = likedInsights.includes(comp.id);

              return (
                <Card
                  key={comp.id}
                  className="p-6 flex flex-col justify-between border border-slate-200/80 hover:shadow-md transition space-y-4"
                >
                  <div>
                    {/* Card Header: Company, Batch, CTC */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <CompanyLogo company={comp.company} className="w-12 h-12" size={26} />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-black text-slate-900">{comp.company}</h3>
                            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                              {comp.batchYear}
                            </span>
                            {comp.difficulty && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  comp.difficulty === 'Easy'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : comp.difficulty === 'Hard'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {comp.difficulty}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-700 mt-0.5">{comp.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl whitespace-nowrap">
                          💰 {comp.ctcRange.split('(')[0]}
                        </span>
                        {canDelete && (
                          <button
                            onClick={(e) => handleDeleteInsight(comp.id, e)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                            title="Delete your interview playbook"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Compensation details */}
                    <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span className="font-semibold text-slate-500">Package Breakdown:</span>
                      <span className="font-bold text-slate-900">{comp.ctcRange}</span>
                    </div>

                    {/* Rounds Breakdown */}
                    <div className="mt-3 space-y-1.5">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Interview Rounds Breakdown ({comp.roundsCount || comp.rounds?.length || 4} Rounds):
                      </p>
                      <div className="space-y-1 text-xs">
                        {comp.rounds?.slice(0, 2).map((r, idx) => (
                          <div key={idx} className="p-2 bg-indigo-50/50 border border-indigo-100/70 rounded-xl">
                            <p className="font-bold text-indigo-950 text-[11px]">{r.name}</p>
                            <p className="text-[10px] text-indigo-900 line-clamp-1">{r.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key Tips */}
                    <div className="mt-3">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Alumni Prep Advice:
                      </p>
                      <p className="text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 leading-relaxed">
                        💡 {comp.topTips}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Contributor, Like & Read Playbook */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate">Documented by <strong className="text-slate-800">{comp.author}</strong></span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleLike(comp.id);
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition border ${
                          isLiked
                            ? 'bg-rose-50 text-rose-600 border-rose-200'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                        }`}
                        title="Upvote helpful playbook"
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{comp.likes || 0}</span>
                      </button>

                      <Button
                        size="sm"
                        onClick={() => setSelectedPlaybookModal(comp)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                      >
                        <span>Read Full Playbook</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: SKILL GAP REPORT & INTERACTIVE VOTING
      ======================================================== */}
      {activeTab === 'skills' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">Curriculum vs Alumni Interview Skill Gap Analysis</h2>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                  Living Dean Feedback Loop
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Upvote critical curriculum gaps or propose missing technologies to influence future academic syllabus revisions
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                size="sm"
                onClick={() => setRequestSkillModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Request Missing Skill (+25 pts)</span>
              </Button>

              {/* Department Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                {['All', 'Computer Science', 'Electronics', 'Central Hardware'].map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setSkillGapDepartmentFilter(dept)}
                    className={`px-3 py-1 rounded-lg transition ${
                      skillGapDepartmentFilter === dept
                        ? 'bg-white text-indigo-600 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Request Success Toast */}
          {reqSuccessToast && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-800 animate-in slide-in-from-top duration-200 shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Industry Skill Gap proposal recorded! Routed to Academic Deans & HODs. (+25 pts)</span>
              </div>
              <button onClick={() => setReqSuccessToast(false)} className="text-emerald-600 hover:text-emerald-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <Card className="p-0 overflow-hidden border border-slate-200/80 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-4">Skill Domain</th>
                    <th className="py-3.5 px-4 w-1/3">Skills Most Mentioned by Placed Alumni</th>
                    <th className="py-3.5 px-4 w-1/4">Current College Curriculum</th>
                    <th className="py-3.5 px-4 text-center">Severity</th>
                    <th className="py-3.5 px-4 text-center">Student Demand</th>
                    <th className="py-3.5 px-4">Recommended Bridging Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSkillGaps.map((sg) => (
                    <tr key={sg.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-4 align-top">
                        <p className="font-bold text-slate-900">{sg.domain}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{sg.department.split('(')[0]}</p>
                      </td>

                      <td className="py-4 px-4 align-top text-slate-700 leading-relaxed">
                        <div className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl text-emerald-950 font-medium">
                          {sg.alumniDemand}
                        </div>
                      </td>

                      <td className="py-4 px-4 align-top text-slate-600 leading-relaxed">
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                          {sg.collegeCurriculum}
                        </div>
                      </td>

                      <td className="py-4 px-4 align-top text-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                            sg.gapSeverity === 'CRITICAL GAP'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {sg.gapSeverity}
                        </span>
                      </td>

                      {/* Interactive Student Upvoting */}
                      <td className="py-4 px-4 align-top text-center">
                        <button
                          onClick={() => handleVoteSkillGap(sg.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            userVotedGaps.includes(sg.id)
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200'
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${userVotedGaps.includes(sg.id) ? 'fill-white text-white' : ''}`} />
                          <span>{sg.votes || 0}</span>
                        </button>
                      </td>

                      <td className="py-4 px-4 align-top text-slate-700">
                        <p className="text-xs font-semibold text-slate-800">{sg.recommendation}</p>
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-indigo-600 font-bold">
                          <BookOpen className="w-3 h-3" />
                          <span>Resource: {sg.resourceLink}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================
          TAB 3: ALUMNI NETWORK & MENTORSHIP
      ======================================================== */}
      {activeTab === 'alumni' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Alumni Search */}
          <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={alumniSearch}
                onChange={(e) => setAlumniSearch(e.target.value)}
                placeholder="Search alumni by name, employer (Google, Microsoft, NVIDIA...), or skill domain..."
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition"
              />
            </div>
          </Card>

          {/* Alumni Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAlumni.map((alm) => (
              <Card
                key={alm.id}
                className="p-6 flex flex-col justify-between border border-slate-200/80 hover:shadow-md transition space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={alm.avatar}
                        alt={alm.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-600/20"
                      />
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{alm.name}</h4>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {alm.batch}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                      ⭐ {alm.rating}
                    </span>
                  </div>

                  {/* Employer & Role */}
                  <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <CompanyLogo company={alm.company} className="w-10 h-10" size={20} />
                    <div>
                      <p className="text-xs font-black text-slate-900">{alm.company}</p>
                      <p className="text-[11px] text-slate-600">{alm.role}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{alm.department}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {alm.bio}
                  </p>

                  {/* Skill Chips */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {alm.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                      >
                        #{s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {alm.sessionsCompleted} Sessions Mentored
                  </span>

                  <Button
                    size="sm"
                    onClick={() => setSelectedAlumniForMentor(alm)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                  >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Request mentor session
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 1: REQUEST MENTOR SESSION
      ======================================================== */}
      {selectedAlumniForMentor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedAlumniForMentor.avatar}
                  alt={selectedAlumniForMentor.name}
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                />
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Book 1-on-1 Session with {selectedAlumniForMentor.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedAlumniForMentor.role} at {selectedAlumniForMentor.company}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlumniForMentor(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBookMentorSession} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Session Topic *</label>
                <select
                  value={mentorSessionType}
                  onChange={(e) => setMentorSessionType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-500"
                >
                  <option value="Mock Technical Interview & DSA">Mock Technical Coding Interview & DSA</option>
                  <option value="System Design Architecture Deep Dive">System Design Architecture Deep Dive</option>
                  <option value="Resume & Portfolio Review">Resume & GitHub Project Review</option>
                  <option value="Placement Strategy & Referral Guidance">Placement Strategy & Referral Guidance</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Date *</label>
                  <input
                    type="date"
                    value={mentorDate}
                    onChange={(e) => setMentorDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Time *</label>
                  <input
                    type="time"
                    value={mentorTime}
                    onChange={(e) => setMentorTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Question / Topics you want to cover</label>
                <textarea
                  rows={3}
                  value={mentorAgenda}
                  onChange={(e) => setMentorAgenda(e.target.value)}
                  placeholder="e.g. I am preparing for SDE-1 interviews and would love to practice a mock graph problem or review my Raft consensus project..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-900 text-[11px] space-y-0.5">
                <p className="font-bold">Campus Mentorship Protocol:</p>
                <p>Sessions run for 45 minutes on Google Meet. An automatic calendar invite will be generated.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" type="button" onClick={() => setSelectedAlumniForMentor(null)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  <Send className="w-3.5 h-3.5 mr-1" />
                  Confirm & Request Session
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: FULL PLAYBOOK DETAIL MODAL
      ======================================================== */}
      {selectedPlaybookModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-start justify-between">
              <div className="flex items-start gap-4">
                <CompanyLogo company={selectedPlaybookModal.company} className="w-14 h-14" size={30} />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold bg-indigo-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Verified Placement Playbook
                    </span>
                    {selectedPlaybookModal.difficulty && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          selectedPlaybookModal.difficulty === 'Easy'
                            ? 'bg-emerald-100 text-emerald-800'
                            : selectedPlaybookModal.difficulty === 'Hard'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {selectedPlaybookModal.difficulty} Difficulty
                      </span>
                    )}
                    {selectedPlaybookModal.offerStatus && (
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                        {selectedPlaybookModal.offerStatus}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-2">
                    {selectedPlaybookModal.company} — {selectedPlaybookModal.role}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Shared by {selectedPlaybookModal.author} ({selectedPlaybookModal.batchYear}) • {selectedPlaybookModal.department}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlaybookModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                <span className="font-bold text-emerald-950 text-xs">Verified CTC / Compensation:</span>
                <span className="font-black text-emerald-700 text-sm">{selectedPlaybookModal.ctcRange}</span>
              </div>

              <div className="space-y-2">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                  Detailed Round-by-Round Breakdown ({selectedPlaybookModal.rounds?.length || 0} Rounds):
                </h4>
                <div className="space-y-2">
                  {selectedPlaybookModal.rounds?.map((r, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                      <p className="font-bold text-indigo-900 text-xs">{r.name}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPlaybookModal.questionsAsked && selectedPlaybookModal.questionsAsked.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                      High-Yield Questions Asked in Interview:
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleCopyQuestions(selectedPlaybookModal.questionsAsked)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 transition"
                    >
                      {copiedQuestions ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Questions</span>
                        </>
                      )}
                    </button>
                  </div>
                  <ul className="list-disc list-inside space-y-1 font-mono text-xs bg-slate-900 text-slate-100 p-4 rounded-2xl">
                    {selectedPlaybookModal.questionsAsked.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl space-y-1">
                <p className="font-bold text-amber-950 text-xs">Alumni Recommendation for Juniors:</p>
                <p className="text-xs text-amber-900 leading-relaxed">{selectedPlaybookModal.topTips}</p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Verified by Campus Placement Cell
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadPlaybook(selectedPlaybookModal)}
                  className="gap-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Export (.md)</span>
                </Button>
                <Button size="sm" onClick={() => setSelectedPlaybookModal(null)}>
                  Close Playbook
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: "SHARE YOUR PLACEMENT EXPERIENCE" QUICK FORM
      ======================================================== */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50 flex items-start justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-indigo-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Placement Intelligence
                  </span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                    +150 Karma Points
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                  Share Your Placement Experience & Interview Playbook
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Help juniors navigate OA questions, technical rounds, and salary benchmarks.
                </p>
              </div>
              <button
                onClick={() => setShareModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSharePlacementSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
                {/* Basic Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={shareCompany}
                      onChange={(e) => setShareCompany(e.target.value)}
                      placeholder="e.g. Google, NVIDIA, Qualcomm, Amazon"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Role / Designation *</label>
                    <input
                      type="text"
                      required
                      value={shareRole}
                      onChange={(e) => setShareRole(e.target.value)}
                      placeholder="e.g. Software Development Engineer (SDE-1)"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Metadata Grid: Package, Department, Batch, Difficulty */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">CTC / Package Range *</label>
                    <input
                      type="text"
                      required
                      value={shareCTC}
                      onChange={(e) => setShareCTC(e.target.value)}
                      placeholder="e.g. ₹32 LPA (₹22L Base + RSUs)"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Academic Department *</label>
                    <select
                      value={shareDept}
                      onChange={(e) => setShareDept(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-500"
                    >
                      <option value="Computer Science & Engineering (CSE)">Computer Science (CSE)</option>
                      <option value="Information Technology & AI (IT)">Information Technology (IT)</option>
                      <option value="Electronics & Communication (ECE)">Electronics & Comm (ECE)</option>
                      <option value="Mechanical Engineering (ME)">Mechanical Engineering (ME)</option>
                      <option value="Central Computing & Hardware Labs">Central Computing Labs</option>
                      <option value="Civil & Structural Engineering (CE)">Civil Engineering (CE)</option>
                      <option value="Biotechnology & Bioinformatics (BT)">Biotechnology (BT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Batch / Year *</label>
                    <select
                      value={shareBatch}
                      onChange={(e) => setShareBatch(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-500"
                    >
                      <option value="2026 Batch">2026 Batch (Current Senior)</option>
                      <option value="2025 Placed">2025 Placed (Recent Alum)</option>
                      <option value="2024 Alumni">2024 Alumni</option>
                    </select>
                  </div>
                </div>

                {/* Difficulty & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Interview Difficulty</label>
                    <select
                      value={shareDifficulty}
                      onChange={(e) => setShareDifficulty(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-500"
                    >
                      <option value="Easy">Easy (Standard fundamentals)</option>
                      <option value="Medium">Medium (LC Mediums, System design)</option>
                      <option value="Hard">Hard (LC Hard, Concurrency, In-depth)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Offer / Selection Status</label>
                    <select
                      value={shareOfferStatus}
                      onChange={(e) => setShareOfferStatus(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-500"
                    >
                      <option value="Offer Accepted & Placed">Offer Accepted & Placed</option>
                      <option value="Offer Received">Offer Received</option>
                      <option value="Interview Rounds Cleared">Interview Rounds Cleared</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic Round-by-Round Breakdown Builder */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800">
                        Interview Rounds Breakdown ({customRounds.length} Rounds)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Detail each round of the evaluation process
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddRound}
                      className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs font-bold gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Round</span>
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {customRounds.map((round, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 relative"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={round.name}
                            onChange={(e) => handleRoundChange(idx, 'name', e.target.value)}
                            placeholder={`e.g. Round ${idx + 1}: Technical Coding`}
                            className="font-bold text-slate-900 bg-transparent border-b border-transparent focus:border-indigo-500 outline-none w-full text-xs"
                          />
                          {customRounds.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRound(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded transition shrink-0"
                              title="Remove this round"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <textarea
                          rows={2}
                          value={round.desc}
                          onChange={(e) => handleRoundChange(idx, 'desc', e.target.value)}
                          placeholder="Describe topics tested, duration, difficulty, and format..."
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* High-Yield Questions Asked */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Key Interview Questions (1 question per line)
                  </label>
                  <textarea
                    rows={3}
                    value={shareQuestions}
                    onChange={(e) => setShareQuestions(e.target.value)}
                    placeholder="e.g. Design a distributed token-bucket rate limiter&#10;Implement Trie-based autocomplete with prefix search&#10;Course Schedule (Topological Sort)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-mono text-xs"
                  />
                </div>

                {/* High-Yield Tips */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Advice & High-Yield Preparation Tips for Juniors *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={shareTips}
                    onChange={(e) => setShareTips(e.target.value)}
                    placeholder="Share essential preparation strategies, key mistakes to avoid, and domain topics interviewers emphasized most..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
                <Button variant="outline" size="sm" type="button" onClick={() => setShareModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>Publish Playbook (+150 pts)</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          REQUEST MISSING SKILL / CURRICULUM FEEDBACK MODAL
      ======================================================== */}
      {requestSkillModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold bg-indigo-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Academic Feedback Loop
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Propose Missing Skill / Curriculum Topic
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Route real industry requirements directly to university academic councils (+25 KnowPoints)
                </p>
              </div>
              <button
                onClick={() => setRequestSkillModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRequestSkillSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Missing Skill / Technology Domain *</label>
                <input
                  type="text"
                  required
                  value={reqDomain}
                  onChange={(e) => setReqDomain(e.target.value)}
                  placeholder="e.g. Generative AI & Vector Embeddings, Kubernetes Orchestration, Rust"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Academic Department *</label>
                <select
                  value={reqDept}
                  onChange={(e) => setReqDept(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-500"
                >
                  <option value="Computer Science & Engineering (CSE)">Computer Science & Engineering (CSE)</option>
                  <option value="Information Technology & AI">Information Technology & AI</option>
                  <option value="Electronics & Communication (ECE)">Electronics & Communication (ECE)</option>
                  <option value="Mechanical Engineering (ME)">Mechanical Engineering (ME)</option>
                  <option value="Central Computing & Hardware Labs">Central Computing & Hardware Labs</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Why is this critical for industry placements? *</label>
                <textarea
                  rows={2}
                  required
                  value={reqDemand}
                  onChange={(e) => setReqDemand(e.target.value)}
                  placeholder="e.g. 80% of backend and cloud engineering interviews at top firms require hands-on Kubernetes and gRPC knowledge..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Syllabus State (Optional)</label>
                <input
                  type="text"
                  value={reqCurriculum}
                  onChange={(e) => setReqCurriculum(e.target.value)}
                  placeholder="e.g. Only covers basic socket programming in C from 3rd semester"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Recommended Campus Action (Optional)</label>
                <input
                  type="text"
                  value={reqRec}
                  onChange={(e) => setReqRec(e.target.value)}
                  placeholder="e.g. Host a 2-day hands-on workshop or offer a 7th sem elective"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" type="button" onClick={() => setRequestSkillModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Submit Curriculum Proposal (+25 pts)</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
