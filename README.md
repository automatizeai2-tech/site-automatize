# Site da Automatize.AI

Site institucional construído com a skill `scroll-craft-br` (mundo contínuo, modo worldflight).

- `index.html`: a página inteira (marcação, estilo e script da página).
- `scrollcraft.js` / `scrollcraft.css`: o engine da skill. Nunca editar por projeto.
- `assets/`: pernas do voo (mp4 h264 GOP denso + webm VP9), pôsteres, logo em SVG, fontes.
- `mundo/`: o projeto Remotion que renderiza o mundo (duas composições: desktop 16:9 e celular 9:16) e o script `cortar-pernas.sh` que corta e codifica as pernas.
- `scrollcraft/`: workspace da skill (BRIEF.md, relatório e registro de impressões digitais).

## Refazer o mundo

```bash
cd mundo && npm install
npx remotion render MundoDesktop out/mundo-desktop.mp4 --crf=12
npx remotion render MundoMobile  out/mundo-mobile.mp4  --crf=12
SKILL=~/scroll-craft-br bash cortar-pernas.sh
```

## Verificar

```bash
npm i playwright-core
node ~/scroll-craft-br/scripts/serve.mjs --root . --port 4500 &
node ~/scroll-craft-br/scripts/shoot.mjs --url http://localhost:4500 --out scrollcraft/lab/shots
node ~/scroll-craft-br/scripts/worldflight-assert.mjs --url http://localhost:4500
```

## Publicação

GitHub Pages servindo a raiz do repositório (branch `main`), com domínio próprio apontado por CNAME na Hostinger.
