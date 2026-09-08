import { useCallback, useState } from 'react';
import { HeroLayer } from './components/HeroLayer/HeroLayer';
import { Intro } from './components/Intro/Intro';
import { SiteHeader } from './components/SiteHeader/SiteHeader';
import { WorkLayer } from './components/WorkLayer/WorkLayer';
import { ScrollStage } from './providers/ScrollStage';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';

function App() {
  const reducedMotion = usePrefersReducedMotion();
  const [booted, setBooted] = useState(false);
  const ready = booted || reducedMotion;
  const handleIntroDone = useCallback(() => setBooted(true), []);

  return (
    <ScrollStage locked={!ready}>
      {!reducedMotion && !booted && <Intro onDone={handleIntroDone} />}
      <SiteHeader />
      <main>
        <HeroLayer ready={ready} />
        <WorkLayer />
      </main>
    </ScrollStage>
  );
}

export default App;
