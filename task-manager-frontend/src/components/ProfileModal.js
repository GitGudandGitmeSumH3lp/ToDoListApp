// In src/components/ProfileModal.js
import React, { useState, useEffect } from 'react';
import api from '../api';
import GlassCard from './GlassCard';
import { FaUserCircle, FaUserSecret, FaToggleOn, FaToggleOff, FaTimes } from 'react-icons/fa';

const SettingsRow = ({ icon, title, description }) => (
    <div className="flex items-center justify-between text-gray-500">
        <div className="flex items-center gap-4">
            {icon}
            <div>
                <h4 className="font-semibold text-gray-300">{title}</h4>
                <p className="text-sm">{description}</p>
            </div>
        </div>
        <FaToggleOff size={24} />
    </div>
);

export default function ProfileModal({ isOpen, onClose, onProfileUpdate }) {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [useSecretIcon, setUseSecretIcon] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.get('/me')
        .then(res => {
          setUser(res.data);
          setUsername(res.data.username || '');
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleSave = (e) => {
    e.preventDefault();
    setStatus({ message: 'Saving...', type: 'loading' });
    api.put('/me', { username })
      .then(() => {
        setStatus({ message: 'Profile saved!', type: 'success' });
        onProfileUpdate(); // Tell the layout to refetch user data
        setTimeout(() => { // Close modal after a short delay
            onClose();
        }, 1000);
      })
      .catch(err => {
        setStatus({ message: err.response?.data?.message || 'Failed to save.', type: 'error' });
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <GlassCard className="w-full max-w-3xl p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <FaTimes />
        </button>

        {loading ? (
            <p>Loading profile...</p>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-8 border-b border-gray-800 pb-4">Your Profile</h2>
            <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center justify-center">
                        {useSecretIcon ? <FaUserSecret size={100} className="text-gray-500" /> : <FaUserCircle size={100} className="text-gray-500" />}
                        <button type="button" onClick={() => setUseSecretIcon(!useSecretIcon)} className="mt-2 text-xs text-gray-500 hover:text-white">Toggle Icon</button>
                        <button type="button" className="mt-4 px-4 py-2 text-sm border border-gray-600 rounded-md text-gray-400 hover:bg-gray-800">Change Picture</button>
                    </div>
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-1">Email</label>
                            <p className="p-3 bg-gray-800 rounded-md text-gray-500 cursor-not-allowed">{user?.email}</p>
                        </div>
                        <div>
                            <label htmlFor="username" className="block text-sm font-semibold text-gray-400 mb-1">Username</label>
                            <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g., The Debugging Partner" className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:border-green-400"/>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-800">
                    {status.message && (<p className={`text-sm ${status.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>{status.message}</p>)}
                    <button type="submit" className="px-6 py-2 bg-green-500 text-black font-bold rounded-md hover:bg-green-400 disabled:bg-gray-600" disabled={status.type === 'loading'}>
                        {status.type === 'loading' ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
            <div className="mt-8 pt-6 border-t border-gray-800">
                <h3 className="text-2xl font-bold mb-6">Settings</h3>
                <div className="space-y-6">
                    <SettingsRow icon={<FaToggleOn size={24} />} title="Email Notifications" description="Receive summaries and updates via email." />
                    <SettingsRow icon={<FaToggleOn size={24} />} title="Push Notifications" description="Get real-time reminders on your devices." />
                    <div>
                        <h4 className="font-semibold text-gray-300">Security</h4>
                        <button type="button" className="mt-2 px-4 py-2 text-sm border border-gray-600 rounded-md text-gray-400 hover:bg-gray-800" disabled>Change Password</button>
                    </div>
                </div>
            </div>
          </>
        )}
      </GlassCard>
    </div>
  );
}