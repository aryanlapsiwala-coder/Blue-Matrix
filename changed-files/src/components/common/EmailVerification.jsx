import React, { useEffect, useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from './Button';

export function EmailVerification({ email, onVerify, onResend, onBack }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [seconds, setSeconds] = useState(60);
  useEffect(() => {
    const timer = setInterval(() => setSeconds((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const verify = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(''); setMessage('');
    try { await onVerify({ email, token: code }); }
    catch (err) { setError(err.message || 'Unable to verify the code. Please try again.'); }
    finally { setBusy(false); }
  };
  const resend = async () => {
    if (busy || seconds > 0) return;
    setBusy(true); setError(''); setMessage('');
    try {
      await onResend();
      setCode(''); setSeconds(60); setMessage('A new code has been sent. Check your inbox and spam folder.');
    } catch (err) { setError(err.message || 'Unable to send a new code. Please try again.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <Mail className="w-9 h-9 text-indigo-600" aria-hidden="true" />
      <div>
        <h2 className="text-xl font-bold text-slate-900">Verify your email</h2>
        <p className="text-sm text-slate-600 mt-2">Enter the code sent to <strong className="break-words">{email}</strong>.</p>
        <p className="text-sm text-slate-500 mt-1">Check your spam folder if it hasn’t arrived.</p>
      </div>
      {error && <p role="alert" className="text-sm text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl">{error}</p>}
      {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
      <form onSubmit={verify} className="space-y-4">
        <label htmlFor="email-code" className="block text-sm font-semibold text-slate-700">Verification code</label>
        <input id="email-code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code"
          autoFocus required minLength={6} maxLength={10} pattern="[0-9]{6,10}"
          value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} disabled={busy}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-xl tracking-widest focus:ring-2 focus:ring-indigo-200 outline-none" />
        <Button type="submit" loading={busy} disabled={code.length < 6} className="w-full">Verify email and continue</Button>
      </form>
      <button type="button" onClick={resend} disabled={busy || seconds > 0} className="text-sm text-indigo-600 font-semibold disabled:text-slate-400">
        {seconds > 0 ? `Resend code in ${seconds}s` : 'Resend code'}
      </button>
      <button type="button" onClick={onBack} disabled={busy} className="flex items-center gap-2 text-sm text-slate-600 disabled:opacity-50">
        <ArrowLeft className="w-4 h-4" /> Use a different email
      </button>
    </div>
  );
}
