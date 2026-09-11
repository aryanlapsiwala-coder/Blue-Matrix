import { tokenStorage } from '../utils/tokenStorage';
import { ROLES } from '../constants/roles';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { createEmailAuth } from './emailAuth';

// Demo fallback mock users for instant testing without a backend server
export const DEMO_USERS = {
  [ROLES.STUDENT]: {
    id: 'usr_student_01',
    name: 'Alex Chen',
    email: 'alex.chen@campus.edu',
    role: ROLES.STUDENT,
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2024-09-01',
    rollNumber: '2023BCSE0142',
    kycStatus: 'VERIFIED',
    kycLevel: 'TIER-2 Campus Verified',
    kycId: 'KYC-CAMPUS-8842A',
    kycDocumentName: 'Campus_Student_SmartCard.pdf',
    badges: ['Pioneer', 'KYC Verified'],
  },
  [ROLES.FACULTY]: {
    id: 'usr_faculty_01',
    name: 'Dr. Sarah Jenkins',
    email: 's.jenkins@campus.edu',
    role: ROLES.FACULTY,
    department: 'Information Technology & AI',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2021-01-15',
    rollNumber: 'FAC-EMP-4091',
    kycStatus: 'VERIFIED',
    kycLevel: 'TIER-3 Institutional Faculty Head',
    kycId: 'KYC-FAC-9921B',
    kycDocumentName: 'Faculty_Appointment_Letter.pdf',
    badges: ['Dean Recommended', 'KYC Verified'],
  },
  [ROLES.ALUMNI]: {
    id: 'usr_alumni_01',
    name: 'Vikram Malhotra',
    email: 'vikram.malhotra@nvidia.com', // Personal/Work email (Graduated, no college ID required)
    role: ROLES.ALUMNI,
    department: 'Mechanical & Robotics Engineering',
    graduationYear: 'Class of 2023',
    currentCompany: 'NVIDIA (Senior Robotics Software Engineer)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2023-06-15',
    workEmail: 'vikram.malhotra@nvidia.com',
    kycStatus: 'VERIFIED',
    kycLevel: 'TIER-3 Corporate Alumni Verified',
    kycId: 'KYC-CORP-7719C',
    kycDocumentName: 'Degree_Certificate_NVIDIA_Offer.pdf',
    badges: ['Top Mentor', 'KYC Verified'],
  },
  [ROLES.ADMIN]: {
    id: 'usr_admin_01',
    name: 'Eleanor Vance (Admin)',
    email: 'admin.knowpass@campus.edu',
    role: ROLES.ADMIN,
    department: 'Academic Affairs & IT Infrastructure',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2019-08-20',
    rollNumber: 'ADM-SYS-001',
    kycStatus: 'VERIFIED',
    kycLevel: 'SUPER-ADMIN Identity Seal',
    kycId: 'KYC-ADM-0001Z',
    kycDocumentName: 'Root_Authority_Certificate.pem',
    badges: ['System Admin', 'KYC Verified'],
  },
};


// Demo access is isolated to local development without a configured database.
export const demoEnabled = import.meta.env.DEV && !isSupabaseConfigured;
const emailAuth = createEmailAuth(supabase);

async function acceptSession(session) {
  if (!supabase || !session?.access_token) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user?.email_confirmed_at) throw new Error('Please verify your email to sign in.');
  const account = data.user;
  const { data: profile, error: profileError } = await supabase.rpc('ensure_own_profile');
  if (profileError || !profile) throw new Error('Your email is verified, but your profile could not be loaded. Please try signing in again or contact the site administrator.');
  const metadata = account.user_metadata || {};
  const user = {
    id: profile.id,
    authId: account.id,
    name: profile.name,
    email: account.email,
    emailVerified: true,
    role: profile.role,
    department: profile.department,
    yearOfStudy: profile.year_of_study,
    graduationYear: profile.graduation_year || metadata.graduation_year,
    currentCompany: profile.current_company || metadata.current_company,
    bio: profile.bio || '',
    knowPoints: profile.know_points ?? 50,
    badges: profile.badges || ['Pioneer'],
    avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    joinedDate: profile.created_at || account.created_at,
    rollNumber: profile.roll_number || metadata.roll_number,
    workEmail: profile.work_email || metadata.work_email,
    linkedinUrl: profile.linkedin_url || metadata.linkedin_url,
    kycId: profile.kyc_id || metadata.kyc_id,
    kycStatus: profile.kyc_status || metadata.kyc_status,
    kycLevel: profile.kyc_level || metadata.kyc_level,
    kycDocumentName: profile.kyc_document_name || metadata.kyc_document_name,
  };
  tokenStorage.setAccessToken(session.access_token);
  tokenStorage.setRefreshToken(session.refresh_token);
  tokenStorage.setUser(user);
  return user;
}

export const authService = {
  async login(credentials) {
    if (credentials.isQuickDemo && demoEnabled) {
      const user = { ...DEMO_USERS[credentials.role || ROLES.STUDENT], isDemo: true };
      tokenStorage.setUser(user);
      tokenStorage.setAccessToken('local_development_demo');
      return { user };
    }
    return emailAuth.requestCode({ email: credentials.email });
  },
  register: (profile) => emailAuth.requestCode({ email: profile.email, profile }),
  async verifyEmail(details) {
    const session = await emailAuth.verifyCode(details);
    try { return await acceptSession(session); }
    catch (error) {
      await supabase.auth.signOut({ scope: 'local' });
      tokenStorage.clearAuth();
      throw error;
    }
  },
  async getCurrentUser() {
    const cached = tokenStorage.getUser();
    if (demoEnabled && cached?.isDemo) return cached;
    if (!supabase) { tokenStorage.clearAuth(); return null; }
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!data.session) { tokenStorage.clearAuth(); return null; }
    return acceptSession(data.session);
  },
  async logout() {
    try { if (supabase) await supabase.auth.signOut({ scope: 'local' }); }
    finally { tokenStorage.clearAuth(); }
  },
};
