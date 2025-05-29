import React, { useState } from 'react'; 
import { Search, AlertTriangle, CheckCircle, Shield } from 'lucide-react';

interface UrlScannerProps {
    onScanComplete: (result: {
        url: string;
        score: number;
        verdict: 'Safe' | 'Phishing' | 'Error';
        date: Date;
        domainAgeDays?: number | null;
        domainStatus?: string | string[];
    }) => void;
}

const UrlScanner: React.FC<UrlScannerProps> = ({ onScanComplete }) => {
    const [url, setUrl] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState('');
    const [whoisError, setWhoisError] = useState('');
    const [scanComplete, setScanComplete] = useState(false);
    const [scanResult, setScanResult] = useState<{
        score: number;
        verdict: 'Safe' | 'Phishing' | 'Error';
        date: string;
        domainAgeDays?: number | null;
    } | null>(null);
    const [whoisData, setWhoisData] = useState<{
        domainName?: string;
        registryDomainId?: string;
        registeredOn?: string;
        expiresOn?: string;
        updatedOn?: string;
        domainAge?: string;
        registrar?: string;
        domainStatus?: string | string[];
        nameServers?: string | string[];
    } | null>(null);

    const saveToHistory = (result: {
        url: string;
        score: number;
        verdict: 'Safe' | 'Phishing' | 'Error';
        date: Date;
        domainAgeDays?: number | null;
        domainStatus?: string | string[];
    }) => {
        const history = JSON.parse(localStorage.getItem('scanHistory') || '[]');
        const newHistory = [
            {
                ...result,
                date: result.date.toISOString(),
            },
            ...history,
        ].slice(0, 50); // Limit to last 50 scans
        localStorage.setItem('scanHistory', JSON.stringify(newHistory));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setWhoisError('');
        setScanComplete(false);
        setScanResult(null);
        setWhoisData(null);

        if (!url.trim()) {
            setError('Please enter a URL to scan.');
            return;
        }

        let formattedUrl = url.startsWith('http') ? url : `https://${url}`;
        
        try {
            new URL(formattedUrl);
        } catch {
            setError('Invalid URL format. Please enter a valid URL (e.g., https://example.com).');
            return;
        }

        setIsScanning(true);

        try {
            console.log("Sending request to /predict:", formattedUrl);
            const response = await fetch('http://127.0.0.1:8000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: formattedUrl }),
            });

            console.log("Predict response status:", response.status);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); // Handle non-JSON responses
                throw new Error(errorData.detail || `Server responded with status ${response.status}`);
            }

            const data = await response.json();
            console.log("Predict response data:", data);
            if (!data.score || !data.verdict || !data.date) {
                throw new Error('Invalid response format from server.');
            }

            const result = {
                url: formattedUrl,
                score: Math.max(0, Math.min(1, data.score)) * 100, // Convert to percentage
                verdict: data.verdict,
                date: new Date(data.date),
                domainAgeDays: data.domain_age_days || null,
            };

            let domainStatus: string | string[] | undefined;
            try {
                console.log("Fetching WHOIS data for:", formattedUrl);
                const whoisResponse = await fetch('http://127.0.0.1:8000/whois', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: formattedUrl }),
                });

                if (!whoisResponse.ok) {
                    throw new Error(`WHOIS server responded with status ${whoisResponse.status}`);
                }

                const whoisJson = await whoisResponse.json();
                console.log("WHOIS response:", whoisJson);
                setWhoisData({
                    domainName: whoisJson.domain_info?.["Domain Name"] || 'N/A',
                    registryDomainId: whoisJson.domain_info?.["Registry Domain ID"] || 'N/A',
                    registeredOn: whoisJson.domain_info?.["Registered On"] || 'N/A',
                    expiresOn: whoisJson.domain_info?.["Expires On"] || 'N/A',
                    updatedOn: whoisJson.domain_info?.["Updated On"] || 'N/A',
                    domainAge: whoisJson.domain_info?.["Domain Age"] || 'N/A',
                    registrar: whoisJson.domain_info?.Registrar || 'N/A',
                    domainStatus: whoisJson.domain_info?.["Domain Status"] || 'N/A',
                    nameServers: whoisJson.domain_info?.["Name Servers"] || 'N/A',
                });
                domainStatus = whoisJson.domain_info?.["Domain Status"] || 'N/A';
            } catch (whoisErr) {
                console.error("WHOIS Fetch Error:", whoisErr);
                setWhoisError(`Unable to fetch WHOIS data: ${whoisErr.message}`);
                domainStatus = 'N/A';
            }

            setScanResult({
                ...result,
                date: result.date.toLocaleString(),
            });

            const completeResult = {
                ...result,
                domainStatus,
            };
            onScanComplete(completeResult);
            saveToHistory(completeResult);

            setScanComplete(true);
        } catch (error) {
            console.error("URL Scan Error:", error);
            setError(`Failed to scan URL: ${error.message}. Check if the server is running at http://localhost:8000.`);
            const errorResult = {
                url: formattedUrl,
                score: 0,
                verdict: 'Error' as const,
                date: new Date(),
            };
            setScanResult({
                ...errorResult,
                date: errorResult.date.toLocaleString(),
            });
            onScanComplete(errorResult);
            saveToHistory(errorResult);
        } finally {
            setIsScanning(false);
        }
    };

    const handleReset = () => {
        setUrl('');
        setScanComplete(false);
        setScanResult(null);
        setWhoisData(null);
        setError('');
        setWhoisError('');
    };

    const formatDomainAge = (days: number | null | undefined) => {
        if (days === null || days === undefined) return 'N/A';
        const years = Math.floor(days / 365);
        const remainingDays = days % 365;
        return years > 0 ? `${years}y ${remainingDays}d` : `${days}d`;
    };

    const formatArrayField = (field: string | string[] | undefined) => {
        if (!field) return 'N/A';
        if (Array.isArray(field)) return field.join(', ');
        return field;
    };

    return (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl shadow-md p-6 mb-6 transition-all duration-300 hover:shadow-lg border border-indigo-100">
            <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-indigo-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Phishing URL Scanner</h2>
            </div>
            
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center">
                    <AlertTriangle size={18} className="mr-2" />
                    {error}
                </div>
            )}

            {scanComplete && scanResult && (
                <div className={`mb-4 p-4 rounded-lg flex items-center ${
                    scanResult.verdict === 'Safe' ? 'bg-green-50 text-green-800' :
                    scanResult.verdict === 'Phishing' ? 'bg-red-50 text-red-800' :
                    'bg-yellow-50 text-yellow-800'
                }`}>
                    {scanResult.verdict === 'Safe' ? (
                        <>
                            <CheckCircle size={24} className="mr-3" />
                            <div>
                                <p className="font-medium">URL appears to be safe</p>
                                <p className="text-sm opacity-80">Confidence score: {scanResult.score.toFixed(1)}%</p>
                                <p className="text-xs opacity-60">Domain Age: {formatDomainAge(scanResult.domainAgeDays)}</p>
                                <p className="text-xs opacity-60">Scanned on: {scanResult.date}</p>
                            </div>
                        </>
                    ) : scanResult.verdict === 'Phishing' ? (
                        <>
                            <AlertTriangle size={24} className="mr-3" />
                            <div>
                                <p className="font-medium">Potential phishing detected!</p>
                                <p className="text-sm opacity-80">Confidence score: {scanResult.score.toFixed(1)}%</p>
                                <p className="text-xs opacity-60">Domain Age: {formatDomainAge(scanResult.domainAgeDays)}</p>
                                <p className="text-xs opacity-60">Scanned on: {scanResult.date}</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <AlertTriangle size={24} className="mr-3" />
                            <div>
                                <p className="font-medium">Error processing URL</p>
                                <p className="text-xs opacity-60">Scanned on: {scanResult.date}</p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {whoisData && (
                <div className="bg-gray-100 p-4 rounded-lg mt-4">
                    <h3 className="text-lg font-semibold mb-2">Domain Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <p><strong>Name:</strong> {whoisData.domainName}</p>
                        <p><strong>Registry Domain ID:</strong> {whoisData.registryDomainId}</p>
                        <p><strong>Registered On:</strong> {whoisData.registeredOn}</p>
                        <p><strong>Expires On:</strong> {whoisData.expiresOn}</p>
                        <p><strong>Updated On:</strong> {whoisData.updatedOn}</p>
                        <p><strong>Domain Age:</strong> {whoisData.domainAge}</p>
                        <p><strong>Registrar:</strong> {whoisData.registrar}</p>
                        <p><strong>Domain Status:</strong> {formatArrayField(whoisData.domainStatus)}</p>
                        <p className="sm:col-span-2"><strong>Name Servers:</strong> {formatArrayField(whoisData.nameServers)}</p>
                    </div>
                </div>
            )}

            {whoisError && (
                <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg mb-4 text-sm flex items-center">
                    <AlertTriangle size={18} className="mr-2" />
                    {whoisError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mt-4">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter URL to scan (e.g., https://example.com)"
                    className="w-full px-4 py-3 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500"
                    disabled={isScanning}
                />
                <button 
                    type="submit" 
                    disabled={isScanning} 
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                >
                    {isScanning ? 'Scanning...' : 'Scan URL'}
                </button>
            </form>

            {scanComplete && (
                <button 
                    onClick={handleReset}
                    className="mt-4 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Scan Another URL
                </button>
            )}
        </div>
    );
};

export default UrlScanner;