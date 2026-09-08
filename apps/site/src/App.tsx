import { useCallback, useState } from 'react';
import { ContactLayer } from './components/ContactLayer/ContactLayer';
import { HeroLayer } from './components/HeroLayer/HeroLayer';
import { Intro } from './components/Intro/Intro';
import { ProjectReel } from './components/ProjectReel/ProjectReel';
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
      <main>
        <HeroLayer ready={ready} />
        <WorkLayer />
        <ProjectReel />
        <ContactLayer />
      </main>
    </ScrollStage>
  );
}

export default App;
