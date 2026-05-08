import { useState } from 'react';
import { useParams, Link } from 'wasp/client/router';
import { useQuery } from 'wasp/client/operations';
import { getProfile, pauseProfile, resumeProfile } from 'wasp/client/operations';
import { formatDate, formatPrice, formatScore } from '../lib/formatters';

export default function ProfileDetailPage() {
  const { id } = useParams();
  const { data: profile, isLoading, error, refetch } = useQuery(getProfile, { id });
  const [isUpdating, setIsUpdating] = useState(false);

  if (isLoading) return <div className="p-8">Loading profile...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;
  if (!profile) return <div className="p-8">Profile not found</div>;

  const handlePauseResume = async () => {
    setIsUpdating(true);
    try {
      if (profile.status === 'active') {
        await pauseProfile({ id: profile.id });
      } else {
        await resumeProfile({ id: profile.id });
      }
      refetch();
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bone)] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link to="/profiles" className="text-[var(--clay)] hover:underline">
                ← Back to Profiles
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-[var(--ink)]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {profile.name}
            </h1>
            <div className="flex gap-4 mt-3 text-sm text-[var(--graphite)]">
              <span>📍 {profile.city}</span>
              <span>{profile.side === 'rent' ? '🔑' : '🏷️'} {profile.side}</span>
              <span>🛏️ {profile.minBedrooms}+ beds</span>
              <span>📏 {profile.radiusKm}km radius</span>
            </div>
            {profile.maxPriceCents > 0 && (
              <p className="text-sm text-[var(--graphite)] mt-1">
                Budget: {formatPrice(profile.minPriceCents)} – {formatPrice(profile.maxPriceCents)}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                profile.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : profile.status === 'paused'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {profile.status}
            </span>
            <button
              onClick={handlePauseResume}
              disabled={isUpdating}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                profile.status === 'active'
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              } disabled:opacity-50`}
            >
              {isUpdating ? 'Updating...' : profile.status === 'active' ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>

        {/* Matches */}
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--contour)] p-6">
          <h2 className="text-xl font-semibold text-[var(--ink)] mb-4">
            Recent Matches ({profile.matches?.length || 0})
          </h2>

          {!profile.matches || profile.matches.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-[var(--graphite)]">
                No matches yet. We'll alert you when listings matching your criteria appear.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {profile.matches.map((match) => (
                <div
                  key={match.id}
                  className="border border-[var(--contour)] rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-[var(--ink)]">
                        {match.listing.addressNorm}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm text-[var(--graphite)]">
                        <span>💰 {formatPrice(match.listing.priceCents)}</span>
                        {match.listing.sqm && <span>📐 {match.listing.sqm} m²</span>}
                        {match.listing.bedrooms && <span>🛏️ {match.listing.bedrooms} beds</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[var(--clay)]">
                        {formatScore(match.score)}
                      </div>
                      <p className="text-xs text-[var(--graphite)]">
                        {formatDate(match.matchedAt)}
                      </p>
                    </div>
                  </div>
                  {match.signals && Object.keys(match.signals).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[var(--contour)]">
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(match.signals as Record<string, number>).map(([key, value]) => (
                          <span
                            key={key}
                            className="px-2 py-1 bg-[var(--haze)] rounded text-xs text-[var(--graphite)]"
                          >
                            {key}: {typeof value === 'number' ? value.toFixed(2) : String(value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
