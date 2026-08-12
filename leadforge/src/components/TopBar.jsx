import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/leads', label: 'Leads' },
];

export default function TopBar() {
  return (
    <header
      className="sticky top-0 z-40 h-14 flex items-center gap-1 px-5 border-b backdrop-blur-sm"
      style={{ background: 'color-mix(in srgb, var(--color-bg) 88%, transparent)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center gap-2 pr-4">
        <div className="w-7 h-7 rounded-[8px] overflow-hidden shrink-0">
          <img src="/logo-mark.png" alt="Colon Byte" className="w-full h-full object-cover" />
        </div>
        <span className="text-[13.5px] font-semibold tracking-tight text-text">Colon Byte</span>
      </div>

      <div className="w-px h-4 mr-2" style={{ background: 'var(--color-border)' }} />

      <nav className="flex items-center gap-0.5 h-full">
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `relative flex items-center h-full px-3 text-[13px] font-medium transition-colors duration-150 ${
                isActive ? 'text-text' : 'text-text-2 hover:text-text'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {label}
                <span
                  className="absolute left-2 right-2 -bottom-px h-[2px] rounded-full transition-opacity duration-150"
                  style={{ background: 'var(--color-accent)', opacity: isActive ? 1 : 0 }}
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
      </div>
    </header>
  );
}
