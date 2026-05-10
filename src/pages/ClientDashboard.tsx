import { useState, useEffect } from 'react';
import { Sidebar, TopBar, ProfileSettings, HomeDashboard, ActivePostsSection, HistorySection, OngoingTasksSection } from '../components/DashboardLayout';

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [isDark, setIsDark] = useState(false); // default light theme as requested

  // Apply dark class to body if isDark
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Cleanup to ensure theme doesn't bleed to public pages
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, [isDark]);

  return (
    <div className={`min-h-screen bg-brand-surface font-sans selection:bg-brand-primary selection:text-white flex`}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} role="client" />
      
      <div className="ml-[280px] flex-1 flex flex-col min-h-screen max-w-full overflow-hidden">
        <TopBar isDark={isDark} toggleTheme={() => setIsDark(!isDark)} role="client" />
        
        <main className="flex-1 bg-brand-surface-container overflow-y-auto">
          {activeTab === 'home' ? (
            <HomeDashboard />
          ) : activeTab === 'profile' ? (
            <ProfileSettings role="client" />
          ) : activeTab === 'jobs' ? (
            <ActivePostsSection />
          ) : activeTab === 'history' ? (
            <HistorySection />
          ) : activeTab === 'tasks' ? (
            <OngoingTasksSection />
          ) : (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-144px)] text-brand-text-variant">
              <div className="w-24 h-24 bg-brand-surface-card border border-brand-outline rounded-full flex items-center justify-center mb-6 shadow-sm">
                <div className="text-4xl">🚧</div>
              </div>
              <h3 className="text-2xl font-semibold text-brand-text-main mb-2">Coming Soon!</h3>
              <p className="text-sm font-medium">The {activeTab} section is currently under construction.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
