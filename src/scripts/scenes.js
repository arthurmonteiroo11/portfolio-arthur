import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setHud } from './hud.js';

gsap.registerPlugin(ScrollTrigger);

const COR_PADRAO = '#ffb347';

const aplicarDestaque = (cor) => {
  document.documentElement.style.setProperty('--destaque', cor);
};

const ligarHud = (cena, indice, total) => {
  const cor = cena.style.getPropertyValue('--cor').trim() || COR_PADRAO;
  ScrollTrigger.create({
    trigger: cena,
    start: 'top 60%',
    end: 'bottom 40%',
    onToggle: (gatilho) => {
      if (gatilho.isActive) {
        setHud(indice + 1, total);
        aplicarDestaque(cor);
      }
    },
    onLeaveBack: () => {
      if (indice === 0) {
        setHud(0, total);
        aplicarDestaque(COR_PADRAO);
      }
    },
  });
};

const animarEntrada = (cena) => {
  const palco = cena.querySelector('[data-palco]');
  const palavras = cena.querySelectorAll('[data-palavra]');
  const entradas = cena.querySelectorAll('[data-entrada]');

  gsap.set(palco, { clipPath: 'inset(100% 0% 0% 0%)' });
  gsap.set(palavras, { yPercent: 110 });
  gsap.set(entradas, { y: 24, opacity: 0 });

  const linha = gsap.timeline({ defaults: { ease: 'power3.out' } });
  linha
    .to(palco, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 })
    .to(palavras, { yPercent: 0, duration: 0.8, stagger: 0.09 }, 0.15)
    .to(entradas, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 }, 0.5);

  ScrollTrigger.create({
    trigger: cena,
    start: 'top top',
    end: '+=85%',
    pin: true,
    scrub: 0.6,
    anticipatePin: 1,
    animation: linha,
  });
};

export const initScenes = (cenas) => {
  const total = cenas.length;
  cenas.forEach((cena, indice) => ligarHud(cena, indice, total));

  const movimento = gsap.matchMedia();
  movimento.add('(prefers-reduced-motion: no-preference)', () => {
    cenas.forEach(animarEntrada);
  });
};
