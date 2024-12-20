import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Hero } from './components/sections/Hero';
import { Pricing } from './components/sections/Pricing';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { TextToSpeechPage } from './pages/TextToSpeechPage';
import { VoiceClonePage } from './pages/VoiceClonePage';
import { PodcastPage } from './pages/PodcastPage';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <Pricing />
              </>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/text-to-speech" element={<TextToSpeechPage />} />
            <Route path="/voice-cloning" element={<VoiceClonePage />} />
            <Route path="/podcast" element={<PodcastPage />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}
export default App;