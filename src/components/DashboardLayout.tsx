import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Home, 
  Search, 
  FileText, 
  CheckSquare, 
  User, 
  LogOut,
  Bell,
  HelpCircle,
  Settings,
  ChevronRight,
  ChevronLeft,
  Camera,
  MapPin,
  Phone,
  Plus,
  PlusCircle,
  Sun,
  Moon,
  History,
  Filter,
  Calendar,
  Smartphone,
  Banknote,
  Star,
  X,
  MessageSquare,
  Clock,
  CheckCircle,
  MessageCircle,
  Pause,
  Play,
  ArrowUpCircle,
  AlertTriangle,
  MoreHorizontal,
  Users,
  Trash2,
  TrendingUp,
  LayoutGrid,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ALL_SERVICES, COMMON_SERVICES } from '../constants';

// --- Sidebar ---

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active = false, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  active?: boolean,
  onClick?: () => void 
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
        <Icon size={18} className={active ? 'text-brand-primary' : 'text-current'} />
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
          onClick={() => onTabChange('home')} 
        />
        
        {role === 'client' ? (
          <>
            <SidebarItem 
              icon={FileText} 
              label="My Active Posts" 
              active={activeTab === 'jobs'} 
              onClick={() => onTabChange('jobs')} 
            />
            <SidebarItem 
              icon={CheckSquare} 
              label="Ongoing Tasks" 
              active={activeTab === 'tasks'} 
              onClick={() => onTabChange('tasks')} 
            />
          </>
        ) : (
          <>
            <SidebarItem 
              icon={FileText} 
              label="My Offers" 
              active={activeTab === 'offers'} 
              onClick={() => onTabChange('offers')} 
            />
            <SidebarItem 
              icon={CheckSquare} 
              label="Active Work" 
              active={activeTab === 'active-work'} 
              onClick={() => onTabChange('active-work')} 
            />
            <SidebarItem 
              icon={Banknote} 
              label="Earnings" 
              active={activeTab === 'earnings'} 
              onClick={() => onTabChange('earnings')} 
            />
            <SidebarItem 
              icon={HelpCircle} 
              label="Help & Safety" 
              active={activeTab === 'help'} 
              onClick={() => onTabChange('help')} 
            />
          </>
        )}

        <SidebarItem 
          icon={History} 
          label="History" 
          active={activeTab === 'history'} 
          onClick={() => onTabChange('history')} 
        />
        <SidebarItem 
          icon={User} 
          label="Profile" 
          active={activeTab === 'profile'} 
          onClick={() => onTabChange('profile')} 
        />
      </nav>

      <div className="mt-auto px-6 py-8">
        <button 
          type="button"
          onClick={() => navigate('/')} 
          className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-brand-text-variant hover:text-brand-text-main transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

// --- TopBar ---

export const TopBar = ({ isDark, toggleTheme, role = 'client' }: { isDark: boolean, toggleTheme: () => void, role?: 'client' | 'provider' }) => {
  const [userProfile, setUserProfile] = React.useState<any>(null);
  
  React.useEffect(() => {
    api.getMe().then(user => {
      setUserProfile(user);
    }).catch(console.error);
  }, []);

  const displayName = userProfile?.full_name || (role === 'client' ? 'Client' : 'Provider');
  const displayAvatar = userProfile?.avatar_url || (role === 'client' 
    ? "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=100&h=100&auto=format&fit=crop"
    : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&h=100&auto=format&fit=crop");

  return (
    <header className="h-[72px] bg-brand-surface border-b border-brand-outline flex items-center justify-between px-12 sticky top-0 z-40">
      <div className="flex items-center gap-12">
        <div className="text-sm font-light text-brand-text-main tracking-wide">
           Welcome, <span className="font-semibold">{displayName}!</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 border-r border-brand-outline pr-4 mr-1">
            <button type="button" onClick={toggleTheme} className="p-2 text-brand-text-variant hover:text-brand-text-main hover:bg-brand-outline/50 rounded-full transition-colors">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button type="button" className="p-2 text-brand-text-variant hover:text-brand-text-main hover:bg-brand-outline/50 rounded-full transition-colors">
            <Bell size={18} />
            </button>
            <button type="button" className="p-2 text-brand-text-variant hover:text-brand-text-main hover:bg-brand-outline/50 rounded-full transition-colors">
            <HelpCircle size={18} />
            </button>
            <button type="button" className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-full transition-colors">
            <Settings size={18} />
            </button>
        </div>
        <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
                <p className="text-sm text-brand-text-main font-medium">{displayName}</p>
                <p className="text-xs text-brand-text-variant font-light">{userProfile?.username ? `@${userProfile.username}` : (role === 'client' ? 'Homeowner' : 'Service Provider')}</p>
            </div>
            <div className="w-10 h-10 rounded-full border border-brand-outline p-0.5">
                <img 
                    src={displayAvatar} 
                    alt="User" 
                    className="w-full h-full rounded-full object-cover"
                />
            </div>
        </div>
      </div>
    </header>
  );
};

// --- Form Fields ---

export const InputGroup = ({ label, children, helper }: { label: string, children: React.ReactNode, helper?: string }) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-sm font-medium text-brand-text-main">{label}</label>
    {children}
    {helper && <p className="text-[10px] italic text-brand-text-variant/60">{helper}</p>}
  </div>
);

