import React from 'react';
import { 
  X, 
  MapPin, 
  Banknote, 
  Star, 
  User, 
  Mail, 
  Phone, 
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { api } from '../../../services/api';

interface UserProfileModalProps {
  userId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ userId, isOpen, onClose }) => {
  const [user, setUser] = React.useState<any>(null);
  const [reviewsData, setReviewsData] = React.useState<any>({ reviews: [], avg_rating: 0, total_reviews: 0 });
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [userData, userReviews] = await Promise.all([
          api.getUser(userId),
          api.getUserReviews(userId).catch(() => ({ reviews: [], avg_rating: 0, total_reviews: 0 }))
        ]);
        setUser(userData);
        setReviewsData(userReviews);
      } catch (err: any) {
        console.error('Failed to load user profile', err);
        setError('Failed to load profile details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-200" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-brand-surface-card w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col text-left max-h-[90vh] border border-white/10 transition-all duration-300">
        
        {/* Close Button Header */}
        <div className="flex justify-between items-center px-8 pt-6 pb-2 relative z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary bg-brand-primary/10 px-3.5 py-1.5 rounded-full border border-brand-primary/20">
            {user?.role === 'client' ? 'Client Profile' : 'User Profile'}
          </span>
          <button 
            onClick={onClose} 
            className="p-2.5 bg-brand-surface hover:bg-brand-outline/50 text-brand-text-variant hover:text-brand-text-main rounded-full transition-all border border-brand-outline shadow-sm"
          >
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-4"></div>
            <p className="text-brand-text-variant text-xs font-black uppercase tracking-widest animate-pulse">Loading Profile...</p>
          </div>
        ) : error || !user ? (
          <div className="py-24 text-center px-6">
            <p className="text-red-500 font-bold mb-4">{error || 'User not found.'}</p>
            <button 
              onClick={onClose}
              className="px-6 py-2.5 bg-brand-surface border border-brand-outline text-brand-text-main rounded-xl font-bold text-xs uppercase"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Profile Avatar / Name Info */}
            <div className="px-8 pt-2 flex flex-col sm:flex-row sm:items-end gap-5 mb-6 relative z-10">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url.startsWith('http') ? user.avatar_url : `http://localhost:3000${user.avatar_url}`} 
                  alt={user.full_name} 
                  className="w-24 h-24 rounded-3xl object-cover border-4 border-brand-surface-card bg-brand-surface shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-primary to-emerald-600 flex items-center justify-center text-white font-extrabold text-3xl border-4 border-brand-surface-card shadow-xl shrink-0">
                  {user.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : '?'}
                </div>
              )}
              <div className="mb-2">
                <h3 className="text-2xl font-black text-brand-text-main flex items-center gap-2 flex-wrap">
                  {user.full_name}
                  {user.is_documents_verified === 1 && (
                    <span className="bg-brand-primary/10 text-brand-primary text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-brand-primary/20 flex items-center gap-0.5">
                      <ShieldCheck size={10} className="text-brand-primary" /> Verified
                    </span>
                  )}
                </h3>
                <p className="text-xs text-brand-text-variant font-medium mt-1">
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-8 overflow-y-auto bg-brand-surface/30 space-y-6 flex-1">
              
              {/* About Bio */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.15em] text-brand-text-variant mb-2.5">About Client</h4>
                <div className="bg-brand-surface-card p-5 rounded-2xl border border-brand-outline shadow-inner">
                  <p className="text-sm text-brand-text-main italic leading-relaxed">
                    "{user.about_me || 'This client is active in hiring skilled neighborhood professionals for household and general service tasks.'}"
                  </p>
                </div>
              </div>

              {/* Logistics Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Location */}
                <div className="bg-brand-surface-card/65 p-4 rounded-2xl border border-brand-outline flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/15 text-brand-primary flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-wider">Neighborhood</p>
                    <p className="text-xs font-bold text-brand-text-main truncate">{user.location || 'Dasmariñas, Cavite'}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="bg-brand-surface-card/65 p-4 rounded-2xl border border-brand-outline flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                    <Star size={18} className="fill-amber-500 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-wider">Client Rating</p>
                    <p className="text-xs font-bold text-brand-text-main truncate">
                      {reviewsData.total_reviews > 0 
                        ? `${reviewsData.avg_rating.toFixed(1)} / 5.0 (${reviewsData.total_reviews} reviews)` 
                        : 'New Client'}
                    </p>
                  </div>
                </div>

                {/* Payment preference */}
                <div className="bg-brand-surface-card/65 p-4 rounded-2xl border border-brand-outline flex items-center gap-3 sm:col-span-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
                    <Banknote size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-wider">Preferred Payment Method</p>
                    <p className="text-xs font-bold text-brand-text-main">
                      {user.payment_method || 'GCash / Maya / Cash'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reviews Feed */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.15em] text-brand-text-variant mb-3">Reviews from Service Providers</h4>
                {reviewsData.reviews && reviewsData.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviewsData.reviews.map((rev: any) => (
                      <div key={rev.id} className="bg-brand-surface-card border border-brand-outline p-5 rounded-2xl space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-3">
                            {rev.reviewer_avatar ? (
                              <img 
                                src={rev.reviewer_avatar.startsWith('http') ? rev.reviewer_avatar : `http://localhost:3000${rev.reviewer_avatar}`} 
                                className="w-8 h-8 rounded-full object-cover border border-brand-outline"
                                alt={rev.reviewer_name}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px] font-bold border border-brand-outline shrink-0">
                                {rev.reviewer_name ? rev.reviewer_name[0] : '?'}
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-bold text-brand-text-main">{rev.reviewer_name || 'Service Provider'}</p>
                              <p className="text-[9px] text-brand-text-variant mt-0.5">Reviewed on task: <span className="font-semibold text-brand-primary">{rev.job_title}</span></p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100 shrink-0">
                            <Star size={10} className="fill-amber-500 text-amber-500" />
                            <span className="text-[10px] font-extrabold text-amber-700">{rev.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-brand-text-variant italic leading-relaxed pl-1">
                          "{rev.comment || 'Smooth communication, straightforward task, and prompt arrival verification. Highly recommended client!'}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border-2 border-dashed border-brand-outline rounded-2xl text-xs text-brand-text-variant font-medium bg-brand-surface-card/40">
                    No review history recorded for this client yet.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-brand-outline bg-brand-surface/50 backdrop-blur-md">
              <button 
                onClick={onClose}
                className="w-full py-4 bg-brand-surface border-2 border-brand-outline hover:bg-brand-surface-card text-brand-text-main rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
              >
                Close Profile
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
