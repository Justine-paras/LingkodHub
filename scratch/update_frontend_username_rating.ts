import fs from 'fs';
import path from 'path';

// 1. Update TopBar.tsx to remove @username completely
const topBarPath = path.resolve('src/components/dashboard/shared/TopBar.tsx');
if (fs.existsSync(topBarPath)) {
  let topBarContent = fs.readFileSync(topBarPath, 'utf8');
  topBarContent = topBarContent.replace(
    `{userProfile?.username ? \`@\${userProfile.username}\` : (role === 'client' ? 'Homeowner' : 'Service Provider')}`,
    `role === 'client' ? 'Homeowner' : 'Service Provider'`
  );
  fs.writeFileSync(topBarPath, topBarContent, 'utf8');
  console.log('Successfully updated TopBar.tsx!');
} else {
  console.error('TopBar.tsx not found!');
}

// 2. Update HomeDashboard.tsx to:
//    - Add 'Star' to lucide-react imports
//    - Remove @username from search results and replace with clean Star rating
//    - Remove @username from profile details modal and replace with "Service Provider" pill
//    - Show real rating from DB in Recommended Professionals cards and Modal
const homeDashboardPath = path.resolve('src/components/dashboard/client/HomeDashboard.tsx');
if (fs.existsSync(homeDashboardPath)) {
  let homeContent = fs.readFileSync(homeDashboardPath, 'utf8');

  // Add 'Star' to Lucide imports
  homeContent = homeContent.replace(
    '  CheckCircle\n} from \'lucide-react\';',
    '  CheckCircle,\n  Star\n} from \'lucide-react\';'
  );
  homeContent = homeContent.replace(
    '  CheckCircle\r\n} from \'lucide-react\';',
    '  CheckCircle,\r\n  Star\r\n} from \'lucide-react\';'
  );

  // Remove @username from search results
  // Also add rating representation
  const targetSearchUsername = `<p className="text-sm text-brand-text-variant mb-3">@{provider.username}</p>`;
  const replacementSearchRating = `<div className="flex items-center gap-1 mt-0.5 mb-3 text-xs font-bold text-amber-500">
                       <Star size={12} className="fill-current" />
                       {provider.total_reviews > 0 ? \`\${provider.avg_rating.toFixed(1)} (\${provider.total_reviews} reviews)\` : 'New'}
                    </div>`;

  if (homeContent.includes(targetSearchUsername)) {
    homeContent = homeContent.replace(targetSearchUsername, replacementSearchRating);
  }

  // Update topProviders (Recommended Professionals) rating representation to use real average rating
  const targetTopProviderRating = `<div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                                    <Activity size={12} className="text-amber-500 fill-amber-500" />
                                    <span className="text-xs font-bold text-amber-700">4.9</span>
                                 </div>`;
  const replacementTopProviderRating = `<div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                                    <Star size={12} className="fill-amber-500 text-amber-500" />
                                    <span className="text-xs font-bold text-amber-700">
                                       {provider.total_reviews > 0 ? provider.avg_rating.toFixed(1) : 'New'}
                                    </span>
                                 </div>`;

  if (homeContent.includes(targetTopProviderRating)) {
    homeContent = homeContent.replace(targetTopProviderRating, replacementTopProviderRating);
  }

  // Replace username in Profile Modal with beautiful Service Provider text pill
  const targetModalUsername = `<p className="text-sm font-medium text-brand-text-variant mt-1">@{selectedProviderForView.username}</p>`;
  const replacementModalRolePill = `<span className="inline-block mt-1 px-3 py-1 bg-brand-surface-card text-brand-text-variant border border-brand-outline rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Service Provider
                     </span>`;

  if (homeContent.includes(targetModalUsername)) {
    homeContent = homeContent.replace(targetModalUsername, replacementModalRolePill);
  }

  // Replace logistics average rating section with real stats
  const targetLogisticsRating = `<div>
                           <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-wider">Average Rating</p>
                           <p className="text-xs font-bold text-brand-text-main">4.9 / 5.0 (⭐ Top Rated)</p>
                        </div>`;
  const replacementLogisticsRating = `<div>
                           <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-wider">Average Rating</p>
                           <p className="text-xs font-bold text-brand-text-main">
                              {selectedProviderForView.total_reviews > 0 
                                 ? \`\${selectedProviderForView.avg_rating.toFixed(1)} / 5.0 (⭐ \${selectedProviderForView.total_reviews} reviews)\` 
                                 : 'New Provider (⭐ New)'}
                           </p>
                        </div>`;

  if (homeContent.includes(targetLogisticsRating)) {
    homeContent = homeContent.replace(targetLogisticsRating, replacementLogisticsRating);
  }

  // Also replace payment details with real gcash/maya capabilities
  const targetPaymentDetails = `<div>
                           <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-wider">GCash Status</p>
                           <p className="text-xs font-bold text-brand-text-main">{selectedProviderForView.gcash_number ? 'GCash Enabled' : 'Cash Only'}</p>
                        </div>`;
  const replacementPaymentDetails = `<div>
                           <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-wider">GCash Status</p>
                           <p className="text-xs font-bold text-brand-text-main">
                              {selectedProviderForView.gcash_number || selectedProviderForView.maya_number 
                                 ? \`Enabled (\${selectedProviderForView.gcash_number ? 'GCash' : ''} \${selectedProviderForView.maya_number ? 'Maya' : ''})\` 
                                 : 'Cash Only'}
                           </p>
                        </div>`;

  if (homeContent.includes(targetPaymentDetails)) {
    homeContent = homeContent.replace(targetPaymentDetails, replacementPaymentDetails);
  }

  fs.writeFileSync(homeDashboardPath, homeContent, 'utf8');
  console.log('Successfully updated HomeDashboard.tsx frontend components!');
} else {
  console.error('HomeDashboard.tsx not found!');
}
