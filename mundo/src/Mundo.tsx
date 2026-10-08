import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { camZ, INICIO, Z_FIM } from "./cfg";

// Paleta do Brand Book (modo claro)
const C = {
  nevoa: "#EDF2F8",
  branco: "#FFFFFF",
  marinho: "#0E2A45",
  oceano: "#007CA5",
  teal: "#1F949B",
  bruma: "#A9BCCF",
  ardosia: "#5B748E",
};

const PERSPECTIVA = 1500;
const FAR = 4600;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => {
  const u = clamp01(v);
  return u * u * (3 - 2 * u);
};
// Opacidade pela distância: longe some na névoa; perto demais some para não "estourar" a câmera.
const nevoa = (depth: number) => {
  const longe = clamp01(1 - depth / FAR);
  const perto = clamp01((depth - 140) / 260);
  return Math.pow(longe, 1.6) * perto;
};

type Obj3D = { x: number; y: number; z: number };

// Um objeto em pé, de frente para a câmera.
const Camada: React.FC<{ o: Obj3D; cam: number; opacidade?: number; children: React.ReactNode }> = ({
  o,
  cam,
  opacidade = 1,
  children,
}) => {
  const depth = o.z - cam;
  if (depth < 120 || depth > FAR) return null;
  const op = nevoa(depth) * opacidade;
  if (op <= 0.004) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%) translate3d(${o.x}px, ${o.y}px, ${-depth}px)`,
        opacity: op,
      }}
    >
      {children}
    </div>
  );
};

// Um retângulo deitado no chão: a borda de perto fica em z0, e ele se estende para longe.
const Plano: React.FC<{
  x: number;
  y: number;
  z0: number;
  cam: number;
  w: number;
  len: number;
  opacidade?: number;
  style?: React.CSSProperties;
}> = ({ x, y, z0, cam, w, len, opacidade = 1, style }) => {
  const depth = z0 - cam;
  if (depth > FAR || depth + len < 100) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: w,
        height: len,
        transformOrigin: "50% 0",
        transform: `translate(-50%, ${y}px) translate3d(${x}px, 0, ${-depth}px) rotateX(-90deg)`,
        opacity: opacidade,
        ...style,
      }}
    />
  );
};

// Um cartão de mensagem: forma abstrata, sem texto. O texto real vive no HTML do site.
const Cartao: React.FC<{ w: number; h: number; tom: "oceano" | "teal" | "bruma"; lado?: "esq" | "dir" }> = ({
  w,
  h,
  tom,
  lado = "esq",
}) => {
  const cor = tom === "oceano" ? C.oceano : tom === "teal" ? C.teal : C.ardosia;
  const fundo = tom === "bruma" ? "rgba(169,188,207,0.30)" : "rgba(255,255,255,0.86)";
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: h * 0.32,
        background: fundo,
        border: `2px solid ${tom === "bruma" ? "rgba(91,116,142,0.35)" : cor}`,
        boxShadow: tom === "bruma" ? "none" : "0 26px 60px -24px rgba(14,42,69,0.40)",
        display: "flex",
        alignItems: "center",
        gap: h * 0.2,
        padding: `0 ${h * 0.28}px`,
        flexDirection: lado === "esq" ? "row" : "row-reverse",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: h * 0.42, height: h * 0.42, borderRadius: 999, background: cor, opacity: tom === "bruma" ? 0.35 : 0.9, flex: "none" }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: h * 0.1 }}>
        <div style={{ height: h * 0.11, borderRadius: 99, background: cor, opacity: 0.55, width: "72%" }} />
        <div style={{ height: h * 0.11, borderRadius: 99, background: cor, opacity: 0.3, width: "46%" }} />
      </div>
    </div>
  );
};

// Chão: um plano com linhas transversais que ficam paradas no mundo enquanto a câmera avança.
const Chao: React.FC<{ cam: number; mobile: boolean; clareia: number }> = ({ cam, mobile, clareia }) => {
  const passo = 460;
  const y = mobile ? 760 : 540;
  return (
    <Plano
      x={0}
      y={y}
      z0={cam - 400}
      cam={cam}
      w={mobile ? 4000 : 7000}
      len={FAR + 600}
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(237,242,248,0) 0%, rgba(237,242,248,0.25) 30%, rgba(237,242,248,1) 72%), repeating-linear-gradient(to bottom, rgba(169,188,207,${0.7 - clareia * 0.5}) 0 3px, transparent 3px ${passo}px), repeating-linear-gradient(to right, rgba(169,188,207,${0.45 - clareia * 0.35}) 0 3px, transparent 3px ${passo}px)`,
        backgroundPosition: `0 0, 0 ${((cam - 400) % passo) * -1 + passo}px, ${passo / 2}px 0`,
      }}
    />
  );
};

