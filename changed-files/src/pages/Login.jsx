import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';
import { GraduationCap, Mail, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';
import { EmailVerification } from '../components/common/EmailVerification';
import { InteractiveDotBackground } from '../components/ui/interactive-dot-background';
import { demoEnabled, DEMO_USERS } from '../services/authService';

export function Login() {
  const { login, verifyEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const sendCode = async (event) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true); setError('');
    try { setPending(await login({ email })); }
    catch (err) { setError(err.message || 'Unable to send a verification code. Please try again.'); }
    finally { setLoading(false); }
  };
  const quickDemo = async (role) => {
    setLoading(true); setError('');
    try { await login({ isQuickDemo: true, role }); navigate(from, { replace: true }); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <InteractiveDotBackground />
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-500/30 mb-4"><GraduationCap className="w-8 h-8" /></div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Know<span className="text-indigo-400">Pass</span></h1>
          <p className="text-sm text-slate-300 mt-1">Campus Knowledge Management & Resource Repository</p>
        </div>
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
          {pending ? <EmailVerification email={pending.email}
            onVerify={async (details) => { await verifyEmail(details); navigate(from, { replace: true }); }}
            onResend={() => login({ email: pending.email })} onBack={() => setPending(null)} /> : <>
            <h2 className="text-xl font-bold text-slate-900">Sign in to your account</h2>
            <p className="text-sm text-slate-500 mt-2 mb-6">We’ll email you a verification code to sign in.</p>
            {error && <p role="alert" className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-sm">{error}</p>}
            <form onSubmit={sendCode} className="space-y-4">
              <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input id="login-email" name="email" type="email" required autoComplete="email" value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" disabled={loading}
                  className="w-full text-base pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              </div>
              <Button type="submit" loading={loading} className="w-full">Send verification code <ArrowRight className="w-4 h-4" /></Button>
            </form>
            {demoEnabled && <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-sm text-slate-500 mb-3">Local development demos</p>
              <div className="grid grid-cols-2 gap-2">{Object.keys(DEMO_USERS).map((role) => <Button key={role} variant="secondary" disabled={loading} onClick={() => quickDemo(role)}>{role}</Button>)}</div>
            </div>}
            <p className="text-sm text-slate-500 mt-6 text-center">Need an account? <Link to={ROUTES.REGISTER} className="text-indigo-600 font-semibold hover:underline">Register here</Link></p>
          </>}
        </div>
      </div>
    </div>
  );
}
