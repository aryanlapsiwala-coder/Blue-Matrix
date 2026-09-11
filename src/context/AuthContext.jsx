import React, { createContext, useState, useEffect, useCallback } from 'react';
import { tokenStorage } from '../utils/tokenStorage';
import { authService, DEMO_USERS } from '../services/authService';
import { ROLES } from '../constants/roles';
import { pushCampusNotification } from '../services/notificationService';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from local storage (defaults to null so Login page opens first)
  useEffect(() => {
    const initAuth = () => {
      const storedUser = tokenStorage.getUser();
      const token = tokenStorage.getAccessToken();

      if (storedUser && token) {
        setUser(storedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();

    // Listen for unauthorized events dispatched by axios interceptor
    const handleUnauthorized = () => {
      setUser(null);
      tokenStorage.clearAuth();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const { user: loggedInUser } = await authService.login(credentials);
      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const { user: registeredUser } = await authService.register(userData);
      setUser(registeredUser);
      return registeredUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const switchRole = useCallback((newRole) => {
    setUser((prev) => {
      if (prev && prev.email) {
        const updated = {
          ...prev,
          role: newRole,
          rollNumber:
            newRole === ROLES.ADMIN
              ? 'ADM-SYS-001'
              : newRole === ROLES.FACULTY
              ? 'FAC-EMP-4091'
              : newRole === ROLES.ALUMNI
              ? 'ALUM-VERIFIED'
              : prev.rollNumber || '2023BCSE0142',
          kycLevel:
            newRole === ROLES.ADMIN
              ? 'SUPER-ADMIN Identity Seal'
              : newRole === ROLES.FACULTY
              ? 'TIER-3 Institutional Faculty Head'
              : newRole === ROLES.ALUMNI
              ? 'TIER-3 Corporate Alumni Verified'
              : 'TIER-2 Campus Student Verified',
          graduationYear: newRole === ROLES.ALUMNI ? prev.graduationYear || 'Class of 2023' : prev.graduationYear,
          currentCompany: newRole === ROLES.ALUMNI ? prev.currentCompany || 'NVIDIA (Senior Engineer)' : prev.currentCompany,
        };
        tokenStorage.setUser(updated);
        tokenStorage.setAccessToken(`knowpass_jwt_${newRole.toLowerCase()}_${Date.now()}`);

        if (isSupabaseConfigured && supabase && prev.id) {
          supabase.from('profiles').update({ role: newRole }).eq('id', prev.id).catch(() => {});
          supabase.auth.updateUser({ data: { role: newRole } }).catch(() => {});
        }

        return updated;
      } else if (DEMO_USERS[newRole]) {
        const demoUser = DEMO_USERS[newRole];
        tokenStorage.setUser(demoUser);
        tokenStorage.setAccessToken(`mock_jwt_${newRole.toLowerCase()}_token`);
        return demoUser;
      }
      return prev;
    });
  }, []);

  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      tokenStorage.setUser(updated);
      return updated;
    });
  }, []);

  const awardPoints = useCallback((amount, reason = '') => {
    setUser((prev) => {
      if (!prev) return prev;
      const currentPts = Number(prev.knowPoints) || 20;
      const newPts = currentPts + amount;
      const updated = { ...prev, knowPoints: newPts };
      tokenStorage.setUser(updated);

      try {
        // Push live notification
        pushCampusNotification(prev.email, {
          title: `+${amount} KnowPoints Earned! 🎉`,
          desc: reason ? `${reason} (+${amount} pts). Total balance: ${newPts} pts.` : `Credited for knowledge sharing. Balance: ${newPts} pts.`,
          type: 'points',
          link: '/profile',
        });

        // Trigger celebratory popup & party poppers
        window.dispatchEvent(
          new CustomEvent('knowpass-celebration', {
            detail: {
              amount,
              reason: reason || 'Outstanding Campus Contribution',
              newTotal: newPts,
            },
          })
        );

        // Async update Supabase PostgreSQL profiles table
        if (isSupabaseConfigured && supabase && prev.email) {
          supabase
            .from('profiles')
            .update({ know_points: newPts })
            .eq('email', prev.email)
            .then(({ error }) => {
              if (error) console.warn('[AuthContext] Error updating know_points:', error.message);
              else console.log(`🏆 [Gamification] +${amount} pts awarded to ${prev.email} (${reason})! New total: ${newPts}`);
            });
        }
      } catch (err) {
        console.warn('[AuthContext] Error in awardPoints side-effect:', err);
      }

      return updated;
    });
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    updateUser,
    awardPoints,
    switchRole,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