// As paredes da sala: painéis de vidro altos nos dois lados, do começo ao fim do voo.
const PAINEIS = Array.from({ length: 20 }, (_, i) => i);
const Paredes: React.FC<{ cam: number; mobile: boolean; clareia: number }> = ({ cam, mobile, clareia }) => {
  const x = mobile ? 760 : 1420;
  return (
    <>
      {PAINEIS.map((i) =>
        [-1, 1].map((s) => {
          const z = 300 + i * 820 + (s > 0 ? 410 : 0);
          return (
            <Camada key={`${i}${s}`} o={{ x: s * x, y: mobile ? -40 : -30, z }} cam={cam} opacidade={0.9 - clareia * 0.45}>
              <div
                style={{
                  width: mobile ? 260 : 360,
                  height: mobile ? 1500 : 980,
                  borderRadius: 28,
                  background: "linear-gradient(to bottom, rgba(255,255,255,0.75), rgba(255,255,255,0.25))",
                  border: "1.5px solid rgba(169,188,207,0.55)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 40px 80px -40px rgba(14,42,69,0.25)",
                }}
              />
            </Camada>
          );
        }),
      )}
    </>
  );
};

// Mensagens: dispersas na perna 1, enxurrada na perna 2, depois se organizam numa parede.
const N = 120;
const CARTOES = Array.from({ length: N }, (_, i) => {
  const r = (k: string) => random(`c${k}${i}`);
  const z = i < 28 ? 700 + r("z") * 2300 : 3000 + r("z") * 4600; // 28 na perna 1, o resto na enxurrada
  return {
    i,
    x: (r("x") - 0.5) * 2,
    y: (r("y") - 0.5) * 2,
    z,
    w: 260 + r("w") * 160,
    h: 92 + r("h") * 34,
    tom: r("t") < 0.6 ? "oceano" : r("t") < 0.85 ? "teal" : "bruma",
    lado: r("l") < 0.5 ? "esq" : "dir",
  } as const;
});

const Mensagens: React.FC<{ t: number; cam: number; mobile: boolean }> = ({ t, cam, mobile }) => {
  const lx = mobile ? 500 : 1150;
  const ly = mobile ? 640 : 430;
  // 14 s a 19 s: as mensagens deixam a dispersão e assumem a grade da parede.
  const grade = ease((t - 14) / 5);
  // 21 s em diante: a parede se dissolve para dar lugar às barras.
  const some = ease((t - 21) / 2.5);
  const cols = mobile ? 3 : 8;
  const cw = mobile ? 300 : 300;
  const ch = mobile ? 100 : 100;
  return (
    <>
      {CARTOES.map((c) => {
        const naParede = c.i >= 28;
        const k = c.i - 28;
        const col = k % cols;
        const row = Math.floor(k / cols);
        const rows = Math.ceil((N - 28) / cols);
        const gx = (col - (cols - 1) / 2) * (cw + 30);
        const gy = (row - (rows - 1) / 2) * (ch + 24) - (mobile ? 0 : 20);
        const x0 = !naParede && !mobile ? (0.15 + (c.x + 1) / 2 * 0.85) * lx : c.x * lx;
        const x = naParede ? interpolate(grade, [0, 1], [c.x * lx, gx]) : x0;
        const y = naParede ? interpolate(grade, [0, 1], [c.y * ly, gy]) : c.y * ly;
        const z = naParede ? interpolate(grade, [0, 1], [c.z, 8400]) : c.z;
        const w = naParede ? interpolate(grade, [0, 1], [c.w, cw]) : c.w;
        const h = naParede ? interpolate(grade, [0, 1], [c.h, ch]) : c.h;
        const op = naParede ? 1 - some : 1;
        const tom = naParede && grade > 0.6 ? "oceano" : c.tom;
        return (
          <Camada key={c.i} o={{ x, y, z }} cam={cam} opacidade={op}>
            <Cartao w={w} h={h} tom={tom} lado={c.lado} />
          </Camada>
        );
      })}
    </>
  );
};

