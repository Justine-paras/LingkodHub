import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare 
} from 'lucide-react';
import { api } from '../../../services/api';
import { motion, AnimatePresence } from 'motion/react';

export const HomeDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [locationQuery, setLocationQuery] = React.useState('');
  
  const [activeJobs, setActiveJobs] = React.useState<any[]>([]);
  const [ongoingJobs, setOngoingJobs] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [hasSearched, setHasSearched] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [viewProfile, setViewProfile] = React.useState<any>(null);

  const [isInviting, setIsInviting] = React.useState(false);
  const [inviteJobId, setInviteJobId] = React.useState<number | ''>('');
  const [inviteMessage, setInviteMessage] = React.useState('');
  const [invitePrice, setInvitePrice] = React.useState<number | ''>('');
  const [inviteStatus, setInviteStatus] = React.useState<{type: 'success'|'error', msg: string} | null>(null);

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

  const handleSendInvite = async () => {
    if (!inviteJobId || !viewProfile) return;
    try {
      await api.sendInvite({
        job_id: Number(inviteJobId),
        provider_id: viewProfile.id,
        message: inviteMessage,
        offered_price: invitePrice ? Number(invitePrice) : undefined
      });
      setInviteStatus({ type: 'success', msg: 'Invitation sent successfully!' });
      setTimeout(() => {
        setIsInviting(false);
        setInviteStatus(null);
        setInviteMessage('');
        setInvitePrice('');
        setInviteJobId('');
      }, 2000);
    } catch (err: any) {
      setInviteStatus({ type: 'error', msg: err.message || 'Failed to send invitation' });
    }
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
                    <h3 className="text-lg font-bold text-brand-text-main flex items-center gap-2">
                       {provider.full_name}
                       {provider.is_documents_verified === 1 && (
                         <span className="w-2 h-2 rounded-full bg-brand-primary" title="Verified Provider"></span>
                       )}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 text-xs font-medium text-brand-text-variant bg-brand-surface px-3 py-1 rounded-full border border-brand-outline mb-4">
                       <MapPin size={12} className="text-brand-primary" /> {provider.location || 'No location specified'}
                    </div>
                    {provider.services && (
                      <div className="flex flex-wrap gap-1.5 justify-center mb-6">
                         {provider.services.split(', ').slice(0, 5).map((s: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-wider rounded-md">{s}</span>
                         ))}
                         {provider.services.split(', ').length > 5 && (
                           <span className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-md">+{provider.services.split(', ').length - 5} more</span>
                         )}
                      </div>
                    )}
                    <button 
                      onClick={() => setViewProfile(provider)}
                      className="mt-auto w-full py-2.5 bg-brand-surface-card border-2 border-brand-primary text-brand-primary font-bold rounded-xl hover:bg-brand-primary hover:text-white transition-all focus:ring-4 focus:ring-brand-primary/10"
                    >
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
      
      {/* Provider Profile Modal */}
      {viewProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewProfile(null)}></div>
          <div className="relative bg-brand-surface-card w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-8 overflow-y-auto">
              <div className="flex flex-col items-center text-center mb-8">
                <img src={viewProfile.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&h=100&auto=format&fit=crop"} alt={viewProfile.full_name} className="w-32 h-32 rounded-full object-cover mb-6 border-4 border-brand-outline shadow-xl" />
                <h3 className="text-3xl font-bold text-brand-text-main flex items-center gap-3 mb-2">
                  {viewProfile.full_name}
                  {viewProfile.is_documents_verified === 1 && (
                    <span className="w-3 h-3 rounded-full bg-brand-primary" title="Verified Provider"></span>
                  )}
                </h3>
                <div className="flex items-center gap-2 text-sm font-semibold text-brand-text-variant bg-brand-surface px-4 py-1.5 rounded-full border border-brand-outline mb-6">
                  <MapPin size={16} className="text-brand-primary" /> {viewProfile.location || 'No location specified'}
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-xs font-bold text-brand-text-variant uppercase tracking-widest mb-4 border-b border-brand-outline pb-2">Professional Bio</h4>
                  <p className="text-brand-text-main leading-relaxed italic">
                    "{viewProfile.about_me || 'No bio provided.'}"
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-brand-text-variant uppercase tracking-widest mb-4 border-b border-brand-outline pb-2">Skills & Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewProfile.services?.split(', ').map((s: string, i: number) => (
                      <span key={i} className="px-4 py-2 bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-wider rounded-xl border border-brand-primary/20">{s}</span>
                    ))}
                  </div>
                </div>

                {isInviting ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-8 border-t border-brand-outline space-y-4"
                  >
                    <h4 className="text-sm font-bold text-brand-text-main">Invite to Work</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-text-variant uppercase mb-1.5 ml-1">Select Job Post</label>
                        <select 
                          value={inviteJobId}
                          onChange={(e) => setInviteJobId(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-4 py-3 bg-brand-surface border border-brand-outline rounded-xl text-sm outline-none focus:border-brand-primary"
                        >
                          <option value="">Choose a pending job...</option>
                          {activeJobs.map(j => (
                            <option key={j.id} value={j.id}>{j.title}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-brand-text-variant uppercase mb-1.5 ml-1">Offered Price (Optional)</label>
                        <input 
                          type="number"
                          placeholder="e.g. 500"
                          value={invitePrice}
                          onChange={(e) => setInvitePrice(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-4 py-3 bg-brand-surface border border-brand-outline rounded-xl text-sm outline-none focus:border-brand-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-brand-text-variant uppercase mb-1.5 ml-1">Message</label>
                        <textarea 
                          placeholder="Why are you inviting them?"
                          value={inviteMessage}
                          onChange={(e) => setInviteMessage(e.target.value)}
                          className="w-full px-4 py-3 bg-brand-surface border border-brand-outline rounded-xl text-sm outline-none focus:border-brand-primary resize-none h-20"
                        />
                      </div>
                    </div>

                    {inviteStatus && (
                      <div className={`p-3 rounded-xl text-xs font-bold ${inviteStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {inviteStatus.msg}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => setIsInviting(false)}
                        className="flex-1 py-3.5 bg-brand-surface border border-brand-outline text-brand-text-main font-bold rounded-xl hover:bg-brand-surface-card transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSendInvite}
                        disabled={!inviteJobId}
                        className="flex-[2] py-3.5 bg-brand-primary text-white font-bold rounded-xl hover:bg-[#059669] transition-all disabled:opacity-50"
                      >
                        Send Invitation
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="pt-8 border-t border-brand-outline flex gap-4">
                    <button 
                      onClick={() => setViewProfile(null)}
                      className="flex-1 py-4 bg-brand-surface border-2 border-brand-outline text-brand-text-main font-bold rounded-2xl hover:bg-brand-surface-card transition-all"
                    >
                      Close
                    </button>
                    <button 
                      onClick={() => {
                        setIsInviting(true);
                      }}
                      className="flex-1 py-4 bg-brand-primary text-white font-bold rounded-2xl hover:bg-[#059669] transition-all shadow-lg shadow-brand-primary/20"
                    >
                      Invite to Work
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
