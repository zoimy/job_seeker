import React from 'react';
import { LayoutDashboard, UserCircle, Settings2, Bell } from 'lucide-react';

interface NavProps {
  currentView: 'dashboard' | 'profile' | 'integrations' | 'notifications';
  setView: (view: 'dashboard' | 'profile' | 'integrations' | 'notifications') => void;
}

const Navigation: React.FC<NavProps> = ({ currentView, setView }) => {
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile', icon: UserCircle },
    { id: 'integrations', label: 'Integrations', icon: Settings2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ] as const;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="
        mx-4 mt-4 rounded-2xl
        bg-[#0a0e27]/80 backdrop-blur-[40px]
        border border-white/10
        shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]
      ">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => setView('dashboard')}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                JobTracker
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-2">
                {navItems.map((item) => {
                  const isActive = currentView === item.id;
                  const Icon = item.icon;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setView(item.id)}
                      className={`
                        relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                        flex items-center gap-2
                        ${isActive 
                          ? 'text-white' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
                      )}
                      <Icon size={18} className={`relative z-10 ${isActive ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]' : ''}`} />
                      <span className="relative z-10">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Menu Button - simplified for now */}
            <div className="md:hidden">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                <UserCircle size={20} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;