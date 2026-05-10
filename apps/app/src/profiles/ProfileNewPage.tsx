import { useState } from "react";
import { Link, routes } from "wasp/client/router";
import { createProfile } from "wasp/client/operations";

const CITIES = [
  "Lisbon", "Madrid", "Berlin", "Barcelona", "Valencia",
  "Porto", "Munich", "Hamburg", "Amsterdam", "London",
  "Paris", "Rome", "Milan", "Vienna", "Zurich",
  "Austin", "New York", "San Francisco", "Los Angeles", "Chicago",
];

const SIDES = [
  { value: "rent", label: "Rent" },
  { value: "sale", label: "Sale" },
  { value: "both", label: "Both" },
];

export default function ProfileNewPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

  const [form, setForm] = useState({
    name: "",
    city: "Lisbon",
    side: "rent",
    minPriceCents: 0,
    maxPriceCents: 0,
    minBedrooms: 1,
    radiusKm: 5.0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await createProfile(form);
      setCreated(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (created) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] p-8">
        <div className="max-w-2xl mx-auto text-center py-16">
          <h1 className="text-3xl font-bold text-[#171417] mb-4">Profile Created!</h1>
          <p className="text-[#222222] mb-8">Your match profile is now active. We'll start sending alerts soon.</p>
          <Link to={routes.ProfilesRoute.to} className="bg-[#2545FF] text-white px-6 py-3 rounded-full hover:bg-[#1A2EBC] transition-colors">
            View Profiles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#171417] mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
          New Match Profile
        </h1>
        <p className="text-[#222222] mb-8">Define what listings you're looking for. We'll alert you when matching listings appear.</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-[#CCCCCC] p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#171417] mb-2">Profile Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., LIS-relocate-1"
              className="w-full px-4 py-3 border border-[#CCCCCC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2545FF]"
              required />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#171417] mb-2">City</label>
            <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full px-4 py-3 border border-[#CCCCCC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2545FF]">
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#171417] mb-2">Type</label>
            <div className="flex gap-3">
              {SIDES.map((s) => (
                <button key={s.value} type="button" onClick={() => setForm({ ...form, side: s.value })}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                    form.side === s.value ? "border-[#2545FF] bg-[#2545FF]/5 text-[#2545FF]" : "border-[#CCCCCC] hover:border-[#2545FF]/50"
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#171417] mb-2">Min Price (cents)</label>
              <input type="number" value={form.minPriceCents} onChange={(e) => setForm({ ...form, minPriceCents: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-[#CCCCCC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2545FF]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#171417] mb-2">Max Price (cents)</label>
              <input type="number" value={form.maxPriceCents} onChange={(e) => setForm({ ...form, maxPriceCents: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-[#CCCCCC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2545FF]" />
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#171417] mb-2">Min Bedrooms</label>
              <input type="number" value={form.minBedrooms} onChange={(e) => setForm({ ...form, minBedrooms: parseInt(e.target.value) || 1 })}
                min="0" max="10"
                className="w-full px-4 py-3 border border-[#CCCCCC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2545FF]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#171417] mb-2">Radius (km)</label>
              <input type="number" value={form.radiusKm} onChange={(e) => setForm({ ...form, radiusKm: parseFloat(e.target.value) || 5 })}
                min="0.5" max="100" step="0.5"
                className="w-full px-4 py-3 border border-[#CCCCCC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2545FF]" />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Link to={routes.ProfilesRoute.to}
              className="flex-1 py-3 px-6 border border-[#CCCCCC] rounded-full text-[#171417] hover:bg-gray-50 transition-colors text-center">
              Cancel
            </Link>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 py-3 px-6 bg-[#2545FF] text-white rounded-full hover:bg-[#1A2EBC] transition-colors disabled:opacity-50">
              {isSubmitting ? "Creating..." : "Create Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
