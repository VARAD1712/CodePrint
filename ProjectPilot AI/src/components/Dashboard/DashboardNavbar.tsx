'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore, useProjectStore } from '@/lib/store';
import { Badge, Button } from '@/components/UI/Primitives';
import { Terminal, LogOut, MessageSquare, Shield, FolderGit2, Sparkles, User as UserIcon } from 'lucide-react';

interface DashboardNavbarProps {
  onOpenCopilot?: () => void;
  isCopilotOpen?: boolean;
}

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ onOpenCopilot, isCopilotOpen = false }) => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { activeProject } = useProjectStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getRoleBadgeVariant = (role?: string) => {
    if (role === 'ADMIN') return 'red';
    if (role === 'FACULTY') return 'purple';
    return 'blue';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Active Workspace */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="p-1.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Terminal className="h-5 w-5 text-white" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-slate-100">
              ProjectPilot <span className="text-blue-400 font-mono text-xs px-2 py-0.5 bg-blue-500/10 rounded border border-blue-500/30 ml-1">AI 3.0</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-3 pl-6 border-l border-slate-800 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <FolderGit2 className="h-4 w-4 text-indigo-400" />
              <span>Workspace:</span>
              <span className="text-blue-400 underline decoration-blue-500/30 font-bold truncate max-w-[200px]">
                {activeProject ? activeProject.title : 'DeepSearch Neural Indexing Project'}
              </span>
            </div>
            <Badge variant="green" className="text-[10px]">Active Node</Badge>
          </div>
        </div>

        {/* User Actions & Copilot Button */}
        <div className="flex items-center gap-3">
          {/* Open Copilot Side Drawer Button */}
          {onOpenCopilot && (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenCopilot}
              className={`text-xs font-bold font-sans flex items-center gap-1.5 py-1.5 shadow-md shadow-indigo-500/20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 ${
                isCopilotOpen ? 'ring-2 ring-blue-400' : ''
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 text-amber-300 animate-bounce" />
              <span>AI Copilot Dock</span>
              <span className="bg-white/20 text-white text-[10px] font-mono px-1.5 py-0.2 rounded ml-1">Ctrl+K</span>
            </Button>
          )}

          {/* User Profile Vault */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-xs font-bold text-slate-200 truncate max-w-[150px]">
                {user?.name || 'Alex Rivera'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono flex items-center justify-end gap-1">
                <Shield className="h-2.5 w-2.5 text-slate-500" /> {user?.role || 'STUDENT'}
              </span>
            </div>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-700 object-cover bg-slate-900" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold">
                {user?.name?.[0] || 'S'}
              </div>
            )}
            <Badge variant={getRoleBadgeVariant(user?.role) as 'blue' | 'red' | 'purple'} className="hidden xl:inline-flex text-[10px]">
              {user?.role || 'STUDENT'}
            </Badge>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            title="Sign Out Vault"
            className="text-slate-400 hover:text-red-400 hover:bg-slate-900 px-2.5 py-1.5"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
