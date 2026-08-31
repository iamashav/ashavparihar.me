import { useState } from 'react';
import { CaseStudies } from './components/CaseStudies/CaseStudies';
import { Header } from './components/Header/Header';
import { HeroSection } from './components/HeroSection/HeroSection';
import { Preloader } from './components/Preloader/Preloader';
import { ProjectDirectory } from './components/ProjectDirectory/ProjectDirectory';
import { RetroCursor } from './components/RetroCursor/RetroCursor';
import { ScreenOverlay } from './components/ScreenOverlay/ScreenOverlay';
import { SystemCapabilities } from './components/SystemCapabilities/SystemCapabilities';
import { SystemTerminalFooter } from './components/SystemTerminalFooter/SystemTerminalFooter';
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
        <ProjectDirectory />
        <SystemCapabilities />
      </main>
      <SystemTerminalFooter />
    </SmoothScrollProvider>
  );
}

export default App;