// A parede vira barras que sobem: a curva real da OdontoLuz em forma (11,7 → 18,6 → 19,0 → 17,8 → 23,1).
const CURVA = [11.7, 18.6, 19.0, 17.8, 23.1];
const Barras: React.FC<{ t: number; cam: number; mobile: boolean }> = ({ t, cam, mobile }) => {
  const sobe = ease((t - 20.5) / 3);
  const some = ease((t - 25.5) / 1.5);
  if (sobe <= 0 || some >= 1) return null;
  const bw = mobile ? 120 : 170;
  const gap = mobile ? 30 : 60;
  const altMax = mobile ? 700 : 760;
  return (
    <Camada o={{ x: 0, y: mobile ? 100 : 40, z: 8900 }} cam={cam} opacidade={1 - some}>
      <div style={{ display: "flex", alignItems: "flex-end", gap, height: altMax }}>
        {CURVA.map((v, i) => {
          const local = ease((sobe * 5 - i * 0.6) / 1.4);
          const h = (v / 24) * altMax * local;
          return (
            <div
              key={i}
              style={{
                width: bw,
                height: Math.max(8, h),
                borderRadius: 20,
                background: `linear-gradient(to top, ${C.oceano}, ${C.teal})`,
                opacity: 0.94,
                boxShadow: "0 30px 60px -24px rgba(0,124,165,0.5)",
              }}
            />
          );
        })}
      </div>
      <div style={{ marginTop: 30, height: 3, background: C.bruma, opacity: 0.9 }} />
    </Camada>
  );
};

// Perna 3: duas faixas de luz no chão. Esquerda apagada (manual), direita acesa (com o Gestor).
const Faixas: React.FC<{ t: number; cam: number; mobile: boolean }> = ({ t, cam, mobile }) => {
  const entra = ease((t - 24) / 2.5);
  const sai = ease((t - 33) / 1.5);
  if (entra <= 0 || sai >= 1) return null;
  const meia = mobile ? 360 : 680;
  const y = mobile ? 758 : 538;
  const op = entra * (1 - sai);
  const lados: React.ReactNode[] = [];
  for (let i = 0; i < 8; i++) {
    const z = 8300 + i * 400;
    lados.push(
      <Camada key={`e${i}`} o={{ x: -meia / 2 - (mobile ? 40 : 160), y: 120 + (random(`fy${i}`) - 0.5) * (mobile ? 500 : 380), z }} cam={cam} opacidade={op}>
        <Cartao w={mobile ? 230 : 300} h={96} tom="bruma" />
      </Camada>,
      <Camada key={`d${i}`} o={{ x: meia / 2 + (mobile ? 40 : 160), y: (mobile ? 260 : 200) - i * (mobile ? 40 : 34), z: z + 180 }} cam={cam} opacidade={op}>
        <Cartao w={mobile ? 230 : 300} h={96} tom={i % 2 ? "teal" : "oceano"} lado="dir" />
      </Camada>,
    );
  }
  return (
    <>
      <Plano
        x={-meia / 2}
        y={y}
        z0={7800}
        cam={cam}
        w={meia - 60}
        len={3800}
        opacidade={op}
        style={{
          borderRadius: 60,
          background: "linear-gradient(to bottom, rgba(169,188,207,0) 0%, rgba(169,188,207,0.34) 25%, rgba(91,116,142,0.16) 65%, rgba(91,116,142,0) 100%)",
        }}
      />
      <Plano
        x={meia / 2}
        y={y - 2}
        z0={7800}
        cam={cam}
        w={meia - 60}
        len={3800}
        opacidade={op}
        style={{
          borderRadius: 60,
          background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 25%, rgba(0,124,165,0.22) 65%, rgba(0,124,165,0) 100%)",
          boxShadow: "0 0 120px 20px rgba(0,194,224,0.18)",
        }}
      />
      {lados}
    </>
  );
};

