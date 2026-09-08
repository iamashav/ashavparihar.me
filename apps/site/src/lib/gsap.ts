import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

/* Lenis drives the ticker, so GSAP's own lag smoothing would fight it for frames. */
gsap.ticker.lagSmoothing(0);

export { gsap, ScrollTrigger, SplitText };
