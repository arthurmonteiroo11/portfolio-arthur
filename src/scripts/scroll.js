import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis = null;

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const scrollParaTopo = () => {
  if (lenis) {
    lenis.scrollTo(0, { duration: 1.6 });
    return;
  }
  window.scrollTo({ top: 0 });
};

export const initScroll = () => {
  const refresh = () => ScrollTrigger.refresh();
  document.fonts.ready.then(refresh);

  if (prefersReducedMotion()) return { refresh };

  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((tempo) => lenis.raf(tempo * 1000));
  gsap.ticker.lagSmoothing(0);

  return { refresh };
};
