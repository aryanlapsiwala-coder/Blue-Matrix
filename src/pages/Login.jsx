import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';
import { ROLES, ROLE_CONFIG } from '../constants/roles';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { InteractiveDotBackground } from '../components/ui/interactive-dot-background';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ROLES.STUDENT,
    rememberMe: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) error = 'Campus email is required';
      else if (!emailRegex.test(value.trim())) error = 'Please enter a valid campus email';
    } else if (name === 'password') {
      if (!value) error = 'Password is required';
      else if (value.length < 4) error = 'Password must be at least 4 characters';
    }
    return error;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailErr = validateField('email', formData.email);
    const passErr = validateField('password', formData.password);

    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr });
      setTouched({ email: true, password: true });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await login({
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      navigate(from, { replace: true });
    } catch (err) {
      console.error('[Login Error]', err);
      let userFriendlyMessage = 'Authentication failed. Please check your credentials or register an account.';

      const raw = (err?.message || '').toLowerCase();
      if (raw.includes('role mismatch') || raw.includes('access denied')) {
        userFriendlyMessage = err.message;
      } else if (raw.includes('invalid login credentials') || raw.includes('invalid password') || raw.includes('not registered') || raw.includes('user not found')) {
        userFriendlyMessage = 'Incorrect campus email or password. Please check your credentials or click "Register an Account".';
      } else if (raw.includes('email not confirmed')) {
        userFriendlyMessage = 'Your campus email is pending verification. Please verify your email or use 1-Click Demo Login.';
      } else if (raw.includes('network') || raw.includes('failed to fetch')) {
        userFriendlyMessage = 'Unable to reach campus authentication server. Please check your network connection.';
      } else if (raw.includes('rate limit') || raw.includes('too many requests')) {
        userFriendlyMessage = 'Too many login attempts. Please wait a few seconds and try again.';
      } else if (err?.message && !raw.includes('function') && !raw.includes('undefined') && !raw.includes('is not a') && !raw.includes('error:')) {
        userFriendlyMessage = err.message;
      }

      setErrors({
        form: userFriendlyMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (roleToUse) => {
    setLoading(true);
    setErrors({});
    try {
      await login({
        isQuickDemo: true,
        role: roleToUse,
      });
      navigate(from, { replace: true });
    } catch (err) {
      setErrors({
        form: err.message || 'Demo login error.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendReset = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setShowForgotModal(false);
      setForgotEmail('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <InteractiveDotBackground />
      <div className="max-w-md w-full relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-500/30 mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Know<span className="text-indigo-400">Pass</span>
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Campus Knowledge Management & Resource Repository
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Sign in to your account</h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your role and authenticate with campus credentials
            </p>
          </div>

          {errors.form && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Simulated Role Selection for Login */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Simulated Campus Role:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: ROLES.STUDENT, label: '🎓 Junior Student' },
                { role: ROLES.ALUMNI, label: '💼 Alumni' },
                { role: ROLES.FACULTY, label: '🏛️ Faculty' },
                { role: ROLES.ADMIN, label: '🛡️ Administrator' },
              ].map((item) => {
                const isSelected = formData.role === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        role: item.role,
                        email: prev.email ? prev.email : (item.role === ROLES.ALUMNI ? 'alumni.vikram@nvidia.com' : `${item.role.toLowerCase()}@campus.edu`),
                      }));
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campus Email / Personal Email */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                {formData.role === ROLES.ALUMNI ? 'Personal / Work Email (No College ID Required)' : 'Campus Email / Student ID'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  placeholder={
                    formData.role === ROLES.ALUMNI
                      ? 'name@company.com or personal@gmail.com'
                      : `${formData.role.toLowerCase()}@campus.edu`
                  }
                  className={`w-full text-sm pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl outline-none transition ${
                    errors.email && touched.email
                      ? 'border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                      : 'border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                  }`}
                />
              </div>
              {errors.email && touched.email && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  className={`w-full text-sm pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl outline-none transition ${
                    errors.password && touched.password
                      ? 'border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                      : 'border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <span>Remember campus device</span>
              </label>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full py-3 text-sm font-semibold mt-2 shadow-md shadow-indigo-600/20"
            >
              Sign In to KnowPass <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Quick Demo One-Click Access */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
              One-Click Role Demo Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin(ROLES.STUDENT)}
                className="px-2 py-2 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-semibold transition flex items-center justify-center gap-1.5"
              >
                <span>🎓 Junior Student</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin(ROLES.ALUMNI)}
                className="px-2 py-2 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-semibold transition flex items-center justify-center gap-1.5"
              >
                <span>💼 Alumni</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin(ROLES.FACULTY)}
                className="px-2 py-2 text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl font-semibold transition flex items-center justify-center gap-1.5"
              >
                <span>🏛️ Faculty</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin(ROLES.ADMIN)}
                className="px-2 py-2 text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-semibold transition flex items-center justify-center gap-1.5"
              >
                <span>🛡️ Admin</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Need a campus account?{' '}
              <Link to={ROUTES.REGISTER} className="font-semibold text-indigo-600 hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">Reset Campus Password</h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Enter your registered university email to receive a password reset link.
            </p>

            {forgotSent ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Password reset link sent to your campus inbox!</span>
              </div>
            ) : (
              <form onSubmit={handleSendReset} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="your.name@campus.edu"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                />
                <Button type="submit" size="sm" className="w-full text-xs">
                  Send Reset Link
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
