import { useState, useEffect } from 'react';
import { Sidebar } from '../components/dashboard/shared/Sidebar';
import { TopBar } from '../components/dashboard/shared/TopBar';
import { ProviderProfileSettings } from '../components/dashboard/provider/ProviderProfileSettings';

import { HistorySection } from '../components/dashboard/shared/HistorySection';

import { ProviderHomeDashboard, BrowseJobsSection } from '../components/dashboard/provider/ProviderHomeDashboard';
import { ProviderBidsSection as MyOffersSection } from '../components/dashboard/provider/ProviderBidsSection';
import { ProviderOngoingTasksSection as ProviderActiveWorkSection } from '../components/dashboard/provider/ProviderOngoingTasksSection';
import { ProviderInvitationsSection } from '../components/dashboard/provider/ProviderInvitationsSection';
import { EarningsSection } from '../components/dashboard/provider/EarningsSection';
import { HelpSection } from '../components/dashboard/shared/HelpSection';


export default function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('providerActiveTab') || 'home');
  const [isDark, setIsDark] = useState(() => localStorage.getItem('dashboardTheme') === 'dark');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dashboardTheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dashboardTheme', 'light');
    }
    // Cleanup theme bleed
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, [isDark]);

  useEffect(() => {
    const handleTabChange = (e: any) => {
      if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener('change-tab', handleTabChange);
    return () => window.removeEventListener('change-tab', handleTabChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('providerActiveTab', activeTab);
  }, [activeTab]);

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
          ) : activeTab === 'invitations' ? (
            <ProviderInvitationsSection />
          ) : activeTab === 'earnings' ? (
            <EarningsSection />
          ) : activeTab === 'help' ? (
            <HelpSection />
          ) : activeTab === 'history' ? (
            <HistorySection />
          ) : activeTab === 'profile' ? (
            <ProviderProfileSettings />
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
