import React from 'react';
import { 
  User, 
  MapPin, 
  Clock, 
  CheckCircle, 
  FileText, 
  ChevronRight, 
  AlertTriangle,
  Trash2 
} from 'lucide-react';
import { api } from '../../../services/api';
import { ProcessTimeline } from '../shared/ProcessTimeline';
import { UserProfileModal } from '../shared/UserProfileModal';

export const ProviderOngoingTasksSection = () => {
  const [activeSupportJob, setActiveSupportJob] = React.useState<number | null>(null);
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = React.useState<number | null>(null);

  const fetchTasks = React.useCallback(async () => {
    try {
      const currentUser = await api.getMe();
      const [ongoing, assigned] = await Promise.all([
        api.getJobsByView('ongoing'),
        api.getJobsByView('assigned')
      ]);

      // Get all jobs where the current user has an application
      const myApplications = await api.getMyApplications().catch(() => []);
      const appliedJobIds = Array.isArray(myApplications) ? myApplications.map((a: any) => a.job_id) : [];

      const assignedList = Array.isArray(assigned) ? assigned : [];
      const validAssigned = assignedList.filter((j: any) => {
         // If it's in progress, it's definitely an ongoing task
         if (j.status === 'in_progress') return true;
         // If it's pending, we ONLY want to show it here if the provider has formally accepted/applied to it.
         // Unaccepted invites belong in ProviderInvitationsSection.
         if (j.status === 'pending' && appliedJobIds.includes(j.id)) return true;
         return false;
      });
      
      const ongoingList = Array.isArray(ongoing) ? ongoing : [];
      // Merge all active work
      const combined = [...ongoingList, ...validAssigned];
      // Deduplicate by ID and filter out completed/cancelled jobs (in case backend caching or old logic returns them)
      const unique = Array.from(new Map(combined.map(j => [j.id, j])).values())
        .filter(j => j.status !== 'completed' && j.status !== 'cancelled');
      
      const enrichedTasks = await Promise.all(unique.map(async (job: any) => {
        try {
          const allMessages = await api.getMessages(job.client_id);
          const messages = allMessages.filter((m: any) => m.job_id === job.id);
          const hasSubmission = messages.some((m: any) => 
            m.sender_id === currentUser.id && 
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
      
      setTasks(enrichedTasks);
    } catch (error) {
      console.error('Failed to fetch provider tasks', error);
    }
  }, []);

  React.useEffect(() => {
    fetchTasks();

    // Listen for cross-tab or cross-component updates
    const channel = new BroadcastChannel('dashboard_sync');
    channel.onmessage = (event) => {
      if (event.data.type === 'DATA_UPDATED') {
        fetchTasks();
      }
    };

    // Polling fallback
    const interval = setInterval(fetchTasks, 15000);

    return () => {
      channel.close();
      clearInterval(interval);
    };
  }, [fetchTasks]);

  const markComplete = async (jobId: number) => {
    try {
      await api.updateJobStatus(jobId, 'completed');
      setTasks((prev) => prev.filter((task) => task.id !== jobId));
    } catch (error) {
      console.error('Failed to complete job', error);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto py-12 px-12 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-text-main mb-2 tracking-tight">Operation Command</h1>
          <p className="text-sm text-brand-text-variant font-medium">Manage active jobs, follow safety protocols, and track progress.</p>
        </div>
        <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-xs font-bold text-[#059669] bg-green-50 px-4 py-2 rounded-xl border border-green-100">
               <div className="w-2 h-2 bg-[#059669] rounded-full animate-pulse" /> Live Tracker Active
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {tasks.map(task => (
          <div key={task.id} className="bg-brand-surface-card border border-brand-outline rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col lg:flex-row min-h-[400px]">
            {/* Left Info Pane */}
            <div className="flex-1 p-10 flex flex-col border-r border-brand-outline bg-brand-surface/20">
              <div className="flex items-center justify-between mb-8">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                  task.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {task.status === 'in_progress' ? 'Working' : 'Assigned'}
                </span>
                <span className="text-2xl font-black text-brand-text-main">₱{Number(task.budget || 0).toLocaleString()}</span>
              </div>
              
              <h3 className="text-3xl font-bold text-brand-text-main mb-6 leading-tight">{task.title}</h3>
              
              <div className="space-y-4 mb-10">
                <div 
                   onClick={() => setSelectedClientId(task.client_id)}
                   className="flex items-center gap-3 text-sm text-brand-text-variant font-semibold cursor-pointer hover:text-brand-primary group/client transition-colors"
                   title="Click to view client profile"
                >
                  <User size={18} className="text-brand-primary group-hover/client:scale-110 transition-transform" />
                  <span>Client: <span className="font-bold border-b border-dashed border-brand-outline group-hover/client:border-brand-primary">{task.client_name}</span></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-brand-text-variant font-semibold">
                  <MapPin size={18} className="text-brand-primary" />
                  <span>{task.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-orange-600">
                  <Clock size={18} />
                  <span>Started {new Date(task.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-auto flex flex-wrap gap-3">
                {task.status === 'pending' ? (
                   <div className="flex gap-3">
                      <button 
                        onClick={async () => {
                           if (!confirm('Withdraw your application for this job?')) return;
                           try {
                              // We need to find the application ID. 
                              // Since the API returns jobs, we might need to fetch applications for this job to find ours.
                              const apps = await api.getJobApplications(task.id);
                              const me = await api.getMe();
                              const myApp = apps.find((a: any) => a.provider_id === me.id);
                              if (myApp) {
                                 await api.deleteApplication(myApp.id);
                                 fetchTasks();
                                 alert('Application withdrawn successfully.');
                              }
                           } catch (err) {
                              console.error('Failed to withdraw', err);
                           }
                        }}
                        className="px-4 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-bold text-xs hover:bg-red-100 transition-all flex items-center gap-2"
                      >
                         <Trash2 size={16} /> Withdraw
                      </button>
                      <button 
                        onClick={async () => {
                          if (!task.provider_arrived) {
                             try {
                               await api.sendMessage(task.client_id, '[SYSTEM:PROVIDER_ARRIVED]', task.id);
                               if (task.client_confirmed) {
                                  await api.updateJobStatus(Math.floor(task.id), 'in_progress');
                               }
                               const channel = new BroadcastChannel('dashboard_sync');
                               channel.postMessage({ type: 'DATA_UPDATED' });
                               channel.close();
                               alert(task.client_confirmed ? 'Arrival confirmed! Task is now in progress.' : 'You marked your arrival. Waiting for client to confirm.');
                               fetchTasks();
                             } catch(e) { console.error(e); }
                          }
                        }}
                        disabled={task.provider_arrived}
                        className={`px-6 py-3 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg ${
                          task.provider_arrived
                            ? 'bg-brand-surface text-brand-text-variant cursor-not-allowed border border-brand-outline'
                            : 'bg-brand-primary text-white hover:bg-brand-primary/90'
                        }`}
                      >
                        <MapPin size={16} />
                        {task.provider_arrived ? 'Waiting for Client to confirm...' : 'I\'m at the location'}
                      </button>
                   </div>
                ) : (
                   <button 
                     onClick={async () => {
                       try {
                         await api.sendMessage(task.client_id, "I have completed the work. Please review and release the funds.", task.id);
                         alert('Work submitted for review! The client has been notified to release your payment.');
                         setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_submitted: true } : t));
                       } catch (err) {
                         console.error('Failed to submit work', err);
                       }
                     }} 
                     className={`px-6 py-3 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg ${
                       task.is_submitted 
                         ? 'bg-amber-100 text-amber-600 border border-amber-200 cursor-default' 
                         : 'bg-[#059669] text-white hover:bg-[#047857] shadow-[#059669]/20'
                     }`}
                     disabled={task.is_submitted}
                   >
                     <CheckCircle size={16} /> 
                     {task.is_submitted ? 'Pending Client Release' : 'Submit for Review'}
                   </button>
                )}
              </div>
            </div>

            {/* Right Protocol Pane */}
            <div className="w-full lg:w-[450px] bg-brand-surface-card p-10 flex flex-col">
               <h4 className="text-xs font-bold text-brand-text-variant uppercase tracking-widest mb-6 flex items-center gap-2">
                 <FileText size={14} /> Job Protocol & Safety
               </h4>
               
               {/* Checkpoints */}
               {/* Process Timeline */}
               <div className="mb-10 bg-brand-surface/50 p-6 rounded-[2rem] border border-brand-outline/50 relative">
                  <ProcessTimeline currentState={task.is_submitted ? 'review' : (task.status === 'in_progress' ? 'in_progress' : 'hired')} />
               </div>

               {/* Protocol Actions */}
               <div className="mt-auto space-y-3">
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl mb-4">
                    <p className="text-[10px] font-bold text-orange-600 uppercase mb-1">Stay Protected</p>
                    <p className="text-[11px] text-orange-800 leading-relaxed italic">
                      For your safety, always keep communication and payment records within Lingkod Hub. External agreements waive our dispute protection.
                    </p>
                  </div>
                  
                  <button className="w-full py-3 text-left px-5 bg-brand-surface border border-brand-outline rounded-2xl text-[11px] font-bold text-brand-text-main hover:border-brand-primary transition-all flex items-center justify-between group">
                    <span>Job not as described?</span>
                    <ChevronRight size={14} className="text-brand-text-variant group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="w-full py-3 text-left px-5 bg-brand-surface border border-brand-outline rounded-2xl text-[11px] font-bold text-brand-text-main hover:border-brand-primary transition-all flex items-center justify-between group">
                    <span>Safety / Security concern</span>
                    <AlertTriangle size={14} className="text-orange-500" />
                  </button>
                  <button className="w-full py-3 text-left px-5 bg-brand-surface border border-brand-outline rounded-2xl text-[11px] font-bold text-brand-text-main hover:border-red-500 hover:text-red-500 transition-all flex items-center justify-between group">
                    <span>Emergency Dispute</span>
                    <ChevronRight size={14} className="text-brand-text-variant" />
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>
      <UserProfileModal 
        userId={selectedClientId} 
        isOpen={selectedClientId !== null} 
        onClose={() => setSelectedClientId(null)} 
      />
    </div>
  );
};
