import { useState } from 'react';
import { CaseStudies } from './components/CaseStudies/CaseStudies';
import { Contact } from './components/Contact/Contact';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { HeroSection } from './components/HeroSection/HeroSection';
import { Preloader } from './components/Preloader/Preloader';
import { Projects } from './components/Projects/Projects';
import { RetroCursor } from './components/RetroCursor/RetroCursor';
import { ScreenOverlay } from './components/ScreenOverlay/ScreenOverlay';
import { SystemCapabilities } from './components/SystemCapabilities/SystemCapabilities';
import { SmoothScrollProvider } from './providers/SmoothScrollProvider';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';

function App() {
  const reducedMotion = usePrefersReducedMotion();
  const [booted, setBooted] = useState(false);

  return (
    <SmoothScrollProvider>
      {!reducedMotion && !booted && <Preloader onComplete={() => setBooted(true)} />}
      <ScreenOverlay />
      <RetroCursor />
      <Header />
      <main>
        <HeroSection />
        <CaseStudies />
        <Projects />
        <SystemCapabilities />
        <Contact />
      </main>
      <Footer />
    </SmoothScrollProvider>
  );
}

export default App;
