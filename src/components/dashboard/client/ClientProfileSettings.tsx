import React from 'react';
import { 
  X, 
  PlusCircle, 
  Camera, 
  Edit2, 
  MapPin, 
  Trash2,
  Smartphone,
  Banknote,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../../services/api';
import { InputGroup } from '../shared/InputGroup';
import { LegalModal } from '../shared/LegalModal';
import { PasswordModal } from '../shared/PasswordModal';

export const ClientProfileSettings = () => {
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [displayName, setDisplayName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [aboutMe, setAboutMe] = React.useState('');
  const [avatarUrl, setAvatarUrl] = React.useState('');
  const [jobsCount, setJobsCount] = React.useState(0);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [isEmailVerified, setIsEmailVerified] = React.useState(false);
  const [isOTPSent, setIsOTPSent] = React.useState(false);
  const [otpValue, setOtpValue] = React.useState('');
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isSendingOTP, setIsSendingOTP] = React.useState(false);

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
  const [addresses, setAddresses] = React.useState<any[]>([]);
  const [isAddingAddress, setIsAddingAddress] = React.useState(false);
  const [newAddress, setNewAddress] = React.useState({ label: '', address_text: '' });

  const [activeSettingsTab, setActiveSettingsTab] = React.useState('profile');
  const [isLoading, setIsLoading] = React.useState(true);
  const [legalModal, setLegalModal] = React.useState<{ isOpen: boolean, type: 'privacy' | 'tos' }>({
    isOpen: false,
    type: 'privacy'
  });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);

  React.useEffect(() => {
    // Load profile from Backend
    const loadData = async () => {
      try {
        const [userData, jobs] = await Promise.all([
          api.getMe(),
          api.getJobs({ view: 'my_posts' })
        ]);
        
        setDisplayName(userData.full_name || '');
        setEmail(userData.email || '');
        setPhone(userData.phone || '');
        setLocation(userData.location || '');
        setAboutMe(userData.about_me || '');
        setAvatarUrl(userData.avatar_url || '');
        setJobsCount(jobs.length || 0);
        setIsEmailVerified(!!userData.is_email_verified);
        
        setPrefEmailMessages(userData.pref_email_messages ?? 1);
        setPrefEmailUpdates(userData.pref_email_updates ?? 1);
        setPrefEmailPromos(userData.pref_email_promos ?? 0);
        setPrefPushAlerts(userData.pref_push_alerts ?? 1);
        setPrefPushMarketing(userData.pref_push_marketing ?? 0);
        setIsPublicProfile(userData.is_public_profile ?? 1);
        setShowOnlineStatus(userData.show_online_status ?? 0);
        setGcashNumber(userData.gcash_number || '');
        setMayaNumber(userData.maya_number || '');
        setPreferredPayment(userData.payment_method || 'gcash');

        const addr = await api.getAddresses();
        setAddresses(addr);

        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const saveProfile = async () => {
    try {
      await api.updateMe({
        full_name: displayName,
        phone,
        location,
        about_me: aboutMe,
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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    try {
      await api.deleteMe();
      window.location.href = '/login';
    } catch (err) {
      alert('Failed to delete account. Please try again.');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addresses.length >= 3) {
      alert('You can only have a maximum of 3 saved addresses.');
      return;
    }
    try {
      await api.addAddress({ ...newAddress, is_default: addresses.length === 0 ? 1 : 0 });
      const addr = await api.getAddresses();
      setAddresses(addr);
      setNewAddress({ label: '', address_text: '' });
      setIsAddingAddress(false);
    } catch (err: any) {
      alert(err.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.deleteAddress(id);
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    try {
      await api.setDefaultAddress(id);
      const addr = await api.getAddresses();
      setAddresses(addr);
    } catch (err: any) {
      alert(err.message || 'Failed to set default address');
    }
  };

  const calculateCompletion = () => {
    const fields = [
      { name: 'Display Name', value: displayName },
      { name: 'Phone Number', value: phone },
      { name: 'Location', value: location },
      { name: 'About Me', value: aboutMe },
      { name: 'Profile Photo', value: avatarUrl },
      { name: 'Email Verified', value: isEmailVerified }
    ];
    const filled = fields.filter(f => !!f.value).length;
    return {
      percentage: Math.round((filled / fields.length) * 100),
      missing: fields.filter(f => !f.value).map(f => f.name)
    };
  };

  const completion = calculateCompletion();

  if (isLoading) {
    return <div className="p-12 text-center text-brand-text-variant">Loading profile...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-16 px-12">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-3xl font-semibold text-brand-text-main mb-2">Account Settings</h1>
          <p className="text-sm text-brand-text-variant">Manage your account preferences and personal details</p>
        </div>
        <div className="flex gap-4 text-xs font-medium text-brand-text-variant mt-4 sm:mt-0">
            {isEmailVerified ? (
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-primary"></span> Verified User</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-accent"></span> Unverified Account</span>
                {!isOTPSent ? (
                  <button 
                    onClick={handleSendOTP}
                    disabled={isSendingOTP}
                    className="text-[10px] font-bold text-brand-primary hover:underline uppercase tracking-wider disabled:opacity-50"
                  >
                    {isSendingOTP ? 'Sending...' : 'Verify Now'}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter OTP"
                      value={otpValue}
                      onChange={e => setOtpValue(e.target.value)}
                      className="w-20 px-2 py-1 text-xs border border-brand-outline rounded-md focus:border-brand-primary focus:outline-none"
                    />
                    <button 
                      onClick={handleVerifyOTP}
                      disabled={isVerifying}
                      className="text-[10px] font-bold text-brand-primary hover:underline uppercase tracking-wider disabled:opacity-50"
                    >
                      {isVerifying ? 'Verifying...' : 'Submit'}
                    </button>
                  </div>
                )}
              </div>
            )}
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
              { id: 'billing', label: 'Payments' },
              { id: 'location', label: 'Addresses' },
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
                <p className="text-sm text-brand-text-variant">Homeowner</p>
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
                <h3 className="text-sm font-semibold text-brand-text-main mb-4">Account Stats</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-brand-text-variant">Jobs Posted</span>
                        <span className="text-brand-text-main font-medium">{jobsCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-brand-text-variant">Member Since</span>
                        <span className="text-brand-text-main font-medium">Jan 2024</span>
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
                  <InputGroup label="About Me">
                    <textarea 
                      rows={4}
                      value={aboutMe}
                      onChange={(e) => setAboutMe(e.target.value)}
                      className="w-full bg-brand-surface border-2 border-brand-outline rounded-xl px-4 py-3 hover:border-brand-primary/50 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 shadow-sm hover:shadow-md transition-all font-medium text-brand-text-main text-sm leading-relaxed resize-none"
                    />
                  </InputGroup>
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
                            <p className="text-xs text-brand-text-variant">Receive an email when providers message you.</p>
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
                             <p className="text-xs text-brand-text-variant">Allow other users to find and view your public profile page.</p>
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
                             <p className="text-xs text-brand-text-variant">Show other users when you are currently active on the platform.</p>
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
                            <p className="text-xs text-red-600/80">Permanently remove your account and all associated data. This action is irreversible.</p>
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
                   <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Payment Methods</h3>
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
                   <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Saved Addresses</h3>
                   {addresses.length === 0 ? (
                     <div className="bg-brand-surface border-2 border-dashed border-brand-outline rounded-2xl p-12 text-center">
                        <MapPin className="mx-auto text-brand-text-variant mb-4 opacity-20" size={48} />
                        <p className="text-brand-text-variant text-sm">No saved addresses yet.</p>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 gap-4">
                        {addresses.map(addr => (
                          <div key={addr.id} className={`flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-2 rounded-2xl p-6 shadow-sm transition-all ${addr.is_default ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-outline bg-brand-surface'}`}>
                            <div className="flex items-center gap-4">
                               <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${addr.is_default ? 'bg-brand-primary/20' : 'bg-brand-outline/20'}`}>
                                  <MapPin className={addr.is_default ? 'text-brand-primary' : 'text-brand-text-variant'} size={24} />
                               </div>
                               <div>
                                  <h4 className="text-sm font-semibold text-brand-text-main mb-1 flex items-center gap-2">
                                    {addr.label}
                                    {addr.is_default === 1 && <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-primary text-white px-2 py-0.5 rounded">Default</span>}
                                  </h4>
                                  <p className="text-xs text-brand-text-variant">{addr.address_text}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                               {!addr.is_default && (
                                 <button 
                                  onClick={() => handleSetDefaultAddress(addr.id)}
                                  className="text-xs font-bold text-brand-primary hover:underline px-4 py-2"
                                 >
                                    Set Default
                                 </button>
                               )}
                               <button 
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="p-2 text-brand-text-variant hover:text-red-500 transition-colors"
                               >
                                  <Trash2 size={16} />
                               </button>
                            </div>
                          </div>
                        ))}
                     </div>
                   )}
                 </div>

                 {isAddingAddress ? (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-brand-surface border-2 border-brand-primary/30 rounded-2xl p-6 shadow-lg"
                    >
                       <form onSubmit={handleAddAddress} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <InputGroup label="Address Label (e.g. Home, Office)">
                                <input 
                                  type="text"
                                  required
                                  value={newAddress.label}
                                  onChange={e => setNewAddress({...newAddress, label: e.target.value})}
                                  placeholder="Home"
                                  className="w-full bg-brand-surface border-2 border-brand-outline rounded-xl px-4 py-2 focus:outline-none focus:border-brand-primary text-sm"
                                />
                             </InputGroup>
                             <InputGroup label="Full Address">
                                <input 
                                  type="text"
                                  required
                                  value={newAddress.address_text}
                                  onChange={e => setNewAddress({...newAddress, address_text: e.target.value})}
                                  placeholder="123 Street Name, Barangay, City"
                                  className="w-full bg-brand-surface border-2 border-brand-outline rounded-xl px-4 py-2 focus:outline-none focus:border-brand-primary text-sm"
                                />
                             </InputGroup>
                          </div>
                          <div className="flex justify-end gap-3">
                             <button 
                              type="button" 
                              onClick={() => setIsAddingAddress(false)}
                              className="px-4 py-2 text-sm font-semibold text-brand-text-variant hover:text-brand-text-main"
                             >
                               Cancel
                             </button>
                             <button 
                              type="submit"
                              className="px-6 py-2 bg-brand-primary text-white text-sm font-bold rounded-xl shadow-md hover:bg-[#059669] transition-all"
                             >
                               Save Address
                             </button>
                          </div>
                       </form>
                    </motion.div>
                 ) : (
                    addresses.length < 3 && (
                      <button 
                        type="button" 
                        onClick={() => setIsAddingAddress(true)}
                        className="w-full py-4 border-2 border-dashed border-brand-outline rounded-2xl text-brand-text-variant font-bold text-sm hover:border-brand-primary hover:text-brand-primary transition-all flex items-center justify-center gap-2"
                      >
                        <PlusCircle size={18} /> Add New Address ({addresses.length}/3)
                      </button>
                    )
                 )}
                 
                 {addresses.length >= 3 && (
                   <p className="text-xs text-brand-text-variant text-center bg-brand-surface-container/50 py-3 rounded-xl border border-brand-outline/50">
                     You have reached the maximum limit of 3 addresses.
                   </p>
                 )}
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

      <PasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />

      <LegalModal 
        isOpen={legalModal.isOpen} 
        onClose={() => setLegalModal({ ...legalModal, isOpen: false })} 
        type={legalModal.type} 
      />

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
              <h2 className="text-2xl font-bold text-brand-text-main mb-2">Delete Account?</h2>
              <p className="text-sm text-brand-text-variant mb-6">
                This action is permanent and cannot be undone. To confirm, please type <span className="font-bold text-red-600">DELETE</span> below.
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
      </AnimatePresence>
      
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
      <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Billing History</h3>
      <div className="bg-brand-surface border-2 border-brand-outline rounded-2xl flex flex-col shadow-sm overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-12 text-center text-brand-text-variant text-sm">No transactions yet.</div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-brand-surface-container border-b border-brand-outline text-brand-text-variant text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Description</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-brand-outline text-brand-text-main">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-brand-surface-card transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium">{p.job_title} - Payment via {p.payment_method.toUpperCase()}</td>
                    <td className="px-6 py-4">₱{p.amount.toLocaleString()}</td>
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
