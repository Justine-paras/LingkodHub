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
  Phone 
} from 'lucide-react';
import { api } from '../../../services/api';

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
          paymentMethod: job.payment_method || 'gcash',
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

  const totalAmount = history.filter(j => j.status === 'Completed').reduce((sum, j) => sum + j.amount, 0);
  const tasksCount = history.filter(j => j.status === 'Completed').length;
  const isProvider = history.length > 0 && history[0].provider_id; // Simple check or pass from props

  return (
    <div className="max-w-5xl mx-auto py-12 px-12 w-full flex flex-col h-[calc(100vh-80px)]">
      {/* 1. The Summary Bar (Header) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 shrink-0">
        <div className="flex items-center gap-8">
           <div>
              <p className="text-sm text-brand-text-variant font-medium mb-1">Total {isProvider ? 'Earned' : 'Spent'}</p>
              <h2 className="text-3xl font-bold text-brand-text-main tracking-tight">₱{totalAmount.toLocaleString()}</h2>
           </div>
           
           <div className="w-px h-12 bg-brand-outline hidden md:block"></div>
           
           <div>
              <p className="text-sm text-brand-text-variant font-medium mb-1">Tasks Completed</p>
              <h2 className="text-2xl font-semibold text-brand-text-main">{tasksCount} <span className="text-base font-normal text-brand-text-variant ml-1">Jobs</span></h2>
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
                               {String(job.paymentMethod).toLowerCase() === 'gcash' ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                     <Smartphone size={10} /> GCash
                                  </span>
                               ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                     <Smartphone size={10} /> Maya
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
