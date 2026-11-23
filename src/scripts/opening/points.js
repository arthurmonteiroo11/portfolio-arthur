const LIMIAR_ALPHA = 127;

export const textToPoints = (alpha, width, height, step) => {
  const pontos = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (alpha[y * width + x] > LIMIAR_ALPHA) {
        pontos.push((x + 0.5) / width, (y + 0.5) / height);
      }
    }
  }
  return Float32Array.from(pontos);
};
