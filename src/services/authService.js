import api from './api';
import { tokenStorage } from '../utils/tokenStorage';
import { ROLES } from '../constants/roles';

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
  },
  [ROLES.FACULTY]: {
    id: 'usr_faculty_01',
    name: 'Dr. Sarah Jenkins',
    email: 's.jenkins@campus.edu',
    role: ROLES.FACULTY,
    department: 'Information Technology & AI',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2021-01-15',
  },
  [ROLES.TECHNICIAN]: {
    id: 'usr_tech_01',
    name: 'Marcus Ramirez',
    email: 'm.ramirez@campus.edu',
    role: ROLES.TECHNICIAN,
    department: 'Central Computing & Hardware Labs',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2022-06-10',
  },
  [ROLES.ADMIN]: {
    id: 'usr_admin_01',
    name: 'Eleanor Vance (Admin)',
    email: 'admin.knowpass@campus.edu',
    role: ROLES.ADMIN,
    department: 'Academic Affairs & IT Infrastructure',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2019-08-20',
  },
};

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const authService = {
  /**
   * Real Supabase / API Login with Strict Credential Validation
   */
  login: async (credentials) => {
    // 1. If it's an explicit 1-click Quick Demo login request
    if (credentials.isQuickDemo) {
      const role = credentials.role || ROLES.STUDENT;
      const demoUser = DEMO_USERS[role];
      const mockAccessToken = `mock_jwt_access_token_${role.toLowerCase()}_${Date.now()}`;
      tokenStorage.setAccessToken(mockAccessToken);
      tokenStorage.setUser(demoUser);
      console.log('[Auth] Logged in with Demo Role:', role);
      return { user: demoUser, accessToken: mockAccessToken };
    }

    // 2. Live Supabase Authentication
    if (isSupabaseConfigured && supabase && credentials.password) {
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim(),
        password: credentials.password,
      });

      if (authErr) {
        throw new Error(authErr.message || 'User not registered or invalid password. Please register an account first.');
      }

      if (authData?.user) {
        // 1. Check PostgreSQL profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', credentials.email.trim())
          .single();

        // 2. Check Supabase Auth user metadata
        const metadata = authData.user.user_metadata || {};
        const userName = profile?.name || metadata.name || credentials.email.split('@')[0];
        const userRole = profile?.role || metadata.role || ROLES.STUDENT;
        const userDept = profile?.department || metadata.department || 'Computer Science & Engineering (CSE)';
        const userYear = profile?.year_of_study || metadata.year_of_study || '4th Year (Senior)';

        const loggedInUser = {
          id: authData.user.id,
          name: userName,
          email: credentials.email.trim(),
          role: userRole,
          department: userDept,
          yearOfStudy: userYear,
          bio: profile?.bio || metadata.bio || '',
          knowPoints: profile?.know_points || 50,
          badges: profile?.badges || ['Pioneer'],
          avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          joinedDate: profile?.created_at || authData.user.created_at || new Date().toISOString(),
        };

        const token = authData.session?.access_token || `supabase_token_${Date.now()}`;
        tokenStorage.setAccessToken(token);
        tokenStorage.setUser(loggedInUser);
        console.log('[Supabase Auth] Logged in with verified name:', userName);
        return { user: loggedInUser, accessToken: token };
      }
    }

    throw new Error('User not registered or invalid password. Please check your credentials or click "Register an Account".');
  },

  /**
   * User Registration with Supabase Profile creation & user_metadata
   */
  register: async (userData) => {
    if (isSupabaseConfigured && supabase && userData.password) {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: userData.email.trim(),
        password: userData.password,
        options: {
          data: {
            name: userData.name.trim(),
            role: userData.role || ROLES.STUDENT,
            department: userData.department || 'Computer Science & Engineering (CSE)',
            year_of_study: userData.yearOfStudy || '1st Year (Freshman)',
            bio: userData.bio || '',
          }
        }
      });

      if (authErr) {
        throw new Error(authErr.message || 'Registration failed. Please check your email and password.');
      }

      if (authData?.user) {
        const profilePayload = {
          id: authData.user.id,
          name: userData.name.trim(),
          email: userData.email.trim(),
          role: userData.role || ROLES.STUDENT,
          department: userData.department || 'Computer Science & Engineering (CSE)',
          year_of_study: userData.yearOfStudy || '1st Year (Freshman)',
          bio: userData.bio || '',
          know_points: 20, // +20 KnowPoints reward for profile completion!
          badges: ['Pioneer'],
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        };

        // Save to profiles table
        try {
          await supabase.from('profiles').upsert(profilePayload, { onConflict: 'email' });
        } catch (dbErr) {
          console.warn('[Supabase Profile Insert Error]', dbErr.message);
        }

        const registeredUser = {
          id: authData.user.id,
          name: profilePayload.name,
          email: profilePayload.email,
          role: profilePayload.role,
          department: profilePayload.department,
          yearOfStudy: profilePayload.year_of_study,
          bio: profilePayload.bio,
          knowPoints: profilePayload.know_points,
          badges: profilePayload.badges,
          avatar: profilePayload.avatar_url,
          joinedDate: new Date().toISOString(),
        };

        const token = authData.session?.access_token || `supabase_token_${Date.now()}`;
        tokenStorage.setAccessToken(token);
        tokenStorage.setUser(registeredUser);
        console.log('[Supabase Auth] Registered verified user:', registeredUser.name);

        // Trigger Real Welcome & Greeting Email Dispatch
        try {
          await api.post('/email/welcome', {
            email: registeredUser.email,
            name: registeredUser.name,
            department: registeredUser.department,
            role: registeredUser.role,
          });
          console.log('[Email Service] Welcome email triggered for:', registeredUser.email);
        } catch (mailErr) {
          console.warn('[authService] Welcome email dispatch status:', mailErr.message);
        }

        return { user: registeredUser, accessToken: token };
      }
    }

    throw new Error('Registration failed. Please provide a valid email and password.');
  },

  /**
   * Fetch current user profile
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      tokenStorage.setUser(response.data.user);
      return response.data.user;
    } catch {
      return tokenStorage.getUser();
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore network errors on logout
    } finally {
      tokenStorage.clearAuth();
    }
  },
};
