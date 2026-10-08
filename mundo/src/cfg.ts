// Linha do tempo do voo. Uma câmera, um ritmo, cinco pernas.
// Segundos de filme por perna; o site usa 0,22 vh de scroll por segundo.
export const FPS = 30;
export const PERNAS = [
  { nome: "chegada", seg: 10 },
  { nome: "resultados", seg: 14 },
  { nome: "o-que-muda", seg: 10 },
  { nome: "como-funciona", seg: 10 },
  { nome: "chamada", seg: 10 },
];
export const INICIO = PERNAS.map((_, i) => PERNAS.slice(0, i).reduce((a, p) => a + p.seg, 0));
export const TOTAL_SEG = PERNAS.reduce((a, p) => a + p.seg, 0); // 54
export const TOTAL_FRAMES = TOTAL_SEG * FPS;

// Velocidade da câmera em unidades de mundo por segundo.
export const V = 300;
// Posição da câmera: linear até 50 s, depois freia e para em 54 s.
export const camZ = (t: number) => {
  if (t <= 50) return V * t;
  const u = t - 50;
  return V * (50 + u - (u * u) / 8);
};
export const Z_FIM = camZ(TOTAL_SEG); // 15600

export const PERSPECTIVA = 1100;
export const FAR = 5600;
