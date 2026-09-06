import { NavLink } from 'react-router-dom';
import API_BASE from '../config';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/leads', label: 'Leads' },
];

export default function TopBar({ userEmail, onLoggedOut }) {
  const handleLogout = async () => {
    await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' }).catch(() => {});
    onLoggedOut?.();
  };

  return (
    <header
      className="h-[72px] flex items-center gap-1 px-7 border-b"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center gap-2.5 pr-6">
        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2" style={{ ['--tw-ring-color']: 'var(--color-border-strong)' }}>
          <img src="/logo-mark.png" alt="Colon Byte" className="w-full h-full object-cover" />
        </div>
        <span className="text-[14px] font-semibold tracking-tight text-text">Colon Byte</span>
      </div>

      <nav className="flex items-center gap-1 h-full">
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `relative flex items-center h-full px-3.5 text-[13.5px] font-medium transition-colors duration-150 ${
                isActive ? 'text-text' : 'text-text-2 hover:text-text'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {label}
                <span
                  className="absolute left-3.5 right-3.5 -bottom-px h-[2px] rounded-full transition-opacity duration-150"
                  style={{ background: 'var(--color-black)', opacity: isActive ? 1 : 0 }}
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        {userEmail && <span className="text-[12px] text-text-3 hidden sm:inline">{userEmail}</span>}
        <button
          onClick={handleLogout}
          className="h-9 px-4 rounded-full text-[12.5px] font-semibold border-2 transition-colors duration-150 hover:bg-[--color-surface-2]"
          style={{ borderColor: 'var(--color-black)', color: 'var(--color-black)' }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
