import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, History, Settings, LogOut, Shield, Menu, X, Lock } from 'lucide-react';

interface SidebarProps {
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
        { name: 'Scan History', path: '/history', icon: <History size={20} /> },
        { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
        { name: 'Auth', path: 'http://localhost:3000', icon: <Lock size={20} />, isExternal: true }, // Updated to external URL
    ];

    return (
        <>
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-gradient-to-br from-purple-900/50 to-teal-900/50 z-40 lg:hidden animate-fade-in"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <div 
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-purple-50 via-blue-50 to-teal-50 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-center h-16 border-b border-purple-200/50 animate-fade-in-down">
                        <div className="flex items-center space-x-3">
                            <Shield className="h-10 w-10 text-purple-600 transition-transform duration-300 hover:scale-110" />
                            <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-transparent bg-clip-text">
                                DataShield
                            </span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
                        {navItems.map((item, index) =>
                            item.isExternal ? (
                                <a
                                    key={item.path}
                                    href={item.path} // Links to http://localhost:3000
                                    className="flex items-center px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-teal-100 animate-fade-in-up"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <span className="mr-3 text-purple-600">{item.icon}</span>
                                    <span className="font-medium">{item.name}</span>
                                </a>
                            ) : (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                                            isActive
                                                ? 'bg-gradient-to-r from-purple-200 to-blue-200 text-purple-800 shadow-md'
                                                : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-teal-100'
                                        } animate-fade-in-up animation-delay-${index * 100}`
                                    }
                                    onClick={() => setIsOpen(false)}
                                >
                                    <span className="mr-3 text-purple-600">{item.icon}</span>
                                    <span className="font-medium">{item.name}</span>
                                </NavLink>
                            )
                        )}
                    </nav>

                    {/* Logout button */}
                    <div className="p-4 border-t border-teal-200/50">
                        <button
                            onClick={onLogout}
                            className="flex items-center w-full px-4 py-3 rounded-xl text-gray-700 bg-gradient-to-r from-orange-50 to-white hover:from-orange-100 hover:to-teal-100 transition-all duration-300 transform hover:scale-105 animate-fade-in-up animation-delay-300"
                        >
                            <LogOut size={20} className="mr-3 text-orange-600" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;