import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
    const { user, updateMe, deleteMe, changePassword } = useAuth();
    const navigate = useNavigate();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState(''); // required for delete auth
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    
    // Switch between 'account', 'security', and 'danger' tabs
    const [activeTab, setActiveTab] = useState('account');

    // Populate initial state from user context
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
        }
        setError(null);
        setSuccessMsg(null);
        setPassword('');
        setCurrentPassword('');
        setNewPassword('');
    }, [user]);

    const handleSave = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setIsSaving(true);
        try {
            await updateMe({ name, phone });
            setSuccessMsg('Profile updated successfully!');
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setIsSaving(true);
        if(!currentPassword || !newPassword) {
            setError('Both current and new passwords are required.');
            setIsSaving(false);
            return;
        }

        try {
            await changePassword(currentPassword, newPassword);
            setSuccessMsg('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to change password.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        setError(null);
        if (!password) {
            setError('Password is required to delete your account.');
            return;
        }

        const isConfirmed = window.confirm(
            'Are you absolutely sure you want to delete your account? This action cannot be undone and all data will be lost.'
        );

        if (!isConfirmed) return;

        setIsDeleting(true);
        try {
            await deleteMe(password);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to delete account.');
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center sm:py-10 sm:px-4 py-0 px-0 Selection">
            <div className="w-full h-full sm:h-auto max-w-2xl bg-white dark:bg-slate-900 sm:rounded-2xl rounded-none sm:shadow-xl shadow-none sm:border border-none border-slate-200 dark:border-white/10 flex flex-col overflow-hidden animate-fade-in">
                
                {/* Header */}
                <div className="flex items-center gap-4 px-5 sm:px-8 py-5 sm:py-6 border-b border-slate-200 dark:border-white/10 shrink-0">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">Settings</h1>
                        <p className="text-[12px] sm:text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 truncate">Manage your account preferences and security.</p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col md:flex-row h-full sm:min-h-[500px]">
                    {/* Navigation Sidebar */}
                    <div className="md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 p-3 sm:p-4 shrink-0 flex flex-row md:flex-col gap-1 sm:gap-1.5 overflow-x-auto CustomScrollbar hide-scrollbar">
                        <button 
                            onClick={() => { setActiveTab('account'); setError(null); setSuccessMsg(null); }}
                            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-[13px] sm:text-[14px] font-medium transition-all whitespace-nowrap ${activeTab === 'account' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>
                            My Account
                        </button>
                        <button 
                            onClick={() => { setActiveTab('security'); setError(null); setSuccessMsg(null); }}
                            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-[13px] sm:text-[14px] font-medium transition-all whitespace-nowrap ${activeTab === 'security' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            Security
                        </button>
                        <button 
                            onClick={() => { setActiveTab('danger'); setError(null); setSuccessMsg(null); }}
                            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-[13px] sm:text-[14px] font-medium transition-all whitespace-nowrap md:mt-auto ${activeTab === 'danger' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/5 hover:text-rose-600 dark:hover:text-rose-400'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
                            Danger Zone
                        </button>
                    </div>

                    {/* Settings Forms */}
                    <div className="flex-1 p-5 sm:p-6 md:p-8 overflow-y-auto">
                        {/* Alerts */}
                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[13px] flex items-start gap-3 shadow-sm animate-fade-in">
                                <svg className="shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                <span>{error}</span>
                            </div>
                        )}
                        
                        {successMsg && (
                            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[13px] flex items-start gap-3 shadow-sm animate-fade-in">
                                <svg className="shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                <span>{successMsg}</span>
                            </div>
                        )}

                        {/* Account Tab */}
                        {activeTab === 'account' && (
                            <div className="animate-fade-in space-y-6 max-w-md">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Profile Details</h3>
                                    <p className="text-[13px] text-slate-500 dark:text-slate-400">Update your personal information here.</p>
                                </div>
                                <form onSubmit={handleSave} className="space-y-5">
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2">Email (Read Only)</label>
                                        <input 
                                            type="email" 
                                            value={email} 
                                            disabled
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500 text-[14px] cursor-not-allowed"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                                        <input 
                                            type="text" 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-[14px]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2">Phone Number</label>
                                        <input 
                                            type="tel" 
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-[14px]"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isSaving}
                                        className="w-full pt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white text-[14px] font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="animate-fade-in space-y-6 max-w-md">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Change Password</h3>
                                    <p className="text-[13px] text-slate-500 dark:text-slate-400">Ensure your account is using a long, random password to stay secure.</p>
                                </div>
                                <form onSubmit={handlePasswordChange} className="space-y-5">
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2">Current Password</label>
                                        <input 
                                            type="password" 
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-[14px]"
                                            placeholder="Enter your current password"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2">New Password</label>
                                        <input 
                                            type="password" 
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-[14px]"
                                            placeholder="Enter your new password"
                                        />
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isSaving || !currentPassword || !newPassword}
                                        className="w-full pt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white text-[14px] font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? 'Updating...' : 'Change Password'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Danger Zone Tab */}
                        {activeTab === 'danger' && (
                            <div className="animate-fade-in space-y-6 max-w-md">
                                <div>
                                    <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400 mb-1">Danger Zone</h3>
                                    <p className="text-[13px] text-slate-500 dark:text-slate-400">Permanently delete your account and all associated data.</p>
                                </div>
                                <form onSubmit={handleDelete} className="space-y-5">
                                    <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-500/5">
                                        <h4 className="text-rose-700 dark:text-rose-400 font-bold text-[14px] mb-2">Warning</h4>
                                        <p className="text-slate-600 dark:text-slate-400 text-[13px] leading-relaxed">
                                            Once you delete your account, there is no going back. Please be certain. All of your conversations, knowledge bases, and generated content will be permanently wiped from our servers.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2">Confirm Current Password</label>
                                        <input 
                                            type="password" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all text-[14px]"
                                            placeholder="Enter password to verify"
                                        />
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isDeleting || !password}
                                        className="w-full pt-2 py-3 px-4 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-600/50 disabled:cursor-not-allowed text-white text-[14px] font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                                    >
                                        {isDeleting ? 'Deleting...' : 'Permanently Delete Account'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
