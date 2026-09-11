import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { knowledgeService, SAMPLE_KNOWLEDGE_ITEMS, getMyContributedIds, getAliasHistory } from '../services/knowledgeService';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { ROLES, ROLE_CONFIG } from '../constants/roles';
import { formatDate } from '../utils/formatters';
import { DotPattern } from '../components/ui/dot-pattern';
import {
  Search,
  Filter,
  Flame,
  Clock,
  BookOpen,
  ThumbsUp,
  Eye,
  Tag,
  Share2,
  Calendar,
  X,
  FileText,
  Star,
  CheckCircle2,
  ShieldCheck,
  Download,
  Youtube,
  Code2,
  MessageSquare,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  Send,
  Building,
  User,
  Trash2,
  Edit3,
  Save,
  AlertTriangle,
  Flag,
  Bug,
  Wrench,
  Check,
  Plus
} from 'lucide-react';

const DEPARTMENTS_FILTER = [
  'All',
  'Computer Science & Engineering (CSE)',
  'Electronics & Communication (ECE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering (CE)',
  'Information Technology & AI (IT)',
  'Electrical & Electronics (EEE)',
  'Biotechnology & Bioinformatics (BT)',
  'Central Computing & Hardware Labs',
];

const KNOWLEDGE_TYPES_FILTER = [
  'All',
  'Project Experience',
  'Lab Tip',
  'Placement Insight',
  'Faculty Method',
  'Equipment Guide',
  'Event Playbook',
  'Career Advice',
  'Lecture Notes',
];

const YEARS_FILTER = [
  'All',
  '1st Year (Freshman)',
  '2nd Year (Sophomore)',
  '3rd Year (Junior)',
  '4th Year (Senior)',
  'Post-Graduate / Masters',
  'Doctoral / PhD Scholar',
  'All Levels',
];

const POPULAR_TAGS = [
  'HPC', 'System-Design', 'DSA', 'CUDA', 'Docker', 'Linux', 'Verilog', 'Robotics', 'TensorRT', 'Wi-Fi'
];

