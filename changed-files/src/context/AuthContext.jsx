import React, { createContext, useState, useEffect, useCallback } from 'react';
import { tokenStorage } from '../utils/tokenStorage';
import { authService, DEMO_USERS, demoEnabled } from '../services/authService';
import { pushCampusNotification } from '../services/notificationService';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore a server-verified Supabase session; cached profile data is not authentication.
  useEffect(() => {
    let active = true;
    let revision = 0;
    let restoreTimer;
    const restore = async () => {
      const current = ++revision;
      try {
        const verifiedUser = await authService.getCurrentUser();
        if (active && current === revision) setUser(verifiedUser);
      } catch {
        if (active && current === revision) { setUser(null); tokenStorage.clearAuth(); }
      } finally {
        if (active) setLoading(false);
      }
    };
    const clear = () => { revision++; setUser(null); tokenStorage.clearAuth(); };
    restore();
    const subscription = supabase?.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') clear();
      if (event === 'TOKEN_REFRESHED') {
        tokenStorage.setAccessToken(session?.access_token);
        tokenStorage.setRefreshToken(session?.refresh_token);
      }
      // Run database/profile work outside Supabase's auth-event lock.
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        clearTimeout(restoreTimer);
        restoreTimer = setTimeout(restore, 0);
      }
    }).data.subscription;
    window.addEventListener('auth:unauthorized', clear);
    return () => {
      active = false; revision++; clearTimeout(restoreTimer);
      subscription?.unsubscribe();
      window.removeEventListener('auth:unauthorized', clear);
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await authService.login(credentials);
    if (result.user && demoEnabled) setUser(result.user);
    return result;
  }, []);

  const register = useCallback((profile) => authService.register(profile), []);

  const verifyEmail = useCallback(async (details) => {
    const verifiedUser = await authService.verifyEmail(details);
    setUser(verifiedUser);
    return verifiedUser;
  }, []);

  const switchRole = useCallback((newRole) => {
    if (demoEnabled && DEMO_USERS[newRole]) {
      const demoUser = { ...DEMO_USERS[newRole], isDemo: true };
      tokenStorage.setUser(demoUser);
      tokenStorage.setAccessToken(`mock_jwt_${newRole.toLowerCase()}_token`);
      setUser(demoUser);
    }
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
    verifyEmail,
    updateUser,
    awardPoints,
    switchRole,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
