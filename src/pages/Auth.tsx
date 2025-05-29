import React from 'react';
import { Lock, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Auth: React.FC = () => {
    const navigate = useNavigate();

    const handleAuthenticate = () => {
        window.location.href = 'http://localhost:3000/'; // Redirect to external URL
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-teal-100">
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
                <div className="bg-gradient-to-br from-white to-teal-50 rounded-2xl shadow-xl p-8 w-full max-w-md transform transition-all duration-300 hover:shadow-2xl animate-fade-in-up">
                    {/* Header */}
                    <div className="flex items-center justify-center mb-6">
                        <Shield className="h-10 w-10 text-purple-600 mr-3" />
                        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-transparent bg-clip-text">
                            Authentication Service
                        </h1>
                    </div>

                    {/* Placeholder Content */}
                    <p className="text-gray-700 text-center mb-6">
                        Securely log in or authenticate here.
                    </p>

                    {/* Form */}
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAuthenticate(); }}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                                placeholder="Enter username"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                className="w-full px-4 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                                placeholder="Enter password"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:from-purple-700 hover:to-teal-700 transition-all duration-300"
                        >
                            <Lock className="inline-block mr-2 h-5 w-5" />
                            Authenticate
                        </button>
                    </form>

                    {/* Back to Dashboard Button */}
                    <button
                        onClick={handleBackToDashboard}
                        className="mt-4 w-full bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md hover:from-gray-300 hover:to-gray-400 transition-all duration-300"
                    >
                        Back to Dashboard
                    </button>

                    {/* Optional Info */}
                    <p className="text-xs text-gray-600 mt-4 text-center">
                        Redirecting to http://localhost:3000/
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;