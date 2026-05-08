import { useState, useEffect } from 'react';
import { useQuery } from 'wasp/client/operations';
import { formatDate } from '../lib/formatters';

interface Source {
  id: string;
  key: string;
  cityCoverage: string;
  pollIntervalS: number;
  status: string;
  lastSuccessAt: string | null;
  isPollerRunning: boolean;
}

export default function SourcesDashboardPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/sources', {
        headers: {
          'X-User-Role': 'operator', // TODO: Get from auth context
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sources');
      }

      const data = await response.json();
      setSources(data.sources);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = async (sourceId: string) => {
    try {
      const response = await fetch(`/api/v1/sources/${sourceId}/restart`, {
        method: 'POST',
        headers: {
          'X-User-Role': 'operator',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to restart source');
      }

      // Refresh sources
      await fetchSources();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleStart = async (sourceId: string) => {
    try {
      const response = await fetch(`/api/v1/sources/${sourceId}/start`, {
        method: 'POST',
        headers: {
          'X-User-Role': 'operator',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to start source');
      }

      await fetchSources();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleStop = async (sourceId: string) => {
    try {
      const response = await fetch(`/api/v1/sources/${sourceId}/stop`, {
        method: 'POST',
        headers: {
          'X-User-Role': 'operator',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to stop source');
      }

      await fetchSources();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'down':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✓';
      case 'degraded':
        return '⚠';
      case 'down':
        return '✕';
      default:
        return '?';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bone)] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">Loading sources...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bone)] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bone)] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--ink)]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Source Health Dashboard
          </h1>
          <p className="text-[var(--graphite)] mt-2">
            Monitor and manage data source pollers. Only accessible to operators.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-[var(--contour)] p-6">
            <div className="text-4xl font-bold text-[var(--ink)]">
              {sources.length}
            </div>
            <div className="text-sm text-[var(--graphite)]">Total Sources</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-[var(--contour)] p-6">
            <div className="text-4xl font-bold text-green-600">
              {sources.filter(s => s.status === 'healthy').length}
            </div>
            <div className="text-sm text-[var(--graphite)]">Healthy</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-[var(--contour)] p-6">
            <div className="text-4xl font-bold text-yellow-600">
              {sources.filter(s => s.status === 'degraded' || s.status === 'down').length}
            </div>
            <div className="text-sm text-[var(--graphite)]">Degraded / Down</div>
          </div>
        </div>

        {/* Sources table */}
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--contour)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--contour)]">
            <h2 className="text-lg font-semibold text-[var(--ink)]">Data Sources</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--graphite)] uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--graphite)] uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--graphite)] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--graphite)] uppercase tracking-wider">
                    Poll Interval
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--graphite)] uppercase tracking-wider">
                    Last Success
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--graphite)] uppercase tracking-wider">
                    Poller
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[var(--graphite)] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--contour)]">
                {sources.map((source) => (
                  <tr key={source.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[var(--ink)]">
                        {source.key}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--graphite)]">
                        {source.cityCoverage}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(source.status)}`}>
                        {getStatusIcon(source.status)} {source.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--graphite)]">
                        {source.pollIntervalS}s
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--graphite)]">
                        {source.lastSuccessAt ? formatDate(source.lastSuccessAt) : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        source.isPollerRunning
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {source.isPollerRunning ? 'Running' : 'Stopped'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {source.isPollerRunning ? (
                          <>
                            <button
                              onClick={() => handleRestart(source.id)}
                              className="text-[var(--clay)] hover:text-[var(--clay-deep)]"
                            >
                              Restart
                            </button>
                            <button
                              onClick={() => handleStop(source.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Stop
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleStart(source.id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            Start
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Refresh button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={fetchSources}
            className="px-4 py-2 bg-[var(--clay)] text-white rounded-lg hover:bg-[var(--clay-deep)] transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
