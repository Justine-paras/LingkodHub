import React from 'react';
import { 
  User, 
  MapPin, 
  Clock, 
  Phone, 
  CheckCircle, 
  FileText, 
  ChevronRight, 
  AlertTriangle 
} from 'lucide-react';
import { api } from '../../../services/api';

export const ProviderOngoingTasksSection = () => {
  const [activeSupportJob, setActiveSupportJob] = React.useState<number | null>(null);
  const [tasks, setTasks] = React.useState<any[]>([]);

  React.useEffect(() => {
    api.getJobsByView('ongoing').then(setTasks).catch(console.error);
  }, []);

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
                  task.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                }`}>
                  {task.status}
                </span>
                <span className="text-2xl font-black text-brand-text-main">₱{Number(task.budget || 0).toLocaleString()}</span>
              </div>
              
              <h3 className="text-3xl font-bold text-brand-text-main mb-6 leading-tight">{task.title}</h3>
              
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3 text-sm text-brand-text-variant font-semibold">
                  <User size={18} className="text-brand-primary" />
                  <span>Client: {task.client_name}</span>
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
                <button 
                   onClick={() => alert(`Calling ${task.client_name} at ${task.client_phone || 'No phone available'}...`)}
                   className="px-6 py-3 bg-brand-surface border border-brand-outline rounded-2xl font-bold text-xs hover:bg-brand-surface-card transition-all flex items-center gap-2"
                >
                  <Phone size={16} className="text-brand-primary" /> Call Client
                </button>
                <button onClick={() => markComplete(task.id)} className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold text-xs hover:bg-[#059669] transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/20">
                  <CheckCircle size={16} /> Mark as Completed
                </button>
              </div>
            </div>

            {/* Right Protocol Pane */}
            <div className="w-full lg:w-[450px] bg-brand-surface-card p-10 flex flex-col">
               <h4 className="text-xs font-bold text-brand-text-variant uppercase tracking-widest mb-6 flex items-center gap-2">
                 <FileText size={14} /> Job Protocol & Safety
               </h4>
               
               {/* Checkpoints */}
               <div className="space-y-4 mb-10">
                {[
                  { label: 'Accepted assignment', done: true },
                  { label: 'Work currently in progress', done: task.status === 'in_progress' },
                  { label: 'Completion pending client confirmation', done: false },
                ].map((cp, idx) => (
                   <div key={idx} className="flex items-center gap-3 group">
                     <button className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                       cp.done ? 'bg-[#059669] border-[#059669]' : 'bg-transparent border-brand-outline group-hover:border-brand-primary'
                     }`}>
                       {cp.done && <CheckCircle size={14} className="text-white" />}
                     </button>
                     <span className={`text-sm font-medium ${cp.done ? 'text-brand-text-variant line-through opacity-60' : 'text-brand-text-main'}`}>
                       {cp.label}
                     </span>
                   </div>
                 ))}
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
    </div>
  );
};