export const ProfileSettings = ({ role = 'client' }: { role?: 'client' | 'provider' }) => {
  const [services, setServices] = React.useState<string[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = React.useState(false);
  const [serviceSearch, setServiceSearch] = React.useState('');
  const [customService, setCustomService] = React.useState('');
  
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [displayName, setDisplayName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [aboutMe, setAboutMe] = React.useState('');

  const [activeSettingsTab, setActiveSettingsTab] = React.useState('profile');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Load profile from Backend
    api.getMe().then(data => {
      setDisplayName(data.full_name || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setLocation(data.location || '');
      setAboutMe(data.about_me || '');
      setIsLoading(false);
    }).catch(console.error);

    if (role === 'provider') {
      // Load services
      api.getMyServices().then(data => {
        setServices(data.map((s: any) => s.name));
      }).catch(console.error);
    }
  }, [role]);

  const saveProfile = async () => {
    try {
      await api.updateMe({
        full_name: displayName,
        phone,
        location,
        about_me: aboutMe
      });
      // Handle success notification here if needed
    } catch (e) {
      console.error('Failed to update profile', e);
    }
  };

  const toggleService = async (service: string) => {
    let updatedServices: string[] = [];
    if (services.includes(service)) {
      updatedServices = services.filter(s => s !== service);
    } else {
      updatedServices = [...services, service];
    }
    setServices(updatedServices);
    await api.updateMyServices(updatedServices);
  };

  const addCustomService = async () => {
    if (customService.trim() && !services.includes(customService.trim())) {
      const updatedServices = [...services, customService.trim()];
      setServices(updatedServices);
      setCustomService('');
      await api.updateMyServices(updatedServices);
    }
  };

  const filteredServices = ALL_SERVICES.filter(s => 
    s.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-12 text-center text-brand-text-variant">Loading profile...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-16 px-12">
      <AnimatePresence>
        {isServiceModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsServiceModalOpen(false)}
              className="absolute inset-0 bg-brand-text-main/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-brand-surface rounded-[2.5rem] shadow-2xl border border-brand-outline p-8 lg:p-10 flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-brand-text-main">Manage Your Services</h2>
                  <p className="text-sm text-brand-text-variant font-medium">Update the services you can offer to clients</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)} 
                  className="w-10 h-10 rounded-full hover:bg-brand-surface-card flex items-center justify-center text-brand-text-variant"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="relative mb-6">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-variant" />
                <input 
                  type="text" 
                  placeholder="Search services..."
                  value={serviceSearch}
                  onChange={e => setServiceSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-brand-surface border-2 hover:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 border-brand-outline rounded-2xl focus:border-brand-primary transition-all text-sm font-medium shadow-sm outline-none"
                />
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredServices.map(service => (
                  <button
                    type="button"
                    key={service}
                    onClick={() => toggleService(service)}
                    className={`p-4 rounded-2xl text-left border-2 transition-all ${
                      services.includes(service)
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary shadow-sm'
                        : 'border-brand-outline hover:border-brand-primary/50 text-brand-text-variant'
                    }`}
                  >
                    <span className="text-xs font-bold leading-tight">{service}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-brand-outline">
                <div className="flex gap-3 mb-6">
                  <input 
                    type="text" 
                    placeholder="Manually add a specialized service..."
                    value={customService}
                    onChange={e => setCustomService(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addCustomService()}
                    className="flex-1 px-5 py-3.5 bg-brand-surface border-2 border-brand-outline hover:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 rounded-xl text-sm font-medium focus:border-brand-primary outline-none transition-all shadow-sm"
                  />
                  <button 
                    type="button"
                    onClick={addCustomService}
                    disabled={!customService.trim()}
                    className="px-6 bg-brand-primary text-white font-bold rounded-xl hover:bg-[#059669] transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <PlusCircle size={18} /> Add
                  </button>
                </div>

                <button 
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:bg-[#059669] transition-all"
                >
                  Save Selection ({services.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-3xl font-semibold text-brand-text-main mb-2">Profile Settings</h1>
          <p className="text-sm text-brand-text-variant">Manage your account and personal details</p>
        </div>
        <div className="flex gap-4 text-xs font-medium text-brand-text-variant mt-4 sm:mt-0">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-primary"></span> Verified User</span>
        </div>
      </header>

      {/* Settings Tabs Container */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-brand-outline mb-8">
        <div className="flex gap-8 px-2">
            {[
              { id: 'profile', label: 'Profile' },
              { id: 'security', label: 'Security' },
              { id: 'notifications', label: 'Notifications' },
              { id: 'privacy', label: 'Privacy' },
              { id: 'billing', label: 'Billing' },
              { id: 'location', label: 'Location' },
            ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveSettingsTab(tab.id)}
                 className={`pb-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                   activeSettingsTab === tab.id 
                     ? 'border-brand-primary text-brand-primary' 
                     : 'border-transparent text-brand-text-variant hover:text-brand-text-main hover:border-brand-outline'
                 }`}
               >
                 {tab.label}
               </button>
            ))}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {/* Left Column: Avatar */}
        <div className="md:col-span-1 space-y-6">
            <div className="bg-brand-surface-card border border-brand-outline p-8 rounded-2xl text-center shadow-sm">
                <div className="relative inline-block mb-6 group">
                   <div className="w-24 h-24 bg-brand-surface border border-brand-outline mx-auto flex items-center justify-center relative overflow-hidden rounded-full">
                        <img 
                            src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=256&h=256&auto=format&fit=crop" 
                            alt="Profile" 
                            className="w-full h-full object-cover transition-opacity"
                        />
                    </div>
                    <button type="button" className="absolute bottom-0 right-0 p-2 bg-brand-primary text-brand-surface rounded-full shadow-md hover:scale-110 transition-transform">
                        <Camera size={14} />
                    </button>
                </div>
                <div className="flex items-center justify-center gap-2 mb-1 group max-w-[200px] mx-auto min-h-[32px]">
                   {isEditingName ? (
                      <input 
                         type="text" 
                         value={displayName}
                         onChange={(e) => setDisplayName(e.target.value)}
                         onBlur={() => setIsEditingName(false)}
                         onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                         autoFocus
                         className="text-lg font-medium text-brand-text-main bg-brand-surface border-b-2 border-brand-primary outline-none text-center px-1 py-0 w-full"
                      />
                   ) : (
                      <>
                         <h4 className="text-lg font-medium text-brand-text-main truncate" title={displayName}>{displayName}</h4>
                         <button onClick={() => setIsEditingName(true)} className="text-brand-text-variant opacity-0 group-hover:opacity-100 hover:text-brand-primary transition-all p-1 -mr-6 shrink-0" title="Edit Name">
                            <Edit2 size={16} />
                         </button>
                      </>
                   )}
                </div>
                <p className="text-sm text-brand-text-variant">Premium Member</p>
                
                <div className="mt-8 pt-6 border-t border-brand-outline">
                    <button type="button" className="w-full py-2.5 bg-brand-primary/10 text-brand-primary rounded-xl text-sm font-semibold hover:bg-brand-primary hover:text-brand-surface transition-all">
                        Change Photo
                    </button>
                </div>
            </div>

            <div className="bg-brand-surface-card border border-brand-outline p-6 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-brand-text-main">Profile Completion</h3>
                    <span className="text-sm font-bold text-brand-primary">80%</span>
                </div>
                <div className="w-full bg-brand-outline/50 rounded-full h-2 mb-4 overflow-hidden">
                    <div className="bg-brand-primary h-2 rounded-full transition-all duration-1000" style={{ width: '80%' }}></div>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-brand-text-variant mb-2 uppercase tracking-wider">Missing Items</p>
                   <ul className="space-y-2">
                       <li className="flex items-center gap-2 text-xs text-brand-text-main group cursor-pointer hover:text-brand-primary transition-colors">
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-accent group-hover:scale-125 transition-transform"></div>
                           <span>Address verification</span>
                       </li>
                       <li className="flex items-center gap-2 text-xs text-brand-text-main group cursor-pointer hover:text-brand-primary transition-colors">
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-accent group-hover:scale-125 transition-transform"></div>
                           <span>Emergency contact</span>
                       </li>
                       <li className="flex items-center gap-2 text-xs text-brand-text-main group cursor-pointer hover:text-brand-primary transition-colors">
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-accent group-hover:scale-125 transition-transform"></div>
                           <span>Bio description</span>
                       </li>
                   </ul>
                </div>
            </div>

            <div className="bg-brand-surface-card border border-brand-outline p-6 rounded-2xl shadow-sm">
                <h3 className="text-sm font-semibold text-brand-text-main mb-4">Account Stats</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-brand-text-variant">Jobs Posted</span>
                        <span className="text-brand-text-main font-medium">12</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-brand-text-variant">Member Since</span>
                        <span className="text-brand-text-main font-medium">Jan 2024</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Fields */}
        <div className="md:col-span-2 bg-brand-surface-card border border-brand-outline rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-8 space-y-8 flex-1">
            {activeSettingsTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Full Name">
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-brand-surface border-2 border-brand-outline rounded-xl px-4 py-3 hover:border-brand-primary/50 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 shadow-sm hover:shadow-md transition-all font-medium text-brand-text-main text-sm"
                  />
                </InputGroup>

                <InputGroup label="Email Address" helper="You cannot change your email address right now.">
                  <input 
                    type="email" 
                    value={email} 
                    disabled
                    className="w-full bg-brand-surface-container border border-brand-outline/40 rounded-xl px-4 py-3 text-brand-text-variant cursor-not-allowed opacity-70 text-sm"
                  />
                </InputGroup>

                <InputGroup label="Phone Number">
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-brand-surface border-2 border-brand-outline rounded-xl px-4 py-3 hover:border-brand-primary/50 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 shadow-sm hover:shadow-md transition-all font-medium text-brand-text-main text-sm"
                  />
                </InputGroup>

                <InputGroup label="Location">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-variant" size={16} />
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-brand-surface border-2 border-brand-outline rounded-xl pl-10 pr-4 py-3 hover:border-brand-primary/50 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 shadow-sm hover:shadow-md transition-all font-medium text-brand-text-main text-sm"
                    />
                  </div>
                </InputGroup>

                <div className="col-span-1 md:col-span-2">
                  <InputGroup label="About Me">
                    <textarea 
                      rows={4}
                      value={aboutMe}
                      onChange={(e) => setAboutMe(e.target.value)}
                      className="w-full bg-brand-surface border-2 border-brand-outline rounded-xl px-4 py-3 hover:border-brand-primary/50 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 shadow-sm hover:shadow-md transition-all font-medium text-brand-text-main text-sm leading-relaxed resize-none"
                    />
                  </InputGroup>
                </div>

                {role === 'provider' && (
                  <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t border-brand-outline">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest">My Service Offerings</h3>
                      <button 
                        type="button"
                        onClick={() => setIsServiceModalOpen(true)}
                        className="text-xs font-bold text-brand-primary flex items-center gap-1.5 hover:underline decoration-2 underline-offset-4"
                      >
                        <PlusCircle size={14} /> Update Services
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {services.map(service => (
                        <div key={service} className="flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/20 px-4 py-2 rounded-xl transition-all hover:bg-brand-primary/15">
                          <span className="text-xs font-bold text-brand-primary">{service}</span>
                          <button 
                            type="button"
                            onClick={() => toggleService(service)}
                            className="text-brand-primary/50 hover:text-brand-primary"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {services.length === 0 && (
                        <p className="text-xs text-brand-text-variant font-medium italic">No services selected. Add services to start receiving job alerts.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSettingsTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Security</h3>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-brand-surface border-2 border-brand-outline rounded-2xl p-6 shadow-sm">
                    <div>
                      <h4 className="text-sm font-semibold text-brand-text-main mb-1">Account Password</h4>
                      <p className="text-xs text-brand-text-variant">Change your password to keep your account secure.</p>
                    </div>
                    <button type="button" className="shrink-0 px-6 py-2.5 bg-brand-surface-card border-2 border-brand-outline text-brand-text-main text-sm font-bold hover:border-brand-primary/50 hover:text-brand-primary transition-all rounded-xl shadow-sm focus:ring-4 focus:ring-brand-primary/10 w-full sm:w-auto">
                      Change Password
                    </button>
                  </div>
                </div>

                <div>
                   <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Two-Factor Authentication</h3>
                   <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-brand-surface border-2 border-brand-outline rounded-2xl p-6 shadow-sm">
                     <div>
                        <h4 className="text-sm font-semibold text-brand-text-main mb-1">Add extra security</h4>
                        <p className="text-xs text-brand-text-variant">Protect your account with a second verification step.</p>
                     </div>
                     <button type="button" className="shrink-0 px-6 py-2.5 bg-brand-primary text-white text-sm font-bold transition-all rounded-xl shadow-lg hover:shadow-brand-primary/20 hover:bg-[#059669] w-full sm:w-auto">
                        Enable 2FA
                     </button>
                   </div>
                </div>
              </div>
            )}

            {activeSettingsTab === 'notifications' && (
               <div className="space-y-8">
                 <div>
                   <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Email Notifications</h3>
                   <div className="bg-brand-surface border-2 border-brand-outline rounded-2xl flex flex-col shadow-sm">
                      <div className="flex items-center justify-between p-6 border-b border-brand-outline">
                         <div className="pr-4">
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1">New Messages</h4>
                            <p className="text-xs text-brand-text-variant">Receive an email when clients or providers message you.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer outline-none">
                           <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                           <div className="w-11 h-6 bg-brand-surface border-2 border-brand-outline rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/10 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-text-variant peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary shadow-sm transition-colors"></div>
                         </label>
                      </div>
                      <div className="flex items-center justify-between p-6 border-b border-brand-outline">
                         <div className="pr-4">
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1">Job Updates</h4>
                            <p className="text-xs text-brand-text-variant">Get notified when a job status changes or an offer is made.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer outline-none">
                           <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                           <div className="w-11 h-6 bg-brand-surface border-2 border-brand-outline rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/10 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-text-variant peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary shadow-sm transition-colors"></div>
                         </label>
                      </div>
                      <div className="flex items-center justify-between p-6">
                         <div className="pr-4">
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1">Promotional Offers</h4>
                            <p className="text-xs text-brand-text-variant">Receive emails about new features, discounts, and platform updates.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer outline-none">
                           <input type="checkbox" className="sr-only peer" defaultChecked={false} />
                           <div className="w-11 h-6 bg-brand-surface border-2 border-brand-outline rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/10 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-text-variant peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary shadow-sm transition-colors"></div>
                         </label>
                      </div>
                   </div>
                 </div>

                 <div>
                   <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Push Notifications</h3>
                   <div className="bg-brand-surface border-2 border-brand-outline rounded-2xl flex flex-col shadow-sm">
                      <div className="flex items-center justify-between p-6 border-b border-brand-outline">
                         <div className="pr-4">
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1">Push Alerts</h4>
                            <p className="text-xs text-brand-text-variant">Allow the website to send you browser push notifications for real-time updates.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer outline-none">
                           <input type="checkbox" className="sr-only peer" defaultChecked={false} />
                           <div className="w-11 h-6 bg-brand-surface border-2 border-brand-outline rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/10 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-text-variant peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary shadow-sm transition-colors"></div>
                         </label>
                      </div>
                      <div className="flex items-center justify-between p-6">
                         <div className="pr-4">
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1">Marketing Push</h4>
                            <p className="text-xs text-brand-text-variant">Receive occasional push notifications about local promotions and discounts.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer outline-none">
                           <input type="checkbox" className="sr-only peer" defaultChecked={false} />
                           <div className="w-11 h-6 bg-brand-surface border-2 border-brand-outline rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/10 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-text-variant peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary shadow-sm transition-colors"></div>
                         </label>
                      </div>
                   </div>
                 </div>
               </div>
            )}

            {activeSettingsTab === 'privacy' && (
               <div className="space-y-8">
                 <div>
                   <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Profile Visibility</h3>
                   <div className="bg-brand-surface border-2 border-brand-outline rounded-2xl flex flex-col shadow-sm">
                      <div className="flex items-center justify-between p-6 border-b border-brand-outline">
                         <div className="pr-4">
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1">Public Profile</h4>
                            <p className="text-xs text-brand-text-variant">Allow other users to find and view your public profile page.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer outline-none">
                           <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                           <div className="w-11 h-6 bg-brand-surface border-2 border-brand-outline rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/10 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-text-variant peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary shadow-sm transition-colors"></div>
                         </label>
                      </div>
                      <div className="flex items-center justify-between p-6 border-b border-brand-outline">
                         <div className="pr-4">
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1">Show Location Status</h4>
                            <p className="text-xs text-brand-text-variant">Display your general location (e.g., Dasmariñas City) to help find matches.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer outline-none">
                           <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                           <div className="w-11 h-6 bg-brand-surface border-2 border-brand-outline rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/10 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-text-variant peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary shadow-sm transition-colors"></div>
                         </label>
                      </div>
                      <div className="flex items-center justify-between p-6">
                         <div className="pr-4">
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1">Online Status</h4>
                            <p className="text-xs text-brand-text-variant">Show other users when you are currently active on the platform.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer outline-none">
                           <input type="checkbox" className="sr-only peer" defaultChecked={false} />
                           <div className="w-11 h-6 bg-brand-surface border-2 border-brand-outline rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/10 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-text-variant peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary shadow-sm transition-colors"></div>
                         </label>
                      </div>
                   </div>
                 </div>

                 <div>
                   <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Data & History</h3>
                   <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-brand-surface border-2 border-brand-outline rounded-2xl p-6 shadow-sm mb-4">
                     <div>
                        <h4 className="text-sm font-semibold text-brand-text-main mb-1">Download Account Data</h4>
                        <p className="text-xs text-brand-text-variant">Get a copy of all your job history, messages, and account information.</p>
                     </div>
                     <button type="button" className="shrink-0 px-6 py-2.5 bg-brand-surface-card border-2 border-brand-outline text-brand-text-main text-sm font-bold hover:border-brand-primary/50 hover:text-brand-primary transition-all rounded-xl shadow-sm focus:ring-4 focus:ring-brand-primary/10 w-full sm:w-auto">
                        Request Data
                     </button>
                   </div>
                   
                   <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-red-50/50 border-2 border-red-200/50 rounded-2xl p-6 shadow-sm">
                     <div>
                        <h4 className="text-sm font-semibold text-red-700 mb-1">Delete Account</h4>
                        <p className="text-xs text-red-600/80">Permanently remove your account and all associated data.</p>
                     </div>
                     <button type="button" className="shrink-0 px-6 py-2.5 bg-white border-2 border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-all rounded-xl shadow-sm focus:ring-4 focus:ring-red-100 w-full sm:w-auto">
                        Delete Account
                     </button>
                   </div>
                 </div>
               </div>
            )}

            {activeSettingsTab === 'billing' && (
               <div className="space-y-8">
                 <div>
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest">Payment Methods</h3>
                     <button type="button" className="text-xs font-bold text-brand-primary hover:text-brand-primary/80 transition-colors">
                       + Add New Method
                     </button>
                   </div>
                   <div className="bg-brand-surface border-2 border-brand-outline rounded-2xl flex flex-col shadow-sm">
                      <div className="flex items-center justify-between p-6 border-b border-brand-outline">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-brand-surface-card border border-brand-outline rounded flex items-center justify-center font-bold text-brand-text-main text-xs italic">
                               VISA
                            </div>
                            <div>
                               <h4 className="text-sm font-bold text-brand-text-main mb-0.5">Visa ending in 4242</h4>
                               <p className="text-xs text-brand-text-variant">Expires 12/28</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-primary/10 text-brand-primary px-2 py-1 rounded">Default</span>
                            <button type="button" className="text-brand-text-variant hover:text-red-500 transition-colors">
                               <Trash2 size={16} />
                            </button>
                         </div>
                      </div>
                      <div className="flex items-center justify-between p-6">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-[#0079C1] rounded flex items-center justify-center font-bold text-white text-xs italic">
                               PayPal
                            </div>
                            <div>
                               <h4 className="text-sm font-bold text-brand-text-main mb-0.5">juan.delacruz@example.com</h4>
                               <p className="text-xs text-brand-text-variant">Connected account</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <button type="button" className="text-xs font-bold text-brand-text-variant hover:text-brand-text-main transition-colors">
                               Make Default
                            </button>
                            <button type="button" className="text-brand-text-variant hover:text-red-500 transition-colors">
                               <Trash2 size={16} />
                            </button>
                         </div>
                      </div>
                   </div>
                 </div>

                 <div>
                   <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Billing History</h3>
                   <div className="bg-brand-surface border-2 border-brand-outline rounded-2xl flex flex-col shadow-sm overflow-hidden">
                      <table className="w-full text-left text-sm">
                         <thead className="bg-brand-surface-container border-b border-brand-outline text-brand-text-variant text-xs uppercase">
                            <tr>
                               <th className="px-6 py-4 font-semibold">Date</th>
                               <th className="px-6 py-4 font-semibold">Description</th>
                               <th className="px-6 py-4 font-semibold">Amount</th>
                               <th className="px-6 py-4 font-semibold">Status</th>
                               <th className="px-6 py-4 font-semibold text-right">Receipt</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-brand-outline text-brand-text-main">
                            <tr className="hover:bg-brand-surface-card transition-colors">
                               <td className="px-6 py-4 whitespace-nowrap text-xs">Oct 24, 2023</td>
                               <td className="px-6 py-4 font-medium">Faucet Repair - Payment</td>
                               <td className="px-6 py-4">₱450.00</td>
                               <td className="px-6 py-4">
                                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Paid</span>
                               </td>
                               <td className="px-6 py-4 text-right">
                                  <button className="text-brand-primary hover:underline text-xs font-semibold">Download</button>
                               </td>
                            </tr>
                            <tr className="hover:bg-brand-surface-card transition-colors">
                               <td className="px-6 py-4 whitespace-nowrap text-xs">Sep 12, 2023</td>
                               <td className="px-6 py-4 font-medium">Monthly Premium Subscription</td>
                               <td className="px-6 py-4">₱299.00</td>
                               <td className="px-6 py-4">
                                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Paid</span>
                               </td>
                               <td className="px-6 py-4 text-right">
                                  <button className="text-brand-primary hover:underline text-xs font-semibold">Download</button>
                               </td>
                            </tr>
                         </tbody>
                      </table>
                   </div>
                 </div>
               </div>
            )}

            {activeSettingsTab === 'location' && (
               <div className="space-y-8">
                 <div>
                   <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Primary Address</h3>
                   <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-brand-surface border-2 border-brand-outline rounded-2xl p-6 shadow-sm">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center shrink-0">
                           <MapPin className="text-brand-primary" size={24} />
                        </div>
                        <div>
                           <h4 className="text-sm font-semibold text-brand-text-main mb-1">Makati City, Metro Manila</h4>
                           <p className="text-xs text-brand-text-variant">123 Ayala Avenue, San Lorenzo</p>
                        </div>
                     </div>
                     <button type="button" className="shrink-0 px-6 py-2.5 bg-brand-surface-card border-2 border-brand-outline text-brand-text-main text-sm font-bold hover:border-brand-primary/50 hover:text-brand-primary transition-all rounded-xl shadow-sm focus:ring-4 focus:ring-brand-primary/10 w-full sm:w-auto">
                        Edit Address
                     </button>
                   </div>
                 </div>

                 {role === 'provider' && (
                   <div>
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest">Service Radius</h3>
                        <span className="text-xs font-bold text-brand-primary">15 km</span>
                     </div>
                     <div className="bg-brand-surface border-2 border-brand-outline rounded-2xl p-6 shadow-sm">
                        <p className="text-xs text-brand-text-variant mb-6">Set the maximum distance you are willing to travel for service requests.</p>
                        <input 
                           type="range" 
                           min="1" 
                           max="50" 
                           defaultValue="15" 
                           className="w-full h-2 bg-brand-outline rounded-lg appearance-none cursor-pointer accent-brand-primary"
                        />
                        <div className="flex justify-between text-xs text-brand-text-variant mt-2 font-medium">
                           <span>1 km</span>
                           <span>50 km</span>
                        </div>
                     </div>
                   </div>
                 )}

                 <div>
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest">Saved Locations</h3>
                     <button type="button" className="text-xs font-bold text-brand-primary flex items-center gap-1.5 hover:underline decoration-2 underline-offset-4">
                       <PlusCircle size={14} /> Add New Location
                     </button>
                   </div>
                   <div className="bg-brand-surface border-2 border-brand-outline rounded-2xl flex flex-col shadow-sm">
                      <div className="flex items-center justify-between p-6 border-b border-brand-outline">
                         <div>
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1 flex items-center gap-2">
                               Home <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded">Default</span>
                            </h4>
                            <p className="text-xs text-brand-text-variant">Makati City, Metro Manila</p>
                         </div>
                         <button type="button" className="text-brand-text-variant hover:text-red-500 transition-colors p-2">
                            <Trash2 size={16} />
                         </button>
                      </div>
                      <div className="flex items-center justify-between p-6">
                         <div>
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1">Office</h4>
                            <p className="text-xs text-brand-text-variant">BGC, Taguig City</p>
                         </div>
                         <button type="button" className="text-brand-text-variant hover:text-red-500 transition-colors p-2">
                            <Trash2 size={16} />
                         </button>
                      </div>
                   </div>
                 </div>
               </div>
            )}
          </div>

           <div className="bg-brand-surface-container/50 px-6 py-6 sm:px-8 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-0 border-t border-brand-outline">
             <div className="flex text-xs font-medium text-brand-text-variant text-center sm:text-left">
                <p>Private data will never be shared without your permission.</p>
             </div>
            <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
                <button type="button" className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold text-brand-text-variant hover:text-brand-text-main hover:bg-brand-text-variant/10 rounded-xl transition-colors">
                Cancel
                </button>
                <button 
                  type="button" 
                  onClick={saveProfile}
                  className="flex-1 sm:flex-none px-8 py-2.5 bg-brand-primary text-white text-sm font-semibold hover:bg-[#059669] transition-all shadow-lg hover:shadow-brand-primary/20 rounded-xl"
                >
                Save Changes
                </button>
            </div>
          </div>
        </div>
      </motion.div>
      
      <footer className="mt-16 flex justify-between border-t border-brand-outline pt-8">
        <div className="flex gap-8 text-xs text-brand-text-variant font-medium">
          <a href="#" className="hover:text-brand-text-main transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-brand-text-main transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-brand-text-main transition-colors">Help Center</a>
        </div>
        <div className="flex gap-4">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-text-variant/20"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-brand-text-variant/20"></div>
        </div>
      </footer>
    </div>
  );
};

export const ProviderHelpSection = () => {
  const [activeFaq, setActiveFaq] = React.useState<number | null>(0);

  const FAQS = [
    {
      q: "What if the job description doesn't match the reality?",
      a: "If you arrive and the scope of work is significantly different from what was described in the post, do NOT start the task. Taking the job implies you accept the terms. Immediately use the 'Misdescribed Job' button in the Active Work section to pause the job and trigger a mediation request. Our review team will assess if a price adjustment or cancellation without penalty is warranted."
    },
    {
      q: "I feel unsafe at the job site. What should I do?",
      a: "Your safety is our absolute priority. If you ever feel uncomfortable or unsafe, leave the premises immediately. Use the 'Safety Concern' button in the platform to report the incident. This will immediately freeze the client's account pending investigation. Communication through Lingkod Hub allows us to track location and verified identities for your protection."
    },
    {
      q: "What are the penalties for canceling an accepted job?",
      a: "Accepted jobs carry a commitment. Cancellations made within 12 hours of the start time result in a ₱300 Reliability Penalty deducted from your next payout. Repeated cancellations (more than 2 within 30 days) may lead to temporary account suspension. Cancellations with valid documentation (medical, emergency) can be appealed via support."
    },
    {
      q: "When can I file a dispute?",
      a: "All disputes regarding payments or job completion must be filed within 24 hours of the job being marked as 'Done'. After this window, funds are released to the provider and the transaction is considered finalized."
    }
  ];

  return (
    <div className="max-w-[1200px] mx-auto py-16 px-12 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Help Content */}
        <div className="lg:col-span-7 flex flex-col gap-12">
          <div>
            <h1 className="text-4xl font-bold text-brand-text-main mb-4 tracking-tight">Help & Safety Protocol</h1>
            <p className="text-brand-text-variant max-w-xl font-medium">Protecting our providers is critical. Learn our safety guidelines, dispute rules, and how to handle discrepancies.</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-brand-text-main mb-6">Frequently Asked Questions</h2>
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-brand-surface-card border border-brand-outline rounded-2xl overflow-hidden shadow-sm">
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between group"
                >
                  <span className={`font-bold transition-colors ${activeFaq === i ? 'text-brand-primary' : 'text-brand-text-main group-hover:text-brand-primary'}`}>
                    {faq.q}
                  </span>
                  <ChevronRight size={18} className={`text-brand-text-variant transition-transform ${activeFaq === i ? 'rotate-90 text-brand-primary' : ''}`} />
                </button>
                {activeFaq === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-6 pb-6 text-sm text-brand-text-variant leading-relaxed font-medium"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* TOS Sidebar */}
        <div className="lg:col-span-5">
           <div className="sticky top-24 space-y-8">
              <div className="bg-brand-primary p-10 rounded-[2.5rem] text-white shadow-xl">
                <h3 className="text-[10px] font-bold uppercase tracking-widest mb-6 opacity-60">Terms Summary</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <Banknote size={16} />
                    </div>
                    <p className="text-[13px] leading-relaxed">Payments must be processed through our vault to ensure 100% dispute coverage.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <Users size={16} />
                    </div>
                    <p className="text-[13px] leading-relaxed">Direct side-agreements are grounds for immediate provider de-listing.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <AlertTriangle size={16} />
                    </div>
                    <p className="text-[13px] leading-relaxed">Disputes must be raised within the 24-hour window post-completion.</p>
                  </div>
                </div>
                <button className="w-full mt-10 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all text-sm border border-white/20">
                  Read Full Provider TOS
                </button>
              </div>

              <div className="bg-brand-surface-card border border-brand-outline p-8 rounded-[2rem] shadow-sm">
                <h4 className="text-sm font-bold text-brand-text-main mb-4">Contact Mediation</h4>
                <p className="text-xs text-brand-text-variant mb-6 leading-relaxed">Our support team is available 24/7 for emergency job sites issues. Response time: &lt;10 mins.</p>
                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-brand-surface border border-brand-outline rounded-xl font-bold text-xs hover:bg-brand-surface-card transition-all">Support Line</button>
                  <button className="flex-1 py-3 bg-brand-surface border border-brand-outline rounded-xl font-bold text-xs hover:bg-brand-surface-card transition-all">Write Mail</button>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export const ActivePostsSection = () => {
  const [viewApplicantsJob, setViewApplicantsJob] = React.useState<any>(null);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [showPostModal, setShowPostModal] = React.useState(false);
  const [showSuccessToast, setShowSuccessToast] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activePosts, setActivePosts] = React.useState<any[]>([]);

  // Form State
  const [formTitle, setFormTitle] = React.useState('');
  const [formCategory, setFormCategory] = React.useState('');
  const [formDesc, setFormDesc] = React.useState('');
  const [formLocation, setFormLocation] = React.useState('');
  const [formDate, setFormDate] = React.useState('');
  const [formIsASAP, setFormIsASAP] = React.useState(false);
  const [formBudget, setFormBudget] = React.useState('');
  const [formNegotiable, setFormNegotiable] = React.useState(false);
  const [formPayment, setFormPayment] = React.useState('Cash');
  const [formError, setFormError] = React.useState('');

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const jobs = await api.getJobs({ status: 'pending' });
      // Fetch applications for each job
      const jobsWithApps = await Promise.all(
        jobs.map(async (job: any) => {
          const apps = await api.getJobApplications(job.id);
          return { ...job, applicants: apps };
        })
      );
      setActivePosts(jobsWithApps);
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchJobs();
  }, []);

  const handleHire = async (jobId: number, applicationId: number) => {
    try {
      await api.decideApplication(applicationId, 'accepted');
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setViewApplicantsJob(null);
        setActivePosts(prev => prev.filter(job => job.id !== jobId));
      }, 2000);
    } catch (error) {
      console.error('Failed to hire', error);
    }
  };

  const calculateAvgRating = (applicants: any[]) => {
    if (applicants.length === 0) return 0;
    return 5.0; // Placeholder for now
  };

  const handlePostJob = async () => {
    if (!formTitle.trim()) {
      setFormError('Title is required');
      return;
    }
    const budgetNum = parseInt(formBudget, 10);
    if (isNaN(budgetNum) || budgetNum < 100) {
      setFormError('Price must be at least ₱100');
      return;
    }
    
    try {
      setFormError('');
      await api.createJob({
        title: formTitle,
        description: formDesc,
        location: formLocation || 'Anywhere',
        budget: budgetNum,
        is_negotiable: formNegotiable,
        payment_method: formPayment
      });
      
      fetchJobs();
      setShowPostModal(false);
      
      // Reset Form
      setFormTitle('');
      setFormCategory('');
      setFormDesc('');
      setFormLocation('');
      setFormDate('');
      setFormIsASAP(false);
      setFormBudget('');
      setFormNegotiable(false);
      setFormPayment('Cash');
      
      // Show Toast
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);
    } catch (error: any) {
      setFormError(error.message || 'Failed to post job');
    }
  };

  const handleDeletePost = async () => {
    try {
      await api.deleteJob(showDeleteModal.id);
      setActivePosts(prev => prev.filter(job => job.id !== showDeleteModal.id));
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Failed to delete job', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 md:px-12 relative w-full flex flex-col min-h-screen">
      
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-8 right-8 z-[100] bg-[#059669] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
           <CheckCircle size={20} className="text-white bg-[#047857] rounded-full p-0.5" />
           <span className="font-semibold text-sm">Task posted successfully!</span>
        </div>
      )}

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[100] flex animate-in fade-in duration-300">
           {/* Mock Confetti Animation Overlay */}
           <div className="absolute inset-0 bg-brand-primary/10 backdrop-blur-sm transition-all duration-1000"></div>
           <div className="absolute inset-0 flex items-center justify-center flex-col">
              <div className="w-24 h-24 bg-brand-surface-card rounded-full flex items-center justify-center shadow-2xl mb-6 transform scale-150 animate-bounce">
                 <CheckCircle size={48} className="text-[#059669]" />
              </div>
              <h2 className="text-4xl font-bold text-brand-text-main shadow-brand-surface-container drop-shadow-md">Worker Hired!</h2>
           </div>
        </div>
      )}

      <div className="flex justify-between items-end mb-8 border-b border-brand-outline pb-4 shrink-0">
        <div>
           <h1 className="text-3xl font-semibold text-brand-text-main mb-2">My Active Posts</h1>
           <p className="text-sm text-brand-text-variant">Manage your open requests and review applicants</p>
        </div>
        <button 
          onClick={() => setShowPostModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand-primary border border-brand-primary text-white text-sm font-semibold rounded-full hover:bg-[#059669] transition-all shadow-sm shadow-brand-primary/20"
        >
          <Plus size={18} className="text-white" />
          Post a New Task
        </button>
     </div>
     
     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 content-start">
        {isLoading ? (
          <div className="col-span-1 md:col-span-2 py-16 text-center text-brand-text-variant">Loading your posts...</div>
        ) : activePosts.map(job => (
          <div 
            key={job.id} 
            className={`bg-brand-surface-card border-2 ${job.is_urgent ? 'border-orange-500/50 shadow-orange-500/10' : 'border-brand-outline hover:border-brand-primary/50'} p-6 rounded-3xl transition-all group relative flex flex-col min-h-[320px] ${job.is_paused ? 'opacity-70 grayscale-[0.2]' : ''}`}
          >
             {/* Status Header */}
             <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col items-start gap-2">
                   <div className="flex items-center gap-2">
                      <span className="inline-block px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-bold rounded-full uppercase tracking-wider">{job.category || 'General'}</span>
                      {job.is_urgent && (
                         <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-bold rounded-full uppercase tracking-wider animate-pulse flex-shrink-0">
                            <AlertTriangle size={12} /> ASAP
                         </span>
                      )}
                   </div>
                   <span className="text-[11px] font-semibold text-brand-text-variant bg-brand-surface px-2 py-0.5 rounded-md flex items-center gap-1 border border-brand-outline">
                      {job.applicants.length === 0 ? (
                         <span className="w-1.5 h-1.5 rounded-full bg-brand-text-variant/40"></span>
                      ) : (
                         <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse"></span>
                      )}
                      {job.applicants.length === 0 ? 'No Bids Yet' : 'New Applicants'}
                   </span>
                </div>

                {/* Pause Toggle */}
                <div className="flex items-center gap-1.5">
                   <span className="text-xs font-semibold text-brand-text-variant">{job.is_paused ? 'Paused' : 'Public'}</span>
                   <button 
                     onClick={() => {
                        // Toggle pause - placeholder for now
                        setActivePosts(prev => prev.map(p => p.id === job.id ? {...p, is_paused: !p.is_paused} : p))
                     }}
                     className={`w-10 h-5 rounded-full flex items-center transition-colors px-0.5 ${job.is_paused ? 'bg-brand-outline justify-start' : 'bg-[#059669] justify-end'}`}
                   >
                     <div className="w-4 h-4 bg-brand-surface-card rounded-full shadow-sm"></div>
                   </button>
                </div>
             </div>

             <div className="mb-4">
                <h3 className={`text-xl font-bold leading-snug line-clamp-2 mb-2 ${job.is_urgent ? 'text-orange-600' : 'text-brand-text-main'}`}>
                   {job.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-text-variant bg-brand-surface border border-brand-outline py-1 px-2.5 rounded-lg inline-flex">
                   <Calendar size={14} className={job.is_urgent ? 'text-orange-500' : 'text-brand-text-variant'} />
                   <span className={job.is_urgent ? 'text-orange-600 font-bold' : ''}>{job.is_urgent ? 'ASAP' : new Date(job.created_at).toLocaleDateString()}</span>
                </div>
             </div>

             <p className="text-sm text-brand-text-variant line-clamp-2 mb-6">
                {job.description}
             </p>

             <div className="flex items-center justify-between mt-auto mb-6">
                <div className="flex items-center gap-1.5 text-brand-text-variant">
                   <MapPin size={14} />
                   <span className="text-sm font-medium">{job.location}</span>
                </div>
                <div className="text-right flex flex-col items-end">
                   <div className="text-xl font-bold text-brand-text-main">₱{job.budget?.toLocaleString()}</div>
                   {job.is_negotiable && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">Negotiable</span>
                   )}
                </div>
             </div>
             
             {/* Applicant Status & Action */}
             <div className="pt-5 border-t border-brand-outline">
                <div className="flex flex-col gap-4">
                   <div className="flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-sm font-bold text-brand-text-main">
                           {job.applicants.length} Applicant{job.applicants.length !== 1 && 's'}
                        </span>
                        {job.applicants.length > 0 && (
                           <span className="text-xs font-medium text-brand-text-variant flex items-center">
                              Avg. <Star size={10} className="fill-brand-text-variant ml-1 mr-0.5" /> {calculateAvgRating(job.applicants)} rating
                           </span>
                        )}
                     </div>
                     <button 
                        onClick={() => setViewApplicantsJob(job)}
                        disabled={job.applicants.length === 0}
                        className="px-4 py-2 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-xl font-bold text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        View Applicants
                     </button>
                   </div>
                   
                   <div className="flex gap-2">
                     <button className="flex-1 py-2 bg-brand-surface hover:bg-brand-surface-card text-brand-text-variant hover:text-brand-text-main rounded-xl font-semibold text-xs transition-colors border border-brand-outline flex items-center justify-center gap-1.5 shadow-sm">
                        <ArrowUpCircle size={14} /> Bump
                     </button>
                      <button className="flex-1 py-2 bg-brand-surface hover:bg-brand-surface-card text-brand-text-variant hover:text-brand-text-main rounded-xl font-semibold text-xs transition-colors border border-brand-outline flex items-center justify-center gap-1.5 shadow-sm">
                         Edit Details
                      </button>
                      <button 
                         onClick={() => setShowDeleteModal(job)}
                         className="flex-shrink-0 w-10 py-2 bg-brand-surface hover:bg-red-50 text-brand-text-variant hover:text-red-500 rounded-xl font-semibold text-xs transition-colors border border-brand-outline hover:border-red-200 flex items-center justify-center shadow-sm"
                         title="Delete Post"
                      >
                         <Trash2 size={14} />
                      </button>
                   </div>
                </div>
             </div>
          </div>
        ))}

        {!isLoading && activePosts.length === 0 && (
           <div className="col-span-1 md:col-span-2 py-16 flex flex-col items-center justify-center text-center bg-brand-surface-card border border-brand-outline rounded-3xl border-dashed">
              <div className="w-20 h-20 bg-brand-primary/5 rounded-full flex items-center justify-center mb-6">
                 <CheckSquare size={40} className="text-brand-primary/40" />
              </div>
              <h3 className="text-xl font-semibold text-brand-text-main mb-2">No active posts</h3>
              <p className="text-brand-text-variant text-sm max-w-sm">Tap "Post a New Task" to find workers for your needs.</p>
           </div>
        )}
     </div>

     {/* Post Modal */}
     {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           {/* Backdrop */}
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPostModal(false)}></div>
           
           {/* Modal Content */}
           <div className="relative bg-brand-surface-card w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 min-h-[500px] max-h-[90vh] flex flex-col text-left">
              {/* Header */}
              <div className="p-6 border-b border-brand-outline bg-brand-surface/50 flex justify-between items-center shrink-0">
                 <h3 className="text-xl font-bold text-brand-text-main">Post a New Task</h3>
                 <button 
                  onClick={() => setShowPostModal(false)}
                  className="p-2 text-brand-text-variant hover:text-brand-text-main hover:bg-brand-outline/50 rounded-full transition-colors bg-brand-surface shadow-sm border border-brand-outline"
                 >
                    <X size={20} />
                 </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex-1 bg-brand-surface flex flex-col gap-8">
                 {/* Section A: The Basics */}
                 <section>
                    <h4 className="text-sm font-bold text-brand-text-variant uppercase tracking-wider mb-4 border-b border-brand-outline pb-2">Section A: The Basics</h4>
                    <div className="flex flex-col gap-4">
                       <div>
                          <label className="block text-sm font-semibold text-brand-text-main mb-1.5">Job Title</label>
                          <input 
                             type="text" 
                             value={formTitle}
                             onChange={(e) => setFormTitle(e.target.value)}
                             placeholder="e.g., Need a Plumber for Kitchen Sink" 
                             className={`w-full p-3 rounded-xl border-2 hover:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 shadow-sm transition-all font-medium ${formError.includes('Title') ? 'border-red-400 focus:border-red-500 hover:border-red-400/50' : 'border-brand-outline focus:border-brand-primary'} text-sm text-brand-text-main placeholder:text-brand-text-variant/50 focus:outline-none`}
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-semibold text-brand-text-main mb-1.5">Category</label>
                          <div className="relative">
                             <select 
                                value={formCategory}
                                onChange={(e) => setFormCategory(e.target.value)}
                                className="w-full p-3 rounded-xl border-2 hover:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 shadow-sm transition-all font-medium border-brand-outline text-sm text-brand-text-main bg-brand-surface focus:outline-none focus:border-brand-primary appearance-none cursor-pointer"
                             >
                                <option value="" disabled>Select a category</option>
                                <option value="Cleaning">Cleaning</option>
                                <option value="Repair">Repair</option>
                                <option value="Plumbing">Plumbing</option>
                                <option value="Electrical">Electrical</option>
                                <option value="Tutoring">Tutoring</option>
                                <option value="General">General</option>
                             </select>
                             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-text-variant">
                                <ChevronRight size={16} className="transform rotate-90" />
                             </div>
                          </div>
                       </div>
                       <div>
                          <label className="block text-sm font-semibold text-brand-text-main mb-1.5">Description</label>
                          <textarea 
                             value={formDesc}
                             onChange={(e) => setFormDesc(e.target.value)}
                             placeholder="The sink has been leaking since last night..." 
                             className="w-full p-3 rounded-xl border-2 hover:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 shadow-sm transition-all border-brand-outline text-sm text-brand-text-main placeholder:text-brand-text-variant/50 focus:outline-none focus:border-brand-primary resize-none h-24"
                          />
                       </div>
                    </div>
                 </section>

                 {/* Section B: Logistics */}
                 <section>
                    <h4 className="text-sm font-bold text-brand-text-variant uppercase tracking-wider mb-4 border-b border-brand-outline pb-2">Section B: Logistics</h4>
                    <div className="flex flex-col gap-4">
                       <div>
                          <label className="block text-sm font-semibold text-brand-text-main mb-1.5">Location</label>
                          <input 
                             type="text" 
                             value={formLocation}
                             onChange={(e) => setFormLocation(e.target.value)}
                             placeholder="e.g., Barangay Paliparan, Dasmariñas" 
                             className="w-full p-3 rounded-xl border-2 hover:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 shadow-sm transition-all font-medium border-brand-outline text-sm text-brand-text-main placeholder:text-brand-text-variant/50 focus:outline-none focus:border-brand-primary"
                          />
                       </div>
                       <div className="flex gap-4 items-start">
                          <div className="flex-1">
                             <label className="block text-sm font-semibold text-brand-text-main mb-1.5">Scheduled Date & Time</label>
                             <input 
                                type="datetime-local" 
                                value={formDate}
                                onChange={(e) => setFormDate(e.target.value)}
                                disabled={formIsASAP}
                                className="w-full p-3 rounded-xl border-2 hover:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 shadow-sm transition-all font-medium border-brand-outline text-sm text-brand-text-main bg-brand-surface focus:outline-none focus:border-brand-primary disabled:opacity-50 disabled:bg-gray-100"
                             />
                          </div>
                          <div className="flex flex-col items-center pt-8">
                             <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-10 h-5 rounded-full flex items-center transition-colors px-0.5 ${formIsASAP ? 'bg-orange-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                                   <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                </div>
                                <span className={`text-sm font-bold ${formIsASAP ? 'text-orange-600' : 'text-brand-text-main'} select-none group-hover:text-orange-600 transition-colors`}>Post as ASAP</span>
                                <input 
                                   type="checkbox" 
                                   checked={formIsASAP} 
                                   onChange={(e) => setFormIsASAP(e.target.checked)} 
                                   className="hidden" 
                                />
                             </label>
                          </div>
                       </div>
                    </div>
                 </section>

                 {/* Section C: Compensation */}
                 <section>
                    <h4 className="text-sm font-bold text-brand-text-variant uppercase tracking-wider mb-4 border-b border-brand-outline pb-2">Section C: Compensation</h4>
                    <div className="flex flex-col gap-6">
                       <div className="flex items-end gap-6">
                          <div className="flex-1">
                             <label className="block text-sm font-semibold text-brand-text-main mb-1.5">Budget (₱)</label>
                             <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-brand-text-main">₱</span>
                                <input 
                                   type="number" 
                                   value={formBudget}
                                   onChange={(e) => setFormBudget(e.target.value)}
                                   placeholder="e.g., 500" 
                                   className={`w-full p-3 pl-8 rounded-xl border-2 hover:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 shadow-sm transition-all font-medium ${formError.includes('Price') ? 'border-red-400 focus:border-red-500 hover:border-red-400/50' : 'border-brand-outline focus:border-brand-primary'} text-sm text-brand-text-main placeholder:text-brand-text-variant/50 focus:outline-none`}
                                />
                             </div>
                          </div>
                          <div className="flex-1 pb-3">
                             <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border ${formNegotiable ? 'bg-[#059669] border-[#059669]' : 'bg-white border-brand-outline group-hover:border-brand-primary'} flex items-center justify-center transition-colors`}>
                                   {formNegotiable && <CheckCircle size={14} className="text-white" />}
                                </div>
                                <span className="text-sm font-semibold text-brand-text-main select-none group-hover:text-brand-primary transition-colors">Negotiable</span>
                                <input 
                                   type="checkbox" 
                                   checked={formNegotiable} 
                                   onChange={(e) => setFormNegotiable(e.target.checked)} 
                                   className="hidden" 
                                />
                             </label>
                          </div>
                       </div>
                       
                       <div>
                          <label className="block text-sm font-semibold text-brand-text-main mb-3">Preferred Payment Method</label>
                          <div className="flex gap-4">
                             <label className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${formPayment === 'Cash' ? 'border-green-500 bg-green-50/50' : 'border-brand-outline hover:border-green-200'}`}>
                                <input 
                                   type="radio" 
                                   name="payment" 
                                   value="Cash" 
                                   checked={formPayment === 'Cash'} 
                                   onChange={() => setFormPayment('Cash')} 
                                   className="hidden" 
                                />
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${formPayment === 'Cash' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-brand-surface-container text-brand-text-variant'}`}>
                                   <Banknote size={24} />
                                </div>
                                <span className={`font-bold ${formPayment === 'Cash' ? 'text-brand-primary' : 'text-brand-text-variant'}`}>💵 Cash</span>
                             </label>
                             <label className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${formPayment === 'GCash' ? 'border-blue-500 bg-blue-50/50' : 'border-brand-outline hover:border-blue-200'}`}>
                                <input 
                                   type="radio" 
                                   name="payment" 
                                   value="GCash" 
                                   checked={formPayment === 'GCash'} 
                                   onChange={() => setFormPayment('GCash')} 
                                   className="hidden" 
                                />
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${formPayment === 'GCash' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-brand-surface-container text-brand-text-variant'}`}>
                                   <Smartphone size={24} />
                                </div>
                                <span className={`font-bold ${formPayment === 'GCash' ? 'text-brand-primary' : 'text-brand-text-variant'}`}>📱 GCash</span>
                             </label>
                          </div>
                       </div>
                    </div>
                 </section>

                 {formError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-sm font-semibold flex items-center gap-2">
                       <AlertTriangle size={16} />
                       {formError}
                    </div>
                 )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-brand-outline bg-brand-surface/50 flex justify-end gap-3 shrink-0">
                 <button 
                  onClick={() => setShowPostModal(false)}
                  className="px-6 py-2.5 text-sm font-semibold text-brand-text-variant hover:text-brand-text-main transition-colors"
                 >
                    Cancel
                 </button>
                 <button 
                  onClick={handlePostJob}
                  className="px-8 py-2.5 bg-brand-primary text-white text-sm font-semibold hover:bg-[#059669] transition-all shadow-md rounded-xl active:scale-95"
                 >
                    Post Job
                 </button>
              </div>
           </div>
        </div>
     )}

     {/* Delete Post Modal */}
     {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(null)}></div>
           <div className="relative bg-brand-surface-card w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-8 text-center flex flex-col items-center">
                 <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                    <Trash2 size={32} />
                 </div>
                 <h3 className="text-2xl font-bold text-brand-text-main mb-4">Delete Post?</h3>
                 <p className="text-brand-text-variant mb-8 text-sm leading-relaxed">
                    Are you sure you want to delete the post <strong>"{showDeleteModal.title}"</strong>? This will also remove any active applicants. This action cannot be undone.
                 </p>
                 
                 <div className="flex w-full gap-3">
                    <button 
                       onClick={() => setShowDeleteModal(null)}
                       className="flex-1 py-3.5 bg-brand-surface border border-brand-outline text-brand-text-main rounded-xl font-semibold text-sm hover:bg-brand-surface-card transition-colors active:scale-[0.98]"
                    >
                       Cancel
                    </button>
                    <button 
                       onClick={handleDeletePost}
                       className="flex-1 py-3.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-sm active:scale-[0.98]"
                    >
                       Delete Post
                    </button>
                 </div>
              </div>
           </div>
        </div>
     )}

     {/* View Applicants Modal */}
     {viewApplicantsJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           {/* Backdrop */}
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewApplicantsJob(null)}></div>
           
           {/* Modal Content */}
           <div className="relative bg-brand-surface-card w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 min-h-[500px] max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-brand-outline bg-brand-surface/50 flex justify-between items-center shrink-0">
                 <div>
                    <h3 className="text-xl font-bold text-brand-text-main leading-tight mb-1">Applicants for: {viewApplicantsJob.title}</h3>
                    <p className="text-sm font-medium text-brand-text-variant flex items-center gap-2">
                       <span className="flex items-center gap-1"><MapPin size={12}/> {viewApplicantsJob.location}</span>
                       <span className="text-brand-outline">|</span>
                       <span className="font-bold text-brand-text-main">Budget: ₱{viewApplicantsJob.price}</span>
                    </p>
                 </div>
                 <button 
                  onClick={() => setViewApplicantsJob(null)}
                  className="p-2 text-brand-text-variant hover:text-brand-text-main hover:bg-brand-outline/50 rounded-full transition-colors bg-brand-surface shadow-sm border border-brand-outline"
                 >
                    <X size={20} />
                 </button>
              </div>

              {/* Body: Applicant List */}
              <div className="p-6 overflow-y-auto flex-1 bg-brand-surface">
                 <div className="flex flex-col gap-4">
                    {viewApplicantsJob.applicants.map((applicant: any) => (
                       <div key={applicant.id} className="bg-brand-surface-card border border-brand-outline rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                          
                          {/* Trust Stats & Info */}
                          <div className="flex flex-col sm:flex-row gap-5 mb-4 items-start sm:items-center">
                             <img src={applicant.avatar_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&h=100&auto=format&fit=crop"} alt={applicant.full_name} className="w-16 h-16 rounded-full object-cover border border-brand-outline shadow-sm" />
                             <div className="flex-1">
                                <h4 className="text-lg font-bold text-brand-text-main mb-1">{applicant.full_name}</h4>
                                <div className="flex items-center gap-3">
                                   <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                                      <Star size={14} className="fill-amber-400 text-amber-400" />
                                      <span className="text-sm font-bold text-amber-700">{applicant.rating || 5.0}</span>
                                   </div>
                                   <span className="text-xs font-semibold text-brand-text-variant">@{applicant.username}</span>
                                </div>
                             </div>
                             <div className="text-left sm:text-right w-full sm:w-auto bg-brand-surface sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none">
                                <span className="text-xs font-semibold text-brand-text-variant block mb-0.5">Project Budget</span>
                                <span className="text-xl font-bold text-[#059669]">₱{viewApplicantsJob.budget?.toLocaleString()}</span>
                             </div>
                          </div>

                          {/* Message/Proposal */}
                          <div className="bg-brand-surface p-4 rounded-xl border border-brand-outline mb-5 relative">
                             <div className="absolute top-0 left-6 -mt-1.5 w-3 h-3 bg-brand-surface border-t border-l border-brand-outline transform rotate-45"></div>
                             <p className="text-sm text-brand-text-main italic font-medium">"{applicant.message || 'No message provided.'}"</p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-1">
                             <button className="flex-1 py-3 bg-brand-surface hover:bg-brand-surface-card border border-brand-outline text-brand-text-main rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm group-hover:border-brand-primary/30">
                                <MessageCircle size={18} className="text-brand-primary" />
                                Pre-Hire Chat
                             </button>
                             <button 
                                onClick={() => handleHire(viewApplicantsJob.id, applicant.id)}
                                className="flex-1 py-3 bg-[#059669] hover:bg-[#047857] text-white rounded-xl font-bold text-sm transition-all shadow-sm shadow-[#059669]/20 flex items-center justify-center gap-2 active:scale-95"
                             >
                                <CheckCircle size={18} />
                                Accept & Hire
                             </button>
                          </div>
                          
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export const OngoingTasksSection = () => {
  const [showCompletionModal, setShowCompletionModal] = React.useState<any>(null);
  const [showCancelModal, setShowCancelModal] = React.useState<any>(null);
  const [showReportModal, setShowReportModal] = React.useState<any>(null);
  const [activeTasks, setActiveTasks] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    api.getJobs({ status: 'in_progress' })
      .then((jobs) => {
        // Only show jobs where a provider has actually been hired
        const hiredJobs = jobs.filter((task: any) => task.provider_id !== null);
        setActiveTasks(hiredJobs);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const completeTask = async (jobId: number) => {
    try {
      await api.updateJobStatus(jobId, 'completed');
      setActiveTasks((prev) => prev.filter((task) => task.id !== jobId));
      setShowCompletionModal(null);
    } catch (error) {
      console.error('Failed to complete task', error);
    }
  };

  const cancelTask = async (jobId: number) => {
    try {
      await api.updateJobStatus(jobId, 'cancelled');
      setActiveTasks((prev) => prev.filter((task) => task.id !== jobId));
      setShowCancelModal(null);
    } catch (error) {
      console.error('Failed to cancel task', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-12 w-full flex flex-col min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 border-b border-brand-outline pb-4 shrink-0">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-semibold text-brand-text-main">Tasks in Progress</h1>
              <div className="flex items-center justify-center bg-brand-primary/10 text-brand-primary font-bold text-xs px-3 py-1 rounded-full border border-brand-primary/20">
                {activeTasks.length} Active
              </div>
           </div>
           <p className="text-sm text-brand-text-variant">Manage your hired workers and track progress</p>
        </div>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-6 flex-1">
        {isLoading ? (
           <div className="flex flex-col items-center justify-center bg-brand-surface-card border border-brand-outline rounded-3xl p-16 text-center shadow-sm h-full max-h-[400px]">
              <p className="text-brand-text-variant text-sm">Loading tasks...</p>
           </div>
        ) : activeTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-brand-surface-card border border-brand-outline rounded-3xl p-16 text-center shadow-sm h-full max-h-[400px]">
               <div className="w-24 h-24 bg-brand-primary/5 rounded-full flex items-center justify-center mb-6">
                  <Clock size={48} className="text-brand-primary/40" />
               </div>
               <h3 className="text-xl font-semibold text-brand-text-main mb-2">No tasks currently in progress.</h3>
               <p className="text-brand-text-variant text-sm max-w-sm">Find a worker in the Search tab!</p>
            </div>
         ) : (
           activeTasks.map((task) => (
               <div key={task.id} className="bg-brand-surface-card border border-brand-outline rounded-2xl shadow-md overflow-hidden flex flex-col group">
                  <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-start gap-6 relative">
                     {/* Financial Info (Right Side/Top on mobile) */}
                     <div className="md:absolute md:top-8 md:right-8 flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2 w-full md:w-auto mb-4 md:mb-0">
                       <span className="text-xl font-bold text-[#059669]">₱{Number(task.budget || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        {String(task.payment_method || '').toLowerCase() === 'gcash' ? (
                           <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              <Smartphone size={10} /> GCash
                           </span>
                        ) : (
                           <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              <Banknote size={10} /> Cash
                           </span>
                        )}
                     </div>

                     {/* Worker Profile (Left Side) */}
                     <div className="flex flex-col items-center shrink-0 w-24">
                       <img src={task.provider_avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&h=100&auto=format&fit=crop"} alt={task.provider_name || 'Provider'} className="w-20 h-20 rounded-full object-cover border-2 border-brand-outline mb-3 shadow-sm" />
                     </div>

                     {/* Job Context (Center) */}
                     <div className="flex-1 text-center md:text-left pt-1">
                        <h3 className="text-2xl font-bold text-brand-text-main mb-3 leading-tight pr-0 md:pr-40">{task.title}</h3>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                           <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border border-brand-primary/10 shrink-0">
                              {task.category}
                           </span>
                           <span className="hidden md:inline-block w-1 h-1 rounded-full bg-brand-text-variant/40 shrink-0"></span>
                           <span className="text-sm font-bold text-brand-text-main">{task.provider_name || 'Assigned provider'}</span>
                           <span className="inline-block w-1 h-1 rounded-full bg-brand-text-variant/40 shrink-0"></span>
                           <span className="flex items-center text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 shrink-0">
                              <Star size={12} className="fill-amber-400 text-amber-500 mr-1.5" />
                              {task.rating}
                           </span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-2 w-full pt-4 border-t border-brand-outline">
                           <button 
                              onClick={() => alert(`Worker phone: ${task.provider_phone || 'No phone available'}`)}
                              className="relative flex items-center gap-2 px-6 py-2.5 bg-brand-surface border border-brand-outline rounded-xl hover:bg-brand-surface-card transition-colors shadow-sm font-semibold text-brand-text-main text-sm w-full md:w-auto justify-center"
                           >
                              <Phone size={18} className="text-brand-primary" />
                              Call Worker
                              {task.is_read === 0 && (
                                 <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-primary rounded-full border-2 border-brand-surface-card shadow-sm animate-pulse"></span>
                              )}
                           </button>

                           <div className="flex items-center justify-center md:justify-end gap-2 w-full md:w-auto">
                              <div className="hidden lg:flex flex-col items-end mr-4 max-w-[150px]">
                                <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wider mb-0.5">Payment Protection</p>
                                <p className="text-[9px] text-brand-text-variant text-right leading-tight">Pay through the platform to keep your 24h dispute window open.</p>
                              </div>
                              <button 
                                 onClick={() => setShowCancelModal(task)}
                                 className="px-4 py-2 text-xs font-semibold text-brand-text-variant hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100 flex items-center gap-1.5"
                              >
                                 <X size={14} /> Cancel
                              </button>
                              <button 
                                 onClick={() => setShowReportModal(task)}
                                 className="px-4 py-2 text-xs font-semibold text-brand-text-variant hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors border border-transparent hover:border-orange-100 flex items-center gap-1.5"
                              >
                                 <AlertTriangle size={14} /> Report
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  {/* Completion Button */}
                  <button 
                        onClick={() => setShowCompletionModal(task)}
                     className="w-full bg-[#059669]/5 hover:bg-[#059669]/10 text-[#059669] font-bold py-4 text-sm transition-colors border-t border-[#059669]/10 flex items-center justify-center gap-2"
                  >
                     <CheckCircle size={18} />
                     Mark as Completed
                  </button>
               </div>
            ))
         )}
      </div>

      {/* Confirmation Modal */}
      {showCompletionModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCompletionModal(null)}></div>
            <div className="relative bg-brand-surface-card w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
               <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#059669]/10 text-[#059669] rounded-full flex items-center justify-center mx-auto mb-6">
                     <CheckCircle size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-brand-text-main mb-4">Job finished?</h3>
                  <p className="text-brand-text-variant mb-8 text-sm leading-relaxed">
                     Confirm you have settled the payment of <strong className="text-brand-text-main font-bold">₱{Number(showCompletionModal.budget || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> via <strong className="text-brand-text-main font-bold">{showCompletionModal.payment_method || 'cash'}</strong> to <strong className="text-brand-text-main font-bold">{showCompletionModal.provider_name || 'Assigned provider'}</strong>.
                  </p>
                  
                  <div className="flex flex-col gap-3">
                     <button 
                        onClick={() => completeTask(showCompletionModal.id)}
                        className="w-full py-3.5 bg-[#059669] text-white rounded-xl font-bold text-sm hover:bg-[#047857] transition-all shadow-sm active:scale-[0.98]"
                     >
                        Confirm & Archive
                     </button>
                     <button 
                        onClick={() => setShowCompletionModal(null)}
                        className="w-full py-3.5 bg-brand-surface border border-brand-outline text-brand-text-main rounded-xl font-semibold text-sm hover:bg-brand-surface-card transition-colors active:scale-[0.98]"
                     >
                        Cancel
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Cancel Task Modal */}
      {showCancelModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCancelModal(null)}></div>
            <div className="relative bg-brand-surface-card w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
               <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                     <X size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-brand-text-main mb-4">Cancel Task?</h3>
                  <p className="text-brand-text-variant mb-6 text-sm leading-relaxed">
                     Are you sure you want to cancel the task <strong>"{showCancelModal.title}"</strong> with <strong>{showCancelModal.provider_name || 'assigned provider'}</strong>? This action cannot be undone.
                  </p>
                  
                  <textarea 
                     placeholder="Reason for cancellation (optional)" 
                     className="w-full p-3 rounded-xl border-2 hover:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 shadow-sm transition-all font-medium border-brand-outline mb-6 text-sm text-brand-text-main placeholder:text-brand-text-variant/50 focus:border-red-300 focus:outline-none resize-none h-24"
                  />

                  <div className="flex w-full gap-3">
                     <button 
                        onClick={() => cancelTask(showCancelModal.id)}
                        className="flex-1 py-3.5 bg-brand-surface border border-brand-outline text-brand-text-main rounded-xl font-semibold text-sm hover:bg-brand-surface-card transition-colors active:scale-[0.98]"
                     >
                        Keep Task
                     </button>
                     <button 
                        onClick={() => setShowCancelModal(null)}
                        className="flex-1 py-3.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-sm active:scale-[0.98]"
                     >
                        Cancel Task
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Report Worker Modal */}
      {showReportModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowReportModal(null)}></div>
            <div className="relative bg-brand-surface-card w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left">
               <div className="p-6 border-b border-brand-outline flex justify-between items-center bg-brand-surface/50">
                 <h3 className="text-lg font-bold text-brand-text-main flex items-center gap-2">
                    <AlertTriangle size={18} className="text-orange-500" /> Report Issue
                 </h3>
                 <button 
                  onClick={() => setShowReportModal(null)}
                  className="p-1.5 text-brand-text-variant hover:text-brand-text-main hover:bg-brand-outline/50 rounded-full transition-colors"
                 >
                    <X size={18} />
                 </button>
              </div>

               <div className="p-6">
                  <p className="text-brand-text-variant mb-6 text-sm leading-relaxed">
                     Please provide details about your issue with <strong>{showReportModal.provider_name || 'assigned provider'}</strong>. Our trust and safety team will investigate this immediately.
                  </p>

                  <div className="flex flex-col gap-4 mb-6">
                     <label className="flex items-start gap-3 p-3 rounded-xl border border-brand-outline hover:border-orange-200 hover:bg-orange-50/30 cursor-pointer transition-colors group">
                        <input type="radio" name="report_reason" className="mt-1 flex-shrink-0 text-orange-500" />
                        <div>
                           <span className="block text-sm font-semibold text-brand-text-main group-hover:text-orange-700">Worker never showed up</span>
                           <span className="block text-xs text-brand-text-variant mt-0.5">They missed the scheduled date and time.</span>
                        </div>
                     </label>
                     <label className="flex items-start gap-3 p-3 rounded-xl border border-brand-outline hover:border-orange-200 hover:bg-orange-50/30 cursor-pointer transition-colors group">
                        <input type="radio" name="report_reason" className="mt-1 flex-shrink-0 text-orange-500" />
                        <div>
                           <span className="block text-sm font-semibold text-brand-text-main group-hover:text-orange-700">Incomplete or poor work</span>
                           <span className="block text-xs text-brand-text-variant mt-0.5">The job was not performed to an acceptable standard.</span>
                        </div>
                     </label>
                     <label className="flex items-start gap-3 p-3 rounded-xl border border-brand-outline hover:border-orange-200 hover:bg-orange-50/30 cursor-pointer transition-colors group">
                        <input type="radio" name="report_reason" className="mt-1 flex-shrink-0 text-orange-500" />
                        <div>
                           <span className="block text-sm font-semibold text-brand-text-main group-hover:text-orange-700">Inappropriate behavior</span>
                           <span className="block text-xs text-brand-text-variant mt-0.5">Unacceptable conduct, language, or harassment.</span>
                        </div>
                     </label>
                  </div>
                  
                  <textarea 
                     placeholder="Additional details (required)" 
                     className="w-full p-3 rounded-xl border-2 hover:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 shadow-sm transition-all font-medium border-brand-outline mb-6 text-sm text-brand-text-main placeholder:text-brand-text-variant/50 focus:border-orange-300 focus:outline-none resize-none h-24"
                  />

                  <div className="flex justify-end gap-3">
                     <button 
                        onClick={() => setShowReportModal(null)}
                        className="px-5 py-2.5 bg-brand-surface text-brand-text-main rounded-xl font-semibold text-sm hover:bg-brand-surface-card transition-colors active:scale-[0.98]"
                     >
                        Cancel
                     </button>
                     <button 
                        onClick={() => setShowReportModal(null)}
                        className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all shadow-sm active:scale-[0.98]"
                     >
                        Submit Report
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export const HistorySection = () => {
  const [selectedJob, setSelectedJob] = React.useState<any>(null);
  const [history, setHistory] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([api.getMe(), api.getJobsByView('history')])
      .then(([me, jobs]) => {
        const mapped = jobs.map((job: any) => ({
          ...job,
          date: new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }),
          worker: me.role === 'provider' ? job.client_name : job.provider_name,
          workerAvatar: me.role === 'provider' ? job.client_avatar : job.provider_avatar,
          amount: Number(job.budget || 0),
          paymentMethod: job.payment_method || 'cash',
          status: job.status === 'completed' ? 'Completed' : 'Cancelled',
          description: job.description || '',
          review: '',
          workerPhone: job.client_phone || '',
        }));
        setHistory(mapped);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-12 px-12 w-full flex flex-col h-[calc(100vh-80px)]">
      {/* 1. The Summary Bar (Header) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 shrink-0">
        <div className="flex items-center gap-8">
           <div>
              <p className="text-sm text-brand-text-variant font-medium mb-1">Total Spent</p>
              <h2 className="text-3xl font-bold text-brand-text-main tracking-tight">₱12,450</h2>
           </div>
           
           <div className="w-px h-12 bg-brand-outline hidden md:block"></div>
           
           <div>
              <p className="text-sm text-brand-text-variant font-medium mb-1">Tasks Completed</p>
              <h2 className="text-2xl font-semibold text-brand-text-main">14 <span className="text-base font-normal text-brand-text-variant ml-1">Jobs</span></h2>
           </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="flex items-center bg-brand-surface border-2 border-brand-outline rounded-full px-4 py-2 flex-1 md:w-64 focus-within:border-brand-primary focus-within:ring-4 focus-within:ring-brand-primary/10 shadow-sm hover:border-brand-primary/50 transition-all">
              <Search className="text-brand-text-variant mr-2 shrink-0" size={16} />
              <input 
                 type="text" 
                 placeholder="Search by worker or service..." 
                 className="bg-transparent border-none outline-none text-sm w-full text-brand-text-main placeholder:text-brand-text-variant"
              />
           </div>
           <button className="flex items-center gap-2 px-4 py-2 border border-brand-outline rounded-full bg-brand-surface hover:bg-brand-surface-card transition-colors text-sm font-medium text-brand-text-main shrink-0">
             <Filter size={14} className="text-brand-text-variant" />
             <span className="hidden sm:inline">Filter</span>
           </button>
        </div>
      </div>

      {/* 2. The Transaction Table (Main Content) */}
      <div className="bg-brand-surface-card border border-brand-outline rounded-3xl overflow-hidden shadow-sm flex flex-col flex-1 min-h-0">
        {isLoading ? (
           <div className="flex flex-col items-center justify-center p-12 text-center h-full flex-1">
              <p className="text-brand-text-variant text-sm">Loading history...</p>
           </div>
        ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full flex-1">
               <div className="w-24 h-24 bg-brand-primary/5 rounded-full flex items-center justify-center mb-6">
                  <History size={48} className="text-brand-primary/40" />
               </div>
               <h3 className="text-xl font-semibold text-brand-text-main mb-2">No history found</h3>
               <p className="text-brand-text-variant text-sm max-w-sm">Once you complete a task, your records will appear here!</p>
            </div>
         ) : (
            <div className="overflow-y-auto w-full">
               <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead className="sticky top-0 bg-brand-surface-card z-10 shadow-sm border-b border-brand-outline">
                     <tr>
                        <th className="px-6 py-4 text-[11px] font-bold text-brand-text-variant uppercase tracking-wider">Date Completed</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-brand-text-variant uppercase tracking-wider">Service & Worker</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-brand-text-variant uppercase tracking-wider text-center">Total Paid</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-brand-text-variant uppercase tracking-wider text-center">Payment Method</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-brand-text-variant uppercase tracking-wider text-right">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-outline/50">
                    {history.map((job, idx) => (
                        <tr 
                          key={job.id} 
                          className={`hover:bg-brand-primary/5 cursor-pointer transition-colors ${idx % 2 === 0 ? 'bg-transparent' : 'bg-brand-surface/30'}`}
                          onClick={() => setSelectedJob(job)}
                        >
                           <td className="px-6 py-5 whitespace-nowrap">
                              <span className="text-xs font-medium text-brand-text-variant flex items-center gap-1.5"><Calendar size={12} className="opacity-70" /> {job.date}</span>
                           </td>
                           <td className="px-6 py-5">
                              <p className="text-sm font-semibold text-brand-text-main mb-1.5">{job.title}</p>
                              <div className="flex items-center gap-2">
                                 <img src={job.workerAvatar} alt={job.worker} className="w-5 h-5 rounded-full object-cover border border-brand-outline shrink-0" />
                                 <p className="text-[11px] text-brand-text-variant flex items-center">
                                    <span className="font-medium mr-1.5 line-clamp-1">Hired: {job.worker}</span>
                                    {job.rating > 0 && (
                                       <span className="flex items-center text-amber-400 shrink-0">
                                          <span className="text-brand-text-variant mx-1.5">•</span>
                                          {[...Array(job.rating)].map((_, i) => <Star key={i} size={8} className="fill-current" />)}
                                       </span>
                                    )}
                                 </p>
                              </div>
                           </td>
                           <td className="px-6 py-5 whitespace-nowrap text-center text-brand-text-main font-bold text-sm">
                              ₱{job.amount.toFixed(2)}
                           </td>
                           <td className="px-6 py-5 whitespace-nowrap text-center">
                              {job.paymentMethod === 'GCash' ? (
                                 <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    <Smartphone size={10} /> GCash
                                 </span>
                              ) : (
                                 <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    <Banknote size={10} /> Cash
                                 </span>
                              )}
                           </td>
                           <td className="px-6 py-5 whitespace-nowrap text-right">
                              {job.status === 'Completed' ? (
                                 <span className="inline-flex items-center px-3 py-1 bg-[#059669]/10 text-[#059669] rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    Completed
                                 </span>
                              ) : (
                                 <span className="inline-flex items-center px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    Cancelled
                                 </span>
                              )}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}

         {/* Pagination */}
        {history.length > 0 && (
           <div className="flex items-center justify-between px-6 py-3 border-t border-brand-outline mt-auto bg-brand-surface shrink-0">
            <p className="text-xs text-brand-text-variant font-medium">Showing {history.length} jobs</p>
             <div className="flex items-center gap-2">
                <button className="flex items-center justify-center p-1.5 rounded-md border border-brand-outline text-brand-text-variant hover:text-brand-text-main hover:bg-brand-surface-card disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronLeft size={14} />
                </button>
                <button className="flex items-center justify-center p-1.5 rounded-md border border-brand-outline text-brand-text-variant hover:text-brand-text-main hover:bg-brand-surface-card disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronRight size={14} />
                </button>
             </div>
           </div>
         )}
      </div>

      {/* 3. Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           {/* Backdrop */}
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedJob(null)}></div>
           
           {/* Modal Content */}
           <div className="relative bg-brand-surface-card w-full max-w-lg rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-brand-outline flex justify-between items-center bg-brand-surface/50">
                 <h3 className="text-base font-semibold text-brand-text-main">Job Details</h3>
                 <button 
                  onClick={() => setSelectedJob(null)}
                  className="p-1.5 text-brand-text-variant hover:text-brand-text-main hover:bg-brand-outline/50 rounded-full transition-colors"
                 >
                    <X size={18} />
                 </button>
              </div>

              <div className="p-6 max-h-[80vh] overflow-y-auto">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                       <h4 className="text-xl font-bold text-brand-text-main mb-1">{selectedJob.title}</h4>
                       <p className="text-xs text-brand-text-variant flex items-center gap-1.5"><Calendar size={12} className="opacity-70" /> Completed on {selectedJob.date}</p>
                    </div>
                    <div className="text-right">
                       <span className="text-lg font-bold text-brand-text-main block">₱{selectedJob.amount.toFixed(2)}</span>
                       <span className="text-[10px] text-brand-text-variant font-bold uppercase tracking-wider">{selectedJob.paymentMethod} Payment</span>
                    </div>
                 </div>

                 <div className="mb-6">
                    <h5 className="text-[10px] font-bold text-brand-text-variant uppercase tracking-wider mb-2">Original Request</h5>
                    <div className="bg-brand-surface p-4 rounded-2xl border border-brand-outline">
                       <p className="text-sm text-brand-text-main leading-relaxed">{selectedJob.description}</p>
                    </div>
                 </div>

                 {selectedJob.review && (
                    <div className="mb-6">
                       <h5 className="text-[10px] font-bold text-brand-text-variant uppercase tracking-wider mb-2">Your Review</h5>
                       <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                          <div className="flex items-center gap-1 mb-2 text-amber-400">
                            {[...Array(selectedJob.rating)].map((_, i) => <Star key={i} size={12} className="fill-current" />)}
                          </div>
                          <p className="text-sm text-amber-900 leading-relaxed italic">"{selectedJob.review}"</p>
                       </div>
                    </div>
                 )}

                 <div className="border-t border-brand-outline pt-6">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <img src={selectedJob.workerAvatar} alt={selectedJob.worker} className="w-10 h-10 rounded-full object-cover border border-brand-outline" />
                          <div>
                             <h5 className="text-sm font-semibold text-brand-text-main">{selectedJob.worker}</h5>
                             <p className="text-xs text-brand-text-variant flex items-center gap-1.5 mt-0.5"><Phone size={10} /> {selectedJob.workerPhone}</p>
                          </div>
                       </div>
                       
                       {selectedJob.status === 'Completed' && (
                         <button className="px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded-full hover:bg-[#059669] transition-colors shadow-sm active:scale-95 duration-200">
                            Hire Again
                         </button>
                       )}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export const HomeDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [locationQuery, setLocationQuery] = React.useState('Dasmariñas City');
  
  const [activeJobs, setActiveJobs] = React.useState<any[]>([]);
  const [ongoingJobs, setOngoingJobs] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [hasSearched, setHasSearched] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  React.useEffect(() => {
    Promise.all([
      api.getJobs({ status: 'pending' }),
      api.getJobs({ status: 'in_progress' })
    ]).then(([pending, ongoing]) => {
      setActiveJobs(pending);
      // Ensure ongoing jobs have a provider assigned (meaning someone was hired)
      setOngoingJobs(ongoing.filter((j: any) => j.provider_id !== null));
    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  const handleSearch = (overrideQuery?: string) => {
    const q = overrideQuery !== undefined ? overrideQuery : searchQuery;
    if (!q.trim() && !locationQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    api.getProviders({ q, location: locationQuery }).then(providers => {
      setSearchResults(providers);
    }).catch(console.error).finally(() => setIsSearching(false));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="flex flex-col h-full px-12 py-8 gap-8 max-w-[1400px] mx-auto w-full">
      {/* Search Section (Full Width Now) */}
      <div className="flex flex-col gap-5 w-full mb-4">
         <div className="flex items-center bg-brand-surface-card border-2 border-brand-outline rounded-[2.5rem] p-1.5 shadow-sm hover:shadow-md hover:border-brand-primary/50 focus-within:border-brand-primary focus-within:ring-4 focus-within:ring-brand-primary/10 transition-all w-full">
            <div className="flex-[1.5] flex items-center relative pl-6">
              <Search className="text-brand-text-variant shrink-0" size={20} />
              <input 
                id="main-search-input"
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="What do you need help with today?" 
                className="w-full bg-transparent py-4 pl-4 pr-4 text-sm tracking-wide text-brand-text-main focus:outline-none placeholder:text-brand-text-variant"
              />
            </div>

            <div className="w-px h-8 bg-brand-outline hidden sm:block"></div>

            <div className="flex-[1] flex items-center relative pl-6 hidden sm:flex">
              <MapPin className="text-brand-text-variant shrink-0" size={20} />
              <input 
                type="text" 
                value={locationQuery}
                onChange={e => setLocationQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Location" 
                className="w-full bg-transparent py-4 pl-4 pr-4 text-sm tracking-wide text-brand-text-main focus:outline-none placeholder:text-brand-text-variant truncate"
              />
            </div>

            <button 
              onClick={() => handleSearch()}
              className="px-10 py-4 bg-brand-primary text-white text-sm font-semibold rounded-full hover:bg-[#059669] transition-all shadow-sm active:scale-[0.98] shrink-0 ml-2"
            >
              Search
            </button>
         </div>
         
         <div className="flex gap-3 items-center flex-wrap px-4">
           <span className="text-sm text-brand-text-variant font-medium">Popular:</span>
           {['Plumbing', 'Electrical', 'Cleaning', 'Carpentry'].map(cat => (
             <button 
               key={cat} 
               onClick={() => {
                 setSearchQuery(cat);
                 handleSearch(cat);
               }}
               className="px-5 py-2 border border-brand-outline bg-transparent rounded-full text-xs font-medium text-brand-text-variant hover:text-brand-text-main hover:border-brand-primary hover:bg-brand-primary/10 transition-all outline-none"
             >
               {cat}
             </button>
           ))}
         </div>
      </div>

      {hasSearched ? (
        <div className="flex flex-col gap-6 w-full bg-brand-surface-container p-8 rounded-3xl border border-brand-outline">
           <div className="flex justify-between items-center mb-4 pb-4 border-b border-brand-outline/50">
             <div>
               <h2 className="text-2xl font-semibold text-brand-text-main">Search Results</h2>
               <p className="text-sm text-brand-text-variant mt-1.5">Found {searchResults.length} providers for "{searchQuery || locationQuery}"</p>
             </div>
             <button 
               onClick={() => { setHasSearched(false); setSearchResults([]); }}
               className="text-sm font-semibold text-brand-primary hover:text-[#059669] transition-colors flex items-center gap-1"
             >
               <ChevronLeft size={16} /> Back to Dashboard
             </button>
           </div>
           
           {isSearching ? (
             <div className="text-center text-brand-text-variant py-12">Searching for providers...</div>
           ) : searchResults.length === 0 ? (
             <div className="text-center text-brand-text-variant py-12 border-2 border-dashed border-brand-outline rounded-3xl">
                No providers found for your search. Try different keywords or location.
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {searchResults.map(provider => (
                 <div key={provider.id} className="bg-brand-surface-card border border-brand-outline p-6 rounded-2xl hover:border-brand-primary/50 hover:shadow-level-2 transition-all flex flex-col items-center text-center group cursor-pointer">
                    <img src={provider.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&h=100&auto=format&fit=crop"} alt={provider.full_name} className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-brand-outline group-hover:border-brand-primary/50 transition-colors" />
                    <h3 className="text-lg font-bold text-brand-text-main">{provider.full_name}</h3>
                    <p className="text-sm text-brand-text-variant mb-3">@{provider.username}</p>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-brand-text-variant bg-brand-surface px-3 py-1 rounded-full border border-brand-outline mb-4">
                       <MapPin size={12} className="text-brand-primary" /> {provider.location || 'No location specified'}
                    </div>
                    {provider.services && (
                      <div className="flex flex-wrap gap-1.5 justify-center mb-6">
                         {provider.services.split(', ').slice(0, 3).map((s: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-wider rounded-md">{s}</span>
                         ))}
                      </div>
                    )}
                    <button className="mt-auto w-full py-2.5 bg-brand-surface-card border-2 border-brand-primary text-brand-primary font-bold rounded-xl hover:bg-brand-primary hover:text-white transition-all focus:ring-4 focus:ring-brand-primary/10">
                       View Profile
                    </button>
                 </div>
               ))}
             </div>
           )}
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12 w-full">
           
           {/* Active Posts Section (Concise) */}
           <div className="flex flex-col flex-1">
              <div className="flex justify-between items-end mb-8 border-b border-brand-outline pb-4">
                <div>
                   <h2 className="text-2xl font-semibold text-brand-text-main">My Active Posts</h2>
                   <p className="text-sm text-brand-text-variant mt-1.5">Quick overview of open requests</p>
                </div>
                <button 
                  className="text-sm font-semibold text-brand-primary hover:text-[#059669] transition-colors flex items-center gap-1"
                  onClick={() => {
                    const jobsTab = document.querySelector('button[aria-label="My Active Posts"]') || Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.includes('My Active Posts'));
                    if (jobsTab) (jobsTab as HTMLButtonElement).click();
                  }}
                >
                  View All <ChevronRight size={16} />
                </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isLoading ? (
                  <div className="col-span-2 text-center text-brand-text-variant py-8">Loading your posts...</div>
                ) : activeJobs.length === 0 ? (
                  <div className="col-span-2 text-center text-brand-text-variant py-8 border-2 border-dashed border-brand-outline rounded-3xl">You have no active posts.</div>
                ) : activeJobs.slice(0, 4).map(job => (
                  <div key={job.id} className="bg-brand-surface-card border border-brand-outline p-5 rounded-3xl hover:border-brand-primary/50 hover:shadow-level-2 transition-all group relative overflow-hidden flex flex-col cursor-pointer">
                     <div className="flex justify-between items-start mb-3">
                        <div>
                           <h3 className="text-lg font-semibold text-brand-text-main leading-snug line-clamp-1">{job.title}</h3>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-1.5 text-brand-text-variant mb-4">
                        <MapPin size={14} />
                        <span className="text-xs truncate">{job.location}</span>
                     </div>
                     
                     <div className="mt-auto pt-4 border-t border-brand-outline flex justify-between items-center">
                        <span className="text-lg font-semibold text-brand-text-main">₱{job.budget?.toLocaleString() ?? 0}</span>
                        <span className="flex items-center gap-1.5 text-xs font-medium text-brand-text-variant bg-brand-surface px-2 py-1 rounded-md border border-brand-outline">
                           <span className="w-1.5 h-1.5 rounded-full bg-brand-text-variant/40"></span>
                           Pending
                        </span>
                     </div>
                  </div>
                ))}
             </div>
           </div>

           {/* Ongoing Tasks Section (Right Column equivalent) */}
           <div className="w-full lg:w-[400px] xl:w-[420px] flex flex-col bg-brand-surface-container rounded-3xl p-8 border border-brand-outline shrink-0">
              <div className="mb-8 border-b border-brand-outline/50 pb-4">
                 <h2 className="text-2xl font-semibold text-brand-text-main">Ongoing Tasks</h2>
                 <p className="text-sm text-brand-text-variant mt-1.5">Track jobs in progress</p>
              </div>
              
              <div className="flex flex-col gap-6">
                {isLoading ? (
                  <div className="text-center text-brand-text-variant py-8">Loading tasks...</div>
                ) : ongoingJobs.length === 0 ? (
                  <div className="text-center text-brand-text-variant py-8 border-2 border-dashed border-brand-outline rounded-3xl">No ongoing tasks.</div>
                ) : ongoingJobs.map(job => (
                  <div key={job.id} className="bg-brand-surface-card border border-brand-primary/30 p-8 rounded-3xl relative overflow-hidden shadow-sm">
                     {/* Active indicator */}
                     <div className="absolute top-8 right-8 flex items-center gap-2 bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/20">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
                        </span>
                        <span className="text-xs font-semibold text-brand-primary px-1">IN PROGRESS</span>
                     </div>

                     <div className="mb-4 mt-1 pr-32">
                        <h3 className="text-xl font-semibold text-brand-text-main leading-snug">{job.title}</h3>
                     </div>

                     <div className="flex items-center gap-1.5 text-brand-text-variant mb-6">
                         <MapPin size={14} />
                         <span className="text-sm truncate">{job.location}</span>
                     </div>

                     <div className="flex items-center gap-4 pt-6 pb-6 border-t border-brand-outline mb-6 -mx-8 px-8">
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-brand-outline">
                           <img src={job.provider_avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&h=100&auto=format&fit=crop"} alt="Provider" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm text-brand-text-main font-medium truncate">{job.provider_name || 'Assigned Provider'}</p>
                           <p className="text-xs text-brand-text-variant mt-0.5 flex items-center gap-1.5">
                             <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                             <span className="font-medium text-brand-text-variant">Service Provider</span>
                           </p>
                        </div>
                        <button className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center hover:bg-brand-primary hover:text-brand-surface border border-brand-primary/20 transition-all shrink-0 outline-none hover:shadow-lg hover:-translate-y-0.5 duration-200" title="Message Provider">
                           <MessageSquare size={18} />
                        </button>
                     </div>
                     
                     <button 
                       className="w-full py-3.5 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-[#059669] transition-all shadow-lg active:scale-[0.98] hover:shadow-brand-primary/20 hover:shadow-xl"
                       onClick={() => {
                          api.updateJobStatus(job.id, 'completed').then(() => {
                             setOngoingJobs(ongoingJobs.filter((j: any) => j.id !== job.id));
                          }).catch(console.error);
                       }}
                     >
                        Mark as Completed
                     </button>
                  </div>
                ))}
              </div>
           </div>
           
        </div>
      )}
    </div>
  );
};

// --- Provider Specific Sections ---

export const ProviderHomeDashboard = () => {
  const [displayName, setDisplayName] = React.useState('');
  
  React.useEffect(() => {
    api.getMe().then(user => {
      setDisplayName(user.full_name);
    }).catch(console.error);
  }, []);

  const firstName = displayName ? displayName.split(' ')[0] : 'Provider';

  return (
    <div className="flex flex-col h-full px-12 py-8 gap-10 max-w-[1400px] mx-auto w-full">
      {/* Header section with personalized context */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-brand-text-main tracking-tight mb-2">Hello, {firstName}!</h1>
          <p className="text-brand-text-variant font-medium flex items-center gap-2">
            You have <span className="text-brand-primary font-bold">2 jobs</span> scheduled for today.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-brand-surface-card border border-brand-outline p-1.5 rounded-2xl shadow-sm">
          <div className="px-4 py-2 border-r border-brand-outline">
            <p className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest mb-0.5">Today's Revenue</p>
            <p className="text-lg font-bold text-brand-text-main">₱1,500.00</p>
          </div>
          <button className="px-5 py-2 bg-brand-primary/10 text-brand-primary text-xs font-bold rounded-xl hover:bg-brand-primary hover:text-white transition-all">
            Go Active
          </button>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        
        {/* Left Column: Priorities & Calendar (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Priority One: The Next Job */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-brand-text-main flex items-center gap-2">
                <Clock size={20} className="text-brand-primary" /> Next Up
              </h2>
              <span className="text-xs font-semibold text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-full">Starting in 45m</span>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-brand-surface-card border-2 border-brand-primary/20 rounded-[2.5rem] p-8 shadow-md relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Home size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-brand-text-main mb-2">General Cleaning & Organization</h3>
                    <div className="flex items-center gap-4 text-sm text-brand-text-variant">
                      <span className="flex items-center gap-1.5 font-medium text-brand-text-main/80"><User size={16} /> Juan Dela Cruz</span>
                      <span className="flex items-center gap-1.5"><MapPin size={16} /> Dasmariñas City</span>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-3xl font-extrabold text-[#059669]">₱1,200</p>
                    <p className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest mt-1">Confirmed Rate</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <button className="px-6 py-3 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:bg-[#059669] transition-all flex items-center gap-2">
                    Get Directions <ChevronRight size={18} />
                  </button>
                  <button className="px-6 py-3 bg-brand-surface border border-brand-outline text-brand-text-main font-bold rounded-2xl hover:bg-brand-surface-card transition-all flex items-center gap-2">
                    <Phone size={18} className="text-brand-primary" /> Call Client
                  </button>
                  <button className="px-4 py-3 bg-brand-surface border border-brand-outline text-brand-text-variant rounded-2xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all ml-auto">
                    Report Issue
                  </button>
                </div>
              </div>
            </motion.div>
          </section>

          {/* New Opportunities */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-brand-text-main flex items-center gap-2">
                <TrendingUp size={20} className="text-brand-primary" /> Personalized Feed
              </h2>
              <button className="text-xs font-bold text-brand-primary hover:underline">View All Matches</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Garden Trimming', price: '850', distance: '1.2km away', cat: 'Outdoor', tag: 'Fast Response' },
                { title: 'Curtain Installation', price: '600', distance: '0.8km away', cat: 'Cleaning', tag: 'Top Match' }
              ].map((job, i) => (
                <div key={i} className="bg-brand-surface-card border border-brand-outline p-6 rounded-3xl hover:border-brand-primary transition-all group cursor-pointer shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2 py-0.5 bg-brand-surface border border-brand-outline text-brand-text-variant text-[10px] font-bold rounded-md uppercase tracking-wider">{job.cat}</span>
                    <span className="text-[10px] font-bold text-brand-primary">{job.tag}</span>
                  </div>
                  <h3 className="text-lg font-bold text-brand-text-main mb-2 leading-tight group-hover:text-brand-primary transition-colors">{job.title}</h3>
                  <div className="flex items-center gap-3 text-[11px] text-brand-text-variant mb-6">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {job.distance}</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-brand-outline">
                    <span className="text-lg font-bold text-brand-text-main">₱{job.price}</span>
                    <button className="px-4 py-2 bg-brand-primary text-white text-[10px] font-extrabold rounded-xl hover:bg-[#059669] transition-all uppercase tracking-widest">
                      Quick Pitch
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Mini Stats & Insights (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Performance Card */}
          <div className="bg-brand-surface-card border border-brand-outline rounded-[2.5rem] p-8 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-8 border-b border-brand-outline pb-4">Performance Insights</h3>
            
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-xs font-semibold text-brand-text-variant uppercase tracking-wider">Reputation Partner</p>
                  <p className="text-2xl font-bold text-brand-text-main">4.9 <Star size={16} className="inline fill-amber-400 text-amber-400 relative top-[-2px] ml-0.5" /></p>
                </div>
                <div className="h-1.5 w-full bg-brand-surface-container rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '98%' }} transition={{ duration: 1 }} className="h-full bg-amber-400 rounded-full" />
                </div>
                <p className="text-[10px] text-brand-text-variant mt-2 font-medium">Top 5% of providers in Dasmariñas</p>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-xs font-semibold text-brand-text-variant uppercase tracking-wider">Account Balance</p>
                  <p className="text-2xl font-bold text-[#059669]">₱4,200</p>
                </div>
                <p className="text-[10px] text-brand-text-variant mb-6 font-medium">Auto-payout scheduled for Friday</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-brand-surface border border-brand-outline rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-brand-text-variant tracking-tighter mb-0.5">Jobs Done</p>
                    <p className="text-lg font-bold text-brand-text-main">24</p>
                  </div>
                  <div className="p-3 bg-brand-surface border border-brand-outline rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-brand-text-variant tracking-tighter mb-0.5">Replies</p>
                    <p className="text-lg font-bold text-brand-text-main">88%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tips or Announcements */}
          <div className="bg-brand-primary p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-lg shadow-brand-primary/20">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Star size={64} fill="white" />
            </div>
             <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-80">Provider Tip</p>
             <h4 className="text-lg font-bold mb-4 leading-tight">Increase your hiring chance by 40%</h4>
             <p className="text-xs leading-relaxed opacity-90 mb-6">Completing your specific skill certifications helps you stand out in the neighborhood search.</p>
             <button className="w-full py-3 bg-white text-brand-primary font-bold rounded-2xl text-xs hover:bg-brand-primary-container transition-all">
                Learn More
             </button>
          </div>
          
        </div>
      </div>
    </div>
  )
}


export const BrowseJobsSection = () => {
  const [filter, setFilter] = React.useState('All');
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    api.getJobs()
      .then((data) => setJobs(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const sendOffer = async (jobId: number) => {
    try {
      await api.applyToJob(jobId);
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error('Failed to send offer', error);
    }
  };

  const filteredJobs = jobs.filter((job) => filter === 'All' || job.title.toLowerCase().includes(filter.toLowerCase()) || job.description?.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto py-12 px-12 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-text-main mb-2">Available Jobs</h1>
          <p className="text-sm text-brand-text-variant">Find work that matches your skills in your neighborhood</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-variant" size={18} />
            <input 
              type="text" 
              placeholder="Search services..." 
              className="w-full bg-brand-surface border-2 border-brand-outline rounded-2xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-brand-primary/10 hover:border-brand-primary/50 focus:border-brand-primary transition-all shadow-sm font-medium"
            />
          </div>
          <button className="p-3 bg-brand-surface-card border border-brand-outline rounded-2xl hover:border-brand-primary/50 transition-colors shadow-sm">
            <Filter size={20} className="text-brand-text-variant" />
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {['All', 'Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Tutoring', 'Repair'].map(cat => (
          <button 
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 border ${
              filter === cat 
                ? 'bg-brand-primary text-white border-brand-primary shadow-md' 
                : 'bg-brand-surface-card text-brand-text-variant border-brand-outline hover:border-brand-primary/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {isLoading ? (
          <p className="text-brand-text-variant text-sm">Loading available jobs...</p>
        ) : filteredJobs.map(job => (
          <motion.div 
            whileHover={{ y: -4 }}
            key={job.id} 
            className="bg-brand-surface-card border border-brand-outline rounded-[2rem] p-8 shadow-sm flex flex-col relative group overflow-hidden"
          >
            {Number(job.budget) >= 2000 && (
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-orange-500 text-white text-[10px] font-bold rounded-bl-2xl uppercase tracking-tighter">
                URGENT
              </div>
            )}
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-bold rounded-lg uppercase tracking-wider">Open Job</span>
                <span className="text-[10px] text-brand-text-variant font-medium flex items-center gap-1.5"><Clock size={12} /> {new Date(job.created_at).toLocaleDateString()}</span>
              </div>
              <h3 className="text-2xl font-bold text-brand-text-main mb-3 leading-tight group-hover:text-brand-primary transition-colors">{job.title}</h3>
              <div className="flex items-center gap-4 text-xs font-semibold text-brand-text-variant">
                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-brand-primary" /> {job.location}</span>
              </div>
            </div>

            <p className="text-sm text-brand-text-variant leading-relaxed line-clamp-2 mb-8">{job.description}</p>

            <div className="mt-auto flex items-center justify-between pt-6 border-t border-brand-outline">
              <div>
                <p className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest mb-0.5">Budget</p>
                <p className="text-2xl font-extrabold text-brand-text-main tracking-tight">₱{Number(job.budget || 0).toLocaleString()}</p>
              </div>
              <button onClick={() => sendOffer(job.id)} className="px-8 py-3 bg-brand-primary text-white text-sm font-bold rounded-2xl hover:bg-[#059669] transition-all shadow-lg hover:shadow-brand-primary/20 active:scale-95">
                Send Offer
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const MyOffersSection = () => {
  const [offers, setOffers] = React.useState<any[]>([]);

  React.useEffect(() => {
    api.getMyApplications().then(setOffers).catch(console.error);
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-12 px-12 w-full">
      <div className="mb-10 text-left">
        <h1 className="text-3xl font-bold text-brand-text-main mb-2">My Offers</h1>
        <p className="text-sm text-brand-text-variant">Track your proposals and communication with potential clients</p>
      </div>

      <div className="space-y-6">
        {offers.map(offer => (
          <div key={offer.id} className="bg-brand-surface-card border border-brand-outline rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row md:items-center gap-6 group hover:border-brand-primary/30 transition-all">
            <img src={offer.client_avatar || "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=64&h=64&auto=format&fit=crop"} className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-brand-outline" alt={offer.client_name} />
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <h3 className="text-lg font-bold text-brand-text-main group-hover:text-brand-primary transition-colors">{offer.title}</h3>
                {offer.status === 'accepted' ? (
                  <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-md uppercase tracking-wider border border-green-100 flex items-center gap-1">
                    <CheckCircle size={10} /> Hired
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-[10px] font-bold rounded-md uppercase tracking-wider border border-brand-primary/10">
                    {offer.status}
                  </span>
                )}
              </div>
              <p className="text-sm text-brand-text-variant">Client: <span className="font-semibold text-brand-text-main">{offer.client_name}</span> • Sent {new Date(offer.created_at).toLocaleDateString()}</p>
            </div>

            <div className="flex items-center gap-6 md:border-l md:border-brand-outline md:pl-8">
              <div className="text-left md:text-right min-w-[100px]">
                <p className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest mb-0.5">Your Bid</p>
                <p className="text-xl font-bold text-brand-text-main">₱{Number(offer.budget || 0).toLocaleString()}</p>
              </div>
                  <div className="flex gap-2">
                <button 
                  onClick={() => alert(`Client phone: +63 912 345 6789. Please use this for urgent coordination only.`)}
                  className="p-3 bg-brand-surface border border-brand-outline rounded-xl hover:bg-brand-surface-card transition-colors text-brand-primary"
                >
                  <Phone size={20} />
                </button>
                <button className="px-6 py-2.5 bg-brand-surface border border-brand-outline text-brand-text-variant hover:text-red-500 hover:border-red-100 rounded-xl font-bold text-xs transition-colors">
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProviderActiveWorkSection = () => {
  const [activeSupportJob, setActiveSupportJob] = React.useState<number | null>(null);
  const [tasks, setTasks] = React.useState<any[]>([]);

  React.useEffect(() => {
    api.getJobsByView('ongoing').then(setTasks).catch(console.error);
  }, []);

  const markComplete = async (jobId: number) => {
    try {
      await api.updateJobStatus(jobId, 'completed');
      setTasks((prev) => prev.filter((task) => task.id !== jobId));
    } catch (error) {
      console.error('Failed to complete job', error);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto py-12 px-12 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-text-main mb-2 tracking-tight">Operation Command</h1>
          <p className="text-sm text-brand-text-variant font-medium">Manage active jobs, follow safety protocols, and track progress.</p>
        </div>
        <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-xs font-bold text-[#059669] bg-green-50 px-4 py-2 rounded-xl border border-green-100">
               <div className="w-2 h-2 bg-[#059669] rounded-full animate-pulse" /> Live Tracker Active
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {tasks.map(task => (
          <div key={task.id} className="bg-brand-surface-card border border-brand-outline rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col lg:flex-row min-h-[400px]">
            {/* Left Info Pane */}
            <div className="flex-1 p-10 flex flex-col border-r border-brand-outline bg-brand-surface/20">
              <div className="flex items-center justify-between mb-8">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                  task.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                }`}>
                  {task.status}
                </span>
                <span className="text-2xl font-black text-brand-text-main">₱{Number(task.budget || 0).toLocaleString()}</span>
              </div>
              
              <h3 className="text-3xl font-bold text-brand-text-main mb-6 leading-tight">{task.title}</h3>
              
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3 text-sm text-brand-text-variant font-semibold">
                  <User size={18} className="text-brand-primary" />
                  <span>Client: {task.client_name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-brand-text-variant font-semibold">
                  <MapPin size={18} className="text-brand-primary" />
                  <span>{task.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-orange-600">
                  <Clock size={18} />
                  <span>Started {new Date(task.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-auto flex flex-wrap gap-3">
                <button 
                   onClick={() => alert(`Calling ${task.client_name} at ${task.client_phone || 'No phone available'}...`)}
                   className="px-6 py-3 bg-brand-surface border border-brand-outline rounded-2xl font-bold text-xs hover:bg-brand-surface-card transition-all flex items-center gap-2"
                >
                  <Phone size={16} className="text-brand-primary" /> Call Client
                </button>
                <button onClick={() => markComplete(task.id)} className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold text-xs hover:bg-[#059669] transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/20">
                  <CheckCircle size={16} /> Mark as Completed
                </button>
              </div>
            </div>

            {/* Right Protocol Pane */}
            <div className="w-full lg:w-[450px] bg-brand-surface-card p-10 flex flex-col">
               <h4 className="text-xs font-bold text-brand-text-variant uppercase tracking-widest mb-6 flex items-center gap-2">
                 <FileText size={14} /> Job Protocol & Safety
               </h4>
               
               {/* Checkpoints */}
               <div className="space-y-4 mb-10">
                {[
                  { label: 'Accepted assignment', done: true },
                  { label: 'Work currently in progress', done: task.status === 'in_progress' },
                  { label: 'Completion pending client confirmation', done: false },
                ].map((cp, idx) => (
                   <div key={idx} className="flex items-center gap-3 group">
                     <button className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                       cp.done ? 'bg-[#059669] border-[#059669]' : 'bg-transparent border-brand-outline group-hover:border-brand-primary'
                     }`}>
                       {cp.done && <CheckCircle size={14} className="text-white" />}
                     </button>
                     <span className={`text-sm font-medium ${cp.done ? 'text-brand-text-variant line-through opacity-60' : 'text-brand-text-main'}`}>
                       {cp.label}
                     </span>
                   </div>
                 ))}
               </div>

               {/* Protocol Actions */}
               <div className="mt-auto space-y-3">
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl mb-4">
                    <p className="text-[10px] font-bold text-orange-600 uppercase mb-1">Stay Protected</p>
                    <p className="text-[11px] text-orange-800 leading-relaxed italic">
                      For your safety, always keep communication and payment records within Lingkod Hub. External agreements waive our dispute protection.
                    </p>
                  </div>
                  
                  <button className="w-full py-3 text-left px-5 bg-brand-surface border border-brand-outline rounded-2xl text-[11px] font-bold text-brand-text-main hover:border-brand-primary transition-all flex items-center justify-between group">
                    <span>Job not as described?</span>
                    <ChevronRight size={14} className="text-brand-text-variant group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="w-full py-3 text-left px-5 bg-brand-surface border border-brand-outline rounded-2xl text-[11px] font-bold text-brand-text-main hover:border-brand-primary transition-all flex items-center justify-between group">
                    <span>Safety / Security concern</span>
                    <AlertTriangle size={14} className="text-orange-500" />
                  </button>
                  <button className="w-full py-3 text-left px-5 bg-brand-surface border border-brand-outline rounded-2xl text-[11px] font-bold text-brand-text-main hover:border-red-500 hover:text-red-500 transition-all flex items-center justify-between group">
                    <span>Emergency Dispute</span>
                    <ChevronRight size={14} className="text-brand-text-variant" />
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const EarningsSection = () => {
  const [jobs, setJobs] = React.useState<any[]>([]);

  React.useEffect(() => {
    api.getJobsByView('history').then(setJobs).catch(console.error);
  }, []);

  const completedJobs = jobs.filter((job) => job.status === 'completed');
  const totalEarned = completedJobs.reduce((sum, job) => sum + Number(job.budget || 0), 0);

  return (
    <div className="max-w-5xl mx-auto py-12 px-12 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-text-main mb-2">Earnings</h1>
          <p className="text-sm text-brand-text-variant">Monitor your income and financial performance</p>
        </div>
        <div className="flex items-center gap-4 bg-brand-surface-card border border-brand-outline p-2 rounded-2xl shadow-sm">
          <div className="px-6 py-2 text-center border-r border-brand-outline">
            <p className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest mb-0.5">Available for Payout</p>
            <p className="text-xl font-bold text-[#059669]">₱{totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <button className="px-6 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl hover:bg-[#059669] transition-all shadow-sm">
            Cash Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 bg-brand-surface-card border border-brand-outline rounded-[2rem] p-8 shadow-sm flex flex-col justify-center min-h-[300px] text-center italic text-brand-text-variant">
           {/* Chart Mockup */}
           <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-brand-primary/5 rounded-full flex items-center justify-center mb-4">
                <TrendingUp size={32} className="text-brand-primary/40" />
              </div>
              <p className="text-sm font-medium">Earnings Analytics Visualization</p>
              <p className="text-xs opacity-60">Revenue growing 12% relative to last month</p>
           </div>
        </div>
        
        <div className="bg-brand-surface-card border border-brand-outline rounded-[2rem] p-8 shadow-sm">
          <h3 className="text-lg font-bold text-brand-text-main mb-6">Wallet Summary</h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-brand-text-variant font-medium">This Week</span>
              <span className="text-brand-text-main font-bold">+₱{totalEarned.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-brand-text-variant font-medium">Pending Clearances</span>
              <span className="text-brand-text-main font-bold">₱0</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-brand-text-variant font-medium">Total Lifetime</span>
              <span className="text-brand-text-main font-bold">₱{totalEarned.toLocaleString()}</span>
            </div>
            <div className="pt-6 border-t border-brand-outline mt-6">
              <label className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest block mb-4">Saved Payout Methods</label>
              <div className="flex items-center gap-3 p-3 bg-brand-surface border border-brand-outline rounded-xl">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <Smartphone size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-text-main">GCash Wallet</p>
                  <p className="text-[10px] text-brand-text-variant">**** 6789</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-brand-surface-card border border-brand-outline rounded-[2rem] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-brand-outline bg-brand-surface/50 font-bold text-sm text-brand-text-main">Transaction History</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-brand-outline">
                <th className="px-6 py-4 font-bold text-brand-text-variant uppercase text-[10px] tracking-widest">Date</th>
                <th className="px-6 py-4 font-bold text-brand-text-variant uppercase text-[10px] tracking-widest">Job</th>
                <th className="px-6 py-4 font-bold text-brand-text-variant uppercase text-[10px] tracking-widest">Amount</th>
                <th className="px-6 py-4 font-bold text-brand-text-variant uppercase text-[10px] tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-outline/50">
              {completedJobs.map((tx) => (
                <tr key={tx.id} className="hover:bg-brand-surface transition-colors">
                  <td className="px-6 py-4 font-medium text-brand-text-variant whitespace-nowrap">{new Date(tx.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold text-brand-text-main">{tx.title}</td>
                  <td className="px-6 py-4 font-extrabold text-[#059669]">+₱{Number(tx.budget || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-green-50 text-green-600">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

