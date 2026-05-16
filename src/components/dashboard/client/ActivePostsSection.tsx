import React from 'react';
import { 
  CheckCircle, 
  Plus, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  Star, 
  ArrowUpCircle, 
  Trash2, 
  X, 
  ChevronRight, 
  Banknote, 
  Smartphone, 
  MessageCircle,
  CheckSquare,
  Clock,
  Info,
  CreditCard,
  Wallet,
  Sparkles,
  Zap,
  ShieldCheck,
  ChevronDown,
  Users
} from 'lucide-react';
import { api } from '../../../services/api';
import { ProcessTimeline } from '../shared/ProcessTimeline';

export const ActivePostsSection = ({ 
  initialInvitedProvider = null, 
  onClearPending = () => {} 
}: { 
  initialInvitedProvider?: any, 
  onClearPending?: () => void 
}) => {
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
  const [formPayment, setFormPayment] = React.useState('gcash');
  const [formError, setFormError] = React.useState('');
  
  // Dynamic Options State
  const [addresses, setAddresses] = React.useState<any[]>([]);
  const [userData, setUserData] = React.useState<any>(null);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string>('');
  const [tempGcashNumber, setTempGcashNumber] = React.useState('');
  const [tempMayaNumber, setTempMayaNumber] = React.useState('');
  const [invitedProvider, setInvitedProvider] = React.useState<any>(null);
  const [saveDetails, setSaveDetails] = React.useState(false);

  // Sync with prop from Dashboard
  React.useEffect(() => {
    if (initialInvitedProvider) {
      setInvitedProvider(initialInvitedProvider);
      setShowPostModal(true);
      if (initialInvitedProvider.services) {
        setFormCategory(initialInvitedProvider.services.split(', ')[0] || '');
        setFormTitle(`${initialInvitedProvider.services.split(', ')[0] || 'Task'} Invitation`);
      }
      onClearPending();
    }
  }, [initialInvitedProvider]);

  const fetchJobs = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [jobs, userAddresses, currentUser] = await Promise.all([
        api.getJobs({ status: 'pending' }),
        api.getAddresses(),
        api.getMe()
      ]);
      setAddresses(userAddresses);
      setUserData(currentUser);
      
      if (currentUser.payment_method) {
        setFormPayment(currentUser.payment_method);
      }
      
      setTempGcashNumber(currentUser.gcash_number || '');
      setTempMayaNumber(currentUser.maya_number || '');

      const defaultAddr = userAddresses.find((a: any) => a.is_default);
      if (defaultAddr) {
        setFormLocation(defaultAddr.address_text);
        setSelectedAddressId(defaultAddr.id.toString());
      } else if (userAddresses.length > 0) {
        setFormLocation(userAddresses[0].address_text);
        setSelectedAddressId(userAddresses[0].id.toString());
      } else {
        setSelectedAddressId('new');
      }

      const jobsWithApps = await Promise.all(
        jobs.map(async (job: any) => {
          const apps = await api.getJobApplications(job.id);
          return { ...job, applicants: apps };
        })
      );
      
      // Filter logic:
      // 1. Regular jobs (provider_id is null) stay in active posts.
      // 2. Direct Invites (provider_id !== null) stay in active posts ONLY IF the provider hasn't applied (accepted) yet.
      const activePostsFiltered = jobsWithApps.filter((job) => {
        if (job.provider_id === null) return true;
        const providerApplied = job.applicants.some((a: any) => a.provider_id === job.provider_id);
        return !providerApplied; // If they haven't applied, it's still pending their acceptance
      });

      setActivePosts(activePostsFiltered);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchJobs();

    // Listen for cross-tab or cross-component updates
    const channel = new BroadcastChannel('dashboard_sync');
    channel.onmessage = (event) => {
      if (event.data.type === 'DATA_UPDATED') {
        fetchJobs();
      }
    };

    // Polling fallback every 15s
    const interval = setInterval(fetchJobs, 15000);

    const handleHireEvent = (e: any) => {
      setInvitedProvider(e.detail);
      setShowPostModal(true);
      if (e.detail.services) {
        setFormCategory(e.detail.services.split(', ')[0] || '');
      }
    };

    const handleDuplicateEvent = (e: any) => {
      const job = e.detail;
      setFormTitle(job.title || '');
      setFormDesc(job.description || '');
      setFormBudget(String(job.amount || job.budget || ''));
      setFormPayment(job.paymentMethod || job.payment_method || 'gcash');
      setFormCategory(job.category || '');
      setFormLocation(job.location || '');
      setShowPostModal(true);
    };

    window.addEventListener('hire-provider', handleHireEvent);
    window.addEventListener('duplicate-job', handleDuplicateEvent);
    return () => {
      window.removeEventListener('hire-provider', handleHireEvent);
      window.removeEventListener('duplicate-job', handleDuplicateEvent);
      channel.close();
      clearInterval(interval);
    };
  }, [fetchJobs]);

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

    if (!formLocation.trim()) {
       setFormError('Location is required');
       return;
    }

    const currentPaymentNum = formPayment === 'gcash' ? tempGcashNumber : tempMayaNumber;
    if (!currentPaymentNum) {
       setFormError(`Please provide your ${formPayment === 'gcash' ? 'GCash' : 'Maya'} number`);
       return;
    }
    
    try {
      setFormError('');
      
      // If "Save for future use" is checked, we would update profile here
      if (saveDetails) {
         await api.updateMe({
            gcash_number: tempGcashNumber,
            maya_number: tempMayaNumber,
            payment_method: formPayment
         });
         // If a new address was used, we could also save it
         if (selectedAddressId === 'new' && formLocation) {
            await api.addAddress({
               label: 'Added from Post',
               address_text: formLocation,
               is_default: addresses.length === 0 ? 1 : 0
            });
         }
      }

      await api.createJob({
        title: formTitle,
        description: formDesc,
        category: formCategory,
        location: formLocation,
        budget: budgetNum,
        is_urgent: formIsASAP,
        is_negotiable: formNegotiable,
        payment_method: formPayment,
        provider_id: invitedProvider?.id,
        scheduled_at: formIsASAP ? null : formDate
      });
      
      fetchJobs();
      setShowPostModal(false);
      setInvitedProvider(null);
      setSaveDetails(false);
      
      // Broadcast update so providers see the new job immediately
      const channel = new BroadcastChannel('dashboard_sync');
      channel.postMessage({ type: 'DATA_UPDATED' });
      channel.close();
      
      // Reset Form
      setFormTitle('');
      setFormCategory('');
      setFormDesc('');
      setFormLocation('');
      setFormDate('');
      setFormIsASAP(false);
      setFormBudget('');
      setFormNegotiable(false);
      
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
    <div className="max-w-6xl mx-auto py-12 px-6 lg:px-12 relative w-full flex flex-col min-h-screen font-sans">
      
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-8 right-8 z-[100] bg-[#059669] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 border border-white/20 backdrop-blur-md">
           <CheckCircle size={20} className="text-white" />
           <span className="font-bold text-sm">Task successfully listed!</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 shrink-0">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
                 <Zap size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-black text-brand-text-main tracking-tight uppercase">Active Tasks Section</h1>
           </div>
           <p className="text-brand-text-variant font-medium">Manage your public listings and review professional bids.</p>
        </div>
        
        <button 
          onClick={() => {
            setInvitedProvider(null);
            setShowPostModal(true);
          }}
          className="group relative flex items-center gap-3 px-8 py-4 bg-brand-primary text-white text-sm font-black rounded-2xl hover:bg-[#059669] transition-all shadow-xl shadow-brand-primary/30 active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <Plus size={20} />
          Post a New Task
        </button>
      </div>
      
      {/* Main Grid */}
      <div className="flex-1">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-6"></div>
             <p className="text-brand-text-variant font-bold animate-pulse uppercase tracking-widest text-sm">Syncing with marketplace...</p>
          </div>
        ) : activePosts.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center">
             <div className="w-full max-w-4xl bg-brand-surface-card border-2 border-brand-outline rounded-[3rem] p-12 md:p-20 relative overflow-hidden shadow-2xl">
                <div className="relative z-10 flex flex-col items-center text-center">
                   <div className="w-24 h-24 bg-brand-primary text-white rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-brand-primary/20 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                      <Zap size={48} />
                   </div>
                   <h2 className="text-4xl md:text-5xl font-black text-brand-text-main mb-6 leading-tight">Ready to get things done? 🛠️</h2>
                   <p className="text-brand-text-variant text-xl max-w-2xl mb-12 leading-relaxed">
                      Your marketplace is currently quiet. Start a new project today and let LingkodHub's professionals handle the rest.
                   </p>
                   
                   <div className="w-full max-w-2xl">
                      <div className="flex items-center justify-center gap-4 mb-8">
                         <div className="h-px flex-1 bg-brand-outline"></div>
                         <span className="text-xs font-black text-brand-text-variant uppercase tracking-[0.2em]">Quick Start by Category</span>
                         <div className="h-px flex-1 bg-brand-outline"></div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                         {[
                            { name: 'Cleaning', icon: '🧹' },
                            { name: 'Repair', icon: '🔧' },
                            { name: 'Tutoring', icon: '📚' },
                            { name: 'Electrical', icon: '⚡' },
                            { name: 'Plumbing', icon: '🚰' },
                            { name: 'Delivery', icon: '📦' }
                         ].map(cat => (
                            <button 
                               key={cat.name}
                               onClick={() => {
                                  setInvitedProvider(null);
                                  setFormCategory(cat.name);
                                  setFormTitle(`${cat.name} Service Needed`);
                                  setShowPostModal(true);
                               }}
                               className="flex flex-col items-center gap-3 p-6 bg-brand-surface border-2 border-brand-outline rounded-[2rem] hover:border-brand-primary hover:shadow-xl hover:shadow-brand-primary/5 transition-all group active:scale-95"
                            >
                               <span className={`text-3xl group-hover:scale-125 transition-transform duration-300`}>{cat.icon}</span>
                               <span className="font-black text-brand-text-main text-sm">{cat.name}</span>
                            </button>
                         ))}
                      </div>
                      
                   </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 content-start pb-20">
            {activePosts.map(job => (
              <div 
                key={job.id} 
                className={`group bg-brand-surface-card border-2 ${job.is_urgent ? 'border-orange-500 shadow-xl shadow-orange-500/10' : 'border-brand-outline hover:border-brand-primary hover:shadow-2xl hover:shadow-brand-primary/10'} p-8 rounded-[2.5rem] transition-all relative flex flex-col h-full min-h-[400px] ${job.is_paused ? 'opacity-75' : ''}`}
              >
                 <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-4 py-1.5 bg-brand-primary/10 text-brand-primary text-[10px] font-black rounded-full uppercase tracking-[0.1em] border border-brand-primary/20">
                             {job.category || 'General'}
                          </span>
                          {job.is_urgent && (
                             <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-orange-500 text-white text-[10px] font-black rounded-full uppercase tracking-[0.1em] shadow-lg shadow-orange-500/20 animate-pulse">
                                <AlertTriangle size={12} /> Priority
                             </span>
                          )}
                       </div>
                       <div className="flex items-center gap-1.5 mt-1">
                          <div className={`w-2 h-2 rounded-full ${job.applicants.length > 0 ? 'bg-brand-primary animate-ping' : 'bg-brand-text-variant/30'}`}></div>
                          <span className="text-[10px] font-black text-brand-text-variant uppercase tracking-widest">
                             {job.provider_id ? 'Waiting for Professional to Accept' : (job.applicants.length === 0 ? 'Awaiting Bids' : `${job.applicants.length} Active Applicants`)}
                          </span>
                       </div>
                    </div>
                    <button 
                      onClick={() => setActivePosts(prev => prev.map(p => p.id === job.id ? {...p, is_paused: !p.is_paused} : p))}
                      className={`flex items-center gap-2 p-2 px-4 rounded-2xl border-2 transition-all font-bold text-[10px] uppercase tracking-widest ${job.is_paused ? 'bg-brand-outline/10 border-brand-outline text-brand-text-variant' : 'bg-[#059669]/5 border-[#059669]/20 text-[#059669] hover:bg-[#059669]/10'}`}
                    >
                      {job.is_paused ? 'Hidden' : 'Visible'}
                    </button>
                 </div>
                 <div className="mb-6 flex-1">
                    <h3 className={`text-2xl font-black leading-tight mb-4 group-hover:text-brand-primary transition-colors ${job.is_urgent ? 'text-orange-600' : 'text-brand-text-main'}`}>
                       {job.title}
                    </h3>
                    <p className="text-brand-text-variant text-sm line-clamp-3 leading-relaxed mb-6 font-medium">
                       {job.description}
                    </p>
                    <div className="flex flex-wrap gap-3 mb-8">
                       <div className="flex items-center gap-2 px-3 py-2 bg-brand-surface border border-brand-outline rounded-xl text-[11px] font-bold text-brand-text-main shadow-sm">
                          <Calendar size={14} className="text-brand-primary" />
                          {job.is_urgent ? 'Immediate' : new Date(job.created_at).toLocaleDateString()}
                       </div>
                       <div className="flex items-center gap-2 px-3 py-2 bg-brand-surface border border-brand-outline rounded-xl text-[11px] font-bold text-brand-text-main shadow-sm">
                          <MapPin size={14} className="text-brand-primary" />
                          {job.location}
                       </div>
                    </div>
                    <div className="bg-brand-surface/80 backdrop-blur-sm p-4 rounded-3xl border border-brand-outline/50 shadow-inner">
                       <ProcessTimeline currentState="pending" />
                    </div>
                 </div>
                 <div className="flex items-center justify-between mb-8">
                    <div>
                       <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-[0.2em] mb-1">Project Budget</p>
                       <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-brand-text-main">₱{job.budget?.toLocaleString()}</span>
                       </div>
                    </div>
                    <div className="flex -space-x-3">
                       {job.applicants.slice(0, 3).map((app: any, i: number) => (
                          <img key={i} src={app.avatar_url} className="w-10 h-10 rounded-full border-4 border-brand-surface-card object-cover shadow-md" alt="Avatar" />
                       ))}
                    </div>
                 </div>
                 <div className="pt-6 border-t border-brand-outline/50 flex flex-col gap-4">
                    <button 
                      onClick={() => setViewApplicantsJob(job)}
                      disabled={job.provider_id ? true : job.applicants.length === 0}
                      className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${job.provider_id ? 'bg-amber-50 text-amber-600 border border-amber-200 cursor-not-allowed shadow-none' : (job.applicants.length === 0 ? 'bg-brand-outline/20 text-brand-text-variant cursor-not-allowed shadow-none' : 'bg-brand-primary text-white hover:bg-[#059669] shadow-brand-primary/20 hover:scale-[1.01]')}`}
                    >
                       {job.provider_id ? 'Waiting for Acceptance...' : `View All Bids ${job.applicants.length > 0 ? `(${job.applicants.length})` : ''}`}
                       {!job.provider_id && <ChevronRight size={18} />}
                    </button>
                    <div className="flex gap-3">
                       <button className="flex-1 py-3 bg-brand-surface hover:bg-brand-surface-card text-brand-text-main rounded-2xl font-black text-[10px] uppercase tracking-widest border border-brand-outline transition-all flex items-center justify-center gap-2">
                          <ArrowUpCircle size={14} className="text-brand-primary" /> Bump
                       </button>
                       <button 
                          onClick={() => setShowDeleteModal(job)}
                          className="w-12 py-3 bg-brand-surface hover:bg-red-500 hover:text-white text-red-500 rounded-2xl border border-red-100 hover:border-red-500 transition-all flex items-center justify-center shadow-sm"
                       >
                          <Trash2 size={16} />
                       </button>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Post Modal */}
      {showPostModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowPostModal(false)}></div>
            <div className="relative bg-brand-surface-card w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col text-left max-h-[95vh] border border-white/10">
               {/* Modal Header */}
               <div className="p-8 border-b border-brand-outline flex justify-between items-center bg-brand-surface/50 backdrop-blur-md sticky top-0 z-10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-brand-primary/20 rounded-2xl flex items-center justify-center text-brand-primary shadow-inner">
                        <Plus size={24} />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-brand-text-main tracking-tight uppercase">
                           {invitedProvider ? `Inviting ${invitedProvider.full_name}` : 'Create a New Task'}
                        </h3>
                        <p className="text-sm font-medium text-brand-text-variant">Fill in the logistics and secure your professional.</p>
                     </div>
                  </div>
                  <button onClick={() => setShowPostModal(false)} className="p-3 bg-brand-surface border border-brand-outline text-brand-text-variant hover:text-brand-text-main rounded-2xl transition-all shadow-sm">
                     <X size={20} />
                  </button>
               </div>

               {/* Modal Body */}
               <div className="p-10 overflow-y-auto bg-brand-surface/30">
                  {formError && (
                     <div className="mb-8 p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-shake">
                        <AlertTriangle size={20} />
                        <span className="font-bold text-sm uppercase tracking-wider">{formError}</span>
                     </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                     {/* Left: Project Scope */}
                     <div className="space-y-10">
                        <div className="flex items-center gap-3 border-b border-brand-outline pb-4">
                           <ShieldCheck size={20} className="text-brand-primary" />
                           <h4 className="text-sm font-black text-brand-text-main uppercase tracking-widest">Section 1: Scope & Detail</h4>
                        </div>
                        <div className="space-y-8">
                           <div>
                              <label className="block text-[10px] font-black text-brand-text-variant uppercase tracking-[0.2em] mb-3 ml-1">What do you need help with?</label>
                              <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g., Deep Cleaning for 3BR Apartment" className="w-full p-5 rounded-[1.5rem] border-2 border-brand-outline focus:border-brand-primary focus:ring-8 focus:ring-brand-primary/5 transition-all text-sm font-bold text-brand-text-main bg-brand-surface outline-none" />
                           </div>
                           <div className="grid grid-cols-2 gap-6">
                              <div>
                                 <label className="block text-[10px] font-black text-brand-text-variant uppercase tracking-[0.2em] mb-3 ml-1">Service Type</label>
                                 <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full p-5 rounded-[1.5rem] border-2 border-brand-outline focus:border-brand-primary focus:ring-8 focus:ring-brand-primary/5 transition-all text-sm font-bold text-brand-text-main bg-brand-surface outline-none appearance-none cursor-pointer">
                                    <option value="" disabled>Choose Category</option>
                                    <option value="Cleaning">Cleaning</option>
                                    <option value="Repair">Repair</option>
                                    <option value="Plumbing">Plumbing</option>
                                    <option value="Electrical">Electrical</option>
                                    <option value="Tutoring">Tutoring</option>
                                    <option value="General">General Service</option>
                                 </select>
                              </div>
                              <div>
                                 <label className="block text-[10px] font-black text-brand-text-variant uppercase tracking-[0.2em] mb-3 ml-1">Your Budget (₱)</label>
                                 <input type="number" value={formBudget} onChange={(e) => setFormBudget(e.target.value)} placeholder="500" className="w-full p-5 rounded-[1.5rem] border-2 border-brand-outline focus:border-brand-primary focus:ring-8 focus:ring-brand-primary/5 transition-all text-lg font-black text-brand-text-main bg-brand-surface outline-none" />
                              </div>
                           </div>
                           <div>
                              <label className="block text-[10px] font-black text-brand-text-variant uppercase tracking-[0.2em] mb-3 ml-1">Describe the job</label>
                              <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="The more detail you provide, the better bids you'll receive..." className="w-full p-5 rounded-[1.5rem] border-2 border-brand-outline focus:border-brand-primary focus:ring-8 focus:ring-brand-primary/5 transition-all text-sm font-bold text-brand-text-main bg-brand-surface outline-none h-44 resize-none leading-relaxed" />
                           </div>
                        </div>
                     </div>

                     {/* Right: Logistics & Payment */}
                     <div className="space-y-10">
                        <div className="flex items-center gap-3 border-b border-brand-outline pb-4">
                           <MapPin size={20} className="text-blue-500" />
                           <h4 className="text-sm font-black text-brand-text-main uppercase tracking-widest">Section 2: Timing & Logistics</h4>
                        </div>
                        <div className="space-y-8">
                           {/* Location Selection */}
                           <div>
                              <label className="block text-[10px] font-black text-brand-text-variant uppercase tracking-[0.2em] mb-3 ml-1">Where should the service happen?</label>
                              <div className="space-y-4">
                                 {addresses.length > 0 && (
                                    <div className="relative group">
                                       <select 
                                          value={selectedAddressId} 
                                          onChange={(e) => {
                                             const val = e.target.value;
                                             setSelectedAddressId(val);
                                             if (val !== 'new') {
                                                const addr = addresses.find(a => a.id.toString() === val);
                                                if (addr) setFormLocation(addr.address_text);
                                             } else {
                                                setFormLocation('');
                                             }
                                          }}
                                          className="w-full p-5 rounded-[1.5rem] border-2 border-brand-outline hover:border-brand-primary focus:border-brand-primary transition-all text-sm font-bold text-brand-text-main bg-brand-surface outline-none appearance-none cursor-pointer pr-12"
                                       >
                                          {addresses.map(addr => (
                                             <option key={addr.id} value={addr.id.toString()}>
                                                📍 {addr.label}: {addr.address_text}
                                             </option>
                                          ))}
                                          <option value="new">➕ Add a new address...</option>
                                       </select>
                                       <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-brand-text-variant group-hover:text-brand-primary pointer-events-none" size={20} />
                                    </div>
                                 )}
                                 {(selectedAddressId === 'new' || addresses.length === 0) && (
                                    <div className="relative animate-in slide-in-from-top-2 duration-300">
                                       <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-text-variant" size={20} />
                                       <input 
                                          value={formLocation} 
                                          onChange={(e) => setFormLocation(e.target.value)} 
                                          placeholder="Enter the complete service address..." 
                                          className="w-full p-5 pl-14 rounded-[1.5rem] border-2 border-brand-primary/30 bg-brand-primary/5 focus:border-brand-primary focus:ring-8 focus:ring-brand-primary/5 transition-all text-sm font-bold text-brand-text-main outline-none" 
                                       />
                                    </div>
                                 )}
                              </div>
                           </div>

                           {/* Scheduling */}
                           <div className="grid grid-cols-2 gap-6">
                              <div>
                                 <label className="block text-[10px] font-black text-brand-text-variant uppercase tracking-[0.2em] mb-3 ml-1">Schedule Date</label>
                                 <div className="relative group">
                                    <Calendar className={`absolute left-5 top-1/2 -translate-y-1/2 ${formIsASAP ? 'text-gray-300' : 'text-brand-text-variant group-focus-within:text-brand-primary'} transition-colors`} size={20} />
                                    <input 
                                       type="datetime-local"
                                        value={formDate}
                                        min={new Date().toISOString().slice(0, 16)} 
                                       onChange={(e) => setFormDate(e.target.value)} 
                                       disabled={formIsASAP}
                                       className="w-full p-5 pl-14 rounded-[1.5rem] border-2 border-brand-outline focus:border-brand-primary transition-all text-sm font-bold text-brand-text-main bg-brand-surface outline-none disabled:opacity-30 disabled:grayscale" 
                                    />
                                 </div>
                              </div>
                              <div className="flex items-end">
                                 <label className={`flex-1 p-5 rounded-[1.5rem] border-2 transition-all cursor-pointer flex items-center justify-center gap-3 ${formIsASAP ? 'bg-orange-500 border-orange-500 text-white shadow-xl shadow-orange-500/30' : 'bg-brand-surface border-brand-outline text-brand-text-variant hover:border-orange-500/50 hover:bg-orange-50/10'}`}>
                                    <Zap size={20} className={formIsASAP ? 'animate-pulse' : ''} />
                                    <span className="text-xs font-black uppercase tracking-[0.1em]">Mark as Urgent</span>
                                    <input type="checkbox" checked={formIsASAP} onChange={(e) => setFormIsASAP(e.target.checked)} className="hidden" />
                                 </label>
                              </div>
                           </div>

                           {/* Payment Setup */}
                           <div>
                              <label className="block text-[10px] font-black text-brand-text-variant uppercase tracking-[0.2em] mb-4 ml-1">Payout Method</label>
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                 <button
                                     type="button"
                                     onClick={() => setFormPayment('gcash')}
                                    className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${formPayment === 'gcash' ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/30' : 'bg-brand-surface border-brand-outline text-brand-text-main hover:border-blue-500/50'}`}
                                 >
                                    <Smartphone size={24} />
                                    <span className="font-black text-sm">GCash</span>
                                 </button>
                                 <button
                                     type="button"
                                     onClick={() => setFormPayment('maya')}
                                    className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${formPayment === 'maya' ? 'bg-green-600 border-green-600 text-white shadow-xl shadow-green-600/30' : 'bg-brand-surface border-brand-outline text-brand-text-main hover:border-green-500/50'}`}
                                 >
                                    <Smartphone size={24} />
                                    <span className="font-black text-sm">Maya</span>
                                 </button>
                              </div>
                              
                              <div className="relative animate-in fade-in duration-500">
                                 <div className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-text-variant opacity-50 font-bold text-sm">
                                    {formPayment === 'gcash' ? 'GCash #' : 'Maya #'}
                                 </div>
                                 <input 
                                    type="text"
                                    value={formPayment === 'gcash' ? tempGcashNumber : tempMayaNumber}
                                    onChange={(e) => formPayment === 'gcash' ? setTempGcashNumber(e.target.value) : setTempMayaNumber(e.target.value)}
                                    placeholder="09XXXXXXXXX"
                                    className="w-full p-5 pl-24 rounded-[1.5rem] border-2 border-brand-outline focus:border-brand-primary transition-all text-sm font-bold text-brand-text-main bg-brand-surface outline-none"
                                 />
                              </div>
                           </div>

                           {/* Save Options */}
                           <label className="flex items-center gap-3 p-4 bg-brand-surface border border-brand-outline rounded-2xl cursor-pointer hover:bg-brand-surface-card transition-colors group">
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${saveDetails ? 'bg-brand-primary border-brand-primary shadow-lg shadow-brand-primary/20' : 'border-brand-outline group-hover:border-brand-primary'}`}>
                                 {saveDetails && <CheckCircle size={16} className="text-white" />}
                              </div>
                              <span className="text-xs font-bold text-brand-text-main">Save these details to my profile for future tasks</span>
                              <input type="checkbox" checked={saveDetails} onChange={(e) => setSaveDetails(e.target.checked)} className="hidden" />
                           </label>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Modal Footer */}
               <div className="p-10 border-t border-brand-outline bg-brand-surface/80 backdrop-blur-lg flex justify-between items-center sticky bottom-0 z-10">
                  <div className="hidden sm:flex items-center gap-4">
                     <div className="p-3 bg-[#059669]/10 rounded-xl">
                        <Wallet size={24} className="text-[#059669]" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-[0.2em] mb-0.5">Total Commitment</p>
                        <p className="text-2xl font-black text-brand-text-main">₱{formBudget ? parseInt(formBudget).toLocaleString() : '0'}</p>
                     </div>
                  </div>
                  <div className="flex gap-4 w-full sm:w-auto">
                     <button onClick={() => setShowPostModal(false)} className="px-8 py-5 font-black text-brand-text-variant hover:text-brand-text-main transition-all uppercase tracking-[0.2em] text-[10px]">Cancel</button>
                     <button onClick={handlePostJob} className="px-12 py-5 bg-brand-primary text-white rounded-[1.5rem] font-black text-sm hover:bg-[#047857] hover:scale-[1.05] shadow-2xl shadow-brand-primary/40 transition-all active:scale-95 flex items-center gap-3 uppercase tracking-wider">
                        <Plus size={20} /> List Task Now
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(null)}></div>
            <div className="relative bg-brand-surface-card w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 text-center animate-in fade-in zoom-in-95 duration-200 border border-white/10">
               <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-red-100">
                  <Trash2 size={36} />
               </div>
               <h3 className="text-2xl font-black text-brand-text-main mb-4 tracking-tight uppercase">Revoke Listing?</h3>
               <p className="text-brand-text-variant mb-10 font-medium leading-relaxed">
                  This will permanently remove <strong>"{showDeleteModal.title}"</strong> and dismiss all current bids.
               </p>
               <div className="flex gap-4">
                  <button onClick={() => setShowDeleteModal(null)} className="flex-1 py-4 bg-brand-surface border border-brand-outline rounded-2xl font-black text-xs uppercase tracking-widest text-brand-text-main hover:bg-brand-surface-card transition-all">Dismiss</button>
                  <button onClick={handleDeletePost} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 hover:bg-red-700 transition-all">Delete Post</button>
               </div>
            </div>
         </div>
      )}
      {/* Applicants Modal */}
      {viewApplicantsJob && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setViewApplicantsJob(null)}></div>
            <div className="relative bg-brand-surface-card w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col text-left max-h-[85vh] border border-white/10">
               <div className="p-8 border-b border-brand-outline flex justify-between items-center bg-brand-surface/50 backdrop-blur-md sticky top-0 z-10">
                  <div>
                     <h3 className="text-2xl font-black text-brand-text-main tracking-tight uppercase">
                        Review Bids: {viewApplicantsJob.title}
                     </h3>
                     <p className="text-sm font-medium text-brand-text-variant mt-1">Select the best professional for your task.</p>
                  </div>
                  <button onClick={() => setViewApplicantsJob(null)} className="p-3 bg-brand-surface border border-brand-outline text-brand-text-variant hover:text-brand-text-main rounded-2xl transition-all shadow-sm">
                     <X size={20} />
                  </button>
               </div>
               <div className="p-8 overflow-y-auto bg-brand-surface/30 space-y-4">
                  {viewApplicantsJob.applicants.length === 0 ? (
                     <div className="text-center py-12">
                        <div className="w-16 h-16 bg-brand-surface border-2 border-brand-outline rounded-3xl flex items-center justify-center mx-auto mb-4">
                           <Users size={24} className="text-brand-text-variant" />
                        </div>
                        <p className="text-brand-text-main font-bold">No bids received yet.</p>
                        <p className="text-sm text-brand-text-variant mt-2">Professionals will appear here once they apply.</p>
                     </div>
                  ) : (
                     viewApplicantsJob.applicants.map((app: any) => (
                        <div key={app.id} className="bg-brand-surface border-2 border-brand-outline rounded-3xl p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center hover:border-brand-primary/50 transition-all hover:shadow-lg">
                           <img src={app.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&h=100&auto=format&fit=crop"} alt={app.full_name} className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-outline" />
                           <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                 <h4 className="text-lg font-black text-brand-text-main">{app.full_name || 'Professional'}</h4>
                                 <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Verified</span>
                              </div>
                              <p className="text-sm font-medium text-brand-text-variant mb-4 bg-brand-surface-card p-3 rounded-xl border border-brand-outline/50">"{app.message || 'I am interested in this task and available to help.'}"</p>
                              <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-brand-text-variant">
                                 <span className="flex items-center gap-1.5"><Star size={14} className="text-amber-500" /> 4.9 Rating</span>
                                 <span className="flex items-center gap-1.5"><MapPin size={14} className="text-blue-500" /> {app.location || 'Local Provider'}</span>
                              </div>
                           </div>
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                               <button
                                  onClick={async () => {
                                     if (!confirm(`Decline application from ${app.full_name}?`)) return;
                                     try {
                                        await api.decideApplication(app.id, 'rejected');
                                        fetchJobs();
                                     } catch (err) {
                                        console.error('Failed to decline applicant', err);
                                     }
                                  }}
                                  className="px-6 py-4 bg-brand-surface border border-red-200 text-red-600 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                               >
                                  <X size={16} /> Decline
                               </button>
                               <button
                                  onClick={async () => {
                                     try {
                                        await api.decideApplication(app.id, 'accepted');
                                        setViewApplicantsJob(null);
                                        fetchJobs();
                                        
                                        // Trigger a generic event so other components (like HomeDashboard) might refresh
                                        const channel = new BroadcastChannel('dashboard_sync');
                                        channel.postMessage({ type: 'DATA_UPDATED' });
                                        channel.close();
                                     } catch (err) {
                                        console.error('Failed to accept applicant', err);
                                        alert('Failed to accept applicant.');
                                     }
                                  }}
                                  className="px-8 py-4 bg-brand-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-[#059669] transition-all shadow-lg shadow-brand-primary/20 active:scale-95 flex items-center justify-center gap-2"
                               >
                                  <CheckCircle size={16} /> Hire Now
                               </button>
                            </div>
                        </div>
                     ))
                  )}
               </div>
            </div>
         </div>
      )}

    </div>
  );
};
