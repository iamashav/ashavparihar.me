import { CaseStudies } from './components/CaseStudies/CaseStudies';
import { Contact } from './components/Contact/Contact';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { Hero } from './components/Hero/Hero';
import { Projects } from './components/Projects/Projects';
import { RetroCursor } from './components/RetroCursor/RetroCursor';
import { ScreenOverlay } from './components/ScreenOverlay/ScreenOverlay';
import { TechStrip } from './components/TechStrip/TechStrip';
import { SmoothScrollProvider } from './providers/SmoothScrollProvider';

function App() {
  return (
    <SmoothScrollProvider>
      <ScreenOverlay />
      <RetroCursor />
      <Header />
      <main>
        <Hero />
        <CaseStudies />
        <Projects />
        <TechStrip />
        <Contact />
      </main>
      <Footer />
    </SmoothScrollProvider>
  );
}

export default App;
