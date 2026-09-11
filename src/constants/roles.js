/**
 * Campus Knowledge Management System - User Roles
 */
export const ROLES = {
  STUDENT: 'STUDENT',
  ALUMNI: 'ALUMNI',
  FACULTY: 'FACULTY',
  ADMIN: 'ADMIN',
};

/**
 * Role Metadata & Badge Styling for UI
 */
export const ROLE_CONFIG = {
  [ROLES.STUDENT]: {
    label: 'Junior Student',
    description: 'Current 1st–4th year student with campus ID. Accesses guides, lab SOPs, placement notes, and mentorship.',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    color: 'blue',
  },
  [ROLES.ALUMNI]: {
    label: 'Alumni',
    description: 'Graduated senior / industry working pro. Mentors juniors, authors production playbooks, and offers job referrals.',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    color: 'emerald',
  },
  [ROLES.FACULTY]: {
    label: 'Faculty',
    description: 'Academic staff and professors. Endorse peer reviews, verify syllabus runbooks, and guide research.',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    color: 'purple',
  },
  [ROLES.ADMIN]: {
    label: 'Administrator',
    description: 'Complete system oversight, role management, audit logs, and content approvals.',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    color: 'rose',
  },
};

/**
 * Role hierarchy / permissions
 */
export const ROLE_PERMISSIONS = {
  [ROLES.STUDENT]: ['read_knowledge', 'contribute_resource', 'ask_chat', 'view_profile', 'request_referral'],
  [ROLES.ALUMNI]: ['read_knowledge', 'contribute_resource', 'publish_playbooks', 'mentor_juniors', 'scout_talent', 'ask_chat', 'view_profile'],
  [ROLES.FACULTY]: ['read_knowledge', 'contribute_resource', 'publish_courseware', 'verify_content', 'ask_chat', 'view_profile'],
  [ROLES.ADMIN]: ['read_knowledge', 'contribute_resource', 'publish_courseware', 'manage_lab_sops', 'manage_users', 'manage_roles', 'audit_logs', 'ask_chat', 'view_profile'],
};
