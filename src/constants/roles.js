/**
 * Campus Knowledge Management System - User Roles
 */
export const ROLES = {
  STUDENT: 'STUDENT',
  FACULTY: 'FACULTY',
  TECHNICIAN: 'TECHNICIAN',
  ADMIN: 'ADMIN',
};

/**
 * Role Metadata & Badge Styling for UI
 */
export const ROLE_CONFIG = {
  [ROLES.STUDENT]: {
    label: 'Student',
    description: 'Access lecture notes, search knowledge repository, submit inquiries.',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    color: 'blue',
  },
  [ROLES.FACULTY]: {
    label: 'Faculty',
    description: 'Publish course syllabi, verify student contributions, host QA sessions.',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    color: 'purple',
  },
  [ROLES.TECHNICIAN]: {
    label: 'Technician',
    description: 'Manage lab equipment guides, SOPs, and technical troubleshooting articles.',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    color: 'emerald',
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
  [ROLES.STUDENT]: ['read_knowledge', 'contribute_resource', 'ask_chat', 'view_profile'],
  [ROLES.FACULTY]: ['read_knowledge', 'contribute_resource', 'publish_courseware', 'verify_content', 'ask_chat', 'view_profile'],
  [ROLES.TECHNICIAN]: ['read_knowledge', 'contribute_resource', 'manage_lab_sops', 'service_tickets', 'ask_chat', 'view_profile'],
  [ROLES.ADMIN]: ['read_knowledge', 'contribute_resource', 'publish_courseware', 'manage_lab_sops', 'manage_users', 'manage_roles', 'audit_logs', 'ask_chat', 'view_profile'],
};
