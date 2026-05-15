import React from 'react';
import { 
  Clock, 
  Smartphone, 
  Banknote, 
  Star, 
  Phone, 
  X, 
  AlertTriangle, 
  CheckCircle 
} from 'lucide-react';
import { api } from '../../../services/api';

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
                              <Smartphone size={10} /> Maya
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
                     Confirm you have settled the payment of <strong className="text-brand-text-main font-bold">₱{Number(showCompletionModal.budget || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> via <strong className="text-brand-text-main font-bold">{(showCompletionModal.payment_method || 'gcash').toUpperCase()}</strong> to <strong className="text-brand-text-main font-bold">{showCompletionModal.provider_name || 'Assigned provider'}</strong>.
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
