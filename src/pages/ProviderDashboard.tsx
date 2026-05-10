import { useState, useEffect } from 'react';
import { 
  Sidebar, 
  TopBar, 
  ProfileSettings, 
  ProviderHomeDashboard, 
  BrowseJobsSection, 
  MyOffersSection, 
  ProviderActiveWorkSection, 
  EarningsSection,
  HistorySection,
  ProviderHelpSection
} from '../components/DashboardLayout';

export default function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Cleanup theme bleed
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, [isDark]);

  return (
    <div className={`min-h-screen bg-brand-surface font-sans flex text-left`}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} role="provider" />
      
      <div className="ml-[280px] flex-1 flex flex-col min-h-screen">
        <TopBar isDark={isDark} toggleTheme={() => setIsDark(!isDark)} role="provider" />
        
        <main className="flex-1 bg-brand-surface-container overflow-y-auto">
          {activeTab === 'home' ? (
            <ProviderHomeDashboard />
          ) : activeTab === 'browse' ? (
            <BrowseJobsSection />
          ) : activeTab === 'offers' ? (
            <MyOffersSection />
          ) : activeTab === 'active-work' ? (
            <ProviderActiveWorkSection />
          ) : activeTab === 'earnings' ? (
            <EarningsSection />
          ) : activeTab === 'help' ? (
            <ProviderHelpSection />
          ) : activeTab === 'history' ? (
            <HistorySection />
          ) : activeTab === 'profile' ? (
            <ProfileSettings role="provider" />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-144px)] text-brand-text-variant">
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
