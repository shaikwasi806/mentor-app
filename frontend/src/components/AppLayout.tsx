'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { LayoutDashboard, LogOut, BookOpen, Settings } from 'lucide-react';
import api from '@/lib/api';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, login } = useAuthStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token && !user) {
           const res = await api.get('/auth/me');
           login(res.data, token);
        }
      } catch (err) {
        logout();
        router.push('/login');
      }
    };
    if (isAuthenticated && !user) fetchUser();
    if (!isAuthenticated && pathname !== '/login' && pathname !== '/signup') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router, pathname]);

  if (!isAuthenticated && pathname !== '/login' && pathname !== '/signup') {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (pathname === '/login' || pathname === '/signup') return children;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-950 overflow-hidden text-gray-900 dark:text-zinc-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-gray-100 dark:border-zinc-800 flex flex-col transition-all">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="text-white w-4 h-4" />
          </div>
          <span className="font-bold text-lg tracking-tight">OnyxLearn</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
          <Link 
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
              pathname === '/dashboard' || pathname.startsWith('/course') 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' 
                : 'text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          
          {user?.role === 'admin' && (
            <Link 
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                pathname.startsWith('/admin') 
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' 
                  : 'text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200'
              }`}
            >
              <Settings className="w-5 h-5" />
              Admin Area
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
               {user?.name?.charAt(0) || 'U'}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium truncate">{user?.name}</p>
               <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">{user?.role}</p>
             </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 dark:text-red-400 rounded-xl transition-colors font-medium text-sm mt-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
