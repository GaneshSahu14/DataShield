import React from 'react';
import { ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';

export interface ScanResult {
  url: string;
  score: number; // Score in percentage (0-100) from UrlScanner.tsx
  verdict: 'Safe' | 'Phishing' | 'Error';
  date: Date;
  domainAgeDays?: number | null;  // Added from /predict endpoint
  domainStatus?: string | string[];  // Added to hold Domain Status from /whois
}

interface ScanResultsTableProps {
  results: ScanResult[];
}

const ScanResultsTable: React.FC<ScanResultsTableProps> = ({ results }) => {
  if (results.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <p className="text-gray-500">No scan results yet. Try scanning a URL above.</p>
      </div>
    );
  }

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
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-6 pb-0">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Scans</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence Score</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Verdict</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Domain Age</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Domain Status</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date Scanned</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {results.map((result, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                      {result.url}
                    </span>
                    <a 
                      href={result.url.startsWith('http') ? result.url : `https://${result.url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${getScoreColor(result.score, result.verdict)}`}
                        style={{ width: `${result.score}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-700">
                      {result.score.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {result.verdict === 'Safe' ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      <CheckCircle size={16} className="mr-1" /> Safe
                    </span>
                  ) : result.verdict === 'Phishing' ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      <AlertTriangle size={16} className="mr-1" /> Phishing
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      <AlertTriangle size={16} className="mr-1" /> Error
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDomainAge(result.domainAgeDays)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    getDomainStatusLabel(result.domainStatus) === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : getDomainStatusLabel(result.domainStatus) === 'Inactive' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {getDomainStatusLabel(result.domainStatus)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {result.date.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScanResultsTable;