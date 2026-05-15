import React from 'react';
import { 
  TrendingUp, 
  Smartphone 
} from 'lucide-react';
import { api } from '../../../services/api';

export const EarningsSection = () => {
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = React.useState('none');

  React.useEffect(() => {
    Promise.all([
      api.getJobsByView('history'),
      api.getMe()
    ]).then(([jobsData, userData]) => {
      setJobs(jobsData);
      setPaymentMethod(userData.payment_method || 'none');
    }).catch(console.error);
  }, []);

  const completedJobs = jobs.filter((job) => job.status === 'completed');
  const totalEarned = completedJobs.reduce((sum, job) => sum + Number(job.budget || 0), 0);

  return (
    <div className="max-w-5xl mx-auto py-12 px-12 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-text-main mb-2">Earnings</h1>
          <p className="text-sm text-brand-text-variant">Monitor your income and financial performance</p>
        </div>
        <div className="flex items-center gap-4 bg-brand-surface-card border border-brand-outline p-2 rounded-2xl shadow-sm">
          <div className="px-6 py-2 text-center border-r border-brand-outline">
            <p className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest mb-0.5">Available for Payout</p>
            <p className="text-xl font-bold text-[#059669]">₱{totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <button 
            onClick={() => {
              if (totalEarned > 0) {
                alert(`Payout of ₱${totalEarned.toLocaleString()} requested to your ${paymentMethod === 'none' ? 'default account' : paymentMethod}.`);
              } else {
                alert('No funds available for payout.');
              }
            }}
            className="px-6 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl hover:bg-[#059669] transition-all shadow-sm"
          >
            Cash Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 bg-brand-surface-card border border-brand-outline rounded-[2rem] p-8 shadow-sm flex flex-col justify-center min-h-[300px]">
           <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#059669]/10 rounded-full flex items-center justify-center mb-6">
                <TrendingUp size={32} className="text-[#059669]" />
              </div>
              <h3 className="text-xl font-bold text-brand-text-main mb-2">Live Monthly Performance</h3>
              <p className="text-sm text-brand-text-variant font-medium mb-8">Your revenue is calculated based on completed tasks.</p>
              
              <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Completed', value: completedJobs.length, unit: 'Jobs' },
                  { label: 'Avg Rate', value: completedJobs.length ? (totalEarned / completedJobs.length).toFixed(0) : 0, unit: '₱' },
                  { label: 'Growth', value: '+12%', unit: 'Trend' },
                  { label: 'Rank', value: 'Top 5%', unit: 'Local' }
                ].map((stat, i) => (
                  <div key={i} className="p-4 bg-brand-surface border border-brand-outline rounded-2xl">
                    <p className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-lg font-bold text-brand-text-main">{stat.unit === '₱' ? `₱${Number(stat.value).toLocaleString()}` : stat.value}</p>
                    <p className="text-[8px] text-brand-text-variant uppercase font-bold mt-1 opacity-60">{stat.unit}</p>
                  </div>
                ))}
              </div>
           </div>
        </div>
        
        <div className="bg-brand-surface-card border border-brand-outline rounded-[2rem] p-8 shadow-sm">
          <h3 className="text-lg font-bold text-brand-text-main mb-6">Wallet Summary</h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-brand-text-variant font-medium">This Week</span>
              <span className="text-brand-text-main font-bold">+₱{totalEarned.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-brand-text-variant font-medium">Pending Clearances</span>
              <span className="text-brand-text-main font-bold">₱0</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-brand-text-variant font-medium">Total Lifetime</span>
              <span className="text-brand-text-main font-bold">₱{totalEarned.toLocaleString()}</span>
            </div>
            <div className="pt-6 border-t border-brand-outline mt-6">
              <label className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest block mb-4">Saved Payout Method</label>
              <div className="flex items-center gap-3 p-3 bg-brand-surface border border-brand-outline rounded-xl">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <Smartphone size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-text-main capitalize">{paymentMethod === 'none' ? 'No Payout Method Set' : paymentMethod}</p>
                  <p className="text-[10px] text-brand-text-variant">{paymentMethod === 'none' ? 'Update in profile settings' : 'Verified Method'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-brand-surface-card border border-brand-outline rounded-[2rem] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-brand-outline bg-brand-surface/50 font-bold text-sm text-brand-text-main">Transaction History</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-brand-outline">
                <th className="px-6 py-4 font-bold text-brand-text-variant uppercase text-[10px] tracking-widest">Date</th>
                <th className="px-6 py-4 font-bold text-brand-text-variant uppercase text-[10px] tracking-widest">Job</th>
                <th className="px-6 py-4 font-bold text-brand-text-variant uppercase text-[10px] tracking-widest">Amount</th>
                <th className="px-6 py-4 font-bold text-brand-text-variant uppercase text-[10px] tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-outline/50">
              {completedJobs.map((tx) => (
                <tr key={tx.id} className="hover:bg-brand-surface transition-colors">
                  <td className="px-6 py-4 font-medium text-brand-text-variant whitespace-nowrap">{new Date(tx.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold text-brand-text-main">{tx.title}</td>
                  <td className="px-6 py-4 font-extrabold text-[#059669]">+₱{Number(tx.budget || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-green-50 text-green-600">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
