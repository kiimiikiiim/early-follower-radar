'use client';

import { useState, useEffect, useMemo } from 'react';

interface Signal {
  username: string;
  followed_by: string[];
  score: number;
}

interface DashboardStats {
  totalSignals: number;
  highSignals: number;
  avgScore: number;
}

// Helper function to format time ago
function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function Home() {
  const [highSignals, setHighSignals] = useState<Signal[]>([]);
  const [recentSignals, setRecentSignals] = useState<Signal[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSignals: 0,
    highSignals: 0,
    avgScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Filter and search state
  const [showOnlyHighSignal, setShowOnlyHighSignal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSignals = async () => {
    try {
      setLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      
      // Fetch high-signal accounts
      const highRes = await fetch(`${apiBase}/api/signals/high`);
      if (!highRes.ok) throw new Error('Failed to fetch high signals');
      const highData = await highRes.json();
      setHighSignals(highData.signals || []);

      // Fetch recent signals
      const recentRes = await fetch(`${apiBase}/api/signals/recent`);
      if (!recentRes.ok) throw new Error('Failed to fetch recent signals');
      const recentData = await recentRes.json();
      setRecentSignals(recentData.signals || []);

      // Fetch all signals for stats
      const allRes = await fetch(`${apiBase}/api/signals`);
      if (!allRes.ok) throw new Error('Failed to fetch all signals');
      const allData = await allRes.json();
      const allSignals = allData.signals || [];

      // Calculate stats
      const avgScore = allSignals.length > 0
        ? (allSignals.reduce((sum: number, s: Signal) => sum + s.score, 0) / allSignals.length).toFixed(1)
        : 0;

      setStats({
        totalSignals: allSignals.length,
        highSignals: highData.count || 0,
        avgScore: parseFloat(avgScore as string),
      });

      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      setError(`Failed to connect to backend at ${apiBase}. Make sure the server is running.`);
      console.error('Error fetching signals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchSignals, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter and search logic
  const filteredHighSignals = useMemo(() => {
    let filtered = highSignals;

    // Apply high signal filter
    if (showOnlyHighSignal) {
      filtered = filtered.filter(s => s.score >= 2);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.username.toLowerCase().includes(query) ||
        s.followed_by.some(account => account.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [highSignals, showOnlyHighSignal, searchQuery]);

  const filteredRecentSignals = useMemo(() => {
    let filtered = recentSignals;

    // Apply high signal filter
    if (showOnlyHighSignal) {
      filtered = filtered.filter(s => s.score >= 2);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.username.toLowerCase().includes(query) ||
        s.followed_by.some(account => account.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [recentSignals, showOnlyHighSignal, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">📡</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Early Follower Radar</h1>
                <p className="text-sm text-slate-400">Track emerging accounts followed by big players</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">
                {loading ? 'Updating...' : `Updated ${timeAgo(lastUpdate)}`}
              </p>
              <div className="flex items-center gap-2 mt-2 justify-end">
                {loading && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                )}
                <p className="text-xs text-slate-600">
                  {loading ? 'Live' : 'Ready'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <p className="text-red-200 text-sm">
              ⚠️ {error} - Make sure the backend server is running on port 4000
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
            <p className="text-slate-400 text-sm font-medium mb-2">Total Signals</p>
            <p className="text-3xl font-bold text-white">{stats.totalSignals}</p>
            <p className="text-xs text-slate-500 mt-2">emerging accounts</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
            <p className="text-slate-400 text-sm font-medium mb-2">High Signal</p>
            <p className="text-3xl font-bold text-blue-400">{stats.highSignals}</p>
            <p className="text-xs text-slate-500 mt-2">score ≥ 2</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
            <p className="text-slate-400 text-sm font-medium mb-2">Average Score</p>
            <p className="text-3xl font-bold text-purple-400">{stats.avgScore}</p>
            <p className="text-xs text-slate-500 mt-2">per account</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Bar */}
            <div>
              <label className="text-sm text-slate-400 font-medium mb-2 block">Search</label>
              <input
                type="text"
                placeholder="Search by username or big account..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              {searchQuery && (
                <p className="text-xs text-slate-400 mt-1">
                  Found {filteredHighSignals.length + filteredRecentSignals.length} results
                </p>
              )}
            </div>

            {/* Filter Toggle */}
            <div className="flex items-end">
              <button
                onClick={() => setShowOnlyHighSignal(!showOnlyHighSignal)}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                  showOnlyHighSignal
                    ? 'bg-blue-600 text-white border border-blue-500'
                    : 'bg-slate-700 text-slate-300 border border-slate-600 hover:border-slate-500'
                }`}
              >
                {showOnlyHighSignal ? '✓ HIGH SIGNAL ONLY' : 'Show All'}
              </button>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* High Signal Section */}
          <section className="bg-slate-800 border border-slate-700 rounded-lg p-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">⭐</span>
              <h2 className="text-xl font-bold text-white">High Signal</h2>
              <span className="ml-auto text-xs bg-blue-900 text-blue-200 px-3 py-1 rounded-full font-medium">
                {filteredHighSignals.length} results
              </span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-slate-700/30 rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-slate-600 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredHighSignals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 text-sm">
                  {searchQuery ? 'No results found' : 'No high signal accounts yet'}
                </p>
                <p className="text-slate-500 text-xs mt-2">
                  {searchQuery ? 'Try a different search' : 'Run the scraper to detect new signals'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHighSignals.map((signal, idx) => (
                  <div
                    key={signal.username}
                    className="bg-gradient-to-r from-slate-700/50 to-slate-700/30 border border-slate-600 rounded-lg p-4 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-slate-500 bg-slate-700 px-2 py-1 rounded">
                            #{idx + 1}
                          </span>
                          {signal.score >= 2 && (
                            <span className="text-xs font-bold bg-blue-900/60 text-blue-200 px-2 py-1 rounded">
                              HIGH SIGNAL
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-white text-lg">@{signal.username}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Followed by {signal.followed_by.length} big account{signal.followed_by.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="bg-blue-900/50 text-blue-200 text-sm font-bold px-3 py-1 rounded-lg">
                          {signal.score}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {signal.followed_by.slice(0, 3).map((account) => (
                        <span
                          key={account}
                          className="text-xs bg-slate-600/50 text-slate-200 px-2 py-1 rounded"
                        >
                          @{account}
                        </span>
                      ))}
                      {signal.followed_by.length > 3 && (
                        <span className="text-xs bg-slate-600/50 text-slate-400 px-2 py-1 rounded">
                          +{signal.followed_by.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Follows Section */}
          <section className="bg-slate-800 border border-slate-700 rounded-lg p-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">📊</span>
              <h2 className="text-xl font-bold text-white">Recent Follows</h2>
              <span className="ml-auto text-xs bg-purple-900 text-purple-200 px-3 py-1 rounded-full font-medium">
                {filteredRecentSignals.length} results
              </span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-slate-700/30 rounded-lg p-3 animate-pulse">
                    <div className="h-4 bg-slate-600 rounded w-2/5 mb-2"></div>
                    <div className="h-3 bg-slate-600 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredRecentSignals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 text-sm">
                  {searchQuery ? 'No results found' : 'No recent signals yet'}
                </p>
                <p className="text-slate-500 text-xs mt-2">
                  {searchQuery ? 'Try a different search' : 'New accounts will appear here as they\'re detected'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRecentSignals.map((signal, idx) => (
                  <div
                    key={`${signal.username}-${idx}`}
                    className="bg-gradient-to-r from-slate-700/50 to-slate-700/30 border border-slate-600 rounded-lg p-4 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 bg-slate-700 px-2 py-1 rounded">
                          #{idx + 1}
                        </span>
                        <p className="font-medium text-white">@{signal.username}</p>
                      </div>
                      <span className="bg-purple-900/50 text-purple-200 text-xs font-bold px-2 py-1 rounded">
                        {signal.score}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Followed by:</span>
                      <div className="flex flex-wrap gap-1">
                        {signal.followed_by.slice(0, 2).map((account) => (
                          <span
                            key={account}
                            className="bg-slate-600/50 text-slate-200 px-2 py-1 rounded"
                          >
                            @{account}
                          </span>
                        ))}
                        {signal.followed_by.length > 2 && (
                          <span className="bg-slate-600/50 text-slate-400 px-2 py-1 rounded">
                            +{signal.followed_by.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-slate-800/50 border border-slate-700 rounded-lg text-center">
          <p className="text-slate-300 text-sm">
            🔄 Data refreshes automatically every <span className="font-bold text-blue-400">30 seconds</span>
          </p>
          <p className="text-slate-500 text-xs mt-3">
            Last update: <span className="font-mono text-slate-400">{lastUpdate.toLocaleTimeString()}</span>
          </p>
        </div>
      </main>
    </div>
  );
}
