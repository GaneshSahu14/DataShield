import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Shield, Bell, Lock, Save, Trash2 } from 'lucide-react';

interface SettingsProps {
    onLogout: () => void;
    userEmail: string; // Email from login
}

const Settings: React.FC<SettingsProps> = ({ onLogout, userEmail }) => {
    const [username, setUsername] = useState('DataShieldUser'); // Mock username
    const [email, setEmail] = useState(userEmail); // Use email from login
    const [notifications, setNotifications] = useState(true);
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);

    const handleSave = () => {
        // Mock save action (e.g., API call in a real app)
        alert('Settings saved successfully!');
    };

    const handleClearHistory = () => {
        if (window.confirm('Are you sure you want to clear your scan history? This action cannot be undone.')) {
            localStorage.removeItem('scanHistory');
            alert('Scan history cleared successfully!');
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-teal-100">
            <Sidebar onLogout={onLogout} />
            
            <div className="flex-1 overflow-auto lg:ml-64 transition-all duration-500 ease-in-out">
                <main className="p-4 sm:p-6 md:p-8">
                    <div className="mb-8 animate-fade-in-down">
                        <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-transparent bg-clip-text mb-2">
                            Settings
                        </h1>
                        <p className="text-lg text-gray-700">Customize your DataShield experience with flair</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Profile Settings */}
                        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl animate-fade-in-up">
                            <h2 className="text-xl font-semibold text-purple-800 mb-4 bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
                                Profile
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                        disabled // Disable editing if tied to login
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Email linked to your login</p>
                                </div>
                            </div>
                        </div>

                        {/* Notification Settings */}
                        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl animate-fade-in-up animation-delay-200">
                            <h2 className="text-xl font-semibold text-blue-800 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                                Notifications
                            </h2>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Bell className="h-6 w-6 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-700">Enable Notifications</span>
                                </div>
                                <button
                                    onClick={() => setNotifications(!notifications)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                                        notifications ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                            notifications ? 'translate-x-5' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Security Settings */}
                        <div className="bg-gradient-to-br from-white to-teal-50 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl animate-fade-in-up animation-delay-400">
                            <h2 className="text-xl font-semibold text-teal-800 mb-4 bg-gradient-to-r from-teal-600 to-blue-600 text-transparent bg-clip-text">
                                Security
                            </h2>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Lock className="h-6 w-6 text-teal-600" />
                                    <span className="text-sm font-medium text-gray-700">Two-Factor Authentication</span>
                                </div>
                                <button
                                    onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                                        twoFactorAuth ? 'bg-teal-600' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                            twoFactorAuth ? 'translate-x-5' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Clear History */}
                        <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl animate-fade-in-up animation-delay-600">
                            <h2 className="text-xl font-semibold text-red-800 mb-4 bg-gradient-to-r from-red-600 to-purple-600 text-transparent bg-clip-text">
                                Clear Scan History
                            </h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Remove all recorded scan history from your browser's local storage. This action cannot be undone.
                            </p>
                            <button
                                onClick={handleClearHistory}
                                className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-lg hover:from-red-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                            >
                                <Trash2 size={20} className="mr-2" />
                                Clear History
                            </button>
                        </div>

                        {/* Save Button */}
                        <div className="bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl animate-fade-in-up animation-delay-800">
                            <h2 className="text-xl font-semibold text-pink-800 mb-4 bg-gradient-to-r from-pink-600 to-purple-600 text-transparent bg-clip-text">
                                Save Settings
                            </h2>
                            <button
                                onClick={handleSave}
                                className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                            >
                                <Save size={20} className="mr-2" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Settings;