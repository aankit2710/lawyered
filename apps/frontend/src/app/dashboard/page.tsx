'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function DashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else {
      setIsChecking(false);
    }
  }, [user, router]);

  if (isChecking) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Lawyered - Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Welcome, {user?.firstName || user?.email}!
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Info Card */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">ID:</span> {user?.id}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Email:</span> {user?.email}
                </p>
                {user?.firstName && (
                  <p className="text-gray-600">
                    <span className="font-medium">First Name:</span> {user.firstName}
                  </p>
                )}
                {user?.lastName && (
                  <p className="text-gray-600">
                    <span className="font-medium">Last Name:</span> {user.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition">
                  Create New Will
                </button>
                <button className="w-full bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition">
                  View My Wills
                </button>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Phase 1 Authentication is now complete!</li>
              <li>Proceed to Phase 2: Database Design for wills, beneficiaries, and assets</li>
              <li>Phase 3: AI Extraction Engine for natural language processing</li>
              <li>Phase 4: Conversation Memory & Snapshots for multi-turn interactions</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
