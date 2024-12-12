"use client"
import React, { useState } from 'react';
import { Skeleton } from '@nextui-org/skeleton';
import { ShieldAlert, ShieldCheck, ShieldQuestion, AlertTriangle } from 'lucide-react';

const ScamPredictor = () => {
  const [domain, setDomain] = useState<string>('');
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDomain(e.target.value);
  };

  const handleSearch = async () => {
    if (!domain) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/scamPredictor?domain=${domain}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Render risk icon based on risk level
  const renderRiskIcon = (riskLevel: string) => {
    const iconProps = { 
      size: 48, 
      className: "mb-4 mx-auto" 
    };

    switch (riskLevel) {
      case 'Safe':
        return <ShieldCheck color="#10b981" {...iconProps} />;
      case 'Minimal Risk':
        return <ShieldQuestion color="#eab308" {...iconProps} />;
      case 'Moderate+ Risk':
        return <ShieldAlert color="#f97316" {...iconProps} />;
      case 'High Risk':
        return <AlertTriangle color="#ef4444" {...iconProps} />;
      default:
        return <ShieldQuestion color="#6b7280" {...iconProps} />;
    }
  };

  // Determine background color based on risk level
  const getBackgroundColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Safe': return 'bg-green-950/70';
      case 'Minimal Risk': return 'bg-yellow-950/70';
      case 'Moderate+ Risk': return 'bg-orange-950/70';
      case 'High Risk': return 'bg-red-950/70';
      default: return 'bg-gray-900/70';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Results Section - Always Visible */}
        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden min-h-[400px]">
          {loading && (
            <div className="p-6">
              <Skeleton className="h-full w-full rounded-lg" />
            </div>
          )}

          {error && (
            <div className="p-6 text-center bg-red-950 text-red-300">
              {error}
            </div>
          )}

          {result && !loading && !error && (
            <div 
              className={`p-8 transition-all duration-500 h-full ${getBackgroundColor(result.riskLevel)}`}
            >
              <div className="text-center">
                {renderRiskIcon(result.riskLevel)}
                
                <h3 className="text-3xl font-bold mb-2">{result.riskLevel}</h3>
                <p className="text-gray-300 mb-6">Domain: {result.domain}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-black/30 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Scam Class</p>
                    <p className="text-xl font-semibold">{result.scamClass}</p>
                  </div>
                  <div className="bg-black/30 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Trust Score</p>
                    <p className="text-xl font-semibold">{result.trustScore}</p>
                  </div>
                </div>

                <div className="bg-black/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Interpretation</p>
                  <p>
                    {result.riskLevel === 'Safe' 
                      ? "This domain appears to be safe and trustworthy." 
                      : result.riskLevel === 'Minimal Risk'
                      ? "This domain has some suspicious characteristics."
                      : result.riskLevel === 'Moderate+ Risk'
                      ? "Exercise caution. This domain shows suspicious signs."
                      : "High risk of being a potential scam. Proceed with extreme caution."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Default state when no result */}
          {!result && !loading && !error && (
            <div className="h-full flex items-center justify-center text-center p-6">
              <p className="text-gray-300">Enter a domain to check its security risk</p>
            </div>
          )}
        </div>

        {/* Search Section */}
        <div className=" rounded-xl overflow-hidden">
          <div className="p-3">
            <div className="flex">
              <input
                type="text"
                value={domain}
                onChange={handleInputChange}
                placeholder="example.com"
                className="flex-grow px-6 py-3 bg-black text-white rounded-l-lg focus:outline-none focus:ring-1 focus:ring-gray-700 border border-gray-700"
              />
              <button 
                onClick={handleSearch} 
                className="px-6 py-3 bg-gray-800 text-white rounded-r-lg hover:bg-gray-700 transition-colors border border-gray-700"
              >
                Predict
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScamPredictor;