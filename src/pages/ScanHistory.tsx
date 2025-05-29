import React from 'react';
import Sidebar from '../components/Sidebar';
import { ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';

interface ScanHistoryProps {
    onLogout: () => void;
}

interface ScanResult {
    url: string;
    score: number; // Percentage (0-100) from frontend conversion
    verdict: 'Safe' | 'Phishing' | 'Error';
    date: string; // Stored as ISO string in local storage
    domainAgeDays?: number | null;
    domainStatus?: string | string[];
}

const ScanHistory: React.FC<ScanHistoryProps> = ({ onLogout }) => {
    const scanHistory: ScanResult[] = JSON.parse(localStorage.getItem('scanHistory') || '[]').map((item: ScanResult) => ({
        ...item,
        date: new Date(item.date), // Convert ISO string back to Date object
    }));

    const formatDomainAge = (days: number | null | undefined) => {
        if (days === null || days === undefined) return 'N/A';
        const years = Math.floor(days / 365);
        const remainingDays = days % 365;
        return years > 0 ? `${years}y ${remainingDays}d` : `${days}d`;
    };

    const getDomainStatusLabel = (status: string | string[] | undefined) => {
        if (!status || status === 'N/A') return 'Unknown';
        const statusStr = Array.isArray(status) ? status.join(' ').toLowerCase() : status.toLowerCase();
        return statusStr.includes('clientdeleteprohibited') || statusStr.includes('ok') || statusStr.includes('active')
            ? 'Active'
            : 'Inactive';
    };

    const getScoreColor = (score: number, verdict: string) => {
        if (verdict === 'Phishing') {
            return score >= 50 ? 'bg-red-500' : score >= 30 ? 'bg-orange-500' : 'bg-yellow-500';
        } else if (verdict === 'Safe') {
            return score >= 90 ? 'bg-green-500' : score >= 75 ? 'bg-teal-500' : 'bg-blue-500';
        }
        return 'bg-gray-500'; // For Error
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-teal-100">
            <Sidebar onLogout={onLogout} />
            
            <div className="flex-1 overflow-auto lg:ml-64 transition-all duration-500 ease-in-out">
                <main className="p-4 sm:p-6 md:p-8">
                    <div className="mb-8 animate-fade-in-down">
                        <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-transparent bg-clip-text mb-2">
                            Scan History
                        </h1>
                        <p className="text-lg text-gray-700">Explore your scanning journey with colorful insights</p>
                    </div>
                    
                    {scanHistory.length === 0 ? (
                        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg p-6 text-center transition-all duration-300 hover:shadow-xl animate-fade-in-up">
                            <p className="text-gray-600 text-lg font-medium">No scan history yet. Start scanning URLs to see your colorful history!</p>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-white to-teal-50 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl animate-fade-in-up">
                            <div className="p-6 pb-0">
                                <h2 className="text-xl font-semibold bg-gradient-to-r from-teal-600 to-purple-600 text-transparent bg-clip-text mb-4">
                                    Your Scan Records
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-purple-100 to-teal-100 text-left">
                                            <th className="px-6 py-3 text-xs font-semibold text-purple-800 uppercase tracking-wider">URL</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-blue-800 uppercase tracking-wider">Confidence Score</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-teal-800 uppercase tracking-wider">Verdict</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-purple-800 uppercase tracking-wider">Domain Age</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-blue-800 uppercase tracking-wider">Domain Status</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-teal-800 uppercase tracking-wider">Date Scanned</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-teal-200/50">
                                        {scanHistory.map((result, index) => (
                                            <tr key={index} className="transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-teal-50 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                                            {result.url}
                                                        </span>
                                                        <a 
                                                            href={result.url.startsWith('http') ? result.url : `https://${result.url}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="ml-2 text-purple-600 hover:text-purple-800 transition-colors duration-200"
                                                        >
                                                            <ExternalLink size={16} />
                                                        </a>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                                            <div 
                                                                className={`h-2.5 rounded-full transition-all duration-300 ${getScoreColor(result.score, result.verdict)}`}
                                                                style={{ width: `${result.score}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="ml-2 text-sm text-blue-700 font-medium">{result.score.toFixed(1)}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {result.verdict === 'Safe' ? (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-200 text-green-800 transition-colors duration-200 hover:bg-green-300">
                                                            <CheckCircle size={16} className="mr-1" /> Safe
                                                        </span>
                                                    ) : result.verdict === 'Phishing' ? (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-200 text-red-800 transition-colors duration-200 hover:bg-red-300">
                                                            <AlertTriangle size={16} className="mr-1" /> Phishing
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-200 text-orange-800 transition-colors duration-200 hover:bg-orange-300">
                                                            <AlertTriangle size={16} className="mr-1" /> Error
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-700 font-medium">
                                                    {formatDomainAge(result.domainAgeDays)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors duration-200 ${
                                                        getDomainStatusLabel(result.domainStatus) === 'Active' 
                                                            ? 'bg-teal-200 text-teal-800 hover:bg-teal-300' 
                                                            : getDomainStatusLabel(result.domainStatus) === 'Inactive' 
                                                                ? 'bg-red-200 text-red-800 hover:bg-red-300' 
                                                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                                    }`}>
                                                        {getDomainStatusLabel(result.domainStatus)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-700 font-medium">
                                                    {(result.date as Date).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ScanHistory;