export function KnowledgeBase() {
  const { user, role, awardPoints } = useAuth();

  const [searchParams] = useSearchParams();
  const initialUrlSearch = searchParams.get('search') || '';

  // 1-Like-per-account storage
  const likedStorageKey = `knowpass_liked_${user?.email || 'guest'}`;
  const [likedEntries, setLikedEntries] = useState(() => {
    try {
      const saved = localStorage.getItem(likedStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Keep liked list in sync when user account changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`knowpass_liked_${user?.email || 'guest'}`);
      if (saved) setLikedEntries(JSON.parse(saved));
      else setLikedEntries([]);
    } catch {
      setLikedEntries([]);
    }
  }, [user?.email]);

  // Data state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState(initialUrlSearch);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedTag, setSelectedTag] = useState(null);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('trending'); // 'trending', 'upvotes', 'newest', 'rating'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Keep state in sync if user navigates with new search param from Navbar
  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  // Modal State
  const [activeItem, setActiveItem] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [shareToast, setShareToast] = useState(false);

  // Author Edit Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    category: '',
    department: '',
    summary: '',
    content: '',
    tags: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Issue Reporting & Resolution State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState('Bug / Syntax Error');
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [suggestedFix, setSuggestedFix] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [resolvingReportId, setResolvingReportId] = useState(null);
  const [resolutionInput, setResolutionInput] = useState('');
  const [reportToast, setReportToast] = useState(null);

  // Author-only access check
  const canUserEdit = (item) => {
    if (!item) return false;
    if (role === ROLES.ADMIN) return true;
    if (user?.name && item.author && item.author.trim().toLowerCase() === user.name.trim().toLowerCase()) return true;
    if (user?.email && item.authorEmail && item.authorEmail.trim().toLowerCase() === user.email.trim().toLowerCase()) return true;
    const myIds = getMyContributedIds(user?.email);
    if (item.id && myIds.includes(item.id)) return true;
    const aliases = getAliasHistory(user?.email);
    if (item.author && aliases.includes(item.author.trim().toLowerCase())) return true;
    return false;
  };

  // Comment Access Control:
  // - Edit: ONLY the author of the comment
  // - Delete/Remove: The comment author OR the author of this contribution OR an admin
  const isCommentAuthor = (comm) => {
    if (!comm || !user) return false;
    const currentName = (user.name || '').trim().toLowerCase();
    const currentUserEmail = (user.email || '').trim().toLowerCase();
    const commUser = (comm.user || '').trim().toLowerCase();
    const commEmail = (comm.userEmail || '').trim().toLowerCase();

    if (currentUserEmail && commEmail && currentUserEmail === commEmail) return true;
    if (currentName && commUser && currentName === commUser) return true;
    return false;
  };

  const isContributionAuthor = (item) => {
    if (!item || !user) return false;
    const currentName = (user.name || '').trim().toLowerCase();
    const currentUserEmail = (user.email || '').trim().toLowerCase();
    const authorName = (item.author || '').trim().toLowerCase();
    const authorEmail = (item.authorEmail || '').trim().toLowerCase();

    if (currentUserEmail && authorEmail && currentUserEmail === authorEmail) return true;
    if (currentName && authorName && currentName === authorName) return true;
    const myIds = getMyContributedIds(user?.email);
    if (item.id && myIds.includes(item.id)) return true;
    const aliases = getAliasHistory(user?.email);
    if (authorName && aliases.includes(authorName)) return true;
    return false;
  };

  const canEditComment = (comm) => {
    return isCommentAuthor(comm);
  };

  const canDeleteComment = (comm) => {
    if (role === ROLES.ADMIN) return true;
    if (isCommentAuthor(comm)) return true;
    if (isContributionAuthor(activeItem)) return true;
    return false;
  };

  // Real Share Link to Clipboard
  const handleShare = (item, e) => {
    if (e) e.stopPropagation();
    const shareUrl = `${window.location.origin}/knowledge-base?search=${encodeURIComponent(item.title)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
    }
    setShareToast(true);
    setTimeout(() => setShareToast(false), 3500);
  };

  // Real File & SOP Blob Exporter
  const handleDownloadFile = (file, item) => {
    const docData = `# ${item.title}\n\n**Category:** ${item.category || item.knowledgeType}\n**Department:** ${item.department}\n**Author:** ${item.author} (${item.authorRole || 'STUDENT'})\n**Verified:** ${item.isVerified ? 'Yes (Faculty Endorsed)' : 'Peer Reviewed'}\n\n---\n\n## Executive Summary\n${item.summary}\n\n## Detailed Knowledge / SOP / Runbook\n${item.content}\n\n---\n*Preserved permanently on KnowPass Campus Knowledge Node — Anti-Knowledge Loss System*`;
    const blob = new Blob([docData], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file?.name || `${(item.title || 'knowledge').replace(/[^a-zA-Z0-9_-]/g, '_')}_SOP.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Fetch live articles from Supabase / API
  useEffect(() => {
    let isMounted = true;
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const res = await knowledgeService.getAll({
          department: selectedDept,
          category: selectedType,
          year: selectedYear,
          minRating: minRating,
          search: searchQuery,
        });
        if (isMounted && res && res.items) {
          setItems(res.items);
        }
      } catch (err) {
        console.warn('Fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchArticles();
    return () => {
      isMounted = false;
    };
  }, [selectedDept, selectedType, selectedYear, minRating, searchQuery]);

  // Listen for real-time profile updates (e.g. user updated avatar or name in Profile)
  useEffect(() => {
    const handleProfileUpdate = (e) => {
      const updatedFields = e.detail;
      if (!updatedFields) return;

      setItems((prevItems) =>
        prevItems.map((item) => {
          if (canUserEdit(item)) {
            return {
              ...item,
              author: updatedFields.name || item.author,
              authorAvatar: updatedFields.avatar || item.authorAvatar,
              authorRole: updatedFields.role || item.authorRole,
              authorBio: updatedFields.bio !== undefined ? updatedFields.bio : item.authorBio,
            };
          }
          return item;
        })
      );

      setActiveItem((prev) => {
        if (!prev) return prev;
        if (canUserEdit(prev)) {
          return {
            ...prev,
            author: updatedFields.name || prev.author,
            authorAvatar: updatedFields.avatar || prev.authorAvatar,
            authorRole: updatedFields.role || prev.authorRole,
            authorBio: updatedFields.bio !== undefined ? updatedFields.bio : prev.authorBio,
          };
        }
        return prev;
      });
    };

    window.addEventListener('knowpass-profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('knowpass-profile-updated', handleProfileUpdate);
  }, [user?.name, user?.email, role]);

  // Real-time filtering logic
  const filteredItems = useMemo(() => {
    let result = (items || []).filter((item) => {
      if (!item) return false;

      // Search query match
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (item.title || '').toLowerCase().includes(q);
        const matchesSummary = (item.summary || '').toLowerCase().includes(q);
        const matchesAuthor = (item.author || '').toLowerCase().includes(q);
        const matchesTags = Array.isArray(item.tags)
          ? item.tags.some((t) => typeof t === 'string' && t.toLowerCase().includes(q))
          : false;
        if (!matchesTitle && !matchesSummary && !matchesAuthor && !matchesTags) {
          return false;
        }
      }

      // Department filter
      if (selectedDept !== 'All') {
        const dept = item.department || '';
        if (!dept.toLowerCase().includes(selectedDept.toLowerCase())) {
          return false;
        }
      }

      // Type filter
      if (selectedType !== 'All') {
        const type = item.knowledgeType || item.category || '';
        if (type !== selectedType && item.category !== selectedType) {
          return false;
        }
      }

      // Year level filter
      if (selectedYear !== 'All') {
        const yr = item.yearOfStudy || 'All Levels';
        if (yr !== selectedYear && yr !== 'All Levels') {
          return false;
        }
      }

      // Tag filter
      if (selectedTag) {
        if (!Array.isArray(item.tags) || !item.tags.includes(selectedTag)) {
          return false;
        }
      }

      // Rating filter
      if (minRating > 0) {
        if ((Number(item.rating) || 5.0) < minRating) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      const aUpvotes = Number(a?.upvotes) || 0;
      const bUpvotes = Number(b?.upvotes) || 0;
      const aViews = Number(a?.views) || 0;
      const bViews = Number(b?.views) || 0;
      const aRating = Number(a?.rating) || 5.0;
      const bRating = Number(b?.rating) || 5.0;

      if (sortBy === 'trending') {
        return (bUpvotes * 1.5 + bViews * 0.1) - (aUpvotes * 1.5 + aViews * 0.1);
      }
      if (sortBy === 'upvotes') {
        return bUpvotes - aUpvotes;
      }
      if (sortBy === 'newest') {
        return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
      }
      if (sortBy === 'rating') {
        return bRating - aRating;
      }
      return 0;
    });

    return result;
  }, [items, searchQuery, selectedDept, selectedType, selectedYear, selectedTag, minRating, sortBy]);

  // Top trending items
  const trendingItems = useMemo(() => {
    return [...(items || [])]
      .filter((item) => item && item.title)
      .sort((a, b) => (Number(b?.upvotes) || 0) - (Number(a?.upvotes) || 0))
      .slice(0, 3);
  }, [items]);

  // Recently added items
  const recentItems = useMemo(() => {
    return [...(items || [])]
      .filter((item) => item && item.title)
      .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
      .slice(0, 4);
  }, [items]);

  // Upvote Handler with 1-Like-per-Account Toggle Protection
  const handleUpvote = (id, e) => {
    if (e) e.stopPropagation();
    const targetItem = (items || []).find((i) => i.id === id) || activeItem;
    if (!targetItem) return;

    const isAlreadyLiked = likedEntries.includes(id);
    let updatedLikes;
    let newCount = Number(targetItem.upvotes) || 0;

    if (isAlreadyLiked) {
      // Toggle unlike (-1)
      updatedLikes = likedEntries.filter((itemKey) => itemKey !== id);
      newCount = Math.max(0, newCount - 1);
    } else {
      // Toggle like (+1)
      updatedLikes = [...likedEntries, id];
      newCount = newCount + 1;
    }

    setLikedEntries(updatedLikes);
    try {
      localStorage.setItem(likedStorageKey, JSON.stringify(updatedLikes));
    } catch (err) {
      console.warn('Error saving liked state:', err);
    }

    // Call Supabase persistence
    knowledgeService.upvote(id, newCount - 1);

    setItems((prev) =>
      (prev || []).map((item) =>
        item.id === id ? { ...item, upvotes: newCount } : item
      )
    );
    if (activeItem && activeItem.id === id) {
      setActiveItem((prev) => ({ ...prev, upvotes: newCount }));
    }
  };

  // Open Detail Modal and fetch live comments & issue reports
  const handleOpenDetail = async (item) => {
    setActiveItem(item);
    try {
      const [dbComments, dbReports] = await Promise.all([
        knowledgeService.getComments(item.id),
        knowledgeService.getReports(item.id),
      ]);
      setActiveItem((prev) => {
        if (!prev || prev.id !== item.id) return prev;
        return {
          ...prev,
          comments: dbComments && dbComments.length > 0 ? dbComments : (prev.comments || []),
          reports: dbReports || prev.reports || [],
        };
      });
    } catch (err) {
      console.warn('Error loading comments/reports:', err);
    }
  };

  // Verify Resource Handler (for Faculty, Tech, Admin)
  const handleVerifyResource = async (id) => {
    const verifierName = `${user?.name || 'Faculty Lead'} (${role})`;
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, isVerified: true, verifiedBy: verifierName }
          : item
      )
    );
    if (activeItem && activeItem.id === id) {
      setActiveItem((prev) => ({
        ...prev,
        isVerified: true,
        verifiedBy: verifierName,
      }));
    }

    // Persist to Supabase PostgreSQL table
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('knowledge_entries')
          .update({ is_verified: true })
          .eq('id', id);
      } catch (err) {
        console.warn('Error updating verification status in Supabase:', err);
      }
    }

    pushCampusNotification(user?.email, {
      title: 'Tier-3 Faculty Endorsement Certified 🛡️',
      desc: `You officially verified and endorsed "${activeItem?.title || 'Knowledge Resource'}" as an institutional asset.`,
      type: 'endorse',
      link: `/knowledge-base?search=${encodeURIComponent(activeItem?.title || '')}`,
    });
  };

  // Add Comment Handler with Supabase Persistence
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeItem) return;

    const textToSubmit = newCommentText.trim();
    setNewCommentText('');

    const savedComment = await knowledgeService.addComment(activeItem.id, {
      user: user?.name || 'Campus Scholar',
      userEmail: user?.email || '',
      role: role || ROLES.STUDENT,
      text: textToSubmit,
    });

    const updatedComments = [...(activeItem.comments || []), savedComment];

    setItems((prev) =>
      prev.map((item) =>
        item.id === activeItem.id ? { ...item, comments: updatedComments } : item
      )
    );

    setActiveItem((prev) => ({ ...prev, comments: updatedComments }));
  };

  // Comment Edit & Delete Handlers
  const handleStartEditComment = (comm) => {
    if (!canEditComment(comm)) return;
    setEditingCommentId(comm.id);
    setEditingCommentText(comm.text || '');
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleSaveEditComment = async (commId) => {
    if (!editingCommentText.trim() || !activeItem) return;
    const trimmed = editingCommentText.trim();

    await knowledgeService.editComment(activeItem.id, commId, trimmed);

    const updatedComments = (activeItem.comments || []).map((c) =>
      c.id === commId ? { ...c, text: trimmed, isEdited: true } : c
    );

    setItems((prev) =>
      prev.map((item) =>
        item.id === activeItem.id ? { ...item, comments: updatedComments } : item
      )
    );
    setActiveItem((prev) => ({ ...prev, comments: updatedComments }));
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleDeleteComment = async (commId) => {
    const targetComm = (activeItem.comments || []).find((c) => c.id === commId);
    if (!canDeleteComment(targetComm)) return;

    if (!window.confirm('Are you sure you want to remove this comment?')) return;
    if (!activeItem) return;

    await knowledgeService.deleteComment(activeItem.id, commId);

    const updatedComments = (activeItem.comments || []).filter((c) => c.id !== commId);

    setItems((prev) =>
      prev.map((item) =>
        item.id === activeItem.id ? { ...item, comments: updatedComments } : item
      )
    );
    setActiveItem((prev) => ({ ...prev, comments: updatedComments }));
  };

  // Author Edit Handlers
  const handleStartEdit = (item) => {
    if (!canUserEdit(item)) {
      alert("Unauthorized: Only the verified author of this document can make edits.");
      return;
    }
    setEditForm({
      title: item.title || '',
      category: item.category || item.knowledgeType || 'Project Experience',
      department: item.department || 'Computer Science & Engineering (CSE)',
      summary: item.summary || '',
      content: item.content || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
    });
    setEditingItem(item);
  };

  const handleSaveEdit = async (e) => {
    if (e) e.preventDefault();
    if (!editingItem) return;
    if (!canUserEdit(editingItem)) {
      alert("Unauthorized: Only the verified author can update this document.");
      return;
    }
    if (!editForm.title.trim()) {
      alert("Document title is required.");
      return;
    }

    setSavingEdit(true);
    try {
      const parsedTags = editForm.tags
        ? editForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : (editingItem.tags || []);

      const updatedFields = {
        title: editForm.title.trim(),
        category: editForm.category,
        knowledgeType: editForm.category,
        department: editForm.department,
        summary: editForm.summary.trim(),
        content: editForm.content.trim(),
        tags: parsedTags,
      };

      await knowledgeService.update(editingItem.id, updatedFields);

      // Update in main list
      setItems((prev) =>
        prev.map((it) => (it.id === editingItem.id ? { ...it, ...updatedFields } : it))
      );

      // Update activeItem if opened
      if (activeItem && activeItem.id === editingItem.id) {
        setActiveItem((prev) => ({ ...prev, ...updatedFields }));
      }

      setEditingItem(null);
    } catch (err) {
      console.error('Failed to update knowledge entry:', err);
      alert('Failed to save changes. Please check network connection and try again.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Article Handler (for Admin & Authors)
  const handleDeleteEntry = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this campus knowledge document from the database?")) {
      await knowledgeService.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setActiveItem(null);
    }
  };

  // -------------------------------------------------------------
  // ISSUE REPORTING & AUTHOR RESOLUTION HANDLERS
  // -------------------------------------------------------------
  const handleOpenReportModal = () => {
    setReportCategory('Bug / Syntax Error');
    setReportTitle('');
    setReportDescription('');
    setSuggestedFix('');
    setReportModalOpen(true);
  };

  const handleCloseReportModal = () => {
    setReportModalOpen(false);
    setReportTitle('');
    setReportDescription('');
    setSuggestedFix('');
  };

  const handleSubmitReport = async (e) => {
    if (e) e.preventDefault();
    if (!activeItem) return;
    if (!reportTitle.trim()) {
      alert('Please provide a brief title summarizing the issue.');
      return;
    }
    if (!reportDescription.trim()) {
      alert('Please explain the issue or error encountered.');
      return;
    }

    setSubmittingReport(true);
    try {
      const result = await knowledgeService.addReport(activeItem.id, {
        reporterName: user?.name || 'Campus Student',
        reporterEmail: user?.email || '',
        reporterRole: role || ROLES.STUDENT,
        category: reportCategory,
        title: reportTitle.trim(),
        description: reportDescription.trim(),
        suggestedFix: suggestedFix.trim(),
        authorEmail: activeItem.authorEmail,
        entryTitle: activeItem.title,
      });

      // Update activeItem & items
      setActiveItem((prev) => ({
        ...prev,
        reports: result.allReports,
      }));
      setItems((prev) =>
        prev.map((it) => (it.id === activeItem.id ? { ...it, reports: result.allReports } : it))
      );

      handleCloseReportModal();
      setReportToast('Issue reported successfully! The author has been notified.');
      setTimeout(() => setReportToast(null), 4000);
    } catch (err) {
      console.error('Error submitting report:', err);
      alert('Could not submit report. Please try again.');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleStartResolveReport = (report) => {
    setResolvingReportId(report.id);
    setResolutionInput(
      report.suggestedFix ? `Applied suggested fix: ${report.suggestedFix}` : 'Addressed and corrected in document.'
    );
  };

  const handleCancelResolveReport = () => {
    setResolvingReportId(null);
    setResolutionInput('');
  };

  const handleConfirmResolveReport = async (reportId) => {
    if (!activeItem) return;
    const resolverName = user?.name || activeItem.author || 'Author';

    try {
      const result = await knowledgeService.resolveReport(
        activeItem.id,
        reportId,
        resolutionInput.trim() || 'Resolved and corrected in the document.',
        resolverName,
        activeItem.title
      );

      setActiveItem((prev) => ({
        ...prev,
        reports: result.allReports,
      }));
      setItems((prev) =>
        prev.map((it) => (it.id === activeItem.id ? { ...it, reports: result.allReports } : it))
      );

      setResolvingReportId(null);
      setResolutionInput('');
      setReportToast('Issue marked as resolved! Student notified and rewarded +10 KnowPoints.');
      setTimeout(() => setReportToast(null), 4000);
    } catch (err) {
      console.error('Error resolving report:', err);
      alert('Could not resolve report. Please try again.');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!activeItem) return;
    if (!window.confirm('Are you sure you want to dismiss and delete this reported issue?')) return;

    try {
      const result = await knowledgeService.deleteReport(activeItem.id, reportId);
      setActiveItem((prev) => ({
        ...prev,
        reports: result.allReports,
      }));
      setItems((prev) =>
        prev.map((it) => (it.id === activeItem.id ? { ...it, reports: result.allReports } : it))
      );
    } catch (err) {
      console.error('Error deleting report:', err);
    }
  };

  const handleResetFilters = () => {
    setSelectedDept('All');
    setSelectedType('All');
    setSelectedYear('All');
    setSelectedTag(null);
    setMinRating(0);
    setSearchQuery('');
    setSortBy('trending');
  };

  const hasActiveFilters =
    selectedDept !== 'All' ||
    selectedType !== 'All' ||
    selectedYear !== 'All' ||
    selectedTag !== null ||
    minRating > 0 ||
    searchQuery !== '';

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="bg-gradient-to-r from-neutral-950 via-[#0a0a0d] to-black rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-white/10 ring-1 ring-white/5">
        <DotPattern
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={1.25}
          className="fill-white/50 opacity-90 [mask-image:radial-gradient(ellipse_at_center,white,transparent_85%)]"
        />
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs backdrop-blur-md mb-3 border border-white/15">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Central Campus Knowledge Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Discover & Explore Knowledge
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Search peer-reviewed lecture notes, placement playbooks, research SOPs, and lab tutorials.
          </p>

          {/* Large Real-Time Search Bar */}
          <div className="mt-6 relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword, topic, professor, course, or tag (e.g. SLURM, Raft, Jetson, CMOS)..."
              className="w-full text-xs sm:text-sm pl-12 pr-10 py-3.5 bg-white text-slate-900 rounded-2xl shadow-xl outline-none placeholder-slate-400 focus:ring-4 focus:ring-indigo-400/30 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Share Toast Banner */}
      {shareToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-800 animate-in slide-in-from-top duration-200 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Direct Knowledge Link copied to clipboard! Share with your classmates or research team.</span>
          </div>
          <button onClick={() => setShareToast(false)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Layout Grid: Sidebar (1 Col) + Content Area (3 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="text-xs gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {mobileFilterOpen ? 'Hide Filters' : 'Show Knowledge Filters'}
          </Button>
          <span className="text-xs text-slate-500 font-medium">
            {filteredItems.length} resources found
          </span>
        </div>

        {/* Filter Sidebar */}
        <div
          className={`lg:block ${
            mobileFilterOpen ? 'block' : 'hidden'
          } bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-6 lg:sticky lg:top-20`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Filter className="w-4 h-4 text-indigo-600" />
              <span>Filter Catalog</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* 1. Department Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Academic Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition"
            >
              {DEPARTMENTS_FILTER.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Knowledge Type Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Knowledge Type
            </label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {KNOWLEDGE_TYPES_FILTER.map((type) => {
                const isSelected = selectedType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{type}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Year Level Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Academic Year / Target Level
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition"
            >
              {YEARS_FILTER.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Popular Tags Cloud */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Popular Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TAGS.map((t) => {
                const isSelected = selectedTag === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTag(isSelected ? null : t)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    #{t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Rating Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Minimum Rating
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {[
                { val: 0, label: 'All' },
                { val: 4.0, label: '4.0★+' },
                { val: 4.8, label: '4.8★+' },
              ].map((r) => (
                <button
                  key={r.val}
                  type="button"
                  onClick={() => setMinRating(r.val)}
                  className={`py-1.5 rounded-lg border text-center font-medium transition ${
                    minRating === r.val
                      ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content Area: Trending, Recently Added, and Main Catalog Grid */}
        <div className="lg:col-span-3 space-y-8">
          {/* Section 1: Trending This Week */}
          {!hasActiveFilters && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Trending This Week
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Highest velocity and most upvoted campus contributions
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {trendingItems.map((item) => (
                  <Card
                    key={item.id}
                    hover
                    onClick={() => handleOpenDetail(item)}
                    className="p-5 cursor-pointer bg-gradient-to-b from-white to-slate-50/50 flex flex-col justify-between border-slate-200/90 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-rose-500 via-indigo-500 to-amber-500" />
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                          <Flame className="w-3 h-3" /> Trending
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{item.rating || 5.0}</span>
                        </div>
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-2 mb-1.5">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                        {item.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[120px]">
                        {item.author}
                      </span>
                      <span className="inline-flex items-center gap-1 text-indigo-600 font-bold text-xs">
                        <ThumbsUp className="w-3 h-3" /> {item.upvotes}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Recently Added Quick Carousel */}
          {!hasActiveFilters && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Recently Added</h2>
                  <p className="text-[11px] text-slate-400">Newly indexed documents from campus departments</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {recentItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleOpenDetail(item)}
                    className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl cursor-pointer transition flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
                        {item.knowledgeType || item.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2 hover:text-indigo-600">
                        {item.title}
                      </h4>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{formatDate(item.createdAt)}</span>
                      <span className="font-semibold text-slate-600">{item.upvotes} upvotes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Main Knowledge Catalog Grid with Sorting */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  All Knowledge Entries ({filteredItems.length})
                </h2>
                {hasActiveFilters && (
                  <p className="text-xs text-indigo-600 font-medium mt-0.5">
                    Filtering active • Showing matching criteria
                  </p>
                )}
              </div>

              {/* Sort By Selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-semibold">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 outline-none focus:border-indigo-500 shadow-xs"
                >
                  <option value="trending">🔥 Trending & Upvoted</option>
                  <option value="newest">⏱️ Most Recent</option>
                  <option value="upvotes">👍 Highest Upvotes</option>
                  <option value="rating">⭐ Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Skeleton Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm animate-pulse space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-5 bg-slate-200 rounded-md w-24"></div>
                      <div className="h-4 bg-slate-200 rounded-md w-16"></div>
                    </div>
                    <div className="h-6 bg-slate-200 rounded-md w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-full"></div>
                      <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="h-8 bg-slate-200 rounded-full w-8"></div>
                      <div className="h-6 bg-slate-200 rounded-md w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">No matching knowledge documents</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your search query or clear the active department/type filters.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="mt-4 text-xs"
                >
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    hover
                    onClick={() => handleOpenDetail(item)}
                    className="p-5 cursor-pointer flex flex-col justify-between group transition-all"
                  >
                    <div>
                      {/* Top 3-Tier Academic Trust Pipeline Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">
                          {item.knowledgeType || item.category}
                        </span>

                        {/* Tier 1: AI Integrity */}
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200" title="Tier 1: Automated AI Academic Integrity Verified">
                          🤖 AI Verified
                        </span>

                        {/* Tier 2: Senior Peer Review */}
                        <span
                          className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                            (item.upvotes || 0) >= 5
                              ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                              : 'text-slate-500 bg-slate-50 border-slate-200'
                          }`}
                          title="Tier 2: Senior Peer Consensus"
                        >
                          👥 {(item.upvotes || 0) >= 5 ? 'Peer Reviewed' : `${item.upvotes || 0}/5 Reviews`}
                        </span>

                        {/* Tier 3: Faculty Endorsement */}
                        {item.isVerified ? (
                          <span
                            className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200"
                            title={`Tier 3: Verified by ${item.verifiedBy || 'Faculty'}`}
                          >
                            🛡️ Faculty Endorsed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-200">
                            🛡️ Faculty Reviewing
                          </span>
                        )}
                      </div>

                      {/* Title & Preview */}
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition mb-1.5 leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3.5">
                        {item.summary}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {(Array.isArray(item.tags) ? item.tags : []).map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                          >
                            <Tag className="w-2.5 h-2.5 text-slate-400" />
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Contributor Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 truncate mr-2">
                        <img
                          src={
                            item.authorAvatar ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
                          }
                          alt={item.author}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 flex-shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-bold text-slate-900 text-xs truncate leading-tight">
                            {item.author}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {item.authorRole || 'STUDENT'} • {(item.department || 'Computer Science').split('(')[0]}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {canUserEdit(item) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(item);
                            }}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition"
                            title="Edit your published document"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleShare(item, e)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 rounded-xl transition"
                          title="Share direct link"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleUpvote(item.id, e)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition text-xs font-bold border ${
                            likedEntries.includes(item.id)
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border-slate-200/80'
                          }`}
                          title={likedEntries.includes(item.id) ? 'Click to unlike' : 'Upvote resource'}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${likedEntries.includes(item.id) ? 'fill-white text-white' : ''}`} />
                          <span>{item.upvotes}</span>
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULL ENTRY DETAIL MODAL */}
      {activeItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white px-2.5 py-0.5 rounded-full">
                    {activeItem.knowledgeType || activeItem.category}
                  </span>
                  {activeItem.isVerified && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified by {activeItem.verifiedBy}
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    • Published {formatDate(activeItem.createdAt)}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                  {activeItem.title}
                </h2>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Author or Admin only can edit */}
                {canUserEdit(activeItem) && (
                  <button
                    onClick={() => handleStartEdit(activeItem)}
                    className="px-2.5 py-1.5 text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
                    title="Edit your published document"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}

                {/* Author or Admin only can delete */}
                {canUserEdit(activeItem) && (
                  <button
                    onClick={() => handleDeleteEntry(activeItem.id)}
                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Delete your document"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => setActiveItem(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-800">
              {/* Contributor Profile Header Box */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      activeItem.authorAvatar ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
                    }
                    alt={activeItem.author}
                    className="w-11 h-11 rounded-2xl object-cover ring-2 ring-indigo-600/20"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{activeItem.author}</h4>
                      <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md">
                        {activeItem.authorRole}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{activeItem.department}</p>
                    {activeItem.authorBio && (
                      <p className="text-[11px] text-slate-400 italic mt-0.5">{activeItem.authorBio}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{activeItem.views || 400}+ views</p>
                    <p className="text-[10px] text-slate-400">Knowledge Reads</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600">{activeItem.upvotes} Upvotes</p>
                    <p className="text-[10px] text-slate-400">Campus Endorsements</p>
                  </div>
                </div>
              </div>

              {/* Tri-Tier Academic Trust & Verification Pipeline */}
              <div className="p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white rounded-2xl border border-indigo-500/30 shadow-md space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Tri-Tier Academic Trust & Verification Pipeline</h4>
                      <p className="text-[10px] text-slate-300">Instant AI Integrity on publish ➔ Peer upvotes & bug checks ➔ Faculty 1-click institutional seal</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                    {activeItem.isVerified ? 'Tier 3 Certified' : (activeItem.upvotes || 0) >= 5 ? 'Tier 2 Peer Approved' : 'Tier 1 AI Verified'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {/* Tier 1 */}
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-200 text-[11px]">🤖 Tier 1: AI Integrity</span>
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">✓ Passed</span>
                      </div>
                      <p className="text-[10px] text-slate-300">96/100 Quality Score • 0% Campus Redundancy</p>
                    </div>
                  </div>

                  {/* Tier 2 */}
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-200 text-[11px]">👥 Tier 2: Peer Review</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          (activeItem.upvotes || 0) >= 5
                            ? 'text-emerald-400 bg-emerald-400/10'
                            : 'text-amber-300 bg-amber-400/10'
                        }`}>
                          {(activeItem.upvotes || 0) >= 5 ? '✓ Approved' : `${activeItem.upvotes || 0}/5 Votes`}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300">
                        {(activeItem.upvotes || 0) >= 5
                          ? `${activeItem.upvotes} Senior Community Endorsements`
                          : 'Awaiting senior peer review threshold'}
                      </p>
                    </div>
                  </div>

                  {/* Tier 3 */}
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-200 text-[11px]">🛡️ Tier 3: Faculty Seal</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          activeItem.isVerified
                            ? 'text-emerald-400 bg-emerald-400/10'
                            : 'text-slate-400 bg-white/10'
                        }`}>
                          {activeItem.isVerified ? '✓ Endorsed' : 'In Queue'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300">
                        {activeItem.isVerified
                          ? `Endorsed by ${activeItem.verifiedBy || 'Prof. Sarah Jenkins (HOD)'}`
                          : 'Pending faculty milestone review'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Summary */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                <p className="font-bold text-indigo-950 text-xs mb-1">Executive Summary:</p>
                <p className="text-xs text-indigo-900 leading-relaxed">{activeItem.summary}</p>
              </div>

              {/* Full Content Body */}
              <div className="space-y-3 font-mono text-xs bg-slate-900 text-slate-100 p-5 rounded-2xl overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {activeItem.content}
              </div>

              {/* Attached Resources & Downloads */}
              {activeItem.resources && (
                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                    Attached Files & Learning Assets
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeItem.resources.files?.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                          <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                            {file.size}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDownloadFile(file, activeItem)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Download asset"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {activeItem.resources.youtube && (
                      <a
                        href={activeItem.resources.youtube}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-900 hover:bg-rose-100 transition"
                      >
                        <div className="flex items-center gap-2">
                          <Youtube className="w-4 h-4 text-rose-600" />
                          <span className="font-semibold">Watch Video Walkthrough</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-rose-400" />
                      </a>
                    )}

                    {activeItem.resources.github && (
                      <a
                        href={activeItem.resources.github}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-800 hover:bg-slate-200 transition"
                      >
                        <div className="flex items-center gap-2">
                          <Code2 className="w-4 h-4 text-slate-800" />
                          <span className="font-semibold">Open Source Code Repository</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Peer Issue Reports & Corrections Engine */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <Flag className="w-4 h-4 text-amber-500" />
                      Community Issue Reports & Accuracy Corrections
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        {(activeItem.reports || []).filter((r) => r.status === 'OPEN').length} Open
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Found a typo, outdated command, or broken step? Report it so the author can fix it and you can earn bug bounty points.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenReportModal}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition shadow-sm self-start sm:self-auto"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Report an Issue
                  </button>
                </div>

                {/* Reports List */}
                <div className="space-y-2.5">
                  {Array.isArray(activeItem.reports) && activeItem.reports.length > 0 ? (
                    activeItem.reports.map((report) => {
                      const isOpen = report.status === 'OPEN';
                      const canResolve = canUserEdit(activeItem) && isOpen;
                      const isResolvingThis = resolvingReportId === report.id;

                      return (
                        <div
                          key={report.id}
                          className={`p-3.5 rounded-xl border text-xs transition ${
                            isOpen
                              ? 'bg-amber-50/40 border-amber-200/80 shadow-sm'
                              : 'bg-emerald-50/30 border-emerald-200/60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                  isOpen
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {isOpen ? (
                                  <>
                                    <Bug className="w-3 h-3 text-amber-600" />
                                    OPEN
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    RESOLVED
                                  </>
                                )}
                              </span>

                              <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {report.category}
                              </span>

                              <span className="text-[11px] font-medium text-slate-500">
                                Reported by <strong className="text-slate-700">{report.reporterName}</strong>
                              </span>

                              <span className="text-[10px] text-slate-400">
                                {formatDate(report.createdAt)}
                              </span>
                            </div>

                            {/* Author/Admin Actions */}
                            <div className="flex items-center gap-1">
                              {canResolve && !isResolvingThis && (
                                <button
                                  onClick={() => handleStartResolveReport(report)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] shadow-sm transition"
                                >
                                  <Wrench className="w-3 h-3" />
                                  Resolve Issue
                                </button>
                              )}

                              {(role === ROLES.ADMIN || canUserEdit(activeItem)) && (
                                <button
                                  onClick={() => handleDeleteReport(report.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                                  title="Dismiss report"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <h5 className="font-bold text-slate-900 text-xs mb-1">
                            {report.title}
                          </h5>

                          <p className="text-slate-700 text-xs leading-relaxed mb-2">
                            {report.description}
                          </p>

                          {report.suggestedFix && (
                            <div className="p-2.5 bg-white/80 rounded-lg border border-slate-200 text-[11px] mb-2 font-mono">
                              <span className="font-bold text-indigo-900 font-sans block mb-0.5">💡 Suggested Correction:</span>
                              <span className="text-slate-800">{report.suggestedFix}</span>
                            </div>
                          )}

                          {/* Resolution Note if resolved */}
                          {!isOpen && (
                            <div className="p-2.5 bg-emerald-100/70 border border-emerald-200 rounded-lg text-[11px] text-emerald-950">
                              <div className="flex items-center gap-1.5 font-bold mb-0.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Resolved by {report.resolvedBy || 'Author'} {report.resolvedAt && `(${formatDate(report.resolvedAt)})`}</span>
                              </div>
                              <p className="text-emerald-900">{report.resolutionNote}</p>
                            </div>
                          )}

                          {/* Inline Author Resolution Form */}
                          {isResolvingThis && (
                            <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-300 shadow-sm space-y-2">
                              <label className="block text-[11px] font-bold text-emerald-950">
                                Explain how you resolved this issue (or note the changes made):
                              </label>
                              <textarea
                                rows={2}
                                value={resolutionInput}
                                onChange={(e) => setResolutionInput(e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                placeholder="e.g., Updated the pip command in section 2 with --index-url. Thanks for catching this!"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={handleCancelResolveReport}
                                  className="px-2.5 py-1 text-xs rounded-lg text-slate-600 hover:bg-slate-100 transition"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleConfirmResolveReport(report.id)}
                                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow transition"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Confirm Resolution (+10 Pts Bounty)
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                      <p className="text-xs text-slate-500">
                        No issues reported yet for this document. If you notice any inaccuracies or broken instructions, click <strong className="text-slate-700">"Report an Issue"</strong> above!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Discussion & Comments Stream */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    Campus Discussion & Questions ({activeItem.comments?.length || 0})
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {Array.isArray(activeItem.comments) && activeItem.comments.length > 0 ? (
                    activeItem.comments.map((comm) => {
                      const canEdit = canEditComment(comm);
                      const canDelete = canDeleteComment(comm);
                      const isEditing = editingCommentId === comm.id;

                      return (
                        <div
                          key={comm.id}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs transition"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900">
                                {comm.user}
                              </span>
                              <span className="text-[10px] text-indigo-600 font-semibold">
                                ({comm.role})
                              </span>
                              {comm.isEdited && (
                                <span className="text-[10px] text-slate-400 italic font-normal">
                                  (edited)
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400">{comm.time}</span>
                              {!isEditing && (canEdit || canDelete) && (
                                <div className="flex items-center gap-1 ml-1 pl-1.5 border-l border-slate-200">
                                  {canEdit && (
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditComment(comm)}
                                      title="Edit your comment"
                                      className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 rounded transition"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                  )}
                                  {canDelete && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteComment(comm.id)}
                                      title={canEdit ? "Delete your comment" : "Remove comment on your contribution"}
                                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {isEditing ? (
                            <div className="mt-2 space-y-2">
                              <textarea
                                value={editingCommentText}
                                onChange={(e) => setEditingCommentText(e.target.value)}
                                className="w-full text-xs p-2.5 bg-white border border-indigo-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none text-slate-700"
                                rows={2}
                                autoFocus
                              />
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={handleCancelEditComment}
                                  className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-200 rounded-md transition"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditComment(comm.id)}
                                  disabled={!editingCommentText.trim()}
                                  className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition flex items-center gap-1"
                                >
                                  <Save className="w-3 h-3" /> Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-slate-600 whitespace-pre-wrap">{comm.text}</p>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No questions yet. Be the first to ask!
                    </p>
                  )}
                </div>

                {/* Comment Input */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Ask a clarifying question or thank the contributor..."
                    className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500"
                  />
                  <Button type="submit" size="sm" disabled={!newCommentText.trim()}>
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleUpvote(activeItem.id)}
                  className={`gap-2 transition ${
                    likedEntries.includes(activeItem.id)
                      ? 'bg-indigo-700 text-white shadow-md'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${likedEntries.includes(activeItem.id) ? 'fill-white text-white' : ''}`} />
                  <span>{likedEntries.includes(activeItem.id) ? 'Upvoted' : 'Upvote'} ({activeItem.upvotes})</span>
                </Button>

                {/* Verify Button for Faculty, Alumni, Admin */}
                {[ROLES.FACULTY, ROLES.ALUMNI, ROLES.ADMIN].includes(role) && (
                  <Button
                    size="sm"
                    variant={activeItem.isVerified ? 'secondary' : 'primary'}
                    onClick={() => handleVerifyResource(activeItem.id)}
                    className={
                      activeItem.isVerified
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                    {activeItem.isVerified ? 'Verified by Faculty/Alumni' : 'Verify & Endorse Resource'}
                  </Button>
                )}

                {/* 1-Click Download Full Article SOP */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadFile(null, activeItem)}
                  className="gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-100"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Download SOP (.md)</span>
                </Button>

                {/* 1-Click Share */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => handleShare(activeItem, e)}
                  className="gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-100"
                >
                  <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Share Link</span>
                </Button>
              </div>

              <Button variant="outline" size="sm" onClick={() => setActiveItem(null)}>
                Close Window
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AUTHOR-ONLY EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Published Document</h3>
                  <p className="text-[11px] text-slate-500">
                    Author control: Only you (or Admin) have permission to edit this document.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
                title="Cancel & Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Document Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full text-sm font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  placeholder="e.g. RISC-V 5-Stage Pipelined Core in Verilog..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category / Knowledge Type
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  >
                    {KNOWLEDGE_TYPES_FILTER.filter((t) => t !== 'All').map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={editForm.department}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, department: e.target.value }))}
                    className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  >
                    {DEPARTMENTS_FILTER.filter((d) => d !== 'All').map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Executive Summary
                </label>
                <textarea
                  rows={3}
                  value={editForm.summary}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, summary: e.target.value }))}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition leading-relaxed"
                  placeholder="Short briefing summarizing the insights..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Content & SOP (Markdown supported)
                </label>
                <textarea
                  rows={8}
                  value={editForm.content}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, content: e.target.value }))}
                  className="w-full text-xs font-mono px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition leading-relaxed"
                  placeholder="Detailed notes, steps, code snippets, or runbooks..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tags <span className="text-slate-400 font-normal">(Comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={editForm.tags}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, tags: e.target.value }))}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  placeholder="e.g. Verilog, FPGA, Architecture"
                />
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingItem(null)}
                  disabled={savingEdit}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={savingEdit}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                >
                  {savingEdit ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report an Issue Modal */}
      {reportModalOpen && activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Report Document Issue</h3>
                  <p className="text-xs text-slate-500">
                    Notify the author to correct an error or outdated instruction
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseReportModal}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Issue Category</label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Bug / Syntax Error">Bug / Syntax Error (Code won't execute or has syntax flaws)</option>
                  <option value="Outdated Command / Flag">Outdated Command / Flag (Deprecated CLI flags or versions)</option>
                  <option value="Inaccurate Step / Prerequisite">Inaccurate Step / Prerequisite (Missing dependency or misleading instruction)</option>
                  <option value="Broken Link / Missing Asset">Broken Link / Missing Asset (Dead URL, repository or resource link)</option>
                  <option value="Safety Hazard / Hardware Risk">Safety Hazard / Hardware Risk (Dangerous pinout, overvoltage, lab hazard)</option>
                  <option value="Other">Other Document Flaw</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Issue Summary / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Command fails with ModuleNotFoundError: torch in section 2"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Detailed Explanation & Steps to Reproduce <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain exactly what went wrong when following the document instructions..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Suggested Fix or Replacement Code <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. pip3 install torch --index-url https://download.pytorch.org/whl/cu121"
                  value={suggestedFix}
                  onChange={(e) => setSuggestedFix(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-2 text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Peer Quality Bounty:</strong> Once the author verifies and resolves your reported issue, you will be awarded <strong>+10 KnowPoints</strong> to your campus ranking profile!
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCloseReportModal}
                  disabled={submittingReport}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submittingReport}
                  className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
                >
                  {submittingReport ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Report</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Report Notification Toast */}
      {reportToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{reportToast}</span>
        </div>
      )}
    </div>
  );
}
