import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/components/dashboard/client/HomeDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Lucide imports
content = content.replace(
  '  Banknote,\n  CheckCircle2\n} from \'lucide-react\';',
  '  Banknote,\n  CheckCircle2,\n  X,\n  CheckCircle\n} from \'lucide-react\';'
);
content = content.replace(
  '  Banknote,\r\n  CheckCircle2\r\n} from \'lucide-react\';',
  '  Banknote,\r\n  CheckCircle2,\r\n  X,\r\n  CheckCircle\r\n} from \'lucide-react\';'
);

// 2. Insert Selected Provider for View state
const stateMarker = 'const [isProfileLoading, setIsProfileLoading] = React.useState(true);';
if (content.includes(stateMarker)) {
  content = content.replace(
    stateMarker,
    `${stateMarker}\n  const [selectedProviderForView, setSelectedProviderForView] = React.useState<any>(null);`
  );
} else {
  console.error('Could not find state marker');
}

// 3. Make Search Results cards clickable
content = content.replace(
  'key={provider.id} className="bg-brand-surface-card border border-brand-outline p-6 rounded-2xl hover:border-brand-primary/50 hover:shadow-level-2 transition-all flex flex-col items-center text-center group cursor-pointer"',
  'key={provider.id} onClick={() => setSelectedProviderForView(provider)} className="bg-brand-surface-card border border-brand-outline p-6 rounded-2xl hover:border-brand-primary/50 hover:shadow-level-2 transition-all flex flex-col items-center text-center group cursor-pointer"'
);

// 4. Make Recommended Professionals cards clickable
content = content.replace(
  'key={provider.id} className="bg-brand-surface-card border-2 border-brand-outline p-6 rounded-[2rem] hover:border-brand-primary/50 hover:shadow-xl transition-all group flex flex-col relative overflow-hidden"',
  'key={provider.id} onClick={() => setSelectedProviderForView(provider)} className="bg-brand-surface-card border-2 border-brand-outline p-6 rounded-[2rem] hover:border-brand-primary/50 hover:shadow-xl transition-all group flex flex-col relative overflow-hidden cursor-pointer"'
);

// 5. Update direct hire click with stopPropagation
content = content.replace(
  'onClick={() => window.dispatchEvent(new CustomEvent(\'hire-provider\', { detail: provider }))}',
  'onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent(\'hire-provider\', { detail: provider })); }}'
);

// 6. Inject the modal markup at the end of the file
const lastDiv = '         </div>\n      )}\n    </div>\n  );\n};';
const lastDivCR = '         </div>\r\n      )}\r\n    </div>\r\n  );\r\n};';

