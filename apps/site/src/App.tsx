import { useCallback, useState } from 'react';
import { ContactLayer } from './components/ContactLayer/ContactLayer';
import { HeroLayer } from './components/HeroLayer/HeroLayer';
import { ProjectReel } from './components/ProjectReel/ProjectReel';
import { WorkLayer } from './components/WorkLayer/WorkLayer';
import { ScrollStage } from './providers/ScrollStage';

function App() {
  /* The hero is the loader: scroll stays locked until it has finished assembling itself, so there
     is no separate panel to slide away and nothing to cut between. */
  const [built, setBuilt] = useState(false);
  const handleBuilt = useCallback(() => setBuilt(true), []);

  return (
    <ScrollStage locked={!built}>
      <main>
        <HeroLayer onBuilt={handleBuilt} />
        <WorkLayer />
        <ProjectReel />
        <ContactLayer />
      </main>
    </ScrollStage>
  );
}

export default App;
