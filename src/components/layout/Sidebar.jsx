import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import { pushCampusNotification } from '../../services/notificationService';
import { Button } from '../common/Button';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  MessageSquare,
  Briefcase,
  Trophy,
  Wrench,
  ShieldAlert,
  User,
  ExternalLink,
  HelpCircle,
  FileText,
  Library,
  CheckCircle2,
  X,
  Send,
  AlertCircle,
  GraduationCap,
  Cpu
} from 'lucide-react';

export function Sidebar({ open, onClose }) {
  const { user, role, awardPoints } = useAuth();
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [helpdeskModalOpen, setHelpdeskModalOpen] = useState(false);

  // Helpdesk Ticket Form State
  const [ticketType, setTicketType] = useState('Lab Hardware Malfunction');
  const [ticketLocation, setTicketLocation] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority, setTicketPriority] = useState('Normal');
  const [ticketToast, setTicketToast] = useState(false);

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketLocation.trim() || !ticketDesc.trim()) return;

    if (awardPoints) {
      awardPoints(10, 'Reported Lab / Infrastructure Ticket');
    }

    pushCampusNotification(user?.email, {
      title: 'IT Helpdesk Ticket Logged (#IT-8492) 🛠️',
      desc: `Issue "${ticketType}" at ${ticketLocation.trim()} logged with Central Infrastructure SLA. (+10 pts)`,
      type: 'equipment',
      link: '/dashboard',
    });

    setHelpdeskModalOpen(false);
    setTicketToast(true);
    setTicketLocation('');
    setTicketDesc('');
    setTimeout(() => setTicketToast(false), 4500);
  };

  const navigation = [
    {
      name: 'Dashboard',
      to: ROUTES.DASHBOARD,
      icon: LayoutDashboard,
      roles: [ROLES.STUDENT, ROLES.FACULTY, ROLES.ALUMNI, ROLES.ADMIN],
    },
    {
      name: 'Knowledge Base',
      to: ROUTES.KNOWLEDGE_BASE,
      icon: BookOpen,
      roles: [ROLES.STUDENT, ROLES.FACULTY, ROLES.ALUMNI, ROLES.ADMIN],
    },
    {
      name: 'Contribute',
      to: ROUTES.CONTRIBUTE,
      icon: PlusCircle,
      roles: [ROLES.STUDENT, ROLES.FACULTY, ROLES.ALUMNI, ROLES.ADMIN],
    },
    {
      name: 'Campus AI Chat',
      to: ROUTES.CHAT,
      icon: MessageSquare,
      roles: [ROLES.STUDENT, ROLES.FACULTY, ROLES.ALUMNI, ROLES.ADMIN],
    },
    {
      name: 'Placements & Alumni',
      to: ROUTES.PLACEMENTS,
      icon: Briefcase,
      roles: [ROLES.STUDENT, ROLES.FACULTY, ROLES.ALUMNI, ROLES.ADMIN],
    },
    {
      name: 'Campus Leaderboard',
      to: ROUTES.LEADERBOARD,
      icon: Trophy,
      roles: [ROLES.STUDENT, ROLES.FACULTY, ROLES.ALUMNI, ROLES.ADMIN],
    },
    {
      name: 'Lab Equipment Wiki',
      to: ROUTES.EQUIPMENT,
      icon: Wrench,
      roles: [ROLES.STUDENT, ROLES.FACULTY, ROLES.ALUMNI, ROLES.ADMIN],
    },
    {
      name: 'Admin Console',
      to: ROUTES.ADMIN,
      icon: ShieldAlert,
      roles: [ROLES.ADMIN], // Admin exclusive
      badge: 'Admin Only',
    },
    {
      name: 'Profile & Access',
      to: ROUTES.PROFILE,
      icon: User,
      roles: [ROLES.STUDENT, ROLES.FACULTY, ROLES.ALUMNI, ROLES.ADMIN],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Main Navigation links */}
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Menu
            </p>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isPermitted = item.roles.includes(role);

                // If not permitted, display disabled state or hide
                if (!isPermitted && item.name === 'Admin Console') {
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 opacity-60 cursor-not-allowed"
                      title="Requires ADMIN role"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{item.name}</span>
                      </div>
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">
                        Locked
                      </span>
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && role === ROLES.ADMIN && (
                      <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-semibold">
                        Master
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Global Academic Resources */}
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Global Academic Gateways
            </p>
            <div className="space-y-1 text-xs">
              <button
                type="button"
                onClick={() => setLibraryModalOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition text-left"
              >
                <div className="flex items-center gap-3">
                  <Library className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold">Digital Library & Journals</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => setHelpdeskModalOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition text-left"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold">Facility IT & Lab Tickets</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100/80 rounded-xl p-3">
            <p className="text-[11px] font-bold text-indigo-900">KnowPass Global Network</p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Federated Node • <span className="font-semibold text-slate-700">{role}</span>
            </p>
          </div>
        </div>
      </aside>

      {/* Ticket Success Toast */}
      {ticketToast && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-800 animate-in slide-in-from-top duration-200 shadow-xl max-w-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Ticket #IT-8492 Logged! Campus IT dispatch notified. (+10 pts)</span>
          </div>
          <button onClick={() => setTicketToast(false)} className="text-emerald-600 hover:text-emerald-900 ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================
          1. CENTRAL UNIVERSITY LIBRARY MODAL
      ======================================================== */}
      {libraryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Library className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Central University Digital Library</h3>
                  <p className="text-xs text-slate-400">Institutional Subscribed Research Databases & E-Journals</p>
                </div>
              </div>
              <button
                onClick={() => setLibraryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <a
                href="https://ieeexplore.ieee.org"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-200 rounded-2xl transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 group-hover:text-indigo-600">IEEE Xplore</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Full-text transactions, conferences & standards in EE, CS, and Telecom.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md self-start mt-2">
                  Campus IP Authorized
                </span>
              </a>

              <a
                href="https://www.sciencedirect.com"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-200 rounded-2xl transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 group-hover:text-indigo-600">ScienceDirect / Elsevier</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Peer-reviewed engineering, materials science, and AI journals.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md self-start mt-2">
                  Campus IP Authorized
                </span>
              </a>

              <a
                href="https://nptel.ac.in"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-200 rounded-2xl transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 group-hover:text-indigo-600">NPTEL & SWAYAM</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    IIT & IISc verified engineering lecture series and curriculum notes.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md self-start mt-2">
                  Open Educational Resource
                </span>
              </a>

              <a
                href="https://dl.acm.org"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-200 rounded-2xl transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 group-hover:text-indigo-600">ACM Digital Library</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Computing machinery proceedings, SIGGRAPH & SIGCOMM archives.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md self-start mt-2">
                  Campus IP Authorized
                </span>
              </a>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setLibraryModalOpen(false)}>
                Close Window
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. CAMPUS IT HELPDESK & TICKETS MODAL
      ======================================================== */}
      {helpdeskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Campus IT & Lab Hardware Helpdesk</h3>
                  <p className="text-xs text-slate-400">Log hardware faults, software licenses & network requests</p>
                </div>
              </div>
              <button
                onClick={() => setHelpdeskModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTicketSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Issue Category *</label>
                <select
                  value={ticketType}
                  onChange={(e) => setTicketType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-500"
                >
                  <option value="Lab Hardware Malfunction">Lab Hardware Malfunction (Oscilloscope, UTM, Rigol)</option>
                  <option value="GPU Cluster Access Token">GPU Cluster SLURM Access Token</option>
                  <option value="Software License / Toolchain">Software License (MATLAB, Cadence, Synopsys)</option>
                  <option value="Campus Network / WiFi">Campus Network / High-Speed LAN Setup</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lab / Room Location *</label>
                  <input
                    type="text"
                    required
                    value={ticketLocation}
                    onChange={(e) => setTicketLocation(e.target.value)}
                    placeholder="e.g. Turing Lab 304, Workshop B"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority Level *</label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-500"
                  >
                    <option value="Normal">Normal (24-hour SLA)</option>
                    <option value="High">High (4-hour SLA)</option>
                    <option value="Urgent">Urgent / Exam In-Progress (30 mins)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Fault Description *</label>
                <textarea
                  rows={3}
                  required
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  placeholder="Describe the hardware error, symptoms, or license activation issue..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" type="button" onClick={() => setHelpdeskModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Ticket (+10 pts)</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
