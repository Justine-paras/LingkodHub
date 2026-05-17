import React from 'react';
import { 
  Search, 
  X, 
  PlusCircle, 
  Camera, 
  Edit2, 
  MapPin, 
  Trash2,
  CheckCircle,
  Banknote,
  Shield,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../../services/api';
import { ALL_SERVICES } from '../../../constants';
import { InputGroup } from '../shared/InputGroup';
import { LegalModal } from '../shared/LegalModal';
import { PasswordModal } from '../shared/PasswordModal';

export const ProviderProfileSettings = () => {
  const [services, setServices] = React.useState<string[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = React.useState(false);
  const [serviceSearch, setServiceSearch] = React.useState('');
  const [customService, setCustomService] = React.useState('');
  
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [displayName, setDisplayName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [aboutMe, setAboutMe] = React.useState('');
  const [avatarUrl, setAvatarUrl] = React.useState('');
  const [createdAt, setCreatedAt] = React.useState('');
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [serviceRadius, setServiceRadius] = React.useState(15);
  const [isEmailVerified, setIsEmailVerified] = React.useState(false);
  const [isDocumentsVerified, setIsDocumentsVerified] = React.useState(false);
  const [isOTPSent, setIsOTPSent] = React.useState(false);
  const [otpValue, setOtpValue] = React.useState('');
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isSendingOTP, setIsSendingOTP] = React.useState(false);
  const [documentStatus, setDocumentStatus] = React.useState('none');

  const [prefEmailMessages, setPrefEmailMessages] = React.useState(1);
  const [prefEmailUpdates, setPrefEmailUpdates] = React.useState(1);
  const [prefEmailPromos, setPrefEmailPromos] = React.useState(0);
  const [prefPushAlerts, setPrefPushAlerts] = React.useState(1);
  const [prefPushMarketing, setPrefPushMarketing] = React.useState(0);

  const [isPublicProfile, setIsPublicProfile] = React.useState(1);
  const [showOnlineStatus, setShowOnlineStatus] = React.useState(0);
  const [isDeletingAccount, setIsDeletingAccount] = React.useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = React.useState('');
  const [gcashNumber, setGcashNumber] = React.useState('');
  const [mayaNumber, setMayaNumber] = React.useState('');
  const [preferredPayment, setPreferredPayment] = React.useState('');

  const [activeSettingsTab, setActiveSettingsTab] = React.useState('profile');
  const [isLoading, setIsLoading] = React.useState(true);
  const [legalModal, setLegalModal] = React.useState<{ isOpen: boolean, type: 'privacy' | 'tos' }>({
    isOpen: false,
    type: 'privacy'
  });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [isIdentityModalOpen, setIsIdentityModalOpen] = React.useState(false);
  const [identityIdFile, setIdentityIdFile] = React.useState<File | null>(null);
  const [identityIdUrl, setIdentityIdUrl] = React.useState('');
  const [identitySelfieFile, setIdentitySelfieFile] = React.useState<File | null>(null);
  const [identitySelfieUrl, setIdentitySelfieUrl] = React.useState('');
  const [isSubmittingIdentity, setIsSubmittingIdentity] = React.useState(false);
  const [identityIdType, setIdentityIdType] = React.useState('National ID');
  const [historyJobs, setHistoryJobs] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState({ avg_rating: 0, total_reviews: 0 });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getMe();
        setDisplayName(data.full_name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setLocation(data.location || '');
        setAboutMe(data.about_me || '');
        setAvatarUrl(data.avatar_url || '');
        setCreatedAt(data.created_at || '');
        setServiceRadius(data.service_radius || 15);
        setIsEmailVerified(!!data.is_email_verified);
        setIsDocumentsVerified(!!data.is_documents_verified);
        setDocumentStatus(data.document_status || 'none');

        setPrefEmailMessages(data.pref_email_messages ?? 1);
        setPrefEmailUpdates(data.pref_email_updates ?? 1);
        setPrefEmailPromos(data.pref_email_promos ?? 0);
        setPrefPushAlerts(data.pref_push_alerts ?? 1);
        setPrefPushMarketing(data.pref_push_marketing ?? 0);
        setIsPublicProfile(data.is_public_profile ?? 1);
        setShowOnlineStatus(data.show_online_status ?? 0);
        setGcashNumber(data.gcash_number || '');
        setMayaNumber(data.maya_number || '');
        setPreferredPayment(data.payment_method || 'gcash');

        const [history, reviews, userServices] = await Promise.all([
          api.getJobsByView('history'),
          api.getUserReviews(data.id),
          api.getMyServices()
        ]);

        setHistoryJobs(history);
        setStats(reviews);
        setServices(userServices.map((s: any) => s.name));
      } catch (error) {
        console.error('Failed to load provider profile data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const completedJobs = historyJobs.filter(j => j.status === 'completed');
  const memberSince = createdAt ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2024';

  const saveProfile = async () => {
    try {
      await api.updateMe({
        full_name: displayName,
        phone,
        location,
        about_me: aboutMe,
        service_radius: serviceRadius,
        pref_email_messages: prefEmailMessages,
        pref_email_updates: prefEmailUpdates,
        pref_email_promos: prefEmailPromos,
        pref_push_alerts: prefPushAlerts,
        pref_push_marketing: prefPushMarketing,
        is_public_profile: isPublicProfile,
        show_online_status: showOnlineStatus,
        gcash_number: gcashNumber,
        maya_number: mayaNumber,
        payment_method: preferredPayment
      });
      setShowSuccess(true);
      window.dispatchEvent(new CustomEvent('profile-updated'));
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to update profile', e);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleSendOTP = async () => {
    setIsSendingOTP(true);
    try {
      await api.sendOTP();
      setIsOTPSent(true);
    } catch (err) {
      alert('Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    try {
      await api.deleteMe();
      window.location.href = '/login';
    } catch (err) {
      alert('Failed to delete account. Please try again.');
    }
  };

  const handleVerifyOTP = async () => {
    setIsVerifying(true);
    try {
      await api.verifyOTP(otpValue);
      setIsEmailVerified(true);
      setIsOTPSent(false);
      setOtpValue('');
      window.dispatchEvent(new CustomEvent('refresh-notifications'));
    } catch (err: any) {
      alert(err.message || 'Invalid OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { status } = await api.uploadDocuments(file);
      setDocumentStatus(status);
      window.dispatchEvent(new CustomEvent('refresh-notifications'));
      alert('Documents uploaded successfully! Waiting for verification.');
    } catch (err) {
      console.error('Document upload failed', err);
      alert('Failed to upload documents.');
    }
  };

  const handleIdentitySubmit = async () => {
    if (!identityIdFile || !identitySelfieFile) {
      alert('Please upload both your government ID and verification selfie.');
      return;
    }

    setIsSubmittingIdentity(true);
    try {
      const { status, is_documents_verified } = await api.uploadDocuments(identityIdFile, identitySelfieFile);
      setDocumentStatus(status);
      setIsDocumentsVerified(!!is_documents_verified);
      setIsIdentityModalOpen(false);
      window.dispatchEvent(new CustomEvent('refresh-notifications'));
      window.dispatchEvent(new CustomEvent('profile-updated'));
      alert('Identity verified successfully! You are now a verified provider.');
    } catch (err) {
      console.error('Identity upload failed', err);
      alert('Failed to submit identity documents.');
    } finally {
      setIsSubmittingIdentity(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { avatar_url } = await api.uploadAvatar(file);
      setAvatarUrl(avatar_url);
      window.dispatchEvent(new CustomEvent('profile-updated'));
    } catch (err) {
      console.error('Failed to upload avatar', err);
      alert('Failed to upload photo.');
    }
  };

  const calculateCompletion = () => {
    const fields = [
      { name: 'Display Name', value: displayName },
      { name: 'Phone Number', value: phone },
      { name: 'Location', value: location },
      { name: 'Professional Bio', value: aboutMe },
      { name: 'Profile Photo', value: avatarUrl },
      { name: 'Service Offerings', value: services.length > 0 },
      { name: 'Email Verified', value: isEmailVerified },
      { name: 'Identity Verified', value: isDocumentsVerified },
      { name: 'Documents Submitted', value: documentStatus !== 'none' }
    ];
    const filled = fields.filter(f => !!f.value).length;
    return {
      percentage: Math.round((filled / fields.length) * 100),
      missing: fields.filter(f => !f.value).map(f => f.name)
    };
  };

  const completion = calculateCompletion();

  const toggleService = async (service: string) => {
    let updatedServices: string[] = [];
    if (services.includes(service)) {
      updatedServices = services.filter(s => s !== service);
    } else {
      updatedServices = [...services, service];
    }
    setServices(updatedServices);
    await api.updateMyServices(updatedServices);
  };

  const addCustomService = async () => {
    if (customService.trim() && !services.includes(customService.trim())) {
      const updatedServices = [...services, customService.trim()];
      setServices(updatedServices);
      setCustomService('');
      await api.updateMyServices(updatedServices);
    }
  };

  const filteredServices = ALL_SERVICES.filter(s => 
    s.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-12 text-center text-brand-text-variant">Loading profile...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-16 px-12">
      <AnimatePresence>
        {isServiceModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsServiceModalOpen(false)}
              className="absolute inset-0 bg-brand-text-main/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-brand-surface rounded-[2.5rem] shadow-2xl border border-brand-outline p-8 lg:p-10 flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-brand-text-main">Manage Your Services</h2>
                  <p className="text-sm text-brand-text-variant font-medium">Update the services you can offer to clients</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)} 
                  className="w-10 h-10 rounded-full hover:bg-brand-surface-card flex items-center justify-center text-brand-text-variant"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="relative mb-6">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-variant" />
                <input 
                  type="text" 
                  placeholder="Search services..."
                  value={serviceSearch}
                  onChange={e => setServiceSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-brand-surface border-2 hover:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 border-brand-outline rounded-2xl focus:border-brand-primary transition-all text-sm font-medium shadow-sm outline-none"
                />
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredServices.map(service => (
                  <button
                    type="button"
                    key={service}
                    onClick={() => toggleService(service)}
                    className={`p-4 rounded-2xl text-left border-2 transition-all ${
                      services.includes(service)
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary shadow-sm'
                        : 'border-brand-outline hover:border-brand-primary/50 text-brand-text-variant'
                    }`}
                  >
                    <span className="text-xs font-bold leading-tight">{service}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-brand-outline">
                <div className="flex gap-3 mb-6">
                  <input 
                    type="text" 
                    placeholder="Manually add a specialized service..."
                    value={customService}
                    onChange={e => setCustomService(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addCustomService()}
                    className="flex-1 px-5 py-3.5 bg-brand-surface border-2 border-brand-outline hover:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 rounded-xl text-sm font-medium focus:border-brand-primary outline-none transition-all shadow-sm"
                  />
                  <button 
                    type="button"
                    onClick={addCustomService}
                    disabled={!customService.trim()}
                    className="px-6 bg-brand-primary text-white font-bold rounded-xl hover:bg-[#059669] transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <PlusCircle size={18} /> Add
                  </button>
                </div>

                <button 
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:bg-[#059669] transition-all"
                >
                  Save Selection ({services.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-3xl font-semibold text-brand-text-main mb-2">Account Settings</h1>
          <p className="text-sm text-brand-text-variant">Manage your professional account and personal details</p>
        </div>
        <div className="flex flex-col items-end gap-2 text-xs font-medium text-brand-text-variant mt-4 sm:mt-0">
            {/* Identity / Document Verification */}
            <div className="flex items-center gap-2">
              {isDocumentsVerified ? (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-black rounded-full uppercase tracking-wider border border-brand-primary/20">
                  <CheckCircle size={10} className="fill-brand-primary text-white" />
                  Verified Provider
                </span>
              ) : (
                <div className="flex items-center gap-2">
                   <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-accent"></span> Unverified Provider</span>
                   {documentStatus !== 'verified' && (
                     <button 
                       onClick={() => setIsIdentityModalOpen(true)}
                       className="text-[10px] font-bold text-brand-primary hover:underline uppercase tracking-wider"
                     >
                       {documentStatus === 'pending' ? 'Update Verification' : 'Verify Identity'}
                     </button>
                   )}
                </div>
              )}
            </div>

            {/* Email OTP Verification */}
            <div className="flex items-center gap-2">
              {isEmailVerified ? (
                <span className="flex items-center gap-1 text-[10px] text-brand-primary font-bold">
                  <CheckCircle size={10} className="fill-brand-primary text-white" />
                  Email Verified
                </span>
              ) : (
                <div className="flex items-center gap-2">
                   <span className="text-[10px] text-brand-text-variant italic">Email unverified</span>
                   {!isOTPSent ? (
                     <button 
                       onClick={handleSendOTP} 
                       disabled={isSendingOTP}
                       className="text-[10px] font-bold text-brand-primary hover:underline uppercase tracking-wider disabled:opacity-50"
                     >
                       {isSendingOTP ? 'Sending...' : 'Verify Email'}
                     </button>
                   ) : (
                     <div className="flex items-center gap-1">
                        <input 
                          type="text" 
                          placeholder="OTP" 
                          className="w-12 px-1.5 py-0.5 text-[10px] border border-brand-outline rounded focus:outline-none" 
                          value={otpValue}
                          onChange={e => setOtpValue(e.target.value)}
                        />
                        <button onClick={handleVerifyOTP} className="text-[10px] font-bold text-brand-primary hover:underline uppercase tracking-wider">Submit</button>
                     </div>
                   )}
                </div>
              )}
            </div>
        </div>
      </header>

      {/* Settings Tabs Container */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-brand-outline mb-8">
        <div className="flex gap-8 px-2">
            {[
              { id: 'profile', label: 'Personal Info' },
              { id: 'security', label: 'Security' },
              { id: 'notifications', label: 'Notifications' },
              { id: 'privacy', label: 'Privacy & Data' },
              { id: 'billing', label: 'Payouts' },
              { id: 'location', label: 'Service Area' },
            ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveSettingsTab(tab.id)}
                 className={`pb-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                   activeSettingsTab === tab.id 
                     ? 'border-brand-primary text-brand-primary' 
                     : 'border-transparent text-brand-text-variant hover:text-brand-text-main hover:border-brand-outline'
                 }`}
               >
                 {tab.label}
               </button>
            ))}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {/* Left Column: Avatar */}
        <div className="md:col-span-1 space-y-6">
            <div className="bg-brand-surface-card border border-brand-outline p-8 rounded-2xl text-center shadow-sm">
                <div className="relative inline-block mb-6 group">
                   <div className="w-24 h-24 bg-brand-surface border border-brand-outline mx-auto flex items-center justify-center relative overflow-hidden rounded-full">
                        {avatarUrl ? (
                          <img 
                              src={avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:3000${avatarUrl}`} 
                              alt="Profile" 
                              className="w-full h-full object-cover transition-opacity"
                          />
                        ) : (
                          <div className="w-full h-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                            <span className="text-2xl font-bold">{displayName.charAt(0)}</span>
                          </div>
                        )}
                    </div>
                    <input 
                      type="file" 
                      id="avatar-input" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleAvatarChange} 
                    />
                    <button 
                      type="button" 
                      onClick={() => document.getElementById('avatar-input')?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-brand-primary text-brand-surface rounded-full shadow-md hover:scale-110 transition-transform"
                    >
                        <Camera size={14} />
                    </button>
                </div>
                <div className="flex items-center justify-center gap-2 mb-1 group max-w-[200px] mx-auto min-h-[32px]">
                   {isEditingName ? (
                      <input 
                         type="text" 
                         value={displayName}
                         onChange={(e) => setDisplayName(e.target.value)}
                         onBlur={() => setIsEditingName(false)}
                         onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                         autoFocus
                         className="text-lg font-medium text-brand-text-main bg-brand-surface border-b-2 border-brand-primary outline-none text-center px-1 py-0 w-full"
                      />
                   ) : (
                      <>
                         <h4 className="text-lg font-medium text-brand-text-main truncate" title={displayName}>{displayName}</h4>
                         <button onClick={() => setIsEditingName(true)} className="text-brand-text-variant opacity-0 group-hover:opacity-100 hover:text-brand-primary transition-all p-1 -mr-6 shrink-0" title="Edit Name">
                            <Edit2 size={16} />
                         </button>
                      </>
                   )}
                </div>
                <p className="text-sm text-brand-text-variant">Premium Provider</p>
            </div>

            <div className="bg-brand-surface-card border border-brand-outline p-6 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-brand-text-main">Profile Completion</h3>
                    <span className="text-sm font-bold text-brand-primary">{completion.percentage}%</span>
                </div>
                <div className="w-full bg-brand-outline/50 rounded-full h-2 mb-4 overflow-hidden">
                    <div className="bg-brand-primary h-2 rounded-full transition-all duration-1000" style={{ width: `${completion.percentage}%` }}></div>
                </div>
                {completion.missing.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-brand-text-variant mb-2 uppercase tracking-wider">Missing Items</p>
                    <ul className="space-y-2">
                        {completion.missing.map(item => (
                          <li key={item} className="flex items-center gap-2 text-xs text-brand-text-main group cursor-pointer hover:text-brand-primary transition-colors">
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-accent group-hover:scale-125 transition-transform"></div>
                              <span>{item}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
            </div>

            <div className="bg-brand-surface-card border border-brand-outline p-6 rounded-2xl shadow-sm">
                <h3 className="text-sm font-semibold text-brand-text-main mb-4">Provider Stats</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-brand-text-variant">Jobs Completed</span>
                        <span className="text-brand-text-main font-medium">{completedJobs.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-brand-text-variant">Avg. Rating</span>
                        <span className="text-brand-text-main font-medium">{stats.avg_rating.toFixed(1)} ⭐</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-brand-text-variant">Member Since</span>
                        <span className="text-brand-text-main font-medium">{memberSince}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Fields */}
        <div className="md:col-span-2 bg-brand-surface-card border border-brand-outline rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-8 space-y-8 flex-1">
            {activeSettingsTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Full Name">
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-brand-surface border-2 border-brand-outline rounded-xl px-4 py-3 hover:border-brand-primary/50 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 shadow-sm hover:shadow-md transition-all font-medium text-brand-text-main text-sm"
                  />
                </InputGroup>

                <InputGroup label="Email Address" helper="You cannot change your email address right now.">
                  <input 
                    type="email" 
                    value={email} 
                    disabled
                    className="w-full bg-brand-surface-container border border-brand-outline/40 rounded-xl px-4 py-3 text-brand-text-variant cursor-not-allowed opacity-70 text-sm"
                  />
                </InputGroup>

                <InputGroup label="Phone Number">
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-brand-surface border-2 border-brand-outline rounded-xl px-4 py-3 hover:border-brand-primary/50 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 shadow-sm hover:shadow-md transition-all font-medium text-brand-text-main text-sm"
                  />
                </InputGroup>

                <InputGroup label="Location">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-variant" size={16} />
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-brand-surface border-2 border-brand-outline rounded-xl pl-10 pr-4 py-3 hover:border-brand-primary/50 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 shadow-sm hover:shadow-md transition-all font-medium text-brand-text-main text-sm"
                    />
                  </div>
                </InputGroup>

                <div className="col-span-1 md:col-span-2">
                  <InputGroup label="About Me / Professional Bio">
                    <textarea 
                      rows={4}
                      value={aboutMe}
                      onChange={(e) => setAboutMe(e.target.value)}
                      className="w-full bg-brand-surface border-2 border-brand-outline rounded-xl px-4 py-3 hover:border-brand-primary/50 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 shadow-sm hover:shadow-md transition-all font-medium text-brand-text-main text-sm leading-relaxed resize-none"
                    />
                  </InputGroup>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t border-brand-outline">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest">My Service Offerings</h3>
                    <button 
                      type="button"
                      onClick={() => setIsServiceModalOpen(true)}
                      className="text-xs font-bold text-brand-primary flex items-center gap-1.5 hover:underline decoration-2 underline-offset-4"
                    >
                      <PlusCircle size={14} /> Update Services
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {services.map(service => (
                      <div key={service} className="flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/20 px-4 py-2 rounded-xl transition-all hover:bg-brand-primary/15">
                        <span className="text-xs font-bold text-brand-primary">{service}</span>
                        <button 
                          type="button"
                          onClick={() => toggleService(service)}
                          className="text-brand-primary/50 hover:text-brand-primary"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {services.length === 0 && (
                      <p className="text-xs text-brand-text-variant font-medium italic">No services selected. Add services to start receiving job alerts.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSettingsTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Security</h3>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-brand-surface border-2 border-brand-outline rounded-2xl p-6 shadow-sm">
                    <div>
                      <h4 className="text-sm font-semibold text-brand-text-main mb-1">Account Password</h4>
                      <p className="text-xs text-brand-text-variant">Change your password to keep your account secure.</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="shrink-0 px-6 py-2.5 bg-brand-surface-card border-2 border-brand-outline text-brand-text-main text-sm font-bold hover:border-brand-primary/50 hover:text-brand-primary transition-all rounded-xl shadow-sm focus:ring-4 focus:ring-brand-primary/10 w-full sm:w-auto"
                    >
                      Change Password
                    </button>
                  </div>
                </div>

                <PasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
              </div>
            )}

            {activeSettingsTab === 'notifications' && (
               <div className="space-y-8">
                 <div>
                   <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Email Notifications</h3>
                   <div className="bg-brand-surface border-2 border-brand-outline rounded-2xl flex flex-col shadow-sm">
                      <div className="flex items-center justify-between p-6 border-b border-brand-outline">
                         <div className="pr-4">
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1">New Messages</h4>
                            <p className="text-xs text-brand-text-variant">Receive an email when clients message you.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer outline-none">
                           <input 
                             type="checkbox" 
                             className="sr-only peer" 
                             checked={prefEmailMessages === 1}
                             onChange={e => setPrefEmailMessages(e.target.checked ? 1 : 0)} 
                           />
                           <div className="w-11 h-6 bg-brand-surface border-2 border-brand-outline rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/10 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-text-variant peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary shadow-sm transition-colors"></div>
                         </label>
                      </div>
                      <div className="flex items-center justify-between p-6 border-b border-brand-outline">
                         <div className="pr-4">
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1">Job Updates</h4>
                            <p className="text-xs text-brand-text-variant">Get notified when a job status changes or an offer is made.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer outline-none">
                           <input 
                             type="checkbox" 
                             className="sr-only peer" 
                             checked={prefEmailUpdates === 1}
                             onChange={e => setPrefEmailUpdates(e.target.checked ? 1 : 0)} 
                           />
                           <div className="w-11 h-6 bg-brand-surface border-2 border-brand-outline rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/10 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-text-variant peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary shadow-sm transition-colors"></div>
                         </label>
                      </div>
                      <div className="flex items-center justify-between p-6">
                         <div className="pr-4">
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1">Promotional Offers</h4>
                            <p className="text-xs text-brand-text-variant">Receive emails about new features, discounts, and platform updates.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer outline-none">
                           <input 
                             type="checkbox" 
                             className="sr-only peer" 
                             checked={prefEmailPromos === 1}
                             onChange={e => setPrefEmailPromos(e.target.checked ? 1 : 0)} 
                           />
                           <div className="w-11 h-6 bg-brand-surface border-2 border-brand-outline rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/10 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-text-variant peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary shadow-sm transition-colors"></div>
                         </label>
                      </div>
                   </div>
                 </div>

                 <div>
                   <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Push Notifications</h3>
                   <div className="bg-brand-surface border-2 border-brand-outline rounded-2xl flex flex-col shadow-sm">
                      <div className="flex items-center justify-between p-6 border-b border-brand-outline">
                         <div className="pr-4">
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1">Push Alerts</h4>
                            <p className="text-xs text-brand-text-variant">Allow the website to send you browser push notifications for real-time updates.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer outline-none">
                           <input 
                             type="checkbox" 
                             className="sr-only peer" 
                             checked={prefPushAlerts === 1}
                             onChange={e => setPrefPushAlerts(e.target.checked ? 1 : 0)} 
                           />
                           <div className="w-11 h-6 bg-brand-surface border-2 border-brand-outline rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/10 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-text-variant peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary shadow-sm transition-colors"></div>
                         </label>
                      </div>
                      <div className="flex items-center justify-between p-6">
                         <div className="pr-4">
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1">Marketing Push</h4>
                            <p className="text-xs text-brand-text-variant">Receive occasional push notifications about local promotions and discounts.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer outline-none">
                           <input 
                             type="checkbox" 
                             className="sr-only peer" 
                             checked={prefPushMarketing === 1}
                             onChange={e => setPrefPushMarketing(e.target.checked ? 1 : 0)} 
                           />
                           <div className="w-11 h-6 bg-brand-surface border-2 border-brand-outline rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/10 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-text-variant peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary shadow-sm transition-colors"></div>
                         </label>
                      </div>
                   </div>
                 </div>
               </div>
            )}

             {activeSettingsTab === 'privacy' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Profile Visibility</h3>
                    <div className="bg-brand-surface border-2 border-brand-outline rounded-2xl flex flex-col shadow-sm">
                       <div className="flex items-center justify-between p-6 border-b border-brand-outline">
                          <div className="pr-4">
                             <h4 className="text-sm font-semibold text-brand-text-main mb-1">Public Profile</h4>
                             <p className="text-xs text-brand-text-variant">Allow clients to find and view your public provider profile.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer outline-none">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={isPublicProfile === 1}
                              onChange={e => setIsPublicProfile(e.target.checked ? 1 : 0)} 
                            />
                            <div className="w-11 h-6 bg-brand-surface border-2 border-brand-outline rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/10 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-text-variant peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary shadow-sm transition-colors"></div>
                          </label>
                       </div>
                       <div className="flex items-center justify-between p-6">
                          <div className="pr-4">
                             <h4 className="text-sm font-semibold text-brand-text-main mb-1">Online Status</h4>
                             <p className="text-xs text-brand-text-variant">Show others when you are currently active on the platform.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer outline-none">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={showOnlineStatus === 1}
                              onChange={e => setShowOnlineStatus(e.target.checked ? 1 : 0)} 
                            />
                            <div className="w-11 h-6 bg-brand-surface border-2 border-brand-outline rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/10 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-text-variant peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary shadow-sm transition-colors"></div>
                          </label>
                       </div>
                    </div>
                  </div>
 
                  <div>
                    <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Account Termination</h3>
                    <div className="bg-red-50/50 border-2 border-red-200/50 rounded-2xl p-6 shadow-sm">
                       <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                         <div>
                            <h4 className="text-sm font-semibold text-red-700 mb-1">Delete Account</h4>
                            <p className="text-xs text-red-600/80">Permanently remove your provider account and all history. This action is irreversible.</p>
                         </div>
                         <button 
                           type="button" 
                           onClick={() => setIsDeletingAccount(true)}
                           className="shrink-0 px-6 py-2.5 bg-white border-2 border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-all rounded-xl shadow-sm focus:ring-4 focus:ring-red-100 w-full sm:w-auto"
                         >
                            Delete Account
                         </button>
                       </div>
                    </div>
                  </div>
                </div>
             )}

            {activeSettingsTab === 'billing' && (
               <div className="space-y-8">
                 <div>
                   <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Payout Methods</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* GCash */}
                      <div className={`p-6 rounded-2xl border-2 transition-all ${preferredPayment === 'gcash' ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-outline bg-brand-surface'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-[10px] tracking-tighter">GCash</div>
                          {preferredPayment === 'gcash' && <span className="text-[10px] font-bold text-brand-primary uppercase">Default</span>}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-[10px] font-bold text-brand-text-variant uppercase mb-1">GCash Number</p>
                            <input 
                              type="text" 
                              placeholder="09XXXXXXXXX"
                              value={gcashNumber}
                              onChange={e => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                                setGcashNumber(val);
                              }}
                              className="w-full bg-transparent border-none p-0 text-sm font-bold text-brand-text-main tracking-widest focus:ring-0 placeholder:text-brand-text-variant/30"
                            />
                          </div>
                          <div className="flex gap-2">
                             <button 
                              onClick={() => setPreferredPayment('gcash')}
                              disabled={gcashNumber.length < 11 || preferredPayment === 'gcash'}
                              className={`p-2 transition-colors ${preferredPayment === 'gcash' ? 'text-brand-primary' : 'text-brand-text-variant hover:text-brand-primary disabled:opacity-30'}`}
                              title="Set as Default"
                             >
                                <CheckCircle size={16} />
                             </button>
                             <button 
                              onClick={() => setGcashNumber('')}
                              className="p-2 text-brand-text-variant hover:text-red-500 transition-colors"
                             >
                                <Trash2 size={14} />
                             </button>
                          </div>
                        </div>
                      </div>

                      {/* Maya */}
                      <div className={`p-6 rounded-2xl border-2 transition-all ${preferredPayment === 'maya' ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-outline bg-brand-surface'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-8 bg-green-500 rounded flex items-center justify-center font-bold text-white text-[10px] tracking-tighter">MAYA</div>
                          {preferredPayment === 'maya' && <span className="text-[10px] font-bold text-brand-primary uppercase">Default</span>}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-[10px] font-bold text-brand-text-variant uppercase mb-1">Maya Number</p>
                            <input 
                              type="text" 
                              placeholder="09XXXXXXXXX"
                              value={mayaNumber}
                              onChange={e => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                                setMayaNumber(val);
                              }}
                              className="w-full bg-transparent border-none p-0 text-sm font-bold text-brand-text-main tracking-widest focus:ring-0 placeholder:text-brand-text-variant/30"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setPreferredPayment('maya')}
                              disabled={mayaNumber.length < 11 || preferredPayment === 'maya'}
                              className={`p-2 transition-colors ${preferredPayment === 'maya' ? 'text-brand-primary' : 'text-brand-text-variant hover:text-brand-primary disabled:opacity-30'}`}
                              title="Set as Default"
                            >
                               <CheckCircle size={16} />
                            </button>
                            <button 
                              onClick={() => setMayaNumber('')}
                              className="p-2 text-brand-text-variant hover:text-red-500 transition-colors"
                             >
                                <Trash2 size={14} />
                             </button>
                          </div>
                        </div>
                      </div>
                   </div>
                 </div>

                 <BillingHistory />
               </div>
            )}

            {activeSettingsTab === 'location' && (
               <div className="space-y-8">
                 <div>
                   <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest">Base of Operations</h3>
                   <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-brand-surface border-2 border-brand-outline rounded-2xl p-6 shadow-sm">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center shrink-0">
                           <MapPin className="text-brand-primary" size={24} />
                        </div>
                        <div>
                           <h4 className="text-sm font-semibold text-brand-text-main mb-1">{location || 'Set your location'}</h4>
                           <p className="text-xs text-brand-text-variant">Primary service area</p>
                        </div>
                     </div>
                     <button type="button" className="shrink-0 px-6 py-2.5 bg-brand-surface-card border-2 border-brand-outline text-brand-text-main text-sm font-bold hover:border-brand-primary/50 hover:text-brand-primary transition-all rounded-xl shadow-sm focus:ring-4 focus:ring-brand-primary/10 w-full sm:w-auto">
                        Edit Address
                     </button>
                   </div>
                 </div>

                 <div>
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest">Service Radius</h3>
                      <span className="text-xs font-bold text-brand-primary">{serviceRadius} km</span>
                   </div>
                   <div className="bg-brand-surface border-2 border-brand-outline rounded-2xl p-6 shadow-sm">
                      <p className="text-xs text-brand-text-variant mb-6">Set the maximum distance you are willing to travel for service requests from your base.</p>
                      <input 
                         type="range" 
                         min="1" 
                         max="50" 
                         value={serviceRadius}
                         onChange={(e) => setServiceRadius(parseInt(e.target.value))}
                         className="w-full h-2 bg-brand-outline rounded-lg appearance-none cursor-pointer accent-brand-primary"
                      />
                      <div className="flex justify-between text-xs text-brand-text-variant mt-2 font-medium">
                         <span>1 km</span>
                         <span>50 km</span>
                      </div>
                   </div>
                 </div>
               </div>
            )}
          </div>

            <div className="bg-brand-surface-container/30 px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-brand-outline">
              <div className="flex-1 text-xs font-medium text-brand-text-variant text-center sm:text-left">
                 <AnimatePresence mode="wait">
                   {showSuccess ? (
                     <motion.span 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                       className="text-sm font-bold text-brand-primary block"
                     >
                       Successfully saved changes!
                     </motion.span>
                   ) : (
                     <p>Private data will never be shared without your permission.</p>
                   )}
                 </AnimatePresence>
              </div>
              <div className="flex gap-3 items-center shrink-0">
                <button type="button" className="px-6 py-2.5 text-sm font-semibold text-brand-text-variant hover:text-brand-text-main hover:bg-brand-text-variant/10 rounded-xl transition-colors">
                Cancel
                </button>
                <button 
                  type="button" 
                  onClick={saveProfile}
                  className="px-8 py-2.5 bg-brand-primary text-white text-sm font-semibold hover:bg-[#059669] transition-all shadow-lg hover:shadow-brand-primary/20 rounded-xl active:scale-95 transition-all"
                >
                Save Changes
                </button>
              </div>
           </div>
        </div>
      </motion.div>

      <LegalModal 
        isOpen={legalModal.isOpen} 
        onClose={() => setLegalModal({ ...legalModal, isOpen: false })} 
        type={legalModal.type} 
      />

      <footer className="mt-16 flex justify-between border-t border-brand-outline pt-8">
        <div className="flex gap-8 text-xs text-brand-text-variant font-medium">
          <button 
            onClick={() => setLegalModal({ isOpen: true, type: 'privacy' })} 
            className="hover:text-brand-text-main transition-colors outline-none"
          >
            Privacy Policy
          </button>
          <button 
            onClick={() => setLegalModal({ isOpen: true, type: 'tos' })} 
            className="hover:text-brand-text-main transition-colors outline-none"
          >
            Terms of Service
          </button>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('change-tab', { detail: 'help' }))} 
            className="hover:text-brand-text-main transition-colors outline-none"
          >
            Help Center
          </button>
        </div>
        <div className="flex gap-4">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-text-variant/20"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-brand-text-variant/20"></div>
        </div>
      </footer>
      <AnimatePresence>
        {isDeletingAccount && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeletingAccount(false)}
              className="absolute inset-0 bg-brand-text-main/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-brand-surface rounded-[2.5rem] shadow-2xl border border-brand-outline p-8 lg:p-10"
            >
              <h2 className="text-2xl font-bold text-brand-text-main mb-2">Delete Provider Account?</h2>
              <p className="text-sm text-brand-text-variant mb-6">
                This will permanently remove your profile, earnings history, and active applications. To confirm, please type <span className="font-bold text-red-600">DELETE</span> below.
              </p>
              
              <input 
                type="text"
                placeholder="Type DELETE to confirm"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                className="w-full px-5 py-4 bg-brand-surface border-2 border-brand-outline rounded-2xl mb-6 focus:border-red-500 outline-none transition-all font-bold text-center tracking-widest"
              />

              <div className="flex gap-4">
                <button 
                  onClick={() => setIsDeletingAccount(false)}
                  className="flex-1 py-4 bg-brand-surface border-2 border-brand-outline text-brand-text-main font-bold rounded-2xl hover:bg-brand-surface-card transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE'}
                  className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all disabled:opacity-50 disabled:shadow-none"
                >
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isIdentityModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsIdentityModalOpen(false)}
              className="absolute inset-0 bg-brand-text-main/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-brand-surface rounded-[2.5rem] shadow-2xl border border-brand-outline p-8 lg:p-10 flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-brand-text-main flex items-center gap-2">
                    <Shield size={24} className="text-brand-primary" /> Verify Your Identity
                  </h2>
                  <p className="text-sm text-brand-text-variant font-medium">Upload ID and a selfie to get Verified instantly.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsIdentityModalOpen(false)} 
                  className="w-10 h-10 rounded-full hover:bg-brand-surface-card flex items-center justify-center text-brand-text-variant"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto pr-2 custom-scrollbar space-y-6 flex-1">
                <div className="p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl">
                  <p className="text-xs text-brand-text-variant font-medium leading-relaxed">
                    To safeguard our marketplace, we require a valid government ID and matching verification selfie. Submitted documents are processed instantly.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Government ID Select Card */}
                  <div 
                    onClick={() => {
                      if (!identityIdUrl) {
                        const input = document.getElementById('settings-id-input');
                        input?.click();
                      }
                    }}
                    className={`aspect-[4/3] bg-brand-surface-card border-2 rounded-2xl flex flex-col items-center justify-center gap-3 group transition-all relative overflow-hidden ${
                      identityIdUrl 
                        ? 'border-brand-primary/50' 
                        : 'border-dashed border-brand-outline hover:border-brand-primary cursor-pointer'
                    }`}
                  >
                    <input 
                      type="file" 
                      id="settings-id-input" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIdentityIdFile(file);
                          setIdentityIdUrl(URL.createObjectURL(file));
                        }
                      }}
                    />
                    {identityIdUrl ? (
                      <>
                        <img src={identityIdUrl} alt="ID Front Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-brand-text-main/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIdentityIdFile(null);
                              setIdentityIdUrl('');
                            }}
                            className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all active:scale-95"
                          >
                            <X size={16} />
                          </button>
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Remove ID</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-brand-surface-container flex items-center justify-center text-brand-text-variant group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                           <Upload size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest group-hover:text-brand-primary transition-colors">ID Front View</span>
                      </>
                    )}
                  </div>

                  {/* Selfie Select Card */}
                  <div 
                    onClick={() => {
                      if (!identitySelfieUrl) {
                        const input = document.getElementById('settings-selfie-input');
                        input?.click();
                      }
                    }}
                    className={`aspect-[4/3] bg-brand-surface-card border-2 rounded-2xl flex flex-col items-center justify-center gap-3 group transition-all relative overflow-hidden ${
                      identitySelfieUrl 
                        ? 'border-brand-primary/50' 
                        : 'border-dashed border-brand-outline hover:border-brand-primary cursor-pointer'
                    }`}
                  >
                    <input 
                      type="file" 
                      id="settings-selfie-input" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIdentitySelfieFile(file);
                          setIdentitySelfieUrl(URL.createObjectURL(file));
                        }
                      }}
                    />
                    {identitySelfieUrl ? (
                      <>
                        <img src={identitySelfieUrl} alt="Selfie Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-brand-text-main/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIdentitySelfieFile(null);
                              setIdentitySelfieUrl('');
                            }}
                            className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all active:scale-95"
                          >
                            <X size={16} />
                          </button>
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Remove Selfie</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-brand-surface-container flex items-center justify-center text-brand-text-variant group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                           <Camera size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest group-hover:text-brand-primary transition-colors">Verification Selfie</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-text-main ml-1 uppercase tracking-widest">Document Type</label>
                  <select 
                    value={identityIdType}
                    onChange={e => setIdentityIdType(e.target.value)}
                    className="w-full px-5 py-4 bg-brand-surface-card border border-brand-outline rounded-2xl text-sm font-medium appearance-none"
                  >
                    <option>National ID (PhilID)</option>
                    <option>Driver's License</option>
                    <option>Passport</option>
                    <option>UMID</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-brand-outline flex gap-4">
                <button 
                  onClick={() => setIsIdentityModalOpen(false)}
                  className="flex-1 py-4 bg-brand-surface border-2 border-brand-outline text-brand-text-main font-bold rounded-2xl hover:bg-brand-surface-card transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleIdentitySubmit}
                  disabled={isSubmittingIdentity || !identityIdUrl || !identitySelfieUrl}
                  className="flex-1 py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:bg-[#059669] transition-all disabled:opacity-50"
                >
                  {isSubmittingIdentity ? 'Verifying...' : 'Verify Now'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BillingHistory = () => {
  const [payments, setPayments] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    api.getBillingHistory().then(data => {
      setPayments(data);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="text-xs text-brand-text-variant italic">Loading history...</div>;

  return (
    <div>
      <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Earnings History</h3>
      <div className="bg-brand-surface border-2 border-brand-outline rounded-2xl flex flex-col shadow-sm overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-12 text-center text-brand-text-variant text-sm">No payouts yet.</div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-brand-surface-container border-b border-brand-outline text-brand-text-variant text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Job Title</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-brand-outline text-brand-text-main">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-brand-surface-card transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium">{p.job_title}</td>
                    <td className="px-6 py-4 font-bold text-[#059669]">₱{p.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {p.status}
                        </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
