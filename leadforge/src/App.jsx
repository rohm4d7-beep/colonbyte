import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar';
import CloudBackdrop from './components/CloudBackdrop';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Login from './pages/Login';
import API_BASE from './config';

export default function App() {
  // null = still checking, false = not logged in, string = logged-in email. The whole app
  // (including every /api/leads and /api/scrape call) is gated behind this - those routes were
  // reachable by anyone on the internet with zero credentials before this existed.
  const [authEmail, setAuthEmail] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/me`)
      .then((res) => res.json())
      .then((data) => setAuthEmail(data.authenticated ? data.email : false))
      .catch(() => setAuthEmail(false));
  }, []);

  if (authEmail === null) {
    return <div className="min-h-screen bg-bg" />;
  }

  if (!authEmail) {
    return (
      <>
        <CloudBackdrop />
        <Login onLoggedIn={setAuthEmail} />
      </>
    );
  }

  return (
    <>
      <CloudBackdrop />
      <div className="min-h-screen py-6 px-4 sm:px-6">
        <div
          className="dotted-frame mx-auto max-w-[1240px] rounded-[32px] overflow-hidden border"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
        >
          <TopBar userEmail={authEmail} onLoggedOut={() => setAuthEmail(false)} />
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
            </Routes>
          </main>
        </div>
      </div>
    </>
  );
}
