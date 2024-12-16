import React from 'react';
import { VoiceCloneForm } from '../components/voice-clone/VoiceCloneForm';
import { useAuth } from '../components/auth/AuthProvider';
import { Navigate } from 'react-router-dom';

export default function VoiceCloning() {
  const { user } = useAuth();

  if (user?.subscription_tier !== 'premium') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Voice Cloning</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Clone a New Voice</h2>
        <VoiceCloneForm />
      </div>
    </div>
  );
}