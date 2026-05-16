import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  CheckSquare, 
  User, 
  LogOut,
  HelpCircle,
  History,
  Banknote,
  Settings,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../../../services/api';

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active = false, 
  onClick,
  badge = 0
}: { 
  icon: any, 
  label: string, 
  active?: boolean,
  onClick?: () => void,
  badge?: number
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between px-6 py-3.5 text-left transition-all relative group ${
        active 
          ? 'text-brand-text-main' 
          : 'text-brand-text-variant hover:text-brand-text-main'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <Icon size={18} className={active ? 'text-brand-primary' : 'text-current'} />
          {badge > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center ring-2 ring-brand-surface group-hover:ring-brand-surface-card transition-all animate-bounce">
              {badge}
            </span>
          )}
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {active && (
        <motion.div 
          layoutId="sidebar-active"
          className="w-1.5 h-1.5 rounded-full bg-brand-primary" 
        />
      )}
    </button>
  );
};

export const Sidebar = ({ activeTab, onTabChange, role = 'client' }: { activeTab: string, onTabChange: (tab: string) => void, role?: 'client' | 'provider' }) => {
  const navigate = useNavigate();
  const [isEmailVerified, setIsEmailVerified] = React.useState(true);
  const [invitationCount, setInvitationCount] = React.useState(0);

  React.useEffect(() => {
    api.getMe().then(user => {
      setIsEmailVerified(!!user.is_email_verified);
      
      if (role === 'provider') {
        // Fetch invitations count
        Promise.all([
          api.getJobsByView('assigned').catch(() => []),
          api.getJobs({ status: 'pending' }).catch(() => [])
        ]).then(([assigned, pending]) => {
          const combined = [...assigned, ...pending];
          const unique = Array.from(new Map(combined.map(j => [j.id, j])).values());
          const count = unique.filter((j: any) => j.provider_id === user.id && j.status === 'pending').length;
          setInvitationCount(count);
        }).catch(console.error);
      }
    }).catch(console.error);
  }, [role]);

  const handleTabClick = (tab: string) => {
    if (!isEmailVerified && ['jobs', 'tasks', 'offers', 'active-work', 'earnings'].includes(tab)) {
      alert('Please verify your email address to access this feature.');
      onTabChange('profile');
      return;
    }
    onTabChange(tab);
  };

  return (
    <aside className="w-[280px] h-screen fixed left-0 top-0 bg-brand-surface border-r border-brand-outline flex flex-col z-50">
      <div className="px-8 py-10">
        <div className="flex items-center gap-3 mb-1 mt-2">
          <svg className="w-9 h-9 shrink-0 relative top-[-1px]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" fill="#10b981"/>
            <path d="M50 30 C 65 30 75 45 75 60 C 75 75 65 80 50 80 C 35 80 25 75 25 60 C 25 45 35 30 50 30 Z" fill="white"/>
            <path d="M50 45 C 55 45 58 52 58 65 C 58 72 55 70 50 70 C 45 70 42 72 42 65 C 42 52 45 45 50 45 Z" fill="#10b981"/>
            <circle cx="50" cy="24" r="10" fill="white" stroke="#10b981" strokeWidth="3"/>
            <circle cx="28" cy="68" r="10" fill="white" stroke="#10b981" strokeWidth="3"/>
            <circle cx="72" cy="68" r="10" fill="white" stroke="#10b981" strokeWidth="3"/>
            <path d="M41 28 Q 28 35 22 45" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none"/>
            <path d="M59 28 Q 72 35 78 45" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none"/>
            <path d="M35 76 Q 50 85 65 76" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none"/>
          </svg>
          <div>
            <span className="font-bold tracking-tight text-brand-text-main text-xl">LingkodHub</span>
            <p className="text-[11px] text-brand-text-variant font-medium">Your neighborhood app</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        <SidebarItem 
          icon={Home} 
          label="Home" 
          active={activeTab === 'home'} 
          onClick={() => handleTabClick('home')} 
        />
        
        {role === 'client' ? (
          <>
            <SidebarItem 
              icon={FileText} 
              label="My Active Posts" 
              active={activeTab === 'jobs'} 
              onClick={() => handleTabClick('jobs')} 
            />
            <SidebarItem 
              icon={CheckSquare} 
              label="Ongoing Tasks" 
              active={activeTab === 'tasks'} 
              onClick={() => handleTabClick('tasks')} 
            />
          </>
        ) : (
          <>
            <SidebarItem 
              icon={FileText} 
              label="My Offers" 
              active={activeTab === 'offers'} 
              onClick={() => handleTabClick('offers')} 
            />
            <SidebarItem 
              icon={Zap} 
              label="Work Invitations" 
              active={activeTab === 'invitations'} 
              onClick={() => handleTabClick('invitations')} 
              badge={invitationCount}
            />
            <SidebarItem 
              icon={CheckSquare} 
              label="Active Work" 
              active={activeTab === 'active-work'} 
              onClick={() => handleTabClick('active-work')} 
            />
            <SidebarItem 
              icon={Banknote} 
              label="Earnings" 
              active={activeTab === 'earnings'} 
              onClick={() => handleTabClick('earnings')} 
            />
          </>
        )}
        <SidebarItem 
          icon={History} 
          label="History" 
          active={activeTab === 'history'} 
          onClick={() => handleTabClick('history')} 
        />
        <SidebarItem 
          icon={HelpCircle} 
          label="Help & Safety" 
          active={activeTab === 'help'} 
          onClick={() => handleTabClick('help')} 
        />
        <SidebarItem 
          icon={Settings} 
          label="Settings" 
          active={activeTab === 'profile'} 
          onClick={() => handleTabClick('profile')} 
        />
      </nav>

      <div className="mt-auto px-6 py-8">
        <button 
          type="button"
          onClick={async () => {
            try {
              await api.logout();
            } catch (err) {
              console.error('Logout failed:', err);
            }
            navigate('/');
          }} 
          className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-brand-text-variant hover:text-brand-text-main transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
