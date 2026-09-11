import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES, ROLE_CONFIG } from '../../constants/roles';
import { ROUTES } from '../../constants/routes';
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  ShieldCheck,
  LogOut,
  User,
  ExternalLink,
  Sparkles,
  Award,
  Briefcase,
  Wrench,
  CheckCheck,
  CheckCircle2,
  X
} from 'lucide-react';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'KnowPoints Earned',
    desc: '+20 pts credited for completing your campus profile setup!',
    time: '10m ago',
    unread: true,
    type: 'points',
    link: ROUTES.PROFILE,
  },
  {
    id: 'n2',
    title: 'New Placement Guide Published',
    desc: 'Alex Chen published Google & Microsoft SDE-1 Playbook (CSE)',
    time: '2h ago',
    unread: true,
    type: 'placement',
    link: ROUTES.PLACEMENTS,
  },
  {
    id: 'n3',
    title: 'Lab Hardware Calibration Alert',
    desc: 'NVIDIA DGX A100 SuperPOD scheduled for calibration on Friday',
    time: '1d ago',
    unread: true,
    type: 'equipment',
    link: ROUTES.EQUIPMENT,
  },
  {
    id: 'n4',
    title: 'Faculty Endorsement',
    desc: 'Prof. Sarah Jenkins endorsed your Concurrency C++ rubric',
    time: '2d ago',
    unread: false,
    type: 'endorse',
    link: ROUTES.KNOWLEDGE_BASE,
  },
];

export function Navbar({ onMobileMenuToggle, onOpenKnowBot, onOpenCommandPalette }) {
  const { user, role, switchRole, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [roleSwitchOpen, setRoleSwitchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifStorageKey = `knowpass_notifs_${user?.email || 'guest'}`;

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(notifStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore JSON parse error
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Keep notifications in sync and listen to live real-time notification events
  useEffect(() => {
    const loadCurrentNotifs = () => {
      try {
        const saved = localStorage.getItem(`knowpass_notifs_${user?.email || 'guest'}`);
        if (saved) {
          setNotifications(JSON.parse(saved));
        } else {
          setNotifications(INITIAL_NOTIFICATIONS);
        }
      } catch {
        setNotifications(INITIAL_NOTIFICATIONS);
      }
    };

    loadCurrentNotifs();

    // Event listener for instant notification broadcasts from any page/service
    const handleNewNotification = (e) => {
      if (e.detail && (!e.detail.email || e.detail.email === user?.email)) {
        if (e.detail.allNotifications) {
          setNotifications(e.detail.allNotifications);
        } else if (e.detail.notification) {
          setNotifications((prev) => [e.detail.notification, ...prev]);
        }
      }
    };

    window.addEventListener('knowpass-new-notification', handleNewNotification);
    return () => {
      window.removeEventListener('knowpass-new-notification', handleNewNotification);
    };
  }, [user?.email]);

  const activeRoleConfig = role ? ROLE_CONFIG[role] : null;
  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, unread: false }));
    setNotifications(updated);
    try {
      localStorage.setItem(notifStorageKey, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving notifications:', e);
    }
  };

  const handleNotificationClick = (notif) => {
    const updated = notifications.map((n) => (n.id === notif.id ? { ...n, unread: false } : n));
    setNotifications(updated);
    try {
      localStorage.setItem(notifStorageKey, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving notifications:', e);
    }
    setNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleGlobalSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      executeSearch();
    }
  };

  const executeSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;

    if (q.toLowerCase().startsWith('ask ') || q.toLowerCase().startsWith('ai ') || q.includes('?')) {
      if (onOpenKnowBot) onOpenKnowBot();
    } else {
      navigate(`${ROUTES.KNOWLEDGE_BASE}?search=${encodeURIComponent(q)}`);
    }
    setSearchQuery('');
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'points':
        return <Award className="w-4 h-4 text-amber-500" />;
      case 'placement':
        return <Briefcase className="w-4 h-4 text-indigo-500" />;
      case 'equipment':
        return <Wrench className="w-4 h-4 text-rose-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleGlobalSearch}
            placeholder="Search courses, lab manuals, research SOPs... (Ctrl + K)"
            className="w-full bg-slate-100/80 border border-transparent focus:border-indigo-300 focus:bg-white text-xs sm:text-sm pl-10 pr-24 py-2 rounded-xl text-slate-900 placeholder-slate-400 transition outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery ? (
              <button
                onClick={executeSearch}
                className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg shadow-2xs transition"
              >
                Go
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onOpenCommandPalette}
                  className="hidden sm:inline-flex items-center text-[9px] font-mono font-bold text-slate-500 bg-white hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs transition"
                  title="Open Spotlight Search (Ctrl + K)"
                >
                  Ctrl K
                </button>
                <kbd className="hidden sm:inline-block text-[9px] font-semibold text-slate-400 bg-white border border-slate-200/80 px-1.5 py-0.5 rounded shadow-2xs">
                  ↵ Enter
                </kbd>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">

        {/* KnowBot Drawer Trigger Pill */}
        <button
          type="button"
          onClick={onOpenKnowBot}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-600 to-brand-500 text-white shadow-sm shadow-indigo-500/20 hover:opacity-95 transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Ask KnowBot</span>
        </button>

        {/* Fixed Verified Campus Role Badge */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border select-none ${
            activeRoleConfig?.badgeClass || 'bg-slate-100 text-slate-700 border-slate-200'
          }`}
          title={`Verified Academic Scope: ${activeRoleConfig?.label}`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{activeRoleConfig?.label || 'Student'}</span>
        </div>

        {/* Interactive Notifications Center */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setDropdownOpen(false);
              setRoleSwitchOpen(false);
            }}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl relative transition"
            title="Campus Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Campus Notifications</h4>
                  <p className="text-[10px] text-slate-400">{unreadCount} unread alerts</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 hover:bg-slate-50 cursor-pointer transition flex items-start gap-3 ${
                      n.unread ? 'bg-indigo-50/30' : ''
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-100 flex-shrink-0 mt-0.5">
                      {getNotifIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className={`text-xs ${n.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                          {n.title}
                        </h5>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                        {n.desc}
                      </p>
                    </div>
                    {n.unread && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 text-center">
                <Link
                  to={ROUTES.DASHBOARD}
                  onClick={() => setNotifOpen(false)}
                  className="text-[11px] text-indigo-600 font-semibold hover:underline"
                >
                  View full campus activity feed →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotifOpen(false);
              setRoleSwitchOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={user?.name}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
            />
            <span className="hidden xl:block text-xs font-semibold text-slate-700 max-w-[120px] truncate">
              {user?.name || 'Campus Scholar'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Scholar'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-semibold border ${activeRoleConfig?.badgeClass}`}>
                  {activeRoleConfig?.label} ({user?.department})
                </span>
              </div>

              {/* Fast Role Simulator Picker */}
              <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/60">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Switch Active Role
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { role: ROLES.STUDENT, label: '🎓 Student' },
                    { role: ROLES.ALUMNI, label: '💼 Alumni' },
                    { role: ROLES.FACULTY, label: '🏛️ Faculty' },
                    { role: ROLES.ADMIN, label: '🛡️ Admin' },
                  ].map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => {
                        switchRole(r.role);
                        setDropdownOpen(false);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-bold text-left transition flex items-center justify-between ${
                        user?.role === r.role
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/70'
                      }`}
                    >
                      <span>{r.label}</span>
                      {user?.role === r.role && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <Link
                to={ROUTES.PROFILE}
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile & Permissions</span>
              </Link>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 transition border-t border-slate-100"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
