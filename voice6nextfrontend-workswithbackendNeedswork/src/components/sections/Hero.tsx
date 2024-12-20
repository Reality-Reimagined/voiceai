import { Button } from "@/components/ui/button";
import { Mic2Icon, Sparkles, Wand2Icon } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <div className="relative isolate pt-14">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>
      
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Transform Your Voice with AI
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Create natural-sounding voices, clone your own voice, and generate engaging podcasts with our cutting-edge AI technology.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/text-to-speech">Try Demo</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-lg bg-primary/10 p-3">
              <Wand2Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Text to Speech</h3>
            <p className="mt-2 text-muted-foreground">
              Convert any text into natural-sounding speech with our AI voices
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="rounded-lg bg-primary/10 p-3">
              <Mic2Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Voice Cloning</h3>
            <p className="mt-2 text-muted-foreground">
              Create your digital voice twin with just 15 seconds of audio
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="rounded-lg bg-primary/10 p-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Podcast Creator</h3>
            <p className="mt-2 text-muted-foreground">
              Generate engaging podcast content with AI-powered scripts and voices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}