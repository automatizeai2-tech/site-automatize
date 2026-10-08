#!/usr/bin/env bash
# Corta os filmes contínuos em pernas (nos limites exatos de quadro), codifica
# para scrub (h264 GOP denso via encode.sh da skill, mais WebM/VP9 para navegadores
# sem h264) e extrai os pôsteres do arquivo CODIFICADO (lei da costura).
set -euo pipefail
SKILL="${SKILL:-$HOME/scroll-craft-br}"
cd "$(dirname "$0")"
OUT=../assets
mkdir -p "$OUT" tmp
FF=$(command -v ffmpeg)
# pernas em segundos: 10 14 10 10 10 (ver src/cfg.ts)
INI=(0 10 24 34 44); DUR=(10 14 10 10 10)
for i in 0 1 2 3 4; do
  n=$((i+1))
  for modo in ${MODOS:-desktop mobile}; do
    src=out/mundo-$modo.mp4
    suf=""; [ "$modo" = mobile ] && suf="-m"
    # corte exato: -ss antes do -i busca no keyframe anterior e decodifica até o ponto; recodificar garante precisão
    [ -s tmp/perna$n$suf-master.mp4 ] || "$FF" -y -v error -ss "${INI[$i]}" -i "$src" -t "${DUR[$i]}" -c:v libx264 -crf 10 -preset fast -pix_fmt yuv420p -an tmp/perna$n$suf-master.mp4
    if [ "$modo" = mobile ]; then
      # retrato: encode.sh não tem modo retrato (assets.md); largura 720, GOP 4
      [ -s "$OUT/perna$n$suf.mp4" ] || "$FF" -y -v error -i tmp/perna$n$suf-master.mp4 -vf "scale=720:-2" -c:v libx264 -crf 22 -g 4 -pix_fmt yuv420p -an -movflags +faststart "$OUT/perna$n$suf.mp4"
    else
      [ -s "$OUT/perna$n$suf.mp4" ] || bash "$SKILL/scripts/encode.sh" tmp/perna$n$suf-master.mp4 "$OUT/perna$n$suf.mp4" $modo
    fi
    gop=8; [ "$modo" = mobile ] && gop=4
     "$FF" -y -v error -i "$OUT/perna$n$suf.mp4" -vf "scale=-2:720" -c:v libvpx-vp9 -b:v 0 -crf 34 -g $gop -row-mt 1 -deadline good -cpu-used 4 -pix_fmt yuv420p -an "$OUT/perna$n$suf.webm"
    [ -s "$OUT/perna$n$suf.webp" ] || "$FF" -y -v error -i "$OUT/perna$n$suf.mp4" -frames:v 1 -vf "scale=1600:-2" -c:v libwebp -quality 82 "$OUT/perna$n$suf.webp"
    echo "pronto: perna$n$suf"
  done
done
ls -la "$OUT"/perna*
