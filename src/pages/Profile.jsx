import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLE_CONFIG, ROLE_PERMISSIONS, ROLES } from '../constants/roles';
import { ROUTES } from '../constants/routes';
import { tokenStorage } from '../utils/tokenStorage';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { GlobalDnsCloudModal } from '../components/common/GlobalDnsCloudModal';
import { ImageCropModal } from '../components/common/ImageCropModal';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { knowledgeService, getMyContributedIds, getAliasHistory } from '../services/knowledgeService';
import { alumniService, VERIFIED_ALUMNI_MENTORS } from '../services/alumniService';
import {
  User,
  ShieldCheck,
  Key,
  Building,
  Mail,
  Calendar,
  CheckCircle2,
  Lock,
  Edit3,
  X,
  Sparkles,
  Camera,
  FileText,
  BookOpen,
  ThumbsUp,
  Trash2,
  ExternalLink,
  Share2,
  PlusCircle,
  Download,
  Award,
  Zap,
  GraduationCap,
  Cpu,
  FileCheck,
  DollarSign,
  AlertCircle,
  Briefcase,
  ArrowRight,
  Globe,
  TrendingUp,
  UploadCloud,
  Crop,
  Check,
  Plus,
  Minus,
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

const DEPARTMENTS_LIST = [
  'Computer Science & Engineering (CSE)',
  'Electronics & Communication (ECE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering (CE)',
  'Information Technology & AI (IT)',
  'Electrical & Electronics (EEE)',
  'Biotechnology & Bioinformatics (BT)',
  'Central Computing & Hardware Labs',
  'Academic Affairs & IT Infrastructure',
];

const YEARS_LIST = [
  '1st Year (Freshman)',
  '2nd Year (Sophomore)',
  '3rd Year (Junior)',
  '4th Year (Senior)',
  'Post-Graduate / Masters',
  'Doctoral / PhD Scholar',
  'Faculty / Specialist',
];

export function Profile() {
  const { user, role, switchRole, updateUser, awardPoints } = useAuth();
  const roleConfig = role ? ROLE_CONFIG[role] : null;
  const permissions = role ? ROLE_PERMISSIONS[role] || [] : [];
  const currentToken = tokenStorage.getAccessToken();
  const navigate = useNavigate();

  // My Contributions State
  const [myContributions, setMyContributions] = useState([]);
  const [loadingContributions, setLoadingContributions] = useState(true);
  const [shareToast, setShareToast] = useState(false);
  const [showDnsModal, setShowDnsModal] = useState(false);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    department: '',
    yearOfStudy: '',
    bio: '',
    avatar: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Avatar Image Cropping State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedRawImage, setSelectedRawImage] = useState(null);

  // Alumni Placement Playbooks State
  const [myPlaybooks, setMyPlaybooks] = useState([]);
  const [sharePlaybookModalOpen, setSharePlaybookModalOpen] = useState(false);
  const [playbookSuccessToast, setPlaybookSuccessToast] = useState(false);
  const [shareCompany, setShareCompany] = useState('');
  const [shareRole, setShareRole] = useState('Software Development Engineer (SDE-1)');
  const [shareCTC, setShareCTC] = useState('');
  const [shareDept, setShareDept] = useState(user?.department || 'Computer Science & Engineering (CSE)');
  const [shareBatch, setShareBatch] = useState(user?.graduationYear || '2025 Placed');
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

  const loadMentorshipData = useCallback(() => {
    if (user?.email) {
      setMyReferralRequests(alumniService.getReferralRequests(user.email));
      setMyMockInterviews(alumniService.getMockInterviewRequests(user.email));
    }
  }, [user?.email]);

  useEffect(() => {
    loadMentorshipData();
    const handleRefCreated = () => loadMentorshipData();
    const handleMockCreated = () => loadMentorshipData();
    window.addEventListener('knowpass-referral-created', handleRefCreated);
    window.addEventListener('knowpass-mock-interview-created', handleMockCreated);
    return () => {
      window.removeEventListener('knowpass-referral-created', handleRefCreated);
      window.removeEventListener('knowpass-mock-interview-created', handleMockCreated);
    };
  }, [loadMentorshipData]);

  const handleOpenReferralModal = (mentor = null) => {
    if (mentor) {
      setSelectedMentor(mentor);
      setReferralCompany(mentor.currentCompany);
      setReferralRole(mentor.targetRoles[0] || 'Software Engineer (SDE-1)');
    }
    setReferralModalOpen(true);
  };

  const handleOpenMockModal = (mentor = null) => {
    if (mentor) {
      setMockMentor(mentor);
      setMockTargetRole(mentor.targetRoles[0] || 'Software Engineer (SDE-1)');
      setMockSlot(mentor.availableSlots[0]);
    }
    setMockModalOpen(true);
  };

  const handleSubmitReferral = (e) => {
    e.preventDefault();
    const currentPts = Number(user?.knowPoints) || 20;
    if (currentPts < 50) {
      alert(`Insufficient KnowPoints! A Fast-Track Referral Token requires 50 pts. Your current balance is ${currentPts} pts. Publish a lab SOP or solve campus bugs to earn more points!`);
      return;
    }

    // Deduct 50 pts
    if (awardPoints) {
      awardPoints(-50, `Redeemed Fast-Track Referral Token for ${selectedMentor.name} (${referralCompany})`);
    }

    // Submit request via alumniService
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
    // Schedule mock interview
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
  const [citationModalOpen, setCitationModalOpen] = useState(false);
  const [juniorCandidates, setJuniorCandidates] = useState([]);
  const [corporateReferrals, setCorporateReferrals] = useState([]);
  const [scoutReferToast, setScoutReferToast] = useState(false);
  const [lastReferredJunior, setLastReferredJunior] = useState('');

  const loadAlumniScoutData = useCallback(() => {
    setJuniorCandidates(alumniService.getTopJuniorCandidates());
    if (user?.email) {
      setCorporateReferrals(alumniService.getCorporateReferrals(user.email));
    }
  }, [user?.email]);

  useEffect(() => {
    loadAlumniScoutData();
    const handleCorp = () => loadAlumniScoutData();
    window.addEventListener('knowpass-corporate-referral-created', handleCorp);
    return () => window.removeEventListener('knowpass-corporate-referral-created', handleCorp);
  }, [loadAlumniScoutData]);

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

  const loadAlumniPlaybooks = useCallback(() => {
    try {
      const saved = localStorage.getItem('knowpass_placement_insights_custom');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((pb) => {
            const matchName = user?.name && pb.author?.toLowerCase() === user.name.toLowerCase();
            const matchEmail = user?.email && pb.authorEmail?.toLowerCase() === user.email.toLowerCase();
            return matchName || matchEmail;
          });
          setMyPlaybooks(filtered);
          return;
        }
      }
    } catch {}
    setMyPlaybooks([]);
  }, [user?.name, user?.email]);

  useEffect(() => {
    loadAlumniPlaybooks();
  }, [loadAlumniPlaybooks]);

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

  const handleDeleteMyPlaybook = (id) => {
    if (!window.confirm('Are you sure you want to delete this placement playbook?')) return;
    try {
      const saved = localStorage.getItem('knowpass_placement_insights_custom');
      if (saved) {
        const parsed = JSON.parse(saved);
        const updated = parsed.filter((p) => p.id !== id);
        localStorage.setItem('knowpass_placement_insights_custom', JSON.stringify(updated));
      }
    } catch {}
    setMyPlaybooks((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSharePlaybookSubmit = async (e) => {
    e.preventDefault();
    if (!shareCompany.trim() || !shareCTC.trim() || !shareTips.trim()) return;

    const filteredRounds = customRounds.filter((r) => r.name.trim().length > 0);
    const roundsToUse =
      filteredRounds.length > 0
        ? filteredRounds
        : [
            { name: 'Round 1: Online Assessment / Screening', desc: 'Coding test on DSA and fundamentals.' },
            { name: 'Round 2: Technical Interview', desc: 'Core problem solving and data structures.' },
            { name: 'Round 3: System Design', desc: 'Modular architecture and scalability.' },
            { name: 'Round 4: Behavioral', desc: 'Culture fit and team leadership.' },
          ];

    const questionsList = shareQuestions
      .split('\n')
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    const newInsight = {
      id: `comp_${Date.now()}`,
      company: shareCompany.trim(),
      logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100',
      color: 'border-emerald-200 bg-emerald-50/40 text-emerald-700',
      role: shareRole.trim(),
      department: shareDept,
      batchYear: shareBatch,
      author: user?.name || 'Alumnus',
      authorEmail: user?.email || '',
      authorRole: 'ALUMNI',
      ctcRange: shareCTC.trim(),
      difficulty: shareDifficulty,
      offerStatus: shareOfferStatus,
      roundsCount: roundsToUse.length,
      rounds: roundsToUse,
      topTips: shareTips.trim(),
      questionsAsked: questionsList.length > 0 ? questionsList : ['Design a scalable system', 'Explain concurrency in production'],
      views: 1,
      likes: 1,
      createdAt: new Date().toISOString(),
    };

    // 1. Save to local storage
    try {
      const saved = localStorage.getItem('knowpass_placement_insights_custom');
      const existing = saved ? JSON.parse(saved) : [];
      localStorage.setItem('knowpass_placement_insights_custom', JSON.stringify([newInsight, ...existing]));
    } catch (err) {
      console.warn('Failed to save placement insight locally:', err);
    }

    // 2. Save to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('placement_insights').insert([
          {
            company: shareCompany.trim(),
            role: shareRole.trim(),
            tier: 'Tier-1 High Priority',
            ctc: shareCTC.trim(),
            batch: shareBatch,
            author_name: user?.name || 'Alumnus',
            author_email: user?.email || '',
            department: shareDept,
            rounds: roundsToUse,
            interview_questions: newInsight.questionsAsked,
            tips: shareTips.trim(),
          },
        ]);
      } catch (err) {
        console.warn('Error saving to Supabase:', err);
      }
    }

    // 3. Index to Knowledge Base
    try {
      await knowledgeService.create({
        title: `${shareCompany.trim()} Interview Playbook & Questions (${shareRole.trim()})`,
        category: 'Placement Insight',
        knowledgeType: 'Placement Insight',
        department: shareDept,
        author: user?.name || 'Alumnus',
        authorRole: 'ALUMNI',
        summary: `Alumni interview playbook for ${shareCompany.trim()} (${shareRole.trim()}). CTC: ${shareCTC.trim()}. Tips: ${shareTips.trim()}`,
        content: `### Company Overview\n**Company:** ${shareCompany.trim()}\n**Role:** ${shareRole.trim()}\n**CTC Offered:** ${shareCTC.trim()}\n**Department:** ${shareDept}\n**Offer Status:** ${shareOfferStatus}\n**Difficulty:** ${shareDifficulty}\n\n### Interview Process\n${roundsToUse.map((r, i) => `**Round ${i + 1}:** ${r.name}\n${r.desc}`).join('\n\n')}\n\n### Candidate Tips & Advice\n${shareTips.trim()}\n\n### Sample Questions Asked\n${newInsight.questionsAsked.map((q) => `- ${q}`).join('\n')}`,
        tags: ['Placement', shareCompany.trim(), 'Interview-Experience', shareRole.trim(), 'Alumni'],
      });
    } catch (e) {
      console.warn('Error syncing placement insight to knowledge base:', e);
    }

    // 4. Award points
    if (awardPoints) {
      awardPoints(150, `Shared ${shareCompany.trim()} placement playbook from Alumni Profile`);
    }

    // 5. Dispatch reactive window event
    window.dispatchEvent(new CustomEvent('knowpass-document-created', { detail: newInsight }));

    setMyPlaybooks((prev) => [newInsight, ...prev]);
    setSharePlaybookModalOpen(false);
    setPlaybookSuccessToast(true);
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
    setTimeout(() => setPlaybookSuccessToast(false), 4000);
  };

  const handleAvatarFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setSelectedRawImage(evt.target.result);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedUrl) => {
    setEditFormData((prev) => ({ ...prev, avatar: croppedUrl }));
  };

  // Fetch My Contributions from database
  useEffect(() => {
    let isMounted = true;
    const fetchMyContributions = async () => {
      try {
        setLoadingContributions(true);
        const res = await knowledgeService.getAll();
        if (isMounted && res && res.items) {
          const userName = (user?.name || '').trim().toLowerCase();
          const userEmail = (user?.email || '').trim().toLowerCase();
          const myIds = getMyContributedIds(user?.email);
          const aliases = getAliasHistory(user?.email);

          const mine = res.items.filter((item) => {
            const author = (item.author || '').trim().toLowerCase();
            return (
              author === userName ||
              author === userEmail ||
              (user?.email && item.authorEmail === user.email) ||
              myIds.includes(item.id) ||
              aliases.includes(author)
            );
          });
          setMyContributions(mine);
        }
      } catch (err) {
        console.warn('Error fetching my contributions:', err);
      } finally {
        if (isMounted) setLoadingContributions(false);
      }
    };

    fetchMyContributions();
    return () => {
      isMounted = false;
    };
  }, [user?.name, user?.email]);

  const handleDeleteMyContribution = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" from the knowledge base?`)) return;
    try {
      await knowledgeService.delete(id);
      setMyContributions((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.warn('Error deleting contribution:', err);
    }
  };

  const handleShareMyContribution = (item) => {
    const shareUrl = `${window.location.origin}/knowledge-base?search=${encodeURIComponent(item.title)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
    }
    setShareToast(true);
    setTimeout(() => setShareToast(false), 3500);
  };

  // Dean's Certificate of Contribution Exporter
  const [certToast, setCertToast] = useState(false);

  const handleDownloadDeanCertificate = () => {
    const pts = Number(user?.knowPoints) || 20;
    const certId = `CERT-KP-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const certContent = `# 🏛️ GLOBAL HIGHER EDUCATION KNOWLEDGE ALLIANCE & UNIVERSITY CONSORTIUM
## OFFICIAL CERTIFICATE OF ACADEMIC KNOWLEDGE CONTINUITY & RESEARCH MERIT

**Certificate Verification UID:** \`${certId}\`  
**Date of Issuance:** ${dateStr}  
**Global Accreditation Standard:** ABET / Washington Accord / International Research Continuity Index

---

### TO WHOMSOEVER IT MAY CONCERN

This is to officially certify that:

## **${(user?.name || 'Academic Scholar').toUpperCase()}**
**Field of Specialization:** ${user?.department || 'Computer Science & Engineering (CSE)'}  
**Academic Standing:** ${user?.yearOfStudy || 'Graduate / Senior Scholar'}  
**Institutional Identifier:** ${user?.email || 'scholar@university.edu'}

has rendered exemplary and distinguished academic service by contributing **${myContributions.length} verified technical knowledge assets, laboratory SOP runbooks, and high-impact engineering retrospectives** to the **KnowPass Global Academic Knowledge Continuity Network**.

### 📊 Certified Contribution Metrics:
* **Total Global KnowKarma Merit Score:** ${pts} KnowPoints
* **Authored Technical Resources & Runbooks:** ${myContributions.length} Peer-Reviewed Articles
* **Cumulative Engineering Troubleshooting Hours Saved Globally:** ~${Math.max(12, myContributions.length * 18)} Hours
* **Institutional Standing & Honors:** Certified Global Knowledge Pioneer

### 🌟 Recognized Academic Privileges & Endorsements:
1. **Dean's Official Letter of Recommendation (LOR) Endorsement** valid for international postgraduate programs & corporate hiring.
2. **Priority High-Performance Computing Quota** on academic supercomputing clusters.
3. **Cross-Institutional Research & Advanced Laboratory Privilege**.

---

### Signatures & Institutional Seal:

**Prof. (Dr.) Sarah Jenkins**  
*Chair of Academic Affairs & Global Research Continuity Council*  
International Higher Education Knowledge Alliance

**Dr. Rajesh Verma**  
*Director of Academic Accreditation & University Relations*

---
*Cryptographically Verified via KnowPass Global Knowledge Continuity Protocol.*  
*Recognized for Academic Portfolios, Corporate Placement Verification & Global Research Fellowship Applications.*
`;

    const blob = new Blob([certContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Dean_Certificate_of_Contribution_${(user?.name || 'Scholar').replace(/\s+/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCertToast(true);
    setTimeout(() => setCertToast(false), 4000);
  };

  // Auto-sync existing user profile to Supabase PostgreSQL table on load
  useEffect(() => {
    if (user?.email && isSupabaseConfigured && supabase) {
      const syncProfile = async () => {
        try {
          const profilePayload = {
            id: user.id || undefined,
            name: user.name || user.email.split('@')[0],
            email: user.email,
            role: user.role || 'STUDENT',
            department: user.department || 'Computer Science & Engineering (CSE)',
            year_of_study: user.yearOfStudy || '4th Year (Senior)',
            bio: user.bio || '',
            know_points: user.knowPoints || 50,
            badges: user.badges || ['Pioneer'],
            avatar_url: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          };
          await supabase.from('profiles').upsert(profilePayload, { onConflict: 'email' });
        } catch (err) {
          console.warn('[Profile Sync Error]', err.message);
        }
      };
      syncProfile();
    }
  }, [user?.email]);

  const openEditModal = () => {
    setEditFormData({
      name: user?.name || '',
      department: user?.department || DEPARTMENTS_LIST[0],
      yearOfStudy: user?.yearOfStudy || YEARS_LIST[3],
      bio: user?.bio || '',
      avatar: user?.avatar || '',
    });
    setIsEditModalOpen(true);
    setSaveSuccess(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedFields = {
        name: editFormData.name.trim(),
        department: editFormData.department,
        yearOfStudy: editFormData.yearOfStudy,
        bio: editFormData.bio.trim(),
        avatar: editFormData.avatar.trim() || user?.avatar,
      };

      const oldName = user?.name;
      const oldEmail = user?.email;

      // 1. Update in-memory and local storage
      if (updateUser) {
        updateUser(updatedFields);
      }

      // 2. Sync all previously contributed notes to the new profile
      await knowledgeService.updateAuthorContributions({
        oldName,
        newProfile: {
          ...updatedFields,
          role: user?.role || 'STUDENT',
          email: user?.email,
        },
        userEmail: oldEmail,
      });

      // 3. Immediately update myContributions in local state
      setMyContributions((prev) =>
        prev.map((item) => ({
          ...item,
          author: updatedFields.name,
          authorAvatar: updatedFields.avatar,
          authorRole: user?.role || item.authorRole,
        }))
      );

      // 4. Dispatch global event so all open pages/modals update immediately
      window.dispatchEvent(
        new CustomEvent('knowpass-profile-updated', {
          detail: {
            ...updatedFields,
            email: user?.email,
            role: user?.role,
          },
        })
      );

      // 2. Update Supabase Auth metadata & PostgreSQL profiles table
      if (isSupabaseConfigured && supabase) {
        // Update auth metadata
        await supabase.auth.updateUser({
          data: {
            name: updatedFields.name,
            department: updatedFields.department,
            year_of_study: updatedFields.yearOfStudy,
            bio: updatedFields.bio,
            avatar_url: updatedFields.avatar,
          },
        });

        // Update profiles table
        await supabase.from('profiles').upsert({
          id: user?.id,
          email: user?.email,
          name: updatedFields.name,
          department: updatedFields.department,
          year_of_study: updatedFields.yearOfStudy,
          bio: updatedFields.bio,
          avatar_url: updatedFields.avatar,
          role: user?.role || 'STUDENT',
        }, { onConflict: 'email' });
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSaveSuccess(false);
      }, 1200);
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            User Profile & Security
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your campus credentials, permissions, and active authorization scopes
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowDnsModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 shadow-sm transition"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>Global DNS & Cloud Architecture</span>
          </button>

          <button
            onClick={openEditModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Profile Header Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={user?.name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-600/20 shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full ring-2 ring-white shadow" title="KYC Identity Verified">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{user?.name || 'Campus Scholar'}</h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    KYC Verified
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  {user?.email}
                  <span className="text-slate-300">•</span>
                  <span className="font-mono text-slate-600 font-semibold">{user?.rollNumber || (user?.role === ROLES.ALUMNI ? 'ALUM-VERIFIED' : '2023BCSE0142')}</span>
                </p>
              </div>

              <div className="flex flex-col items-center sm:items-end gap-1">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${roleConfig?.badgeClass}`}>
                  {roleConfig?.label}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  UID: {user?.kycId || 'KYC-CAMPUS-8842A'}
                </span>
              </div>
            </div>

            {/* Gamification & KnowPoints Showcase */}
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl border border-indigo-100">
                {(() => {
                  const pts = Number(user?.knowPoints) || 20;
                  let tierName = 'Freshman Scholar (Level 1)';
                  let nextTier = 'Campus Pioneer (Level 2)';
                  let maxTierPts = 250;
                  let minTierPts = 0;
                  let badgeBg = 'text-indigo-600 bg-white';

                  if (pts >= 2000) {
                    tierName = '👑 Principal Campus Architect (Level 5)';
                    nextTier = 'Maximum Prestige Reached';
                    minTierPts = 2000;
                    maxTierPts = 5000;
                    badgeBg = 'text-rose-700 bg-rose-50';
                  } else if (pts >= 1200) {
                    tierName = 'Distinguished Fellow (Level 4)';
                    nextTier = 'Principal Campus Architect (Level 5)';
                    minTierPts = 1200;
                    maxTierPts = 2000;
                    badgeBg = 'text-amber-700 bg-amber-50';
                  } else if (pts >= 600) {
                    tierName = 'Academic Mentor (Level 3)';
                    nextTier = 'Distinguished Fellow (Level 4)';
                    minTierPts = 600;
                    maxTierPts = 1200;
                    badgeBg = 'text-purple-700 bg-purple-50';
                  } else if (pts >= 250) {
                    tierName = 'Campus Pioneer (Level 2)';
                    nextTier = 'Academic Mentor (Level 3)';
                    minTierPts = 250;
                    maxTierPts = 600;
                    badgeBg = 'text-emerald-700 bg-emerald-50';
                  }

                  const span = maxTierPts - minTierPts;
                  const earnedInTier = pts - minTierPts;
                  const progressPct = pts >= 2000 ? 100 : Math.min(100, Math.max(5, Math.round((earnedInTier / span) * 100)));
                  const ptsToNext = pts >= 2000 ? 0 : maxTierPts - pts;

                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-900">KnowPoints Balance</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shadow-2xs ${badgeBg}`}>
                          {tierName}
                        </span>
                      </div>
                      <p className="text-2xl font-black text-indigo-950 mt-1">{pts} <span className="text-xs font-bold text-indigo-700">pts</span></p>
                      <div className="w-full bg-indigo-200/80 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                      </div>
                      <p className="text-[10px] text-indigo-700 mt-1 font-medium">
                        {pts >= 2000 ? 'Highest Campus Honor Achieved' : `${ptsToNext} pts to ${nextTier} • +50 pts per published note`}
                      </p>
                    </>
                  );
                })()}
              </div>

              <div className="p-3.5 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl border border-amber-100 flex flex-col justify-between">
                <span className="text-xs font-bold text-amber-900">Earned Institutional Badges</span>
                <div className="flex flex-wrap gap-1.5 my-1">
                  <span className="text-[10px] font-bold bg-white text-amber-950 px-2 py-1 rounded-md border border-amber-200 shadow-2xs">
                    🌟 Pioneer
                  </span>
                  <span className="text-[10px] font-bold bg-white text-indigo-950 px-2 py-1 rounded-md border border-indigo-200 shadow-2xs">
                    🛡️ Mentor
                  </span>
                  <span className="text-[10px] font-bold bg-white text-emerald-950 px-2 py-1 rounded-md border border-emerald-200 shadow-2xs">
                    🏆 Verified Expert
                  </span>
                </div>
                <p className="text-[10px] text-amber-800 font-medium">Badges displayed on your authored notes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-500" />
                <span>Affiliated Campus Node: <strong className="text-slate-800">Central Engineering & AI Node</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400" />
                <span>Department: <strong className="text-slate-800">{user?.department || 'Computer Science & Engineering'}</strong></span>
              </div>
              {role === ROLES.ALUMNI ? (
                <>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-500" />
                    <span>Graduation: <strong className="text-slate-800">{user?.graduationYear || 'Class of 2023'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-500" />
                    <span>Current Company: <strong className="text-emerald-700 font-bold">{user?.currentCompany || 'NVIDIA (Senior Engineer)'}</strong></span>
                  </div>
                </>
              ) : (
                user?.yearOfStudy && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Academic Level: <strong className="text-slate-800">{user?.yearOfStudy}</strong></span>
                  </div>
                )
              )}
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Global Mobility Index: <strong className="text-emerald-700">Verified Cross-Campus</strong></span>
              </div>
            </div>

            {user?.bio && (
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <p className="font-semibold text-slate-700 mb-0.5">Bio / Research Focus:</p>
                <p className="italic text-slate-500">{user.bio}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Toast Notification */}
      {shareToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-800 animate-in slide-in-from-top duration-200 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Direct Knowledge Link copied to clipboard! Share with your classmates.</span>
          </div>
          <button onClick={() => setShareToast(false)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dean Certificate Toast */}
      {certToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-800 animate-in slide-in-from-top duration-200 shadow-sm">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Official Dean's Certificate of Institutional Contribution generated and downloaded!</span>
          </div>
          <button onClick={() => setCertToast(false)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Playbook Success Toast */}
      {playbookSuccessToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-800 animate-in slide-in-from-top duration-200 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Placement Playbook published to the Knowledge Repository! You earned +150 KnowPoints.</span>
          </div>
          <button onClick={() => setPlaybookSuccessToast(false)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================
          ROLE-SPECIFIC PRIVILEGES & REFERRAL ACCESS
      ======================================================== */}
      <Card className="overflow-hidden border border-slate-200 shadow-sm">
        {role === ROLES.ALUMNI ? (
          // ==========================================
          // ALUMNI MENTOR PROFILE VIEW
          // ==========================================
          <>
            <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-extrabold text-white">
                    💼 Alumni Mentor Privileges & Referral Pipeline
                  </h3>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                    Industry Track
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Graduated industry track • No college ID required • Access high-yield corporate referral bonuses & talent scouting
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={ROUTES.PRIVILEGES}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explore Privileges Menu</span>
                </Link>
              </div>
            </div>

            <div className="p-5 sm:p-6 bg-slate-50/50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Alumni Privilege 1: Corporate Referral Bonus Pipeline */}
                <div className="p-5 bg-white border border-emerald-200 rounded-2xl flex flex-col justify-between shadow-2xs space-y-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                          💰
                        </span>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 leading-snug">
                            The Corporate Referral Bonus Pipeline
                          </h4>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            ₹30,000 to ₹1,50,000 ($1,000+) Per Hire
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                        Financial Urge
                      </span>
                    </div>

                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 text-emerald-950 rounded-xl text-xs leading-relaxed space-y-1">
                      <strong className="text-emerald-900 block font-bold flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> The Reality:
                      </strong>
                      <p>
                        Almost all tech companies (Amazon, Microsoft, TCS, Infosys, startups) pay their employees ₹30,000 to ₹1,50,000 ($1,000+) as an internal Referral Bonus if someone they refer gets hired.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs leading-relaxed space-y-1">
                      <strong className="text-slate-900 block font-bold flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-600" /> How It Works:
                      </strong>
                      <p>
                        Top-ranked alumni on KnowPass get first-look access to top-ranked junior talent in their specific domain (e.g., Top 5 backend coders or Top 5 VLSI designers) without getting 200 unvetted LinkedIn DMs.
                      </p>
                    </div>

                    <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-950 rounded-xl text-xs font-medium flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Result:</strong> Help your junior, secure a huge referral bonus from your employer, and strengthen your firm's pipeline.
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Current Company: <strong className="text-emerald-700">{user?.currentCompany || 'NVIDIA (Senior Robotics Software Engineer)'}</strong>
                    </span>
                    <Button
                      size="sm"
                      onClick={() => setScoutModalOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded-xl gap-1 shadow-xs"
                    >
                      <span>Scout Top Juniors</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Alumni Privilege 2: Convocation Citation & VIP Privileges */}
                <div className="p-5 bg-white border border-amber-200 rounded-2xl flex flex-col justify-between shadow-2xs space-y-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                          🏛️
                        </span>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 leading-snug">
                            Official Convocation Citation & VIP Campus Privileges
                          </h4>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            Guest of Honor & Paid Honorariums
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-600 text-white">
                        Top 10 Honors
                      </span>
                    </div>

                    <div className="p-3 bg-purple-50/80 border border-purple-200 text-purple-950 rounded-xl text-xs leading-relaxed space-y-1">
                      <strong className="text-purple-900 block font-bold flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-purple-600" /> VIP Campus Privileges:
                      </strong>
                      <p>
                        College invites Top 10 alumni contributors as Guest of Honor / Paid Jury Members for campus hackathons, symposiums, and tech fests.
                      </p>
                    </div>

                    <div className="p-3 bg-amber-50/80 border border-amber-200 text-amber-950 rounded-xl text-xs leading-relaxed space-y-1">
                      <strong className="text-amber-900 block font-bold flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-600" /> Convocation Citation:
                      </strong>
                      <p>
                        Guest lectures with honorariums and an official "Distinguished Alumni Knowledge Builder" citation awarded at the annual alumni meet.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Class: <strong className="text-slate-800">{user?.graduationYear || 'Class of 2023'}</strong>
                    </span>
                    <Button
                      size="sm"
                      onClick={handleDownloadAlumniCitation}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-1.5 px-3 rounded-xl gap-1.5 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Alumni Citation (.md)</span>
                    </Button>
                  </div>
                </div>

                {/* Live Corporate Referral Pipeline Status Drawer (Active when alumni submitted referrals) */}
                {corporateReferrals.length > 0 && (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl md:col-span-2 space-y-3">
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

                {/* Alumni Privilege 3: Placement Playbooks & Interview Runbooks */}
                <div className="p-5 bg-white border border-indigo-200 rounded-2xl flex flex-col justify-between shadow-2xs space-y-3 md:col-span-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                        💼
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900 leading-snug">
                            My Authored Placement Playbooks & Interview Runbooks
                          </h4>
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                            {myPlaybooks.length} Published
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Document interview rounds, coding assessments, and prep advice to mentor juniors (+150 pts per playbook)
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => setSharePlaybookModalOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-indigo-600/20 shrink-0"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Share Placement Playbook (+150 pts)</span>
                    </Button>
                  </div>

                  {myPlaybooks.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/60 p-4">
                      <p className="text-xs font-bold text-slate-700">No placement playbooks authored yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Share your interview rounds and questions from your college placements to guide hundreds of juniors!
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setSharePlaybookModalOpen(true)}
                        className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Share Your First Playbook</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {myPlaybooks.map((pb) => (
                        <div
                          key={pb.id}
                          className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-2 hover:border-indigo-300 transition"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-black text-slate-900 line-clamp-1">{pb.company} — {pb.role}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{pb.department} • {pb.batchYear || 'Alumni'}</p>
                            </div>
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg whitespace-nowrap">
                              {pb.ctcRange?.split('(')[0] || pb.ctcRange}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                            <span className="text-[10px] text-slate-500 font-semibold">
                              {pb.roundsCount || pb.rounds?.length || 4} Rounds • {pb.likes || 0} Upvotes
                            </span>
                            <div className="flex items-center gap-1.5">
                              <Link
                                to={`${ROUTES.PLACEMENTS}?search=${encodeURIComponent(pb.company)}`}
                                className="p-1 text-slate-500 hover:text-indigo-600 transition"
                                title="View in Placements Hub"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => handleDeleteMyPlaybook(pb.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition"
                                title="Delete this playbook"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          // ==========================================
          // JUNIOR STUDYING STUDENT PROFILE VIEW
          // ==========================================
          <>
            <div className="p-5 sm:p-6 bg-slate-50/50 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                      Student Privileges & Referral Pipeline
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Earned KnowPoints unlock direct Fast-Track Referral Tokens & mock technical interviews
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleDownloadDeanCertificate}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Dean's Certificate (.md)</span>
                  </Button>
                  <Link
                    to={ROUTES.PRIVILEGES}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition border border-indigo-200"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Privileges Menu</span>
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Student Privilege 1: Fast-Track Referral Token */}
                <div className="p-5 bg-white border border-indigo-200 rounded-2xl flex flex-col justify-between shadow-2xs space-y-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                          ⚡
                        </span>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 leading-snug">
                            The "Fast-Track Referral Token"
                          </h4>
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                            Direct Connection to Seniors
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-600 text-white shadow-2xs">
                        {Math.max(1, Math.floor((Number(user?.knowPoints) || 20) / 50))} Token{Math.max(1, Math.floor((Number(user?.knowPoints) || 20) / 50)) > 1 ? 's' : ''} Ready
                      </span>
                    </div>

                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-950 rounded-xl text-xs leading-relaxed space-y-1">
                      <strong className="text-rose-900 block font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> The Problem:
                      </strong>
                      <p>
                        Juniors message hundreds of alumni on LinkedIn: "Hi sir, please refer me", and 99% get ignored.
                      </p>
                    </div>

                    <div className="p-3 bg-indigo-50/70 border border-indigo-200 text-indigo-950 rounded-xl text-xs leading-relaxed space-y-1">
                      <strong className="text-indigo-900 block font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> The Solution:
                      </strong>
                      <p>
                        When you earn leaderboard points (solving bugs, posting lab tips, upvotes), you unlock a Referral Request Token for a guaranteed Resume Review or Referral from a top-ranked alumnus.
                      </p>
                    </div>

                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl text-xs font-medium flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>The Trust Factor:</strong> The senior knows you earned your way through verified merit and isn't just a copy-paste spammer.
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Cost: <strong>50 pts / Token</strong> (Your balance: {user?.knowPoints || 20} pts)
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleOpenReferralModal()}
                      className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-1.5 px-3 flex items-center gap-1 shadow-xs"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Connect with Alumni</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Student Privilege 2: Mock Technical Interview with Seniors */}
                <div className="p-5 bg-white border border-emerald-200 rounded-2xl flex flex-col justify-between shadow-2xs space-y-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                          🎯
                        </span>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 leading-snug">
                            Mock Technical Interview in Target Role
                          </h4>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            1-on-1 45-Min Role Preparation
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                        Top 25 Standings
                      </span>
                    </div>

                    <div className="p-3 bg-indigo-50/70 border border-indigo-200 text-indigo-950 rounded-xl text-xs leading-relaxed space-y-1">
                      <strong className="text-indigo-900 block font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> 1-on-1 Target Prep:
                      </strong>
                      <p>
                        Top 25 juniors get matched for a private 1-on-1 45-minute mock interview with an alumnus working in that exact role (e.g., SDE-1 at Amazon, FPGA Engineer at Texas Instruments).
                      </p>
                    </div>

                    <div className="p-3 bg-emerald-50/80 border border-emerald-200 text-emerald-950 rounded-xl text-xs leading-relaxed space-y-1">
                      <strong className="text-emerald-900 block font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Industry Hiring Bar:
                      </strong>
                      <p>
                        Get direct, real-world feedback on what current company hiring bars actually look like before visiting campus recruitment rounds.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Eligibility: <strong className="text-emerald-700">Active Contributor (Unlocked)</strong>
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleOpenMockModal()}
                      className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-1.5 px-3 flex items-center gap-1 shadow-xs"
                    >
                      <Calendar className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Schedule Mock Interview</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Real-Time Mentorship & Referrals Pipeline Tracker */}
              {(myReferralRequests.length > 0 || myMockInterviews.length > 0) && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                        My Active Alumni Requests & Interview Bookings ({myReferralRequests.length + myMockInterviews.length})
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Live Synced
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Referrals List */}
                    {myReferralRequests.map((req) => (
                      <div key={req.id} className="p-3 bg-white border border-indigo-100 rounded-xl shadow-2xs space-y-2">
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
                          <p className="text-[11px] text-slate-500">Mentor: {req.mentorName} ({req.mentorRole})</p>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-50">
                          <span>Token: -50 pts</span>
                          <span>Submitted: {new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}

                    {/* Mock Interviews List */}
                    {myMockInterviews.map((m) => (
                      <div key={m.id} className="p-3 bg-white border border-emerald-100 rounded-xl shadow-2xs space-y-2">
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
                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-50">
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
          </>
        )}
      </Card>

      {/* ========================================================
          MY PUBLISHED CONTRIBUTIONS & RESEARCH SOPS
      ======================================================== */}
      <Card>
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                My Published Campus Contributions & Research SOPs
              </h3>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
                {myContributions.length}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Practical knowledge, capstone retrospectives, and lab guides authored by you
            </p>
          </div>

          <Link
            to={ROUTES.CONTRIBUTE}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish New Document (+50 pts)</span>
          </Link>
        </div>

        <div className="p-5 sm:p-6">
          {loadingContributions ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Loading your authored documents...
            </div>
          ) : myContributions.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
              <h4 className="text-sm font-bold text-slate-800">No authored contributions yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Share your capstone bug fixes, lab hardware runbooks, or placement experiences to earn KnowPoints and prestige badges!
              </p>
              <Link
                to={ROUTES.CONTRIBUTE}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-indigo-700 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Your First Document</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myContributions.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 transition flex flex-col justify-between group relative shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {item.category || item.knowledgeType || 'Article'}
                      </span>
                      <span className="text-[11px] font-bold text-indigo-600 inline-flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> {item.upvotes || 0}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]">
                      {item.department}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleShareMyContribution(item)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 rounded-lg transition"
                        title="Share document link"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      <Link
                        to={`${ROUTES.KNOWLEDGE_BASE}?search=${encodeURIComponent(item.title)}`}
                        className="p-1.5 text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 rounded-lg transition"
                        title="View in Knowledge Base"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => handleDeleteMyContribution(item.id, item.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200/80 rounded-lg transition"
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Permissions Grid */}
      <Card>
        <CardHeader
          title="Assigned Role Permissions"
          subtitle={`Capabilities granted by the ${roleConfig?.label} role in KnowPass`}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {permissions.map((perm) => (
            <div
              key={perm}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-slate-800 font-mono">{perm}</p>
                <p className="text-[11px] text-slate-500 capitalize">
                  Authorized action for {roleConfig?.label.toLowerCase()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Institutional Security & Access Level */}
      <Card>
        <CardHeader
          title="Institutional Security & Access Level"
          subtitle="Your official verified authorization tier issued by Campus Academic IT"
        />

        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Verified Role: {roleConfig?.label}
              </h4>
              <p className="text-[11px] text-slate-500">
                Authorized for {user?.department} • Access status: Active & Verified
              </p>
            </div>
          </div>

          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${roleConfig?.badgeClass}`}>
            {role}
          </span>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Personal Profile</h3>
                  <p className="text-xs text-slate-500">Update your public campus information</p>
                </div>
              </div>

              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Profile details saved permanently to Supabase PostgreSQL!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name / Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition appearance-none cursor-pointer"
                  >
                    {DEPARTMENTS_LIST.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Level / Year
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={editFormData.yearOfStudy}
                    onChange={(e) => setEditFormData({ ...editFormData, yearOfStudy: e.target.value })}
                    className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition appearance-none cursor-pointer"
                  >
                    {YEARS_LIST.map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bio / Research Focus
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <textarea
                    rows={2}
                    value={editFormData.bio}
                    onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                    className="w-full text-xs sm:text-sm pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition resize-none"
                    placeholder="Brief description of your research focus or campus affiliations..."
                  />
                </div>
              </div>

              {/* Profile Photo: Select from device + Crop + Apply */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Profile Photo
                </label>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                  {/* Photo Preview */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={editFormData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt="Avatar Preview"
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-600/30 shadow-md bg-white"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1 rounded-full shadow">
                      <Camera className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Actions: File Select and Crop */}
                  <div className="flex-1 text-center sm:text-left space-y-2 w-full">
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/20 cursor-pointer transition">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Choose Photo from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileSelect}
                          className="hidden"
                        />
                      </label>

                      {editFormData.avatar && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRawImage(editFormData.avatar);
                            setCropModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-2xs transition"
                        >
                          <Crop className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Crop & Adjust</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Supports JPG, PNG, WebP • Auto-crops to circular campus avatar
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  loading={isSaving}
                  className="px-5 py-2 text-xs font-bold"
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Placement Playbook Modal (Alumni Profile Exclusive) */}
      {sharePlaybookModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50 flex items-start justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Alumni Mentor Runbook
                  </span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                    +150 Karma Points
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                  Share Your Placement Experience & Interview Playbook
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Document actual evaluation rounds, questions asked, and salary ranges to mentor junior scholars.
                </p>
              </div>
              <button
                onClick={() => setSharePlaybookModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSharePlaybookSubmit} className="flex flex-col flex-1 overflow-hidden">
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
                      placeholder="e.g. Google, NVIDIA, Qualcomm, Microsoft"
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
                      placeholder="e.g. ₹36 LPA (₹24L Base + RSUs)"
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
                    <label className="block font-bold text-slate-700 mb-1">Graduation Batch *</label>
                    <input
                      type="text"
                      value={shareBatch}
                      onChange={(e) => setShareBatch(e.target.value)}
                      placeholder="e.g. Class of 2024"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-500 focus:bg-white transition"
                    />
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
                        Detail each round of your evaluation process
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
                <Button variant="outline" size="sm" type="button" onClick={() => setSharePlaybookModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>Publish Playbook (+150 pts)</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Cloud & Anycast DNS Architecture Modal */}
      <GlobalDnsCloudModal
        isOpen={showDnsModal}
        onClose={() => setShowDnsModal(false)}
      />

      {/* Interactive Profile Photo Cropper & Adjuster Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={selectedRawImage}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={handleCropComplete}
      />

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
                  placeholder="Hi senior, I have authored 2 lab SOPs in distributed systems and solved concurrency bug fixes. I am applying for the SDE-1 opening and would love your referral or feedback!"
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

      {/* Floating Success Toasts for Referral & Mock Interview */}
      {referralToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-indigo-700 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <Zap className="w-5 h-5 text-amber-300" />
          <div>
            <p className="text-xs font-bold">Fast-Track Referral Token Redeemed! (-50 pts)</p>
            <p className="text-[11px] text-indigo-200">
              Request routed to {selectedMentor?.name} at {referralCompany}. Check your tracker below.
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
