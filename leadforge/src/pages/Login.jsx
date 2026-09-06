import { useEffect, useRef, useState } from 'react';
import API_BASE from '../config';

function EyeIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6Z" />
      <circle cx="10" cy="10" r="2.4" />
    </svg>
  );
}

function EyeOffIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2.5 2.5l15 15" />
      <path d="M8.2 4.3C8.77 4.1 9.37 4 10 4c5.5 0 8.5 6 8.5 6a15.6 15.6 0 0 1-3.1 3.9M5.6 5.6C3.4 7 1.5 10 1.5 10s3 6 8.5 6c1.1 0 2.1-.24 3-.63" />
      <path d="M7.8 7.8a2.4 2.4 0 0 0 3.4 3.4" />
    </svg>
  );
}

function ArrowIcon(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 12 12 4M5.5 4H12v6.5" />
    </svg>
  );
}

export default function Login({ onLoggedIn }) {
  const [step, setStep] = useState('password'); // 'password' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (step === 'otp') otpInputRef.current?.focus();
  }, [step]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Login failed.');
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Verification failed.');
      onLoggedIn(data.email);
    } catch (err) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full h-11 px-4 text-[14px] text-text bg-transparent outline-none focus:outline-none rounded-full border transition-colors duration-150';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div
        className="dotted-frame w-full max-w-[420px] rounded-[32px] border p-9 sm:p-10"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-center gap-2.5 mb-9">
          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 ring-2" style={{ ['--tw-ring-color']: 'var(--color-border-strong)' }}>
            <img src="/logo-mark.png" alt="Colon Byte" className="w-full h-full object-cover" />
          </div>
          <span className="text-[14.5px] font-semibold tracking-tight text-text">Colon Byte</span>
        </div>

        {step === 'password' ? (
          <form onSubmit={handlePasswordSubmit}>
            <div
              className="inline-block text-[10.5px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-1 mb-4"
              style={{ background: 'var(--color-accent-3-soft)', color: 'var(--color-on-accent-3, var(--color-text))' }}
            >
              Admin access
            </div>
            <h1 className="text-[26px] font-semibold tracking-tight text-text leading-tight mb-1.5">
              Welcome back
            </h1>
            <p className="text-[13.5px] text-text-3 mb-7">Sign in to manage your pipeline.</p>

            <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-3 mb-1.5 ml-1">Email</label>
            <input
              type="email"
              autoComplete="username"
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputClass} mb-4`}
              style={{ borderColor: 'var(--color-border-strong)' }}
            />

            <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-3 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                style={{ borderColor: 'var(--color-border-strong)', paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                title={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-3 hover:text-text transition-colors duration-150"
              >
                {showPassword ? <EyeOffIcon className="w-[18px] h-[18px]" /> : <EyeIcon className="w-[18px] h-[18px]" />}
              </button>
            </div>

            {error && (
              <p className="mt-4 text-[12.5px]" style={{ color: 'var(--color-danger)' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-7 w-full h-12 rounded-full text-[14px] font-semibold flex items-center justify-center gap-2 transition-all duration-150 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
              style={{ background: 'var(--color-black)', color: '#ffffff' }}
            >
              {loading ? 'Checking…' : (<>Continue <ArrowIcon className="w-3.5 h-3.5" /></>)}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <div
              className="inline-block text-[10.5px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-1 mb-4"
              style={{ background: 'var(--color-accent-2-soft)', color: 'var(--color-accent-2)' }}
            >
              Verification
            </div>
            <h1 className="text-[26px] font-semibold tracking-tight text-text leading-tight mb-1.5">
              Check your email
            </h1>
            <p className="text-[13.5px] text-text-3 mb-7">
              A 6-digit code was sent to <span className="text-text-2 font-medium">{email}</span>. It expires in 10 minutes.
            </p>

            <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-3 mb-1.5 ml-1">Code</label>
            <input
              ref={otpInputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={`${inputClass} text-center text-[22px] font-mono tracking-[0.5em]`}
              style={{ borderColor: 'var(--color-border-strong)', height: 56 }}
            />

            {error && (
              <p className="mt-4 text-[12.5px]" style={{ color: 'var(--color-danger)' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="mt-7 w-full h-12 rounded-full text-[14px] font-semibold flex items-center justify-center gap-2 transition-all duration-150 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
              style={{ background: 'var(--color-black)', color: '#ffffff' }}
            >
              {loading ? 'Verifying…' : (<>Verify <ArrowIcon className="w-3.5 h-3.5" /></>)}
            </button>

            <button
              type="button"
              onClick={() => { setStep('password'); setCode(''); setError(null); }}
              className="mt-4 w-full text-[12.5px] text-text-3 hover:text-text transition-colors duration-150"
            >
              ← Use a different account
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
