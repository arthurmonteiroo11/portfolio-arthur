import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setHud } from './hud.js';
import { prefersReducedMotion } from './scroll.js';
import { mountToy } from './toys/index.js';

gsap.registerPlugin(ScrollTrigger);

const COR_PADRAO = '#ffb347';

const corDaCena = (cena) => cena.style.getPropertyValue('--cor').trim() || COR_PADRAO;

const criarLinhaDoTempo = (cena) => {
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
  return linha;
};

const ligarBrinquedo = (cena) => {
  const palco = cena.querySelector('[data-palco]');
  const alvo = cena.querySelector('[data-brinquedo]');
  if (!palco || !alvo) return;
  let desmontar = null;

  const observador = new IntersectionObserver((entradas) => {
    const visivel = entradas.some((entrada) => entrada.isIntersecting);
    if (visivel && !desmontar) {
      desmontar = mountToy(palco.dataset.toy, alvo);
    } else if (!visivel && desmontar) {
      desmontar();
      desmontar = null;
    }
  });
  observador.observe(cena);
};

export const initScenes = (cenas) => {
  const total = cenas.length;
  const cores = cenas.map(corDaCena);
  const animar = !prefersReducedMotion();

  const marcar = (fase) => {
    setHud(fase, total);
    document.documentElement.style.setProperty('--destaque', fase === 0 ? COR_PADRAO : cores[fase - 1]);
  };

  cenas.forEach((cena, indice) => {
    ScrollTrigger.create({
      trigger: cena,
      start: animar ? 'top top' : 'top center',
      end: animar ? '+=85%' : 'bottom center',
      pin: animar,
      anticipatePin: 1,
      scrub: animar ? 0.6 : false,
      animation: animar ? criarLinhaDoTempo(cena) : undefined,
      onEnter: () => marcar(indice + 1),
      onEnterBack: () => marcar(indice + 1),
      onLeaveBack: () => marcar(indice),
    });
    ligarBrinquedo(cena);
  });
};
