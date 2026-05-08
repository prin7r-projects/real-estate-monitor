import { useState } from 'react';
import { useNavigate } from 'wasp/client/router';
import { createProfile } from 'wasp/client/operations';

const CITIES = [
  'Lisbon', 'Madrid', 'Berlin', 'Barcelona', 'Valencia',
  'Porto', 'Munich', 'Hamburg', 'Amsterdam', 'London',
  'Paris', 'Rome', 'Milan', 'Vienna', 'Zurich',
  'Austin', 'New York', 'San Francisco', 'Los Angeles', 'Chicago',
];

const SIDES = [
  { value: 'rent', label: 'Rent', icon: '🔑' },
  { value: 'sale', label: 'Sale', icon: '🏷️' },
  { value: 'both', label: 'Both', icon: '🏠' },
];

export default function ProfileNewPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    city: 'Lisbon',
    side: 'rent',
    minPriceCents: 0,
    maxPriceCents: 0,
    minBedrooms: 1,
    radiusKm: 5.0,
    extras: {} as Record<string, unknown>,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await createProfile(form);
      navigate('/profiles');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateForm = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[var(--bone)] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--ink)]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            New Match Profile
          </h1>
          <p className="text-[var(--graphite)] mt-2">
            Define what listings you're looking for. We'll alert you when matching listings appear.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-[var(--contour)] p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Profile Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--ink)] mb-2">
              Profile Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              placeholder="e.g., LIS-relocate-1"
              className="w-full px-4 py-3 border border-[var(--contour)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--clay)] focus:border-transparent"
              required
            />
          </div>

          {/* City */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--ink)] mb-2">
              City
            </label>
            <select
              value={form.city}
              onChange={(e) => updateForm('city', e.target.value)}
              className="w-full px-4 py-3 border border-[var(--contour)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--clay)] focus:border-transparent"
            >
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Side (Rent/Sale/Both) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--ink)] mb-2">
              Type
            </label>
            <div className="flex gap-3">
              {SIDES.map((side) => (
                <button
                  key={side.value}
                  type="button"
                  onClick={() => updateForm('side', side.value)}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                    form.side === side.value
                      ? 'border-[var(--clay)] bg-[var(--clay)]/5 text-[var(--clay)]'
                      : 'border-[var(--contour)] hover:border-[var(--clay)]/50'
                  }`}
                >
                  <span className="mr-2">{side.icon}</span>
                  {side.label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--ink)] mb-2">
              Budget Range (cents)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  value={form.minPriceCents}
                  onChange={(e) => updateForm('minPriceCents', parseInt(e.target.value) || 0)}
                  placeholder="Min (cents)"
                  className="w-full px-4 py-3 border border-[var(--contour)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--clay)] focus:border-transparent"
                />
                <p className="text-xs text-[var(--graphite)] mt-1">Min price in cents (e.g., 130000 = €1,300)</p>
              </div>
              <div>
                <input
                  type="number"
                  value={form.maxPriceCents}
                  onChange={(e) => updateForm('maxPriceCents', parseInt(e.target.value) || 0)}
                  placeholder="Max (cents)"
                  className="w-full px-4 py-3 border border-[var(--contour)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--clay)] focus:border-transparent"
                />
                <p className="text-xs text-[var(--graphite)] mt-1">Max price in cents (0 = no limit)</p>
              </div>
            </div>
          </div>

          {/* Bedrooms */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--ink)] mb-2">
              Minimum Bedrooms
            </label>
            <input
              type="number"
              value={form.minBedrooms}
              onChange={(e) => updateForm('minBedrooms', parseInt(e.target.value) || 1)}
              min="0"
              max="10"
              className="w-full px-4 py-3 border border-[var(--contour)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--clay)] focus:border-transparent"
            />
          </div>

          {/* Radius */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--ink)] mb-2">
              Search Radius (km)
            </label>
            <input
              type="number"
              value={form.radiusKm}
              onChange={(e) => updateForm('radiusKm', parseFloat(e.target.value) || 5)}
              min="0.5"
              max="100"
              step="0.5"
              className="w-full px-4 py-3 border border-[var(--contour)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--clay)] focus:border-transparent"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/profiles')}
              className="flex-1 py-3 px-6 border border-[var(--contour)] rounded-full text-[var(--ink)] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-6 bg-[var(--clay)] text-white rounded-full hover:bg-[var(--clay-deep)] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
