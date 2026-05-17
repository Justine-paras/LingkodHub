import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Home, 
  User, 
  MapPin, 
  ChevronRight, 
  TrendingUp, 
  Star,
  Search,
  Filter,
  Zap
} from 'lucide-react';
import { api } from '../../../services/api';
import { UserProfileModal } from '../shared/UserProfileModal';

export const ProviderHomeDashboard = () => {
  const [isOnline, setIsOnline] = React.useState(true);
  const [displayName, setDisplayName] = React.useState('');
  const [ongoingJobs, setOngoingJobs] = React.useState<any[]>([]);
  const [historyJobs, setHistoryJobs] = React.useState<any[]>([]);
  const [availableJobs, setAvailableJobs] = React.useState<any[]>([]);
  const [pendingInvitations, setPendingInvitations] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState({ avg_rating: 0, total_reviews: 0 });
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [isEmailVerified, setIsEmailVerified] = React.useState(true);
  const [isProfileLoading, setIsProfileLoading] = React.useState(true);
  const [selectedClientId, setSelectedClientId] = React.useState<number | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await api.getMe();
        setDisplayName(user.full_name);
        setIsEmailVerified(!!user.is_email_verified);
        setIsProfileLoading(false);
        
        const [ongoing, assigned, history, available, reviews] = await Promise.all([
          api.getJobsByView('ongoing'),
          api.getJobsByView('assigned'),
          api.getJobsByView('history'),
          api.getJobs(),
          api.getUserReviews(user.id)
        ]);

        const ongoingList = Array.isArray(ongoing) ? ongoing : [];
        const assignedList = Array.isArray(assigned) ? assigned : [];
        const historyList = Array.isArray(history) ? history : [];
        const availableList = Array.isArray(available) ? available : [];

        // Fetch applications to identify which jobs we've applied to
        const myApps = await api.getMyApplications();
        const appliedJobIds = Array.isArray(myApps) ? myApps.map((a: any) => a.job_id) : [];

        // invitations are assigned jobs that are still pending/invited AND we haven't applied to yet (Direct Invites)
        const invitations = assignedList.filter((j: any) => 
          (j.status === 'pending' || j.status === 'invited') && 
          !appliedJobIds.includes(j.id)
        );
        
        // Deduplicate invitations
        const uniqueInvitations = Array.from(new Map(invitations.map((j: any) => [j.id, j])).values());
        setPendingInvitations(uniqueInvitations);

        // truly ongoing are jobs that are in_progress, OR assigned and pending but the provider HAS applied
        const validAssigned = assignedList.filter((j: any) => {
           if (j.status === 'in_progress') return true;
           if (j.status === 'pending' && appliedJobIds.includes(j.id)) return true;
           return false;
        });
        
        const trulyOngoing = [...ongoingList, ...validAssigned];
        
        // Deduplicate active work and filter out completed/cancelled
        const uniqueOngoing = Array.from(new Map(trulyOngoing.map((j: any) => [j.id, j])).values())
          .filter((j: any) => j.status !== 'completed' && j.status !== 'cancelled');

        // Enrich with submission status and arrival flags
        const enrichedOngoing = await Promise.all(uniqueOngoing.map(async (job: any) => {
          try {
            const allMessages = await api.getMessages(job.client_id);
            const messages = allMessages.filter((m: any) => m.job_id === job.id);
            const hasSubmission = messages.some((m: any) => 
              m.sender_id === user.id && 
              m.content && (m.content.includes('completed the work') || m.content.includes('release the funds'))
            );
            const providerArrived = messages.some((m: any) => m.content && m.content.includes('[SYSTEM:PROVIDER_ARRIVED]'));
            const clientConfirmed = messages.some((m: any) => m.content && m.content.includes('[SYSTEM:CLIENT_CONFIRMED_ARRIVAL]'));
            
            if (clientConfirmed && providerArrived && job.status === 'pending') {
               try {
                  await api.updateJobStatus(job.id, 'in_progress');
                  job.status = 'in_progress';
               } catch(e) { console.error('Auto-resolve failed', e); }
            }
            
            return { ...job, is_submitted: hasSubmission, provider_arrived: providerArrived, client_confirmed: clientConfirmed };
          } catch (e) {
            return job;
          }
        }));

        setOngoingJobs(enrichedOngoing);
        setHistoryJobs(historyList);
        
        // Available jobs should include pending, open, or active jobs that don't have a provider yet
        setAvailableJobs(availableList.filter((j: any) => 
          (!j.provider_id || j.provider_id === null) && 
          (j.status === 'pending' || j.status === 'open' || j.status === 'active')
        )); 
        
        setStats(reviews);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Listen for cross-tab or cross-component updates
    const channel = new BroadcastChannel('dashboard_sync');
    channel.onmessage = (event) => {
      if (event.data.type === 'DATA_UPDATED') {
        fetchData();
      }
    };

    // Polling fallback
    const interval = setInterval(fetchData, 15000);

    return () => {
      channel.close();
      clearInterval(interval);
    };
  }, []);

  const firstName = displayName ? displayName.split(' ')[0] : 'Provider';
  const nextUpJob = ongoingJobs[0];
  const completedJobs = historyJobs.filter(j => j.status === 'completed');
  const lifetimeEarnings = completedJobs.reduce((sum, j) => sum + Number(j.budget || 0), 0);
  
  // Calculate today's revenue from scheduled jobs
  const todayRevenue = ongoingJobs.filter(j => {
    if (!j.scheduled_date) return false;
    const scheduledDate = new Date(j.scheduled_date);
    const today = new Date();
    return scheduledDate.toDateString() === today.toDateString();
  }).reduce((sum, j) => sum + Number(j.budget || 0), 0);

  const completedCount = completedJobs.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-12 py-8 gap-10 max-w-[1400px] mx-auto w-full relative">
      {!isProfileLoading && !isEmailVerified && (
        <div className="absolute inset-0 z-50 bg-brand-surface/60 backdrop-blur-sm flex items-center justify-center p-8 rounded-3xl">
           <div className="bg-brand-surface-card border-2 border-brand-outline rounded-[2.5rem] p-10 max-w-lg text-center shadow-2xl">
              <div className="w-20 h-20 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-accent">
                 <User size={40} />
              </div>
              <h2 className="text-2xl font-bold text-brand-text-main mb-4">Verification Required</h2>
              <p className="text-brand-text-variant mb-8 leading-relaxed">
                 To start accepting jobs and offering your services, please verify your email address. This helps us ensure a safe marketplace for everyone.
              </p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('change-tab', { detail: 'profile' }))}
                className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:bg-[#059669] transition-all"
              >
                Go to Verification
              </button>
           </div>
        </div>
      )}

      {/* Header section with personalized context */}
      <header className={`flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 ${!isEmailVerified ? 'opacity-50 pointer-events-none select-none' : ''}`}>
        <div>
          <h1 className="text-4xl font-extrabold text-brand-text-main tracking-tight mb-2">Hello, {firstName}!</h1>
          <p className="text-brand-text-variant font-semibold flex items-center gap-2">
            You have <span className="text-brand-primary font-bold">{ongoingJobs.length} active jobs</span> currently.
            <span className="inline-flex items-center gap-1.5 ml-2">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#059669] animate-pulse' : 'bg-gray-400'}`}></span>
              <span className="text-[10px] uppercase font-bold tracking-widest">{isOnline ? 'Active Now' : 'Offline'}</span>
            </span>
          </p>
        </div>
        <div className="flex items-center gap-4 bg-brand-surface-card border-2 border-brand-outline p-2 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
          <div className="px-8 py-3 border-r border-brand-outline">
            <p className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest mb-1 opacity-70">Available Balance</p>
            <p className="text-2xl font-black text-[#059669]">â‚±{lifetimeEarnings.toLocaleString()}</p>
          </div>
          <div className="px-6 py-2">
            <button 
               onClick={() => setIsOnline(!isOnline)}
               className={`px-8 py-3 text-xs font-bold rounded-2xl transition-all shadow-sm ${
               isOnline 
                  ? 'bg-brand-primary text-white hover:bg-[#059669] shadow-brand-primary/20 hover:shadow-lg' 
                  : 'bg-brand-surface border border-brand-outline text-brand-text-main hover:bg-brand-surface-card'
               }`}
            >
               {isOnline ? 'Accepting Jobs' : 'Go Online'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 w-full ${!isEmailVerified ? 'opacity-50 pointer-events-none select-none' : ''}`}>
        
        {/* Left Column: Priorities & Calendar (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Direct Invitations / Offers */}
          {pendingInvitations.length > 0 && (
            <section className="animate-in slide-in-from-top-4 duration-500">
               <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black text-brand-text-main flex items-center gap-2 uppercase tracking-tight">
                     <Star size={20} className="text-amber-500 fill-amber-500" /> New Job Invitations
                  </h2>
                  <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black rounded-full animate-pulse">
                     {pendingInvitations.length} Pending
                  </span>
               </div>
               <div className="space-y-4">
                  {pendingInvitations.map(inv => (
                     <div key={inv.id} className="bg-white border-2 border-amber-200 rounded-3xl p-6 shadow-xl shadow-amber-500/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shrink-0 border border-amber-100">
                              <Zap size={28} />
                           </div>
                           <div>
                              <h4 className="text-lg font-black text-brand-text-main leading-tight mb-1">{inv.title}</h4>
                              <p className="text-xs font-bold text-brand-text-variant uppercase"><span onClick={() => setSelectedClientId(inv.client_id)} className="cursor-pointer border-b border-dashed border-brand-outline hover:border-brand-primary hover:text-brand-primary transition-colors text-brand-text-main" title="Click to view client profile">{inv.client_name}</span> â€¢ {inv.location}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="text-right mr-4 hidden md:block">
                              <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-widest">Offer Price</p>
                              <p className="text-xl font-black text-brand-text-main">â‚±{Number(inv.budget || 0).toLocaleString()}</p>
                           </div>
                           <button 
                              onClick={async () => {
                                 if (!confirm('Decline this job invitation?')) return;
                                 try {
                                    await api.updateJobStatus(inv.id, 'cancelled');
                                    setPendingInvitations(prev => prev.filter(p => p.id !== inv.id));
                                 } catch (err) { console.error(err); }
                              }}
                              className="px-6 py-3 bg-brand-surface border border-brand-outline text-brand-text-main text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                           >
                              Decline
                           </button>
                           <button 
                              onClick={async () => {
                                 try {
                                    await api.applyToJob(inv.id, 'I accept your direct work invitation! Let\'s get started.');
                                    // Refresh all to move it to ongoing
                                    window.dispatchEvent(new CustomEvent('dashboard_sync', { detail: { type: 'DATA_UPDATED' } }));
                                    const channel = new BroadcastChannel('dashboard_sync');
                                    channel.postMessage({ type: 'DATA_UPDATED' });
                                    channel.close();
                                    // Local update for immediate feedback
                                    setPendingInvitations(prev => prev.filter(p => p.id !== inv.id));
                                 } catch (err) { console.error(err); }
                              }}
                              className="px-8 py-3 bg-brand-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-[#059669] shadow-lg shadow-brand-primary/20 transition-all active:scale-95"
                           >
                              Accept Job
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </section>
          )}

          {/* Priority One: The Next Job */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-brand-text-main flex items-center gap-2">
                <Clock size={20} className="text-brand-primary" /> Next Up
              </h2>
              {nextUpJob && (
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${
                  nextUpJob.status === 'in_progress' ? 'text-brand-primary bg-brand-primary/10' : 'text-blue-600 bg-blue-50'
                }`}>
                  {nextUpJob.status === 'in_progress' ? 'Ongoing Task' : 'Assigned Invitation'}
                </span>
              )}
            </div>
            
            {nextUpJob ? (
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
                      <h3 className="text-2xl font-bold text-brand-text-main mb-2">{nextUpJob.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-brand-text-variant flex-wrap">
                        <span 
                           onClick={() => setSelectedClientId(nextUpJob.client_id)}
                           className="flex items-center gap-1.5 font-bold text-brand-primary/80 hover:text-brand-primary cursor-pointer border-b border-dashed border-brand-outline hover:border-brand-primary transition-colors"
                           title="Click to view client profile"
                        >
                           <User size={16} /> {nextUpJob.client_name}
                        </span>
                        <span className="flex items-center gap-1.5"><MapPin size={16} /> {nextUpJob.location}</span>
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-3xl font-extrabold text-[#059669]">â‚±{Number(nextUpJob.budget || 0).toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest mt-1">Confirmed Rate</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nextUpJob.location)}`)}
                      className="px-6 py-3 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:bg-[#059669] transition-all flex items-center gap-2"
                    >
                      Get Directions <ChevronRight size={18} />
                    </button>
                    {nextUpJob.status === 'pending' && (
                      <button 
                        onClick={async () => {
                           if (!nextUpJob.provider_arrived) {
                              try {
                                await api.sendMessage(nextUpJob.client_id, '[SYSTEM:PROVIDER_ARRIVED]', nextUpJob.id);
                                if (nextUpJob.client_confirmed) {
                                   await api.updateJobStatus(Math.floor(nextUpJob.id), 'in_progress');
                                }
                                const channel = new BroadcastChannel('dashboard_sync');
                                channel.postMessage({ type: 'DATA_UPDATED' });
                                channel.close();
                                alert(nextUpJob.client_confirmed ? 'Arrival confirmed! Task is now in progress.' : 'You marked your arrival. Waiting for client to confirm.');
                                window.location.reload(); 
                              } catch(e) { console.error(e); }
                           }
                        }}
                        disabled={nextUpJob.provider_arrived}
                        className={`px-8 py-3 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg ${
                          nextUpJob.provider_arrived
                            ? 'bg-brand-surface text-brand-text-variant cursor-not-allowed border border-brand-outline'
                            : 'bg-brand-primary text-white hover:bg-brand-primary/90 shadow-brand-primary/20'
                        }`}
                      >
                        <MapPin size={18} />
                        {nextUpJob.provider_arrived ? 'Arrival Pending...' : 'I\'m Here'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-brand-surface border-2 border-dashed border-brand-outline rounded-[2.5rem] p-12 text-center">
                <p className="text-brand-text-variant font-medium mb-4">No ongoing jobs at the moment.</p>
                <button className="text-brand-primary font-bold hover:underline">Browse available jobs</button>
              </div>
            )}
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
              {availableJobs.slice(0, 4).map((job, i) => (
                <div key={job.id} className="bg-brand-surface-card border border-brand-outline p-6 rounded-3xl hover:border-brand-primary transition-all group cursor-pointer shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2 py-0.5 bg-brand-surface border border-brand-outline text-brand-text-variant text-[10px] font-bold rounded-md uppercase tracking-wider">Open Job</span>
                    <span className="text-[10px] font-bold text-brand-primary">New</span>
                  </div>
                  <h3 className="text-lg font-bold text-brand-text-main mb-2 leading-tight group-hover:text-brand-primary transition-colors line-clamp-1">{job.title}</h3>
                  <div className="flex items-center gap-3 text-[11px] text-brand-text-variant mb-6">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-brand-outline">
                    <span className="text-lg font-bold text-brand-text-main">â‚±{Number(job.budget || 0).toLocaleString()}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const btn = e.currentTarget;
                        btn.disabled = true;
                        btn.innerText = 'Sending...';
                        api.applyToJob(job.id).then(() => {
                          setAvailableJobs(prev => prev.filter(j => j.id !== job.id));
                          
                          // Notify other tabs/components that data has changed
                          const channel = new BroadcastChannel('dashboard_sync');
                          channel.postMessage({ type: 'DATA_UPDATED' });
                          channel.close();
                          
                          alert('Success! Your offer for "' + job.title + '" has been sent.');
                        }).catch(err => {
                          btn.disabled = false;
                          btn.innerText = 'Quick Pitch';
                          if (err.message.includes('already applied')) {
                            alert('You have already applied to this job.');
                            setAvailableJobs(prev => prev.filter(j => j.id !== job.id));
                          } else {
                            alert('Failed to send offer: ' + err.message);
                          }
                        });
                      }}
                      className="px-4 py-2 bg-brand-primary text-white text-[10px] font-extrabold rounded-xl hover:bg-[#059669] transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Quick Pitch
                    </button>
                  </div>
                </div>
              ))}
              {availableJobs.length === 0 && (
                <p className="text-sm text-brand-text-variant col-span-2">No new jobs matching your profile right now.</p>
              )}
            </div>
          </section>

          <BrowseJobsSection />
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
                  <p className="text-2xl font-bold text-brand-text-main">{stats.avg_rating.toFixed(1)} <Star size={16} className="inline fill-amber-400 text-amber-400 relative top-[-2px] ml-0.5" /></p>
                </div>
                <div className="h-1.5 w-full bg-brand-surface-container rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.avg_rating / 5) * 100}%` }} transition={{ duration: 1 }} className="h-full bg-amber-400 rounded-full" />
                </div>
                <p className="text-[10px] text-brand-text-variant mt-2 font-medium">Based on {stats.total_reviews} reviews</p>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-xs font-semibold text-brand-text-variant uppercase tracking-wider">Lifetime Earnings</p>
                  <p className="text-2xl font-bold text-[#059669]">â‚±{lifetimeEarnings.toLocaleString()}</p>
                </div>
                <p className="text-[10px] text-brand-text-variant mb-6 font-medium">Auto-payout scheduled for Friday</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-brand-surface border border-brand-outline rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-brand-text-variant tracking-tighter mb-0.5">Jobs Done</p>
                    <p className="text-lg font-bold text-brand-text-main">{completedCount}</p>
                  </div>
                  <div className="p-3 bg-brand-surface border border-brand-outline rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-brand-text-variant tracking-tighter mb-0.5">Pending</p>
                    <p className="text-lg font-bold text-brand-text-main">{ongoingJobs.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
      <UserProfileModal 
        userId={selectedClientId} 
        isOpen={selectedClientId !== null} 
        onClose={() => setSelectedClientId(null)} 
      />
    </div>
  )
}



export const BrowseJobsSection = () => {
  const [filter, setFilter] = React.useState('All');
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<string[]>(['All']);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      api.getJobs(),
      api.getServices()
    ])
      .then(([jobsData, servicesData]) => {
        const jobsList = Array.isArray(jobsData) ? jobsData : [];
        setJobs(jobsList.filter((j: any) => 
          (!j.provider_id || j.provider_id === null) && 
          (j.status === 'pending' || j.status === 'open' || j.status === 'active')
        ));
        setCategories(['All', ...servicesData.map((s: any) => s.name)]);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const sendOffer = async (jobId: number, e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    try {
      btn.disabled = true;
      btn.innerText = 'Sending...';
      await api.applyToJob(jobId);
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
      
      const channel = new BroadcastChannel('dashboard_sync');
      channel.postMessage({ type: 'DATA_UPDATED' });
      channel.close();
      
      alert('Success! Your offer has been sent.');
    } catch (error: any) {
      btn.disabled = false;
      btn.innerText = 'Send Offer';
      if (error.message.includes('already applied')) {
        alert('You have already applied to this job.');
        setJobs((prev) => prev.filter((job) => job.id !== jobId));
      } else {
        alert('Failed to send offer: ' + error.message);
      }
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesFilter = filter === 'All' || 
      (job.title && job.title.toLowerCase().includes(filter.toLowerCase())) || 
      (job.description && job.description.toLowerCase().includes(filter.toLowerCase())) ||
      (job.category && job.category.toLowerCase() === filter.toLowerCase());
    return matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto py-12 px-0 w-full">
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
        {categories.map(cat => (
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
                <p className="text-2xl font-extrabold text-brand-text-main tracking-tight">â‚±{Number(job.budget || 0).toLocaleString()}</p>
              </div>
              <button onClick={(e) => sendOffer(job.id, e)} className="px-8 py-3 bg-brand-primary text-white text-sm font-bold rounded-2xl hover:bg-[#059669] transition-all shadow-lg hover:shadow-brand-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                Send Offer
              </button>
            </div>
          </motion.div>
        ))}
        {filteredJobs.length === 0 && !isLoading && (
          <div className="col-span-1 md:col-span-2 py-12 text-center bg-brand-surface border-2 border-dashed border-brand-outline rounded-3xl">
            <p className="text-brand-text-variant font-medium">No available jobs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
