import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Music2,
  Users,
  ListMusic,
  Sparkles,
  Settings,
  Menu,
  X,
  Disc3,
} from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/tracks', label: 'Tracks', icon: Music2 },
  { to: '/artists', label: 'Artists', icon: Users },
  { to: '/playlists', label: 'Playlists', icon: ListMusic },
  { to: '/taste', label: 'Taste Analysis', icon: Sparkles },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: profile } = useApi(() => api.getProfile(), []);
  const isDemo = !api.isAuthenticated();

  return (
    <div className="flex h-screen bg-[#0d0d14] font-sans text-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-40 flex h-full w-64 flex-col bg-[#0f0f17] transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2.5 px-6 py-5">
          <Disc3 size={24} className="text-purple-500" />
          <span className="text-lg font-semibold">Tunelytics</span>
        </div>

        <nav className="flex-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-200 ${
                  isActive
                    ? 'bg-purple-500/15 font-semibold text-purple-400'
                    : 'text-[#a0a0b8] hover:bg-[#1a1a2e] hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info at bottom */}
        {profile && (
          <div className="border-t border-[#252540] px-4 py-4">
            <div className="flex items-center gap-3">
              {profile.images?.[0]?.url ? (
                <img
                  src={profile.images[0].url}
                  alt={profile.display_name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-xs font-semibold">
                  {profile.display_name?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {profile.display_name}
                </p>
                <p className="text-xs text-[#6b6b80]">
                  {isDemo ? 'Demo Mode' : profile.product ?? 'Spotify'}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#252540] bg-[#13131d] px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#a0a0b8] lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            {isDemo && (
              <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                Demo
              </span>
            )}
            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-[#a0a0b8] lg:hidden"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#13131d] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