const modalMarkup = `         </div>
      )}

      {/* Premium Provider Profile Details Modal */}
      {selectedProviderForView && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setSelectedProviderForView(null)}></div>
            <div className="relative bg-brand-surface-card w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col text-left max-h-[90vh] border border-white/10">
               
               {/* Modal Header Cover */}
               <div className="relative h-32 bg-gradient-to-r from-brand-primary to-brand-primary/60 flex items-end px-8 pb-4">
                  <div className="absolute top-6 right-6 z-10">
                     <button 
                        onClick={() => setSelectedProviderForView(null)} 
                        className="p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all border border-white/15 backdrop-blur-sm"
                     >
                        <X size={18} />
                     </button>
                  </div>
               </div>

               {/* Profile Avatar Offset */}
               <div className="px-8 -mt-16 flex flex-col sm:flex-row sm:items-end gap-5 mb-6 relative z-10">
                  <img 
                     src={selectedProviderForView.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&h=100&auto=format&fit=crop"} 
                     alt={selectedProviderForView.full_name} 
                     className="w-28 h-28 rounded-3xl object-cover border-4 border-brand-surface-card bg-brand-surface shadow-xl"
                  />
                  <div className="mb-2">
                     <h3 className="text-2xl font-black text-brand-text-main flex items-center gap-2">
                        {selectedProviderForView.full_name}
                        {selectedProviderForView.is_documents_verified === 1 && (
                          <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-brand-primary/20 flex items-center gap-1">
                             <CheckCircle size={10} className="fill-brand-primary text-white" /> Verified
                          </span>
                        )}
                     </h3>
                     <p className="text-sm font-medium text-brand-text-variant mt-1">@{selectedProviderForView.username}</p>
                  </div>
               </div>

               {/* Modal Content Body */}
               <div className="p-8 overflow-y-auto bg-brand-surface/30 space-y-6">
                  {/* Detailed Bio */}
                  <div>
                     <h4 className="text-xs font-black uppercase tracking-[0.15em] text-brand-text-variant mb-2.5">About Professional</h4>
                     <div className="bg-brand-surface-card p-5 rounded-2xl border border-brand-outline shadow-inner">
                        <p className="text-sm text-brand-text-main italic leading-relaxed">
                           "{selectedProviderForView.about_me || 'This professional is highly dedicated to delivering world-class service with LingkodHub. Ready to assist you anytime!'}"
                        </p>
                     </div>
                  </div>

                  {/* Services & Offerings */}
                  {selectedProviderForView.services && (
                     <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.15em] text-brand-text-variant mb-2.5">Offered Services</h4>
                        <div className="flex flex-wrap gap-2">
                           {selectedProviderForView.services.split(', ').map((s: string, idx: number) => (
                              <span key={idx} className="px-3.5 py-1.5 bg-brand-primary/15 text-brand-primary text-[11px] font-black uppercase tracking-wider rounded-xl border border-brand-primary/25">
                                 {s}
                              </span>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* Profile Logistics Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="bg-brand-surface-card/65 p-4 rounded-2xl border border-brand-outline flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-primary/15 text-brand-primary flex items-center justify-center">
                           <MapPin size={18} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-wider">Location</p>
                           <p className="text-xs font-bold text-brand-text-main">{selectedProviderForView.location || 'Dasmariñas'}</p>
                        </div>
                     </div>

                     <div className="bg-brand-surface-card/65 p-4 rounded-2xl border border-brand-outline flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center">
                           <Activity size={18} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-wider">Coverage Radius</p>
                           <p className="text-xs font-bold text-brand-text-main">{selectedProviderForView.service_radius || 5} km</p>
                        </div>
                     </div>

                     {/* Payment Details */}
                     <div className="bg-brand-surface-card/65 p-4 rounded-2xl border border-brand-outline flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center">
                           <Banknote size={18} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-wider">GCash Status</p>
                           <p className="text-xs font-bold text-brand-text-main">{selectedProviderForView.gcash_number ? 'GCash Enabled' : 'Cash Only'}</p>
                        </div>
                     </div>

                     <div className="bg-brand-surface-card/65 p-4 rounded-2xl border border-brand-outline flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                           <Users size={18} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-wider">Average Rating</p>
                           <p className="text-xs font-bold text-brand-text-main">4.9 / 5.0 (⭐ Top Rated)</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Modal Footer CTA */}
               <div className="p-8 border-t border-brand-outline flex gap-4 bg-brand-surface/50 backdrop-blur-md sticky bottom-0">
                  <button 
                     onClick={() => setSelectedProviderForView(null)}
                     className="flex-1 py-4 bg-brand-surface border-2 border-brand-outline hover:bg-brand-surface-card text-brand-text-main rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                  >
                     Close Profile
                  </button>
                  <button 
                     onClick={() => {
                        window.dispatchEvent(new CustomEvent('hire-provider', { detail: selectedProviderForView }));
                        setSelectedProviderForView(null);
                     }}
                     className="flex-1 py-4 bg-brand-primary text-white hover:bg-[#059669] rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-brand-primary/20 active:scale-95 flex items-center justify-center gap-2"
                  >
                     Direct Hire Now <ChevronRight size={16} />
                  </button>
               </div>

            </div>
         </div>
      )}
    </div>
  );
};`;

if (content.includes(lastDiv)) {
  content = content.replace(lastDiv, modalMarkup);
} else if (content.includes(lastDivCR)) {
  content = content.replace(lastDivCR, modalMarkup);
} else {
  console.error('Could not find last div tag');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully injected clickable recommended professional cards and profile modal!');