// Perna 4: quatro marcos de luz ao longo do caminho.
const Marcos: React.FC<{ t: number; cam: number; mobile: boolean }> = ({ t, cam, mobile }) => {
  const entra = ease((t - 34) / 2);
  const sai = ease((t - 44.5) / 2);
  if (entra <= 0 || sai >= 1) return null;
  const xs = mobile ? [-340, 340, -340, 340] : [-640, 640, -640, 640];
  const zs = [10900, 11650, 12400, 13150];
  const op = entra * (1 - sai);
  return (
    <>
      {zs.map((z, i) => (
        <Camada key={i} o={{ x: xs[i], y: mobile ? 120 : 60, z }} cam={cam} opacidade={op}>
          <div
            style={{
              width: 22,
              height: mobile ? 1000 : 900,
              borderRadius: 11,
              background: `linear-gradient(to bottom, rgba(0,124,165,0) 0%, ${C.oceano} 40%, ${C.teal} 100%)`,
              boxShadow: "0 0 80px 10px rgba(0,194,224,0.28)",
            }}
          />
        </Camada>
      ))}
      {zs.map((z, i) => (
        <Plano
          key={`r${i}`}
          x={xs[i]}
          y={mobile ? 758 : 538}
          z0={z - 240}
          cam={cam}
          w={520}
          len={480}
          opacidade={op}
          style={{ borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(0,194,224,0.45) 0%, rgba(0,194,224,0) 70%)" }}
        />
      ))}
    </>
  );
};

// Perna 5: a clareira. Um brilho branco ao fundo, um pouso no chão, a câmera para.
const Clareira: React.FC<{ t: number; cam: number; mobile: boolean }> = ({ t, cam, mobile }) => {
  const entra = ease((t - 43) / 4);
  if (entra <= 0) return null;
  return (
    <>
      <Camada o={{ x: 0, y: mobile ? 40 : -20, z: Z_FIM + 1800 }} cam={cam} opacidade={entra}>
        <div
          style={{
            width: 3400,
            height: 3400,
            borderRadius: "50%",
            background: "radial-gradient(circle at center, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 24%, rgba(237,242,248,0) 62%)",
          }}
        />
      </Camada>
      <Plano
        x={0}
        y={mobile ? 758 : 538}
        z0={Z_FIM + 300}
        cam={cam}
        w={mobile ? 1100 : 1700}
        len={1200}
        opacidade={entra}
        style={{ borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(0,194,224,0.30) 0%, rgba(0,194,224,0) 68%)" }}
      />
    </>
  );
};

export const Mundo: React.FC<{ mobile?: boolean }> = ({ mobile = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = camZ(t);
  const clareia = ease((t - 46) / 7);
  const luzTopo = interpolate(t, [0, INICIO[1]], [0.8, 0.6], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: C.nevoa, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          perspective: PERSPECTIVA,
          perspectiveOrigin: mobile ? "50% 50%" : "50% 52%",
          transformStyle: "preserve-3d",
        }}
      >
        <Chao cam={cam} mobile={mobile} clareia={clareia} />
        <Clareira t={t} cam={cam} mobile={mobile} />
        <Paredes cam={cam} mobile={mobile} clareia={clareia} />
        <Marcos t={t} cam={cam} mobile={mobile} />
        <Faixas t={t} cam={cam} mobile={mobile} />
        <Barras t={t} cam={cam} mobile={mobile} />
        <Mensagens t={t} cam={cam} mobile={mobile} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% -10%, rgba(255,255,255,${luzTopo}) 0%, rgba(255,255,255,0) 55%)`,
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(to top, rgba(237,242,248,0.85) 0%, rgba(237,242,248,0) 22%), linear-gradient(to right, rgba(237,242,248,0.5) 0%, rgba(237,242,248,0) 14%, rgba(237,242,248,0) 86%, rgba(237,242,248,0.5) 100%)`,
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill style={{ background: C.branco, opacity: clareia * 0.32, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
