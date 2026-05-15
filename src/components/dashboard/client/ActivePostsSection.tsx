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
  Wallet
} from 'lucide-react';
import { api } from '../../../services/api';

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
  const [formPayment, setFormPayment] = React.useState('gcash');
  const [formError, setFormError] = React.useState('');
  const [hiringInfo, setHiringInfo] = React.useState<{jobId: number, applicationId: number, amount: number} | null>(null);
  const [selectedPayment, setSelectedPayment] = React.useState('gcash');
  const [addresses, setAddresses] = React.useState<any[]>([]);
  const [userData, setUserData] = React.useState<any>(null);
  const [invitedProvider, setInvitedProvider] = React.useState<any>(null);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string>('custom');
  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const [jobs, userAddresses, currentUser] = await Promise.all([
        api.getJobs({ status: 'pending' }),
        api.getAddresses(),
        api.getMe()
      ]);
      setAddresses(userAddresses);
      setUserData(currentUser);
      
      // Set default payment method if available
      if (currentUser.payment_method) {
        setFormPayment(currentUser.payment_method);
        setSelectedPayment(currentUser.payment_method);
      }

      // Set default address if available
      const defaultAddr = userAddresses.find((a: any) => a.is_default);
      if (defaultAddr) {
        setFormLocation(defaultAddr.address_text);
        setSelectedAddressId(defaultAddr.id.toString());
      }

      // Fetch applications for each job
      const jobsWithApps = await Promise.all(
        jobs.map(async (job: any) => {
          const apps = await api.getJobApplications(job.id);
          return { ...job, applicants: apps };
        })
      );
      setActivePosts(jobsWithApps);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchJobs();

    const handleHireEvent = (e: any) => {
      setInvitedProvider(e.detail);
      setShowPostModal(true);
      if (e.detail.services) {
        setFormCategory(e.detail.services.split(', ')[0] || '');
      }
    };
    window.addEventListener('hire-provider', handleHireEvent);
    return () => window.removeEventListener('hire-provider', handleHireEvent);
  }, []);

  const handleHire = async (jobId: number, applicationId: number, paymentMethod: string) => {
    try {
      setIsProcessingPayment(true);
      await api.decideApplication(applicationId, 'accepted', paymentMethod);
      setShowConfetti(true);
      setHiringInfo(null);
      setTimeout(() => {
        setShowConfetti(false);
        setViewApplicantsJob(null);
        setActivePosts(prev => prev.filter(job => job.id !== jobId));
      }, 2000);
    } catch (error) {
      console.error('Failed to hire', error);
    } finally {
      setIsProcessingPayment(false);
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
        payment_method: formPayment,
        provider_id: invitedProvider?.id
      });
      
      // If payment method chosen is different from default, suggest update? 
      // For now we just create the job.

      fetchJobs();
      setShowPostModal(false);
      setInvitedProvider(null);
      
      // Reset Form
      setFormTitle('');
      setFormCategory('');
      setFormDesc('');
      setFormLocation('');
      setFormDate('');
      setFormIsASAP(false);
      setFormBudget('');
      setFormNegotiable(false);
      // Keep formPayment as is for next post convenience
      
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
           <div className="relative bg-brand-surface-card w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col text-left">
              {/* Header */}
              <div className="p-6 border-b border-brand-outline bg-brand-surface/50 flex justify-between items-center shrink-0">
                 <div>
                    <h3 className="text-xl font-bold text-brand-text-main">
                        {invitedProvider ? `Invite ${invitedProvider.full_name}` : 'Post a New Task'}
                    </h3>
                    <p className="text-xs text-brand-text-variant mt-0.5">Fill in the details to find the best provider for you.</p>
                 </div>
                 <button 
                  onClick={() => setShowPostModal(false)}
                  className="p-2 text-brand-text-variant hover:text-brand-text-main hover:bg-brand-outline/50 rounded-full transition-colors bg-brand-surface shadow-sm border border-brand-outline"
                 >
                    <X size={20} />
                 </button>
              </div>

              {/* Body */}
              <div className="p-8 overflow-y-auto flex-1 bg-brand-surface">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    
                    {/* Left Column: The Basics */}
                    <div className="space-y-10">
                       {invitedProvider && (
                         <div className="bg-brand-primary/5 border-2 border-brand-primary/20 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                            <img src={invitedProvider.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&h=100&auto=format&fit=crop"} alt={invitedProvider.full_name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                            <div>
                              <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Inviting Professional</p>
                              <h4 className="text-sm font-bold text-brand-text-main">{invitedProvider.full_name}</h4>
                            </div>
                         </div>
                       )}

                       <section className="space-y-6">
                          <div className="flex items-center gap-3 border-b border-brand-outline pb-3">
                             <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                <Info size={18} />
                             </div>
                             <h4 className="text-sm font-bold text-brand-text-main uppercase tracking-widest">Section A: The Basics</h4>
                          </div>
                          
                          <div className="space-y-6">
                             <div>
                                <label className="block text-xs font-bold text-brand-text-variant uppercase tracking-wider mb-2 ml-1">Job Title</label>
                                <input 
                                   type="text" 
                                   value={formTitle}
                                   onChange={(e) => setFormTitle(e.target.value)}
                                   placeholder="e.g., Need a Plumber for Kitchen Sink" 
                                   className={`w-full p-4 rounded-2xl border-2 hover:border-brand-primary/50 focus:ring-8 focus:ring-brand-primary/5 shadow-sm transition-all font-medium ${formError.includes('Title') ? 'border-red-400 focus:border-red-500 hover:border-red-400/50' : 'border-brand-outline focus:border-brand-primary'} text-sm text-brand-text-main placeholder:text-brand-text-variant/40 focus:outline-none`}
                                />
                             </div>
                             
                             <div>
                                <label className="block text-xs font-bold text-brand-text-variant uppercase tracking-wider mb-2 ml-1">Category</label>
                                <div className="relative group">
                                   <select 
                                      value={formCategory}
                                      onChange={(e) => setFormCategory(e.target.value)}
                                      className="w-full p-4 rounded-2xl border-2 hover:border-brand-primary/50 focus:ring-8 focus:ring-brand-primary/5 shadow-sm transition-all font-medium border-brand-outline text-sm text-brand-text-main bg-brand-surface focus:outline-none focus:border-brand-primary appearance-none cursor-pointer"
                                   >
                                      <option value="" disabled>Select a category</option>
                                      <option value="Cleaning">Cleaning</option>
                                      <option value="Repair">Repair</option>
                                      <option value="Plumbing">Plumbing</option>
                                      <option value="Electrical">Electrical</option>
                                      <option value="Tutoring">Tutoring</option>
                                      <option value="General">General</option>
                                   </select>
                                   <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-text-variant group-hover:text-brand-primary transition-colors">
                                      <ChevronRight size={18} className="transform rotate-90" />
                                   </div>
                                </div>
                             </div>

                             <div>
                                <label className="block text-xs font-bold text-brand-text-variant uppercase tracking-wider mb-2 ml-1">Task Description</label>
                                <textarea 
                                   value={formDesc}
                                   onChange={(e) => setFormDesc(e.target.value)}
                                   placeholder="The sink has been leaking since last night... I need someone to check the pipes and fix any leaks. Material costs can be discussed." 
                                   className="w-full p-4 rounded-2xl border-2 hover:border-brand-primary/50 focus:ring-8 focus:ring-brand-primary/5 shadow-sm transition-all border-brand-outline text-sm text-brand-text-main placeholder:text-brand-text-variant/40 focus:outline-none focus:border-brand-primary resize-none h-[220px] leading-relaxed"
                                />
                             </div>
                          </div>
                       </section>
                    </div>

                    {/* Right Column: Logistics & Compensation */}
                    <div className="space-y-10">
                       {/* Section B: Logistics */}
                       <section className="space-y-6">
                          <div className="flex items-center gap-3 border-b border-brand-outline pb-3">
                             <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <Clock size={18} />
                             </div>
                             <h4 className="text-sm font-bold text-brand-text-main uppercase tracking-widest">Section B: Logistics</h4>
                          </div>

                          <div className="space-y-6">
                             <div>
                                 <label className="block text-xs font-bold text-brand-text-variant uppercase tracking-wider mb-2 ml-1">Service Location</label>
                                 {addresses.length > 0 ? (
                                   <div className="flex flex-col gap-3">
                                      <div className="relative group">
                                         <select 
                                           value={selectedAddressId}
                                           onChange={(e) => {
                                             const val = e.target.value;
                                             setSelectedAddressId(val);
                                             if (val !== 'custom') {
                                               const addr = addresses.find(a => a.id.toString() === val);
                                               if (addr) setFormLocation(addr.address_text);
                                             }
                                           }}
                                           className="w-full p-4 rounded-2xl border-2 border-brand-outline hover:border-brand-primary/50 focus:border-brand-primary focus:ring-8 focus:ring-brand-primary/5 shadow-sm transition-all font-medium text-sm text-brand-text-main bg-brand-surface focus:outline-none appearance-none cursor-pointer"
                                         >
                                           {addresses.map(addr => (
                                             <option key={addr.id} value={addr.id.toString()}>
                                               {addr.label}: {addr.address_text} {addr.is_default ? '(Default)' : ''}
                                             </option>
                                           ))}
                                           <option value="custom">Use a different address...</option>
                                         </select>
                                         <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-text-variant group-hover:text-brand-primary transition-colors">
                                            <ChevronRight size={18} className="transform rotate-90" />
                                         </div>
                                      </div>
                                     
                                     {selectedAddressId === 'custom' && (
                                       <div className="relative group animate-in slide-in-from-top-2 duration-300">
                                         <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-variant group-focus-within:text-brand-primary transition-colors" size={18} />
                                         <input 
                                            type="text" 
                                            value={formLocation}
                                            onChange={(e) => setFormLocation(e.target.value)}
                                            placeholder="Enter custom location..." 
                                            className="w-full p-4 pl-12 rounded-2xl border-2 border-brand-outline hover:border-brand-primary/50 focus:border-brand-primary focus:ring-8 focus:ring-brand-primary/5 shadow-sm transition-all font-medium text-sm text-brand-text-main placeholder:text-brand-text-variant/40 focus:outline-none"
                                         />
                                       </div>
                                     )}
                                   </div>
                                 ) : (
                                   <div className="relative group">
                                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-variant group-focus-within:text-brand-primary transition-colors" size={18} />
                                      <input 
                                         type="text" 
                                         value={formLocation}
                                         onChange={(e) => setFormLocation(e.target.value)}
                                         placeholder="e.g., Barangay Paliparan, Dasmariñas" 
                                         className="w-full p-4 pl-12 rounded-2xl border-2 border-brand-outline hover:border-brand-primary/50 focus:border-brand-primary focus:ring-8 focus:ring-brand-primary/5 shadow-sm transition-all font-medium text-sm text-brand-text-main placeholder:text-brand-text-variant/40 focus:outline-none"
                                      />
                                   </div>
                                 )}
                              </div>

                             <div className="flex flex-col sm:flex-row gap-4 items-end">
                                <div className="flex-1 w-full">
                                   <label className="block text-xs font-bold text-brand-text-variant uppercase tracking-wider mb-2 ml-1">Scheduled Date & Time</label>
                                   <div className="relative group">
                                      <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 ${formIsASAP ? 'text-gray-300' : 'text-brand-text-variant group-focus-within:text-brand-primary'} transition-colors`} size={18} />
                                      <input 
                                         type="datetime-local" 
                                         value={formDate}
                                         onChange={(e) => setFormDate(e.target.value)}
                                         disabled={formIsASAP}
                                         className="w-full p-4 pl-12 rounded-2xl border-2 hover:border-brand-primary/50 focus:ring-8 focus:ring-brand-primary/5 shadow-sm transition-all font-medium border-brand-outline text-sm text-brand-text-main bg-brand-surface focus:outline-none focus:border-brand-primary disabled:opacity-50 disabled:bg-gray-50/50 disabled:border-brand-outline/50"
                                      />
                                   </div>
                                </div>
                                
                                <div className="shrink-0 pb-1">
                                   <label className="flex items-center gap-3 cursor-pointer group bg-brand-surface p-3 px-4 rounded-2xl border-2 border-brand-outline hover:border-orange-500/30 transition-all shadow-sm h-[54px]">
                                      <div className={`w-10 h-5 rounded-full flex items-center transition-all px-0.5 ${formIsASAP ? 'bg-orange-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                                         <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
                                      </div>
                                      <div className="flex flex-col">
                                         <span className={`text-xs font-bold ${formIsASAP ? 'text-orange-600' : 'text-brand-text-main'} select-none transition-colors`}>ASAP</span>
                                         <span className="text-[10px] text-brand-text-variant">Post as urgent</span>
                                      </div>
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
                       <section className="space-y-6">
                          <div className="flex items-center gap-3 border-b border-brand-outline pb-3">
                             <div className="w-8 h-8 rounded-lg bg-[#059669]/10 flex items-center justify-center text-[#059669]">
                                <Banknote size={18} />
                             </div>
                             <h4 className="text-sm font-bold text-brand-text-main uppercase tracking-widest">Section C: Compensation</h4>
                          </div>

                          <div className="space-y-6">
                             <div className="flex flex-col sm:flex-row gap-4 items-end">
                                <div className="flex-1 w-full">
                                   <label className="block text-xs font-bold text-brand-text-variant uppercase tracking-wider mb-2 ml-1">Project Budget (₱)</label>
                                   <div className="relative group">
                                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-brand-text-main group-focus-within:text-brand-primary transition-colors text-lg">₱</span>
                                      <input 
                                         type="number" 
                                         value={formBudget}
                                         onChange={(e) => setFormBudget(e.target.value)}
                                         placeholder="e.g., 500" 
                                         className={`w-full p-4 pl-10 rounded-2xl border-2 hover:border-brand-primary/50 focus:ring-8 focus:ring-brand-primary/5 shadow-sm transition-all font-bold text-lg ${formError.includes('Price') ? 'border-red-400 focus:border-red-500 hover:border-red-400/50' : 'border-brand-outline focus:border-brand-primary'} text-brand-text-main placeholder:text-brand-text-variant/30 focus:outline-none`}
                                      />
                                   </div>
                                </div>
                                
                                <div className="shrink-0 pb-1">
                                   <label className="flex items-center gap-3 cursor-pointer group bg-brand-surface p-3 px-4 rounded-2xl border-2 border-brand-outline hover:border-brand-primary/30 transition-all shadow-sm h-[54px]">
                                      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${formNegotiable ? 'bg-brand-primary border-brand-primary' : 'bg-white border-brand-outline group-hover:border-brand-primary'}`}>
                                         {formNegotiable && <CheckCircle size={14} className="text-white" />}
                                      </div>
                                      <div className="flex flex-col">
                                         <span className="text-xs font-bold text-brand-text-main select-none group-hover:text-brand-primary transition-colors">Negotiable</span>
                                         <span className="text-[10px] text-brand-text-variant">Open for offers</span>
                                      </div>
                                      <input 
                                         type="checkbox" 
                                         checked={formNegotiable} 
                                         onChange={(e) => setFormNegotiable(e.target.checked)} 
                                         className="hidden" 
                                      />
                                   </label>
                                </div>
                             </div>
                             
                              <div className="space-y-4">
                                 <div className="flex items-center justify-between ml-1">
                                    <label className="block text-xs font-bold text-brand-text-variant uppercase tracking-wider">Preferred Payment Method</label>
                                 </div>
                                 
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <label className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${formPayment === 'gcash' ? 'border-blue-500 bg-blue-50/30' : 'border-brand-outline hover:border-blue-200 bg-brand-surface'}`}>
                                       <input 
                                          type="radio" 
                                          name="payment" 
                                          value="gcash" 
                                          checked={formPayment === 'gcash'} 
                                          onChange={() => setFormPayment('gcash')} 
                                          className="hidden" 
                                       />
                                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${formPayment === 'gcash' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-brand-surface-container text-brand-text-variant'}`}>
                                          <Smartphone size={20} />
                                       </div>
                                       <div className="flex-1 overflow-hidden">
                                          <span className={`block font-bold text-sm ${formPayment === 'gcash' ? 'text-blue-600' : 'text-brand-text-main'}`}>GCash</span>
                                          {userData?.gcash_number ? (
                                            <span className="text-[9px] font-medium text-brand-text-variant tracking-widest truncate block">{userData.gcash_number.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</span>
                                          ) : (
                                            <span className="text-[9px] font-medium text-red-400">Not linked</span>
                                          )}
                                       </div>
                                       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${formPayment === 'gcash' ? 'border-blue-500 bg-blue-500' : 'border-brand-outline'}`}>
                                          {formPayment === 'gcash' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                       </div>
                                    </label>

                                    <label className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${formPayment === 'maya' ? 'border-green-500 bg-green-50/30' : 'border-brand-outline hover:border-green-200 bg-brand-surface'}`}>
                                       <input 
                                          type="radio" 
                                          name="payment" 
                                          value="maya" 
                                          checked={formPayment === 'maya'} 
                                          onChange={() => setFormPayment('maya')} 
                                          className="hidden" 
                                       />
                                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${formPayment === 'maya' ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-brand-surface-container text-brand-text-variant'}`}>
                                          <Smartphone size={20} />
                                       </div>
                                       <div className="flex-1 overflow-hidden">
                                          <span className={`block font-bold text-sm ${formPayment === 'maya' ? 'text-green-600' : 'text-brand-text-main'}`}>Maya</span>
                                          {userData?.maya_number ? (
                                            <span className="text-[9px] font-medium text-brand-text-variant tracking-widest truncate block">{userData.maya_number.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</span>
                                          ) : (
                                            <span className="text-[9px] font-medium text-red-400">Not linked</span>
                                          )}
                                       </div>
                                       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${formPayment === 'maya' ? 'border-green-500 bg-green-500' : 'border-brand-outline'}`}>
                                          {formPayment === 'maya' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                       </div>
                                    </label>
                                 </div>
                                 
                                 {((!userData?.gcash_number && formPayment === 'gcash') || (!userData?.maya_number && formPayment === 'maya')) && (
                                    <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl flex items-start gap-2 animate-in fade-in duration-500">
                                       <AlertTriangle className="text-orange-500 shrink-0" size={14} />
                                       <p className="text-[10px] text-orange-600 leading-tight">You haven't set up your {formPayment === 'gcash' ? 'GCash' : 'Maya'} number in your profile yet.</p>
                                    </div>
                                 )}
                              </div>
                          </div>
                       </section>
                    </div>
                 </div>

                 {formError && (
                    <div className="mt-8 bg-red-50 text-red-600 p-4 rounded-2xl border-2 border-red-100 text-sm font-bold flex items-center gap-3 animate-shake">
                       <AlertTriangle size={20} className="shrink-0" />
                       {formError}
                    </div>
                 )}
              </div>

              {/* Footer */}
              <div className="p-8 border-t border-brand-outline bg-brand-surface/80 backdrop-blur-md flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                 <div className="text-left hidden sm:block">
                    <p className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest mb-1">Estimated Cost</p>
                    <p className="text-xl font-black text-brand-text-main">₱{formBudget ? parseInt(formBudget).toLocaleString() : '0'}</p>
                 </div>
                 
                 <div className="flex gap-4 w-full sm:w-auto">
                    <button 
                     onClick={() => setShowPostModal(false)}
                     className="flex-1 sm:flex-none px-8 py-4 text-sm font-bold text-brand-text-variant hover:text-brand-text-main hover:bg-brand-outline/30 transition-all rounded-2xl"
                    >
                       Cancel
                    </button>
                    <button 
                     onClick={handlePostJob}
                     className="flex-1 sm:flex-none px-12 py-4 bg-brand-primary text-white text-sm font-bold hover:bg-[#059669] hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-primary/20 transition-all rounded-2xl active:scale-95 flex items-center justify-center gap-2"
                    >
                       <Plus size={18} />
                       Post Task
                    </button>
                 </div>
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
                       <span className="font-bold text-brand-text-main">Budget: ₱{viewApplicantsJob.budget?.toLocaleString()}</span>
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
                                onClick={() => setHiringInfo({ jobId: viewApplicantsJob.id, applicationId: applicant.id, amount: viewApplicantsJob.budget })}
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
      {/* Hire Confirmation Modal */}
      {hiringInfo && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setHiringInfo(null)}></div>
           <div className="relative bg-brand-surface-card w-full max-w-md rounded-[2rem] shadow-2xl border border-brand-outline p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left">
              <div className="text-center mb-8">
                 <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Banknote size={32} />
                 </div>
                 <h3 className="text-2xl font-bold text-brand-text-main">Confirm Payment</h3>
                 <p className="text-sm text-brand-text-variant mt-2">Choose your preferred payment method to finalize the hire.</p>
              </div>

              <div className="space-y-4 mb-8">
                 <button 
                    onClick={() => setSelectedPayment('gcash')}
                    className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${selectedPayment === 'gcash' ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-outline hover:border-brand-primary/50'}`}
                 >
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-7 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-[8px]">GCASH</div>
                       <div className="flex flex-col items-start">
                          <span className={`font-bold ${selectedPayment === 'gcash' ? 'text-brand-text-main' : 'text-brand-text-variant'}`}>GCash</span>
                          {userData?.gcash_number && <span className="text-[10px] text-brand-text-variant">{userData.gcash_number.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</span>}
                       </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'gcash' ? 'border-brand-primary bg-brand-primary' : 'border-brand-outline'}`}>
                       {selectedPayment === 'gcash' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                 </button>

                 <button 
                    onClick={() => setSelectedPayment('maya')}
                    className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${selectedPayment === 'maya' ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-outline hover:border-brand-primary/50'}`}
                 >
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-7 bg-green-500 rounded flex items-center justify-center font-bold text-white text-[8px]">MAYA</div>
                       <div className="flex flex-col items-start">
                          <span className={`font-bold ${selectedPayment === 'maya' ? 'text-brand-text-main' : 'text-brand-text-variant'}`}>Maya</span>
                          {userData?.maya_number && <span className="text-[10px] text-brand-text-variant">{userData.maya_number.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</span>}
                       </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'maya' ? 'border-brand-primary bg-brand-primary' : 'border-brand-outline'}`}>
                       {selectedPayment === 'maya' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                 </button>
              </div>

              <div className="bg-brand-surface p-4 rounded-2xl border border-brand-outline mb-8 flex justify-between items-center">
                 <span className="text-sm font-semibold text-brand-text-variant">Total Payment:</span>
                 <span className="text-xl font-bold text-brand-text-main">₱{hiringInfo.amount.toLocaleString()}</span>
              </div>

              <div className="flex gap-3">
                 <button 
                    onClick={() => setHiringInfo(null)}
                    className="flex-1 py-4 bg-brand-surface border border-brand-outline text-brand-text-main font-bold rounded-2xl hover:bg-brand-surface-card transition-colors"
                 >
                    Cancel
                 </button>
                  <button 
                     onClick={() => handleHire(hiringInfo.jobId, hiringInfo.applicationId, selectedPayment)}
                     disabled={isProcessingPayment}
                     className="flex-1 py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:bg-[#059669] transition-all disabled:opacity-70 disabled:cursor-wait"
                  >
                     {isProcessingPayment ? (
                        <div className="flex items-center justify-center gap-2">
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           <span>Charging Account...</span>
                        </div>
                     ) : (
                        "Pay & Hire"
                     )}
                  </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
