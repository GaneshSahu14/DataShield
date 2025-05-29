import React, { useState, useEffect } from 'react';
// Removed unused Link import since we'll use <a> for external URL
import Sidebar from '../components/Sidebar';
import UrlScanner from '../components/UrlScanner';
import ScanResultsTable, { ScanResult } from '../components/ScanResultsTable';
import PhishingTrendsChart from '../components/PhishingTrendsChart';
import { Shield, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface DashboardProps {
    onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
    const [scanResults, setScanResults] = useState<ScanResult[]>([]);
    const [stats, setStats] = useState({
        totalScans: 0,
        phishingDetected: 0,
        safeWebsites: 0,
        threatLevel: 'Low'
    });
    const [activeGraph, setActiveGraph] = useState<string | null>(null);

    useEffect(() => {
        setTimeout(() => {
            setStats({
                totalScans: 1248,
                phishingDetected: 327,
                safeWebsites: 921,
                threatLevel: 'Moderate'
            });
        }, 300);
    }, []);

    const handleScanComplete = (result: ScanResult) => {
        setScanResults([result, ...scanResults]);
        setStats(prev => ({
            ...prev,
            totalScans: prev.totalScans + 1,
            phishingDetected: prev.phishingDetected + (result.verdict === 'Phishing' ? 1 : 0),
            safeWebsites: prev.safeWebsites + (result.verdict === 'Safe' ? 1 : 0),
            threatLevel: prev.phishingDetected + (result.verdict === 'Phishing' ? 1 : 0) > 400 ? 'High' : 'Moderate'
        }));
    };

    const trendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        phishing: [42, 58, 37, 45, 39, 33, 28],
        safe: [86, 94, 102, 83, 95, 112, 98],
    };

    const graphData = {
        totalScans: [1000, 1050, 1100, 1150, 1200, 1248],
        phishingDetected: [300, 310, 315, 320, 325, 327],
        safeWebsites: [700, 750, 800, 850, 900, 921],
    };

    const toggleGraph = (stat: string) => {
        setActiveGraph(activeGraph === stat ? null : stat);
    };

    const renderGraph = (data: number[], color: string) => {
        const minValue = Math.min(...data);
        const maxValue = Math.max(...data);
        const xStep = 100 / (data.length - 1); // X-axis step size
        
        return (
            <div className="w-full h-32 mt-2 px-2 relative">
                <svg className="w-full h-full" viewBox="0 0 120 70" preserveAspectRatio="none">
                    <line x1="10" y1="60" x2="110" y2="60" stroke="#9ca3af" strokeWidth="1" />
                    <text x="55" y="68" textAnchor="middle" fill="#6b7280" fontSize="5">Time</text>
                    <line x1="10" y1="10" x2="10" y2="60" stroke="#9ca3af" strokeWidth="1" />
                    <text x="5" y="35" textAnchor="end" fill="#6b7280" fontSize="5" transform="rotate(-90 5 35)">Count</text>
                    <polyline
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        points={data.map((value, index) => {
                            const x = 10 + index * xStep;
                            const y = 60 - ((value - minValue) / (maxValue - minValue)) * 50;
                            return `${x},${y}`;
                        }).join(' ')}
                    />
                    <text x="5" y="15" textAnchor="end" fill="#6b7280" fontSize="4">{maxValue}</text>
                    <text x="5" y="62" textAnchor="end" fill="#6b7280" fontSize="4">{minValue}</text>
                </svg>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-teal-100">
            <Sidebar onLogout={onLogout} />
            
            <div className="flex-1 overflow-auto lg:ml-64 transition-all duration-500 ease-in-out">
                <main className="p-4 sm:p-6 md:p-8">
                    <div className="mb-8 animate-fade-in-down">
                        <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-transparent bg-clip-text mb-2">
                            Welcome to DataShield
                        </h1>
                        <p className="text-lg text-gray-700">"Don't Click Blindly – Detect Phishing Instantly!"</p>
                        {/* Authentication Service Button */}
                        <div className="mt-4">
                            {/* External URL */}
                            <a
                                href="http://localhost:3000"
                                className="inline-block bg-gradient-to-r from-purple-600 to-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:from-purple-700 hover:to-teal-700 transition-all duration-300"
                            >
                                Go to Authentication Service
                            </a>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div 
                            className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-l-4 border-purple-500 animate-bounce-in cursor-pointer relative"
                            onClick={() => toggleGraph('totalScans')}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-purple-600 mb-1">Total Scans</p>
                                    <h3 className="text-3xl font-bold text-purple-800">{stats.totalScans.toLocaleString()}</h3>
                                </div>
                                <div className="bg-purple-200 p-3 rounded-full transition-colors duration-300 hover:bg-purple-300">
                                    <Shield className="h-6 w-6 text-purple-700" />
                                </div>
                            </div>
                            <div className="mt-3 text-xs font-medium text-purple-600">
                                <span className="flex items-center">
                                    <TrendingUp size={14} className="mr-1" /> 12% surge
                                </span>
                            </div>
                            {activeGraph === 'totalScans' && (
                                <div className="absolute top-full left-0 w-full bg-white rounded-b-2xl shadow-lg p-2 z-10 animate-dropdown">
                                    {renderGraph(graphData.totalScans, '#9333ea')}
                                </div>
                            )}
                        </div>

                        <div 
                            className="bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-l-4 border-red-500 animate-bounce-in animation-delay-100 cursor-pointer relative"
                            onClick={() => toggleGraph('phishingDetected')}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-red-600 mb-1">Phishing Detected</p>
                                    <h3 className="text-3xl font-bold text-red-800">{stats.phishingDetected.toLocaleString()}</h3>
                                </div>
                                <div className="bg-red-200 p-3 rounded-full transition-colors duration-300 hover:bg-red-300">
                                    <AlertTriangle className="h-6 w-6 text-red-700" />
                                </div>
                            </div>
                            <div className="mt-3 text-xs font-medium text-red-600">
                                <span className="flex items-center">
                                    <TrendingUp size={14} className="mr-1" /> 8% rise
                                </span>
                            </div>
                            {activeGraph === 'phishingDetected' && (
                                <div className="absolute top-full left-0 w-full bg-white rounded-b-2xl shadow-lg p-2 z-10 animate-dropdown">
                                    {renderGraph(graphData.phishingDetected, '#ef4444')}
                                </div>
                            )}
                        </div>

                        <div 
                            className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-l-4 border-green-500 animate-bounce-in animation-delay-200 cursor-pointer relative"
                            onClick={() => toggleGraph('safeWebsites')}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-green-600 mb-1">Safe Websites</p>
                                    <h3 className="text-3xl font-bold text-green-800">{stats.safeWebsites.toLocaleString()}</h3>
                                </div>
                                <div className="bg-green-200 p-3 rounded-full transition-colors duration-300 hover:bg-green-300">
                                    <CheckCircle className="h-6 w-6 text-green-700" />
                                </div>
                            </div>
                            <div className="mt-3 text-xs font-medium text-green-600">
                                <span className="flex items-center">
                                    <TrendingUp size={14} className="mr-1" /> 15% boost
                                </span>
                            </div>
                            {activeGraph === 'safeWebsites' && (
                                <div className="absolute top-full left-0 w-full bg-white rounded-b-2xl shadow-lg p-2 z-10 animate-dropdown">
                                    {renderGraph(graphData.safeWebsites, '#22c55e')}
                                </div>
                            )}
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-l-4 border-orange-500 animate-bounce-in animation-delay-300">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-orange-600 mb-1">Threat Level</p>
                                    <h3 className="text-3xl font-bold text-orange-800">{stats.threatLevel}</h3>
                                </div>
                                <div className="bg-orange-200 p-3 rounded-full transition-colors duration-300 hover:bg-orange-300">
                                    <AlertTriangle className="h-6 w-6 text-orange-700" />
                                </div>
                            </div>
                            <div className="mt-3 text-xs font-medium text-orange-600">
                                <span className="flex items-center">
                                    Live threat analysis
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mb-8 animate-slide-in-right">
                        <UrlScanner onScanComplete={handleScanComplete} />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="animate-fade-in-up animation-delay-200">
                            <ScanResultsTable results={scanResults} />
                        </div>
                        <div className="animate-fade-in-up animation-delay-400">
                            <PhishingTrendsChart data={trendData} />
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 mb-6 transition-all duration-300 hover:shadow-xl">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 bg-gradient-to-r from-teal-600 to-purple-600 text-transparent bg-clip-text">
                            Security Tips
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { title: "Check the URL", desc: "Verify URLs before sharing sensitive info.", color: "purple" },
                                { title: "Look for HTTPS", desc: "Secure sites use HTTPS with a padlock.", color: "blue" },
                                { title: "Be Wary of Urgency", desc: "Phishing uses urgency to deceive.", color: "teal" },
                                { title: "Use DataShield", desc: "Scan URLs with our vibrant tool.", color: "pink" },
                            ].map((tip, index) => (
                                <div key={index} className="flex items-start group transition-all duration-300 hover:-translate-y-1">
                                    <div className={`flex-shrink-0 p-2 rounded-lg mr-3 bg-${tip.color}-100 group-hover:bg-${tip.color}-200`}>
                                        <Shield className={`h-5 w-5 text-${tip.color}-600`} />
                                    </div>
                                    <div>
                                        <h3 className={`text-sm font-medium text-${tip.color}-800 group-hover:text-${tip.color}-600`}>{tip.title}</h3>
                                        <p className="text-xs text-gray-600 mt-1">{tip.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;