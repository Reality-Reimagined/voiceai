import React from 'react';
import { Mic } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Logo() {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <Mic className="h-8 w-8 text-blue-600" />
      <span className="text-xl font-bold text-gray-900">VoiceAI</span>
    </Link>
  );
}