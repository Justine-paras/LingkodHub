import React from 'react';
import { 
  Search, 
  Filter, 
  History, 
  Calendar, 
  Star, 
  Smartphone, 
  Banknote, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Phone,
  Trash2,
  CheckCircle,
  MapPin,
  CreditCard
} from 'lucide-react';
import { api } from '../../../services/api';

export const HistorySection = () => {
  const [selectedJob, setSelectedJob] = React.useState<any>(null);
  const [history, setHistory] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [currentUser, setCurrentUser] = React.useState<any>(null);

  const fetchHistory = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [me, pending, ongoing, completed, cancelled] = await Promise.all([
        api.getMe(), 
        api.getJobs({ status: 'pending' }),
        api.getJobs({ status: 'in_progress' }),
        api.getJobs({ status: 'completed' }),
        api.getJobs({ status: 'cancelled' })
      ]);
      setCurrentUser(me);
      const allJobs = [...pending, ...ongoing, ...completed, ...cancelled];
      
      let reviews: any[] = [];
      try {
        const reviewData = await api.getUserReviews(me.id);
        reviews = Array.isArray(reviewData) ? reviewData : (reviewData.reviews || []);
      } catch (e) {
        console.warn('Failed to fetch reviews for history', e);
      }

      const mapped = allJobs.map((job: any) => {
        const jobReview = reviews.find((r: any) => 
          r.job_id === job.id && 
          (me.role === 'client' ? r.reviewer_id === me.id : r.reviewee_id === me.id)
        );
        
        return {
          ...job,
          date: new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }),
          worker: me.role === 'provider' ? job.client_name : job.provider_name,
          workerAvatar: me.role === 'provider' ? job.client_avatar : job.provider_avatar,
          amount: Number(job.budget || 0),
          paymentMethod: job.payment_method || 'gcash',
          displayStatus: job.status.charAt(0).toUpperCase() + job.status.slice(1).replace('_', ' '),
          description: job.description || '',
          review: jobReview?.comment || job.review_comment || '', 
          rating: jobReview?.rating || job.rating || 0,
          workerPhone: job.client_phone || job.provider_phone || '',
          role: me.role,
          location: job.location || 'Remote'
        };
      });
      setHistory(mapped);
    } catch (error) {
      console.error('Fetch history error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchHistory();
    const channel = new BroadcastChannel('dashboard_sync');
    channel.onmessage = (event) => {
      if (event.data.type === 'DATA_UPDATED') fetchHistory();
    };
    return () => channel.close();
  }, [fetchHistory]);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} history records?`)) return;
    
    try {
      await api.bulkDeleteJobs(selectedIds);
      setSelectedIds([]);
      await fetchHistory();
    } catch (err) {
      console.error('Bulk delete failed', err);
      alert('Delete failed. Please try again.');
    }
  };

  const filteredHistory = history.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.worker?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = history.filter(j => j.status === 'completed').reduce((sum, j) => sum + j.amount, 0);
  const tasksCount = history.filter(j => j.status === 'completed').length;
  const isProvider = currentUser?.role === 'provider';

  return (
    <div className="max-w-6xl mx-auto py-10 px-8 w-full flex flex-col h-[calc(100vh-80px)]">
      {/* 1. Enhanced Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-black text-brand-text-main tracking-tight">History</h1>
              <div className="bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-brand-primary/20">
                 {history.length} Records
              </div>
           </div>
           <p className="text-sm text-brand-text-variant font-medium">Manage your past transactions and job records.</p>
        </div>

        <div className="flex items-center gap-3">
           {selectedIds.length > 0 && (
              <button 
                onClick={handleBulkDelete}
                className="px-6 py-3 bg-red-600 text-white text-[11px] font-black rounded-2xl hover:bg-red-700 transition-all flex items-center gap-2 shadow-xl animate-in slide-in-from-right-4 duration-300 uppercase tracking-widest"
              >
                <Trash2 size={16} /> Delete Selected ({selectedIds.length})
              </button>
           )}
           <div className="flex items-center bg-brand-surface border-2 border-brand-outline rounded-2xl px-4 py-2.5 w-72 focus-within:border-brand-primary transition-all shadow-sm">
              <Search className="text-brand-text-variant mr-3" size={18} />
              <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Search history, location..." 
                 className="bg-transparent border-none outline-none text-sm w-full text-brand-text-main font-medium"
              />
           </div>
           <div className="relative">
              <button 
                 onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                 className={`flex items-center gap-2 px-6 py-3 border-2 rounded-2xl transition-all text-[11px] font-black uppercase tracking-widest ${statusFilter !== 'all' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-brand-surface border-brand-outline text-brand-text-variant hover:border-brand-primary'}`}
              >
                <Filter size={14} /> {statusFilter === 'all' ? 'Filter' : statusFilter.replace('_', ' ')}
              </button>
              {showFilterDropdown && (
                 <div className="absolute right-0 mt-3 w-52 bg-brand-surface-card border-2 border-brand-outline rounded-[1.5rem] shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    {['all', 'pending', 'in_progress', 'completed', 'cancelled'].map((status) => (
                       <button
                          key={status}
                          onClick={() => {
                             setStatusFilter(status);
                             setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${statusFilter === status ? 'bg-brand-primary text-white' : 'text-brand-text-variant hover:bg-brand-primary/5 hover:text-brand-primary'}`}
                       >
                          {status.replace('_', ' ')}
                       </button>
                    ))}
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* 2. Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
         <div className="bg-brand-surface-card border border-brand-outline rounded-[2rem] p-6 shadow-sm">
            <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-widest mb-2">Total {isProvider ? 'Earnings' : 'Spent'}</p>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-[#059669]/10 text-[#059669] rounded-xl flex items-center justify-center"><Banknote size={20} /></div>
               <h3 className="text-2xl font-black text-brand-text-main">₱{totalAmount.toLocaleString()}</h3>
            </div>
         </div>
         <div className="bg-brand-surface-card border border-brand-outline rounded-[2rem] p-6 shadow-sm">
            <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-widest mb-2">Jobs Completed</p>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center"><CheckCircle size={20} /></div>
               <h3 className="text-2xl font-black text-brand-text-main">{tasksCount}</h3>
            </div>
         </div>
         <div className="bg-brand-surface-card border border-brand-outline rounded-[2rem] p-6 shadow-sm">
            <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-widest mb-2">Success Rate</p>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center"><Star size={20} /></div>
               <h3 className="text-2xl font-black text-brand-text-main">{(history.length > 0 ? (history.filter(j => j.status === 'completed').length / history.length * 100).toFixed(0) : 0)}%</h3>
            </div>
         </div>
      </div>

      {/* 3. Transaction Table */}
      <div className="bg-brand-surface-card border border-brand-outline rounded-[2.5rem] shadow-lg flex flex-col flex-1 min-h-0 overflow-hidden">
        {isLoading ? (
           <div className="flex flex-col items-center justify-center p-20 text-center h-full flex-1">
              <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
           </div>
        ) : filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center h-full flex-1">
               <div className="w-20 h-20 bg-brand-surface rounded-[2rem] flex items-center justify-center mb-6 border border-brand-outline">
                  <History size={40} className="text-brand-text-variant opacity-50" />
               </div>
               <h3 className="text-xl font-black text-brand-text-main mb-2">No history found</h3>
               <p className="text-sm text-brand-text-variant font-medium">Try adjusting your search or filters.</p>
            </div>
         ) : (
            <div className="overflow-y-auto w-full flex-1 scrollbar-hide">
               <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead className="sticky top-0 bg-brand-surface-card z-10 border-b-2 border-brand-outline">
                     <tr>
                        <th className="px-8 py-6 w-16 text-center">
                           <input 
                              type="checkbox" 
                              checked={selectedIds.length > 0 && selectedIds.length === filteredHistory.length}
                              onChange={() => setSelectedIds(selectedIds.length === filteredHistory.length ? [] : filteredHistory.map(j => j.id))}
                              className="w-5 h-5 rounded-lg border-2 border-brand-outline text-brand-primary cursor-pointer transition-all"
                           />
                        </th>
                        <th className="px-6 py-6 text-[10px] font-black text-brand-text-variant uppercase tracking-widest">Date</th>
                        <th className="px-6 py-6 text-[10px] font-black text-brand-text-variant uppercase tracking-widest">Job & Party</th>
                        <th className="px-6 py-6 text-[10px] font-black text-brand-text-variant uppercase tracking-widest">Location</th>
                        <th className="px-6 py-6 text-[10px] font-black text-brand-text-variant uppercase tracking-widest text-center">Amount</th>
                        <th className="px-6 py-6 text-[10px] font-black text-brand-text-variant uppercase tracking-widest text-center">Payment</th>
                        <th className="px-6 py-6 text-[10px] font-black text-brand-text-variant uppercase tracking-widest text-right">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-outline/50">
                    {filteredHistory.map((job) => (
                        <tr 
                          key={job.id} 
                          onClick={() => setSelectedJob(job)}
                          className={`group hover:bg-brand-primary/[0.03] cursor-pointer transition-all ${selectedIds.includes(job.id) ? 'bg-brand-primary/[0.05]' : ''}`}
                        >
                           <td className="px-8 py-6 text-center" onClick={e => e.stopPropagation()}>
                              <input 
                                 type="checkbox" 
                                 checked={selectedIds.includes(job.id)}
                                 onChange={() => toggleSelect(job.id)}
                                 className="w-5 h-5 rounded-lg border-2 border-brand-outline text-brand-primary cursor-pointer transition-all"
                              />
                           </td>
                           <td className="px-6 py-6 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-xs font-bold text-brand-text-main">
                                 <Calendar size={14} className="text-brand-primary" />
                                 {job.date}
                              </div>
                           </td>
                           <td className="px-6 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl overflow-hidden border border-brand-outline shadow-sm shrink-0">
                                    <img src={job.workerAvatar} alt={job.worker} className="w-full h-full object-cover" />
                                 </div>
                                 <div>
                                    <h4 className="text-sm font-black text-brand-text-main group-hover:text-brand-primary transition-colors leading-tight mb-1">{job.title}</h4>
                                    <p className="text-[10px] font-bold text-brand-text-variant uppercase tracking-tight">
                                       {isProvider ? 'Client' : 'Provider'}: <span className="text-brand-text-main">{job.worker}</span>
                                    </p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-6">
                              <div className="flex items-center gap-1.5 text-xs font-medium text-brand-text-variant">
                                 <MapPin size={12} className="shrink-0" />
                                 <span className="line-clamp-1">{job.location}</span>
                              </div>
                           </td>
                           <td className="px-6 py-6 text-center">
                              <span className="text-base font-black text-brand-text-main">₱{job.amount.toLocaleString()}</span>
                           </td>
                           <td className="px-6 py-6 text-center">
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-surface border border-brand-outline rounded-xl text-[9px] font-black uppercase tracking-widest text-brand-text-variant">
                                 <Smartphone size={10} /> {job.paymentMethod}
                              </div>
                           </td>
                           <td className="px-6 py-6 text-right">
                              <div className="flex flex-col items-end gap-1.5">
                                 <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                                   job.status === 'completed' ? 'bg-[#059669] text-white border-[#059669]' : 
                                   job.status === 'cancelled' ? 'bg-red-500 text-white border-red-500' : 
                                   'bg-blue-500 text-white border-blue-500'
                                 }`}>
                                    {job.status}
                                 </span>
                                 {job.status === 'completed' && (
                                    <button 
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          window.dispatchEvent(new CustomEvent('duplicate-job', { detail: job }));
                                          window.dispatchEvent(new CustomEvent('change-tab', { detail: 'jobs' }));
                                       }}
                                       className="text-[9px] font-black text-brand-primary hover:underline transition-all uppercase tracking-widest"
                                    >
                                        Repeat Job
                                    </button>
                                 )}
                              </div>
                           </td>
                        </tr>
                    ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>

      {/* 4. Rich Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedJob(null)}></div>
           <div className="relative bg-brand-surface-card w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
              <div className="p-10">
                 <div className="flex justify-between items-start mb-8">
                    <div className="flex-1">
                       <div className="flex items-center gap-3 mb-4">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                             selectedJob.status === 'completed' ? 'bg-[#059669]/10 text-[#059669] border-[#059669]/20' : 'bg-red-50 text-red-600 border-red-100'
                          }`}>
                             {selectedJob.status}
                          </span>
                          <span className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest">Job ID: #{selectedJob.id}</span>
                       </div>
                       <h3 className="text-4xl font-black text-brand-text-main leading-tight mb-2 tracking-tight">{selectedJob.title}</h3>
                       <div className="flex flex-wrap gap-4 text-sm font-bold text-brand-text-variant uppercase tracking-tight">
                          <span className="flex items-center gap-2"><Calendar size={16} className="text-brand-primary" /> {selectedJob.date}</span>
                          <span className="flex items-center gap-2"><MapPin size={16} className="text-brand-primary" /> {selectedJob.location}</span>
                       </div>
                    </div>
                    <div className="text-right shrink-0">
                       <p className="text-3xl font-black text-brand-text-main tracking-tight">₱{selectedJob.amount.toLocaleString()}</p>
                       <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-surface rounded-lg mt-2 text-[10px] font-black text-[#059669] uppercase tracking-widest border border-brand-outline">
                          <CreditCard size={12} /> {selectedJob.paymentMethod}
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="space-y-6">
                       <div>
                          <h5 className="text-[10px] font-black text-brand-text-variant uppercase tracking-widest mb-3 ml-1">Work Description</h5>
                          <div className="bg-brand-surface p-6 rounded-[2rem] border border-brand-outline min-h-[140px]">
                             <p className="text-sm text-brand-text-main leading-relaxed font-medium">{selectedJob.description}</p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div>
                          <h5 className="text-[10px] font-black text-brand-text-variant uppercase tracking-widest mb-3 ml-1">
                             {selectedJob.role === 'client' ? 'Review & Feedback' : 'Client Rating'}
                          </h5>
                          {selectedJob.rating > 0 ? (
                             <div className="bg-amber-50/50 p-6 rounded-[2rem] border border-amber-100 relative overflow-hidden h-full">
                                <div className="flex items-center gap-1.5 mb-4 text-amber-400">
                                   {[...Array(5)].map((_, i) => (
                                     <Star key={i} size={18} className={i < selectedJob.rating ? "fill-current" : "text-brand-outline"} />
                                   ))}
                                </div>
                                <p className="text-sm text-amber-900 leading-relaxed italic font-bold">"{selectedJob.review || 'No written feedback provided.'}"</p>
                             </div>
                          ) : (
                             <div className="bg-brand-surface p-6 rounded-[2rem] border border-brand-outline border-dashed flex flex-col items-center justify-center h-[140px] text-center">
                                <Star size={24} className="text-brand-text-variant opacity-30 mb-2" />
                                <p className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest">No Review Recorded</p>
                             </div>
                          )}
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center justify-between pt-8 border-t border-brand-outline">
                    <div className="flex items-center gap-5">
                       <div className="relative">
                          <img src={selectedJob.workerAvatar} alt={selectedJob.worker} className="w-16 h-16 rounded-[1.25rem] object-cover border-2 border-brand-outline shadow-md" />
                          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center border-2 border-brand-surface-card">
                             <CheckCircle size={12} />
                          </div>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-widest mb-1">{selectedJob.role === 'provider' ? 'Job Client' : 'Job Professional'}</p>
                          <h5 className="text-xl font-black text-brand-text-main leading-none mb-2">{selectedJob.worker}</h5>
                          <p className="text-sm font-bold text-brand-primary flex items-center gap-2"><Phone size={14} /> {selectedJob.workerPhone}</p>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                       <button 
                          onClick={async () => {
                             if (!confirm('Are you sure you want to delete this record? This action cannot be undone.')) return;
                             try {
                                await api.deleteJob(selectedJob.id);
                                await fetchHistory();
                                setSelectedJob(null);
                             } catch (err) { console.error('Delete failed', err); }
                          }}
                          className="p-5 bg-red-50 text-red-600 rounded-[1.5rem] hover:bg-red-100 transition-all border-2 border-red-100/50 group shadow-sm"
                          title="Delete Record"
                       >
                          <Trash2 size={24} className="group-hover:scale-110 transition-transform" />
                       </button>
                       {selectedJob.status === 'completed' && (
                          <button 
                             onClick={() => {
                                window.dispatchEvent(new CustomEvent('duplicate-job', { detail: selectedJob }));
                                window.dispatchEvent(new CustomEvent('change-tab', { detail: 'jobs' }));
                                setSelectedJob(null);
                             }}
                             className="px-8 py-5 bg-brand-primary text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-[#059669] transition-all shadow-xl active:scale-95"
                          >
                             Post Job Again
                          </button>
                       )}
                    </div>
                 </div>
                 
                 <button onClick={() => setSelectedJob(null)} className="w-full mt-10 py-4 text-[10px] font-black uppercase text-brand-text-variant tracking-[0.2em] hover:text-brand-text-main transition-colors">
                    Return to history list
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
