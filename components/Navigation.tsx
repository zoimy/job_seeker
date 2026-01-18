import React from 'react';
import { LayoutDashboard, UserCircle, Bell, Settings } from 'lucide-react';

interface Props {
  currentView: 'dashboard' | 'profile' | 'integrations';
  setView: (view: 'dashboard' | 'profile' | 'integrations') => void;
}

const Navigation: React.FC<Props> = ({ currentView, setView }) => {
  const navItemClass = (active: boolean) => `
    flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
    ${active 
      ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/20' 
      : 'text-gray-400 hover:text-white hover:bg-white/5'
    }
  `;

  return (
    <nav className="sticky top-0 z-50 w-full px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="
          bg-slate-900/60 backdrop-blur-xl border border-white/10 
          rounded-2xl shadow-2xl px-6 py-3
          flex items-center justify-between
        ">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-bold text-white text-lg">J</span>
            </div>
            <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 hidden sm:block">
              JobMatcher
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-1 sm:gap-4">
            <button 
              onClick={() => setView('dashboard')}
              className={navItemClass(currentView === 'dashboard')}
            >
              <LayoutDashboard size={20} />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button 
              onClick={() => setView('profile')}
              className={navItemClass(currentView === 'profile')}
            >
              <UserCircle size={20} />
              <span className="hidden sm:inline">Profile</span>
            </button>
             <button 
              onClick={() => setView('integrations')}
              className={navItemClass(currentView === 'integrations')}
            >
              <Settings size={20} />
              <span className="hidden sm:inline">Integrations</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
             <button className="relative p-2 text-gray-300 hover:text-white transition-colors">
               <Bell size={20} />
               <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
             </button>
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 border border-white/20"></div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;