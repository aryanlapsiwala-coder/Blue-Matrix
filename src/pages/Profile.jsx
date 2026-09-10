import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLE_CONFIG, ROLE_PERMISSIONS, ROLES } from '../constants/roles';
import { ROUTES } from '../constants/routes';
import { tokenStorage } from '../utils/tokenStorage';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { knowledgeService } from '../services/knowledgeService';
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
  FileCheck
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
  const { user, role, switchRole, updateUser } = useAuth();
  const roleConfig = role ? ROLE_CONFIG[role] : null;
  const permissions = role ? ROLE_PERMISSIONS[role] || [] : [];
  const currentToken = tokenStorage.getAccessToken();
  const navigate = useNavigate();

  // My Contributions State
  const [myContributions, setMyContributions] = useState([]);
  const [loadingContributions, setLoadingContributions] = useState(true);
  const [shareToast, setShareToast] = useState(false);

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

          const mine = res.items.filter((item) => {
            const author = (item.author || '').trim().toLowerCase();
            return (
              author === userName ||
              author === userEmail ||
              (user?.email && item.authorEmail === user.email)
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

      // 1. Update in-memory and local storage
      if (updateUser) {
        updateUser(updatedFields);
      }

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

        <button
          onClick={openEditModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition self-start sm:self-auto"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Profile Details</span>
        </button>
      </div>

      {/* Profile Header Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt={user?.name}
            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-600/20 shadow-md"
          />

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{user?.name || 'Campus Scholar'}</h2>
                <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  {user?.email}
                </p>
              </div>

              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${roleConfig?.badgeClass}`}>
                {roleConfig?.label}
              </span>
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
              {user?.yearOfStudy && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Academic Level: <strong className="text-slate-800">{user?.yearOfStudy}</strong></span>
                </div>
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

      {/* ========================================================
          TANGIBLE ACADEMIC REWARDS & INSTITUTIONAL PRIVILEGES
      ======================================================== */}
      <Card className="overflow-hidden border border-indigo-100 shadow-sm">
        <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-300" />
              <h3 className="text-base font-extrabold text-white">
                Tangible Academic Rewards & Institutional Privileges
              </h3>
              <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                Real Academic Credit
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Your KnowPoints translate into official Dean letters, GPU compute hours, and campus privileges
            </p>
          </div>

          <Button
            size="sm"
            onClick={handleDownloadDeanCertificate}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-emerald-600/20 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Official Dean's Certificate (.md)</span>
          </Button>
        </div>

        <div className="p-5 sm:p-6 bg-slate-50/50 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Reward 1: GPU Cluster SLURM */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Cpu className="w-4 h-4" />
                  </div>
                  {(Number(user?.knowPoints) || 20) >= 250 ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      ✓ Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      🔒 250 pts
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900">Campus DGX GPU Quota</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  200 Node-Hours priority access on the campus NVIDIA A100 SuperPOD for capstone research.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] font-semibold text-purple-700">
                {(Number(user?.knowPoints) || 20) >= 250
                  ? 'SLURM Access Key Active'
                  : `Need ${250 - (Number(user?.knowPoints) || 20)} more pts to unlock`}
              </div>
            </div>

            {/* Reward 2: Faculty LOR */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  {(Number(user?.knowPoints) || 20) >= 600 ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      ✓ Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      🔒 600 pts
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900">Official Faculty LOR</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Dean of Academic Affairs certified Letter of Recommendation for master's applications & placements.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] font-semibold text-indigo-700">
                {(Number(user?.knowPoints) || 20) >= 600
                  ? 'Dean LOR Endorsement Certified'
                  : `Need ${600 - (Number(user?.knowPoints) || 20)} more pts to unlock`}
              </div>
            </div>

            {/* Reward 3: Central Lab Pass */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4" />
                  </div>
                  {(Number(user?.knowPoints) || 20) >= 250 ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      ✓ Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      🔒 250 pts
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900">24/7 Prototyping Lab Pass</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Keycard authorization for PCB milling, 3D printing suites, and optical testing benches.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] font-semibold text-amber-700">
                {(Number(user?.knowPoints) || 20) >= 250
                  ? 'Keycard NFC Authorized'
                  : `Need ${250 - (Number(user?.knowPoints) || 20)} more pts to unlock`}
              </div>
            </div>
          </div>
        </div>
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

              {/* Avatar URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Avatar Photo URL (Optional)
                </label>
                <div className="relative">
                  <Camera className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={editFormData.avatar}
                    onChange={(e) => setEditFormData({ ...editFormData, avatar: e.target.value })}
                    className="w-full text-xs sm:text-sm pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                    placeholder="https://images.unsplash.com/..."
                  />
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
    </div>
  );
}
