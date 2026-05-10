import { Link, routes } from "wasp/client/router";
import { useAuth } from "wasp/client/auth";
import { logout } from "wasp/client/auth";

export default function AccountPage() {
  const { data: user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] p-8">
        <div className="max-w-2xl mx-auto text-center py-16">
          <p className="text-[#222222]">Please sign in to view your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#171417] mb-8" style={{ fontFamily: "DM Sans, sans-serif" }}>
          Account
        </h1>

        <div className="bg-white rounded-2xl shadow-sm border border-[#CCCCCC] p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#171417] mb-4">Profile</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#222222]">Email</span>
              <span className="text-[#171417]">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#222222]">Subscription</span>
              <span className="text-[#171417]">{user.subscriptionStatus || "None"}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link to={routes.ProfilesRoute.to}
            className="flex-1 text-center py-3 px-6 border border-[#CCCCCC] rounded-full text-[#171417] hover:bg-gray-50 transition-colors">
            My Profiles
          </Link>
          <button onClick={() => logout()}
            className="flex-1 py-3 px-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
