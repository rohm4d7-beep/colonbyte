import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '◈' },
  { to: '/leads', label: 'Leads', icon: '◉' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col border-r border-border" style={{ background: 'var(--color-sidebar-bg)' }}>
      <div className="flex items-center gap-3 px-5 pt-6 pb-8">
        <div className="w-9 h-9 flex items-center justify-center rounded-lg overflow-hidden">
          <img src="/logo.png" alt="logo" className="w-full h-full object-contain" />
        </div>
        <span className="text-text-primary font-semibold tracking-tight text-base">Devs Aura</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? 'font-medium border-l-2'
                  : 'hover:bg-[var(--color-nav-hover-bg)] hover:text-[var(--color-nav-hover-text)]'
              }`
            }
            style={({ isActive }) => isActive ? {
              color: 'var(--color-nav-active-text)',
              borderLeftColor: 'var(--color-accent)',
              background: 'var(--color-nav-active-bg)',
            } : {
              color: 'var(--color-text-muted)',
            }}
          >
            <span className="text-xs">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-3 pb-4">
        <ThemeToggle />
      </div>

      <div className="px-5 py-4 text-text-subtle text-xs border-t border-border">v1.0 · Phase 1</div>
    </aside>
  );
}
