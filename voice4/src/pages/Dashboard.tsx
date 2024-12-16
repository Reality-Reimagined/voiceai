import React from 'react';
import { TTSForm } from '../components/tts/TTSForm';
import { useAuth } from '../components/auth/AuthProvider';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Text to Speech</h2>
        <TTSForm />
      </div>

      {user?.subscription_tier === 'free' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900">Upgrade to Premium</h3>
          <p className="mt-2 text-blue-700">
            Get access to advanced features including voice cloning and unlimited generations.
          </p>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Upgrade Now
          </button>
        </div>
      )}
    </div>
  );
}