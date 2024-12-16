import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, Waves, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          Next-Generation Text-to-Speech
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Create natural-sounding speech with our advanced AI technology. Clone voices, generate speech, and bring your content to life.
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <Link to="/register">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </div>

      <div className="mt-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            icon={<Mic className="h-6 w-6 text-white" />}
            title="Text-to-Speech"
            description="Convert any text into natural-sounding speech with multiple voices and languages."
          />
          <Feature
            icon={<Waves className="h-6 w-6 text-white" />}
            title="Voice Cloning"
            description="Clone voices with just a few minutes of audio data using our advanced AI technology."
          />
          <Feature
            icon={<CreditCard className="h-6 w-6 text-white" />}
            title="Flexible Pricing"
            description="Choose from our range of pricing plans to suit your needs, from individual to enterprise."
          />
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="pt-6">
      <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
        <div className="-mt-6">
          <div className="inline-flex items-center justify-center rounded-md bg-blue-500 p-3 shadow-lg">
            {icon}
          </div>
          <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">
            {title}
          </h3>
          <p className="mt-5 text-base text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
}