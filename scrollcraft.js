/* ============================================================================
   scrollcraft: um runtime de interação guiado por scroll
   ----------------------------------------------------------------------------
   JS puro. Zero dependências. Zero geração de DOM.

   O engine NÃO constrói a sua página. Você escreve HTML real e semântico e o
   marca com atributos data-sc-*; o engine os lê e os guia a partir de um único
   valor de scroll em um único loop de rAF. Isso é deliberado: um runtime que
   gera o próprio DOM a partir de um objeto de configuração faz todo site que
   toca parecer idêntico, que é o modo de falha que isto substitui.

   ---------------------------------------------------------------------------
   ATOS: a unidade de tempo de scroll
   ---------------------------------------------------------------------------
     <section data-sc-act="pin" data-sc-span="2.5"> ... </section>

     data-sc-act   scrub | pin | pan | flow   (padrão: flow)
     data-sc-clip-map="travel" tira um ato pinado do mapeamento de clipe por
                   vida inteira. Por PADRÃO um clipe de scrub é mapeado ao longo
                   de toda a vida do stage na tela, não ao longo do seu percurso
                   pinado, porque um stage pinado fica visível por um viewport
                   ANTES de o pin começar (subindo para a tela) e por um viewport
                   DEPOIS de ele terminar (saindo pelo topo). Mapeado ao percurso
                   pinado, o clipe fica no primeiro quadro durante toda a entrada
                   e no último quadro durante toda a saída: o leitor assiste a
                   uma fotografia parada enquanto a página se move. Combine com
                   data-sc-dwell, que se move rápido nas bordas e assenta no
                   meio, para que o movimento rápido caia nos dois deslizes e o
                   assentamento caia dentro do pin, onde está o texto.
                   data-sc-runout é aceito e ignorado; ele nomeava o antigo
                   opt-in para a metade de saída disto.
     data-sc-span  alturas de viewport de scroll que este ato possui. Só para
                   dispositivos pinados (scrub/pin/pan). Padrão 1.5. O engine
                   define a altura externa e fixa o primeiro filho
                   .sc-stage / [data-sc-stage].

     Todo ato expõe um progresso normalizado p (0..1):
       pinado  p = (y - top) / (height - vh)
       flow    p = (y + vh - top) / (height + vh)
     e o publica como --sc-p no elemento do ato, para o CSS também poder ler.

   ---------------------------------------------------------------------------
   DISPOSITIVOS: o que p guia
   ---------------------------------------------------------------------------
     data-sc-scrub            em <video>. p faz scrub do currentTime. Carregado
                              por blob, então busca sem precisar de suporte a
                              HTTP range.
     data-sc-sequence="a/{i}.webp:120:1"
                              em <canvas>. p faz scrub de uma sequência de
                              imagens (template de caminho : quantidade de
                              quadros : índice inicial).
     data-sc-pan="0.6"        em um trilho largo dentro de data-sc-act="pan". p
                              guia o percurso horizontal. Valor = multiplicador
                              de percurso extra.
     data-sc-parallax="-0.2"  translateY por taxa * progresso do ato * viewport.
                              Negativo = sobe mais rápido que o scroll (recua).
     data-sc-cue="0.1 0.5"    opacidade/subida atreladas a p. Um valor = entra e
                              segura. Dois = entra..sai. Adicione um terceiro
                              para o ponto de espera.
     data-sc-kinetic="lines"  lines | words | chars. Divide o elemento e
                              escalona seu reveal ao longo da janela da deixa.
     data-sc-reveal="up"      up | down | left | right | iris. Wipe por clip-path.
     data-sc-count="0 4200"   número florescendo ao longo da janela da deixa.
                              Fora de qualquer ato, em vez disso ele sobe uma
                              vez na entrada, ao longo de data-sc-count-ms
                              (padrão 1400).
     data-sc-in               reveal de seção flow, dispara uma vez na entrada
                              via IntersectionObserver (mais barato, e conteúdo
                              que se esconde de novo ao rolar para cima é um
                              defeito, não um efeito).
                              data-sc-stagger="60" no pai escalona os filhos.
     data-sc-drift="#07090c"  o fundo da página interpola em direção a esta cor
                              enquanto o ato está na tela.

   ---------------------------------------------------------------------------
   WORLDFLIGHT: o modo de página para um voo contínuo
   ---------------------------------------------------------------------------
     <div data-sc-mode="worldflight" data-sc-seam="0.12">
       <div data-sc-world>
         <div data-sc-segment data-sc-w="1.4" data-sc-linger="0.3"
              data-sc-waypoint="Approach">
           <img class="sc-world__poster" src="p1.webp" alt="">
           <video data-sc-src="leg1.mp4" data-sc-src-mobile="leg1-m.mp4"></video>
         </div>
         ... mais segmentos, na ordem do voo ...
       </div>
       <div data-sc-world-copy>
         <div class="sc-world__scrim sc-scrim sc-scrim--band"></div>
         <div data-sc-copy data-sc-window="hero"> ... </div>
         <div data-sc-copy data-sc-window="0.34 0.56"> ... </div>
         <div data-sc-copy data-sc-window="finale"> ... </div>
       </div>
       <div data-sc-spacer aria-hidden="true"></div>
     </div>

   Atos cortam a página em blocos pinados, que é a forma certa para uma página
   de capítulos e a forma errada para um movimento de câmera contínuo: o leitor
   chega ao fim de um ato, o stage se solta, uma página estática passa deslizando
   e o próximo ato recomeça tudo. O worldflight remove as costuras removendo os
   blocos. Há UM stage fixo para a página inteira. O único elemento no fluxo do
   documento é um espaçador, cuja altura o engine define como a soma dos pesos
   dos segmentos mais um viewport, para o último voo poder terminar. O scroll
   guia a linha do tempo do filme e a opacidade da sobreposição. Nada mais se
   move.

     data-sc-w        alturas de viewport que este segmento possui. Padrão 1.3.
     data-sc-linger   remapeamento de espera só para esta perna (veja
                      lingerEase). Máx. 0.6.
     data-sc-seam     faixa de crossfade, em alturas de viewport de scroll.
                      Padrão 0.12.
     data-sc-waypoint rótulo publicado em --sc-seg / no evento sc:waypoint, para
                      uma página poder desenhar o próprio trilho de rota. O
                      engine não desenha nenhum.
     data-sc-window   em um bloco de texto: "hero" | "finale" | "from to [in [out]]"
                      como frações da trilha INTEIRA.

   Todo clipe fica montado durante a vida inteira da página. Os segmentos fazem
   crossfade por opacidade ao longo da faixa de costura; nada nunca troca um src,
   porque uma troca de src é um quadro preto e um quadro preto é o corte que este
   modo existe para evitar.

   ---------------------------------------------------------------------------
   PONTEIRO: interatividade que não é scroll
   ---------------------------------------------------------------------------
     data-sc-tilt="8"         inclinação 3D em direção ao ponteiro, com
                              amortecimento de mola, em graus.
     data-sc-magnet="0.35"    o elemento deriva em direção ao ponteiro dentro
                              dos próprios limites.
     data-sc-spotlight        publica --sc-mx/--sc-my (0..1) para uma luz que
                              segue o ponteiro pela superfície.
   Os três são restritos a (hover: hover) e (pointer: fine) e desativados sob
   prefers-reduced-motion. Toque nunca os dispara.

   ---------------------------------------------------------------------------
   MOVIMENTO REDUZIDO
   ---------------------------------------------------------------------------
   Menos e mais suave, não zero. As deixas ainda fazem fade (a compreensão
   sobrevive), mas a translação desaparece, os clipes de vídeo nunca são baixados
   (o poster segura) e os dispositivos de ponteiro ficam inertes. Um worldflight
   ainda conta a história inteira: os posters fazem cross-dissolve pelas mesmas
   costuras e pelas mesmas janelas de texto.

   ---------------------------------------------------------------------------
   O PLAYHEAD
   ---------------------------------------------------------------------------
   Todo clipe de scrub da página, ato ou worldflight, é guiado por um único
   playhead suavizado. O scroll só escreve um ALVO; um loop de rAF independente
   caminha o tempo atual em direção a ele a uma fração fixa por quadro
   (data-sc-lerp, padrão 0.18; 1.0 sob movimento reduzido, que é nenhuma
   suavização). As escritas passam por uma zona morta e são puladas enquanto o
   decodificador ainda está buscando. Sem a suavização, um gesto rápido no
   trackpad parece um engasgo, porque os eventos de wheel não chegam a uma taxa
   constante e uma escrita 1:1 reproduz cada lacuna deles.
   ========================================================================== */

(function (global) {
  'use strict';

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fineMQ = matchMedia('(hover: hover) and (pointer: fine)');
  var smallMQ = matchMedia('(max-width: 860px)');
  var coarse = matchMedia('(hover: none) and (pointer: coarse)').matches;
  var isMobile = function () { return coarse || smallMQ.matches; };

  var clamp = function (x, a, b) { return x < a ? a : x > b ? b : x; };
  var clamp01 = function (x) { return clamp(x, 0, 1); };
  var smooth = function (x) { x = clamp01(x); return x * x * (3 - 2 * x); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  // Remapeamento monótono de espera. Assenta a câmera no meio do ato (onde o
  // texto atinge o pico) e se move mais rápido nas bordas. f(0)=0 e f(1)=1
  // sempre, então os quadros de costura entre clipes consecutivos ficam intactos
  // e a cadeia continua invisível.
  function dwell(x, L) {
    if (!L) return x;
    L = clamp01(L);
    var c = x - 0.5;
    return (1 - L) * x + L * (4 * c * c * c + 0.5);
  }

  // Mesma curva, com teto mais rígido, usada por segmento de worldflight. Acima
  // de ~0.6 a derivada no ponto médio fica baixa o bastante para a câmera parar
  // visivelmente no meio da perna, o que parece um travamento, não uma pausa. Os
  // extremos são fixos por construção: f(0)=0, f(1)=1, então o primeiro e o
  // último quadro de cada perna continuam sendo exatamente os quadros que a lei
  // da costura casou, e a cadeia entre pernas continua invisível por mais espera
  // que uma perna peça.
  function lingerEase(x, L) {
    if (!L) return x;
    L = clamp(L, 0, 0.6);
    var c = x - 0.5;
    return (1 - L) * x + L * (4 * c * c * c + 0.5);
  }

  // O lerp é um mecanismo, não um botão de gosto. Ele é exposto para que uma
  // página com clipes incomumente curtos (onde 0.18 fica atrás do ponteiro)
  // possa apertá-lo, e nunca é lido como 0: um lerp 0 é um playhead que nunca se
  // move.
  function lerpRate(el) {
    var v = parseFloat(el && el.getAttribute && el.getAttribute('data-sc-lerp'));
    return isNaN(v) || v <= 0 ? 0 : clamp(v, 0.02, 1);
  }

  // ---- cor ----------------------------------------------------------------
  function parseColor(str) {
    str = (str || '').trim();
    var m = str.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (m) {
      var h = m[1];
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
    m = str.match(/rgba?\(([^)]+)\)/i);
    if (m) {
      var p = m[1].split(/[,\s/]+/).filter(Boolean).map(parseFloat);
      return [p[0], p[1], p[2]];
    }
    return null;
  }
  function mixColor(a, b, t) {
    return 'rgb(' + Math.round(lerp(a[0], b[0], t)) + ',' +
                    Math.round(lerp(a[1], b[1], t)) + ',' +
                    Math.round(lerp(a[2], b[2], t)) + ')';
  }

  // ---- divisão de texto ---------------------------------------------------
  // Envolve cada unidade em um span mascarado para o reveal poder deslizar por
  // trás de uma borda limpa em vez de só fazer fade. As linhas são medidas depois
  // do layout, então isto precisa rodar com as fontes prontas, ou as caixas de
  // linha saem erradas.
  function splitText(el, mode) {
    if (el.__scSplit) return el.__scSplit;
    var text = el.textContent;
    var units = [];

    if (mode === 'chars' || mode === 'words') {
      var parts = mode === 'chars' ? Array.from(text) : text.split(/(\s+)/);
      el.textContent = '';
      parts.forEach(function (t) {
        if (/^\s+$/.test(t)) { el.appendChild(document.createTextNode(t)); return; }
        var mask = document.createElement('span');
        mask.className = 'sc-split';
        var inner = document.createElement('span');
        inner.className = 'sc-split__i';
        inner.textContent = t;
        mask.appendChild(inner);
        el.appendChild(mask);
        units.push(inner);
      });
    } else {
      // lines: envolve cada palavra, mede offsetTop, reagrupa as palavras em spans de linha
      var words = text.split(/\s+/).filter(Boolean);
      el.textContent = '';
      var probes = words.map(function (w, i) {
        var s = document.createElement('span');
        s.textContent = w;
        el.appendChild(s);
        if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
        return s;
      });
      var lines = [], cur = null, lastTop = null;
      probes.forEach(function (s) {
        var top = s.offsetTop;
        if (lastTop === null || Math.abs(top - lastTop) > 1) { cur = []; lines.push(cur); lastTop = top; }
        cur.push(s.textContent);
      });
      el.textContent = '';
      lines.forEach(function (words, li) {
        var mask = document.createElement('span');
        mask.className = 'sc-split sc-split--line';
        var inner = document.createElement('span');
        inner.className = 'sc-split__i';
        inner.textContent = words.join(' ');
        mask.appendChild(inner);
        el.appendChild(mask);
        // Espaço em branco entre os spans de linha. Sem ele as caixas de linha
        // se encostam na camada de texto, então selecionar e copiar o título
        // gera "mesmo quandocafé" e um leitor de tela ouve o mesmo.
        if (li < lines.length - 1) el.appendChild(document.createTextNode(' '));
        units.push(inner);
      });
    }
    el.classList.add('sc-is-split');
    el.__scSplit = units;
    return units;
  }

  // ---- formatação de números ----------------------------------------------
  function formatNum(v, template) {
    var decimals = 0;
    var dot = template.indexOf('.');
    if (dot > -1) decimals = template.length - dot - 1;
    var s = v.toFixed(decimals);
    if (/,/.test(template) || Math.abs(v) >= 10000) {
      var bits = s.split('.');
      bits[0] = bits[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      s = bits.join('.');
    }
    return s;
  }

  // =========================================================================
  function mount(root, opts) {
    root = typeof root === 'string' ? document.querySelector(root) : (root || document);
    opts = opts || {};

    // Desmontagem para roteadores client-side (issue #6). mount() registra
    // listeners na window, inicia dois loops de rAF que se reagendam sozinhos e
    // insere em ScrollCraft.instances, então sem destroy() toda remontagem deixa
    // a instância antiga rodando pela vida inteira da aba. `on` registra o que
    // registrou e os dois loops guardam seu handle vivo, para destroy() poder
    // desfazer exatamente o que este mount fez e nada mais: seus listeners na
    // window, os dois loops de rAF, os dois IntersectionObservers e todo blob de
    // clipe que criou. Uma página que nunca chama destroy() se comporta
    // exatamente como antes.
    var scListeners = [];
    var scDead = false;
    var scTickFrame = 0, scPointerFrame = 0;
    function on(type, fn, o) {
      addEventListener(type, fn, o);
      scListeners.push([type, fn, o]);
    }

    var acts = [];
    var worlds = [];
    var drifts = [];
    var playheads = [];
    var scrollEls = [];
    var vh = innerHeight, vw = innerWidth;
    var y = 0, needsLayout = true;
    var progressBar = root.querySelector('[data-sc-progress]');
    var docEl = document.documentElement;

    // Uma taxa para a página, sobrescrevível por clipe. Lida da raiz do mount, do
    // elemento do documento ou do objeto de opções, nessa ordem.
    var LERP = lerpRate(root.nodeType === 1 ? root : null) ||
               lerpRate(docEl) ||
               (opts.lerp > 0 ? clamp(opts.lerp, 0.02, 1) : 0) ||
               0.18;

    // Todo clipe de scrub da página vive aqui, seja o que for que o guie. tick()
    // percorre esta única lista, então um clipe de ato e uma perna de worldflight
    // recebem o mesmo playhead.
    function makeClip(v, host) {
      var rec = {
        el: v, host: host || v,
        ready: false, loading: false, painted: false,
        cur: 0, target: 0, live: false, stuckAt: 0,
        lerp: lerpRate(v) || LERP
      };
      v.muted = true; v.playsInline = true; v.preload = 'none';
      v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
      playheads.push(rec);
      return rec;
    }

    // ---- coleta de atos ---------------------------------------------------
    Array.prototype.forEach.call(root.querySelectorAll('[data-sc-act]'), function (el) {
      var device = el.getAttribute('data-sc-act') || 'flow';
      var pinned = device === 'scrub' || device === 'pin' || device === 'pan';
      var act = {
        el: el,
        device: device,
        pinned: pinned,
        span: parseFloat(el.getAttribute('data-sc-span')) || (pinned ? 1.5 : 0),
        dwell: parseFloat(el.getAttribute('data-sc-dwell')) || 0,
        clipTravel: pinned && el.getAttribute('data-sc-clip-map') === 'travel',
        p: 0, raw: 0, top: 0, height: 0, live: false,
        cues: [], parallax: [], reveals: [], counts: [],
        video: null, seq: null, rail: null
      };

      if (pinned) {
        act.stage = el.querySelector('[data-sc-stage]') || el.querySelector('.sc-stage');
        if (act.stage) act.stage.classList.add('sc-stage');
        el.classList.add('sc-act--pinned');
      }

      // vídeo de scrub
      var v = el.querySelector('video[data-sc-scrub]');
      if (v) act.video = makeClip(v, el);

      // sequência de imagens
      var cv = el.querySelector('canvas[data-sc-sequence]');
      if (cv) {
        var spec = cv.getAttribute('data-sc-sequence').split(':');
        act.seq = {
          el: cv, ctx: cv.getContext('2d', { alpha: false }),
          tpl: spec[0], count: parseInt(spec[1], 10) || 1, start: parseInt(spec[2], 10) || 0,
          frames: [], loaded: 0, drawn: -1
        };
      }

      // trilho horizontal
      act.rail = el.querySelector('[data-sc-pan]');
      if (act.rail) act.railExtra = parseFloat(act.rail.getAttribute('data-sc-pan')) || 0;

      // deixas
      Array.prototype.forEach.call(el.querySelectorAll('[data-sc-cue]'), function (c) {
        var nums = (c.getAttribute('data-sc-cue') || '').trim().split(/\s+/).map(parseFloat);
        // from [to [rampIn [rampOut]]]
        // rampIn/rampOut são frações DA JANELA, com padrão 0.3 cada. Isso deixa
        // um platô de ~40% em opacidade total no meio. Sem platô uma deixa é um
        // triângulo: toca a opacidade 1 por um único instante, então o leitor
        // precisa parar exatamente no pixel certo para ver a linha em força
        // total, e todo título parece levemente desbotado.
        var cue = {
          el: c,
          from: isNaN(nums[0]) ? 0 : nums[0],
          to: nums.length > 1 && !isNaN(nums[1]) ? nums[1] : null,
          rIn: nums.length > 2 && !isNaN(nums[2]) ? clamp01(nums[2]) : 0.3,
          rOut: nums.length > 3 && !isNaN(nums[3]) ? clamp01(nums[3]) : null,
          rise: parseFloat(c.getAttribute('data-sc-rise')),
          kinetic: c.getAttribute('data-sc-kinetic'),
          units: null, state: -1
        };
        if (cue.rOut === null) cue.rOut = (nums.length > 2 && !isNaN(nums[2])) ? 0.3 : 0.3;
        if (isNaN(cue.rise)) cue.rise = 1;
        act.cues.push(cue);
      });

      // parallax
      Array.prototype.forEach.call(el.querySelectorAll('[data-sc-parallax]'), function (c) {
        act.parallax.push({ el: c, rate: parseFloat(c.getAttribute('data-sc-parallax')) || 0 });
      });

      // reveals
      Array.prototype.forEach.call(el.querySelectorAll('[data-sc-reveal]'), function (c) {
        var nums = (c.getAttribute('data-sc-reveal-at') || '0 0.5').trim().split(/\s+/).map(parseFloat);
        act.reveals.push({ el: c, dir: c.getAttribute('data-sc-reveal') || 'up', from: nums[0] || 0, to: nums[1] || 0.5 });
      });

      // contadores
      Array.prototype.forEach.call(el.querySelectorAll('[data-sc-count]'), function (c) {
        var nums = (c.getAttribute('data-sc-count') || '').trim().split(/\s+/);
        var at = (c.getAttribute('data-sc-count-at') || '0.1 0.55').trim().split(/\s+/).map(parseFloat);
        // Remove os separadores antes de interpretar, para o autor poder escrever
        // o alvo exatamente como deve ser renderizado. Sem isso, "0 3,500"
        // interpreta o alvo como 3 (a vírgula para o parseFloat) e "0 3500"
        // renderiza "3500", porque formatNum só adiciona separadores acima de
        // 10,000. Assim nenhum número real entre 1,000 e 9,999 poderia aparecer
        // do jeito que está escrito no resto da página. O template continua
        // guiando a formatação.
        var num = function (s) { return parseFloat(String(s).replace(/,/g, '')) || 0; };
        act.counts.push({
          el: c, a: num(nums[0]), b: num(nums[1]),
          tpl: nums[1] || '0', from: at[0], to: at[1], last: null
        });
      });

      acts.push(act);

      var d = el.getAttribute('data-sc-drift');
      if (d) { var rgb = parseColor(d); if (rgb) drifts.push({ act: act, rgb: rgb }); }
    });

    // ---- coleta de worldflights ------------------------------------------
    Array.prototype.forEach.call(root.querySelectorAll('[data-sc-mode="worldflight"]'), function (el) {
      var W = {
        el: el,
        stage: el.querySelector('[data-sc-world]') || el.querySelector('.sc-world'),
        copyLayer: el.querySelector('[data-sc-world-copy]') || el.querySelector('.sc-world__copy'),
        spacer: el.querySelector('[data-sc-spacer]') || el.querySelector('.sc-world__spacer'),
        seam: 0, segs: [], copies: [], total: 0, top: 0, index: -1, checked: false
      };
      var seam = parseFloat(el.getAttribute('data-sc-seam'));
      // Uma costura mais larga que a perna mais curta teria três clipes se
      // dissolvendo ao mesmo tempo e nenhuma perna nunca totalmente presente.
      // Limite bem abaixo disso.
      W.seam = isNaN(seam) || seam <= 0 ? 0.12 : clamp(seam, 0.02, 0.4);
      if (W.stage) W.stage.classList.add('sc-world');
      if (W.copyLayer) W.copyLayer.classList.add('sc-world__copy');
      if (W.spacer) W.spacer.classList.add('sc-world__spacer');

      Array.prototype.forEach.call(el.querySelectorAll('[data-sc-segment]'), function (s) {
        var seg = {
          el: s,
          w: parseFloat(s.getAttribute('data-sc-w')) || 1.3,
          linger: clamp(parseFloat(s.getAttribute('data-sc-linger')) || 0, 0, 0.6),
          label: s.getAttribute('data-sc-waypoint') || '',
          poster: s.querySelector('[data-sc-poster]') || s.querySelector('.sc-world__poster') || s.querySelector('img'),
          c0: 0, c1: 0, local: 0, op: -1, z: -1, clip: null
        };
        s.classList.add('sc-world__seg');
        if (seg.poster) seg.poster.classList.add('sc-world__poster');
        var v = s.querySelector('video');
        if (v) {
          // Marca como clipe de scrub, tenha o autor feito isso ou não. Tudo
          // adiante, incluindo a folha de estilo e o harness de verificação,
          // encontra mídia de scrub por este atributo.
          v.setAttribute('data-sc-scrub', '');
          seg.clip = makeClip(v, s);
        }
        W.segs.push(seg);
      });

      var run = 0;
      W.segs.forEach(function (s) { s.c0 = run; run += Math.max(s.w, 0.1); s.c1 = run; });
      W.total = Math.max(run, 0.001);

      Array.prototype.forEach.call(el.querySelectorAll('[data-sc-copy]'), function (cEl) {
        var spec = (cEl.getAttribute('data-sc-window') || '').trim();
        var q = { el: cEl, from: 0, to: 1, rIn: 0.3, rOut: 0.3, state: -1 };
        var first = W.segs[0], last = W.segs[W.segs.length - 1];
        if (spec === 'hero') {
          // Presente no instante em que o leitor chega. Um hero que faz fade IN
          // precisa surgir do nada sobre uma primeira tela vazia, que é o único
          // momento da página em que não há mais nada para olhar.
          q.from = 0;
          q.to = first ? (0.62 * first.w) / W.total : 0.3;
          q.rIn = 0; q.rOut = 0.65;
        } else if (spec === 'finale') {
          q.from = last ? (last.c0 + 0.4 * last.w) / W.total : 0.7;
          q.to = 1; q.rIn = 0.55; q.rOut = 0;
        } else {
          var n = spec.split(/\s+/).map(parseFloat);
          q.from = isNaN(n[0]) ? 0 : clamp01(n[0]);
          q.to = (n.length > 1 && !isNaN(n[1])) ? clamp01(n[1]) : clamp01(q.from + 0.18);
          if (n.length > 2 && !isNaN(n[2])) q.rIn = clamp01(n[2]);
          if (n.length > 3 && !isNaN(n[3])) q.rOut = clamp01(n[3]);
        }
        if (q.to <= q.from) q.to = clamp01(q.from + 0.05);
        W.copies.push(q);
      });

      worlds.push(W);
    });

    // ---- reveals de flow (disparam uma vez) ------------------------------
    // `cio` é atribuído dentro da IIFE de contadores abaixo; é declarado aqui
    // para destroy() poder desconectá-lo. Um IntersectionObserver guarda uma
    // referência forte a todo alvo observado, e unobserve só roda na primeira
    // interseção, então um elemento nunca revelado em uma subárvore removida fica
    // retido pela vida inteira da aba, uma vez por remontagem.
    var io = null, cio = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          el.classList.add('sc-in');
          var stagger = parseFloat(el.getAttribute('data-sc-stagger'));
          if (!isNaN(stagger)) {
            Array.prototype.forEach.call(el.children, function (kid, i) {
              kid.style.transitionDelay = (i * stagger) + 'ms';
              kid.classList.add('sc-in');
            });
          }
          io.unobserve(el);
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
      Array.prototype.forEach.call(root.querySelectorAll('[data-sc-in]'), function (el) { io.observe(el); });
    } else {
      Array.prototype.forEach.call(root.querySelectorAll('[data-sc-in]'), function (el) { el.classList.add('sc-in'); });
    }

    // ---- contadores de entrada (disparam uma vez) ------------------------
    // Um [data-sc-count] fora de qualquer ato pinado não sofre scrub pelo
    // scroll; ele sobe uma vez ao entrar na tela, ao longo de data-sc-count-ms
    // (padrão 1400). Mesmas regras de formatação do contador de ato: escreva o
    // alvo como ele deve ser renderizado. Movimento reduzido escreve o valor
    // final e nunca anima.
    (function () {
      var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
      var num = function (s) { return parseFloat(String(s).replace(/,/g, '')) || 0; };
      var spec = function (c) { return (c.getAttribute('data-sc-count') || '').trim().split(/\s+/); };
      var els = Array.prototype.filter.call(root.querySelectorAll('[data-sc-count]'), function (c) {
        return !c.closest('[data-sc-act]');
      });
      if (!els.length) return;
      function run(c) {
        var nums = spec(c);
        var a = num(nums[0]), b = num(nums[1]), tpl = nums[1] || '0';
        var ms = parseFloat(c.getAttribute('data-sc-count-ms')) || 1400;
        if (reduce || ms <= 0) { c.textContent = formatNum(b, tpl); return; }
        var t0 = null, last = null;
        function frame(now) {
          if (scDead) return;
          if (t0 === null) t0 = now;
          var t = Math.min((now - t0) / ms, 1);
          var out = formatNum(a + (b - a) * ease(t), tpl);
          if (out !== last) { c.textContent = out; last = out; }
          if (t < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }
      els.forEach(function (c) { var n = spec(c); c.textContent = formatNum(num(n[0]), n[1] || '0'); });
      if ('IntersectionObserver' in window) {
        cio = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            run(e.target); cio.unobserve(e.target);
          });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.5 });
        els.forEach(function (c) { cio.observe(c); });
      } else {
        els.forEach(run);
      }
    })();

    // ---- layout -----------------------------------------------------------
    function layout() {
      // layout() e read() estão ambos na api retornada, então um updated() de
      // framework chegando depois de destroyed() entra neles diretamente.
      if (scDead) return;
      vh = innerHeight; vw = innerWidth;
      acts.forEach(function (a) {
        if (a.pinned) a.el.style.height = (a.span * 100) + 'vh';
      });
      // O espaçador é todo o fluxo do documento de um worldflight. Sua altura é a
      // soma dos pesos das pernas mais um viewport: sem essa tela extra a trilha
      // acaba no momento em que a última perna chega a p=1, então o segundo final
      // da última perna é um lugar onde o leitor nunca consegue parar de fato.
      // Definido em pixels, não em vh, porque .sc-world é dimensionado em svh nos
      // celulares e um descompasso vh/svh colocaria a trilha e o stage em réguas
      // diferentes.
      worlds.forEach(function (W) {
        if (W.spacer) W.spacer.style.height = Math.round((W.total + 1) * vh) + 'px';
      });
      acts.forEach(function (a) {
        var r = a.el.getBoundingClientRect();
        a.top = r.top + scrollY;
        a.height = r.height;
      });
      if (acts.length) {
        acts.forEach(function (a) {
          if (a.seq && a.seq.el) {
            var box = a.seq.el.getBoundingClientRect();
            var dpr = Math.min(devicePixelRatio || 1, 2);
            a.seq.el.width = Math.round(box.width * dpr);
            a.seq.el.height = Math.round(box.height * dpr);
            a.seq.drawn = -1;
          }
        });
      }
      // Um ato pinado cujo stage não é de fato sticky falha em silêncio: o stage
      // simplesmente passa rolando, o texto faz as deixas corretamente contra um
      // quadro que ninguém vê, e toda verificação automatizada passa. Qualquer
      // regra do autor que defina `position` no stage causa isso. Avise.
      acts.forEach(function (a) {
        if (!a.pinned || !a.stage || a.stageChecked) return;
        a.stageChecked = true;
        var pos = getComputedStyle(a.stage).position;
        if (pos !== 'sticky' && pos !== '-webkit-sticky') {
          console.warn('[scrollcraft] o ato "' + (a.el.id || a.device) + '" não vai pinar: seu stage computa ' +
            'position:' + pos + ', não sticky. Algo está sobrescrevendo .sc-stage.', a.stage);
        }
      });

      worlds.forEach(function (W) {
        W.top = W.el.getBoundingClientRect().top + scrollY;
        if (W.checked) return;
        W.checked = true;
        if (!W.stage) {
          console.warn('[scrollcraft] o worldflight não tem stage [data-sc-world]; nada vai voar.', W.el);
          return;
        }
        if (!W.spacer) {
          console.warn('[scrollcraft] o worldflight não tem [data-sc-spacer]; a página não tem trilha de scroll.', W.el);
        }
        // A mesma falha silenciosa de um ato não pinado, um nível pior: um stage
        // que não é fixed rola para fora e leva a página inteira junto, enquanto
        // todo número de progresso continua lendo certo.
        var wp = getComputedStyle(W.stage).position;
        if (wp !== 'fixed') {
          console.warn('[scrollcraft] o stage do worldflight computa position:' + wp + ', não fixed. ' +
            'Algo está sobrescrevendo .sc-world, e o voo vai rolar para fora da tela.', W.stage);
        }
      });

      needsLayout = false;
      read();
    }

    // ---- vídeo ------------------------------------------------------------
    function loadVideo(a) { loadClip(a.video); }
    function loadClip(V) {
      // Sob movimento reduzido o clipe nunca é baixado. O poster segura o quadro
      // e o texto ainda faz as deixas, então a página se lê sem a decodificação.
      if (reduce || !V || V.loading) return;
      var src = V.el.getAttribute('data-sc-src') ||
                (isMobile() && V.el.getAttribute('data-sc-src-mobile')) ||
                V.el.currentSrc || V.el.src;
      if (isMobile() && V.el.getAttribute('data-sc-src-mobile')) src = V.el.getAttribute('data-sc-src-mobile');
      if (!src) return;
      V.loading = true;
      fetch(src).then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); })
        .then(function (blob) {
          // Um fetch em andamento quando destroy() rodou resolve mesmo assim. Sem
          // isto ele anexa loadedmetadata/seeked a um elemento desanexado, chama
          // read(), arma o timer de 2s do primeClip e atribui uma blob URL que
          // nada jamais vai revogar, tudo depois de a desmontagem reportar sucesso.
          if (scDead) return;   // o Blob fica sem referência a partir daqui e é coletado
          // Listeners e preload ANTES do src. Atribuir src inicia o carregamento,
          // então anexar depois e chamar load() reinicia e aborta a primeira
          // requisição (visível como ERR_ABORTED na blob URL).
          V.el.addEventListener('loadedmetadata', function () {
            V.ready = true;
            // Força um seek mesmo quando o alvo já é 0. O reveal depende de um
            // evento 'seeked', e o loop de raf só busca quando o tempo realmente
            // precisa mudar, então um clipe parado bem no topo do seu ato nunca
            // buscaria, nunca dispararia 'seeked' e nunca substituiria seu poster
            // até o leitor rolá-lo para fora do zero.
            try { V.el.currentTime = Math.max(V.target * (V.el.duration || 1), 0.001); } catch (e) {}
            read();
            // Prepara o decodificador no momento em que o clipe pode ser
            // preparado, sem esperar um gesto. Um play() inline e mudo é permitido
            // sem ativação do usuário em toda plataforma, exceto uma restrita
            // (Modo de Baixo Consumo, economia de dados), e ali a rejeição é
            // inofensiva: os listeners de gesto abaixo tentam de novo no próximo
            // toque real.
            primeClip(V);
          });
          // Revela só depois que um quadro real foi pintado. O iOS mantém em
          // branco um vídeo mudo que sofreu seek mas nunca tocou, então esconder o
          // poster só com os metadados pisca um stage vazio.
          var reveal = function () {
            if (V.painted) return;
            V.painted = true;
            V.host.classList.add('sc-has-clip');
            V.el.classList.add('sc-has-clip');
          };
          V.el.addEventListener('seeked', reveal, { once: true });
          // Nunca deixe a visibilidade depender só de um evento que pode não
          // chegar. No iOS um clipe que não foi tocado pode aceitar um seek e nunca
          // disparar 'seeked', o que deixa o elemento em opacidade 0 pela vida
          // inteira da página: o poster fica no ar, o ato parece travado, e todo
          // ato seguinte fica bem porque até lá o leitor já tocou a tela e o
          // decodificador está vivo. Revela também por timer. Um stage brevemente
          // em branco é uma falha menor que um que nunca mostra seu clipe.
          setTimeout(reveal, 2500);
          V.el.preload = 'auto';
          V.el.muted = true;            // como propriedade, não só como atributo
          V.el.playsInline = true;
          V.objectURL = URL.createObjectURL(blob);
          V.el.src = V.objectURL;
        })
        .catch(function () { V.loading = false; });
    }

    // ---- sequência de imagens ---------------------------------------------
    function loadSeq(a) {
      var S = a.seq;
      if (!S || S.frames.length) return;
      for (var i = 0; i < S.count; i++) {
        (function (i) {
          var img = new Image();
          img.decoding = 'async';
          img.src = S.tpl.replace('{i}', String(S.start + i))
                         .replace('{ii}', String(S.start + i).padStart(2, '0'))
                         .replace('{iii}', String(S.start + i).padStart(3, '0'))
                         .replace('{iiii}', String(S.start + i).padStart(4, '0'));
          img.onload = function () { S.loaded++; if (S.loaded === 1) S.drawn = -1; };
          S.frames[i] = img;
        })(i);
      }
    }
    function drawSeq(a) {
      var S = a.seq;
      if (!S || !S.frames.length) return;
      var idx = clamp(Math.round(a.p * (S.count - 1)), 0, S.count - 1);
      if (idx === S.drawn) return;
      var img = S.frames[idx];
      if (!img || !img.complete || !img.naturalWidth) return;
      var cw = S.el.width, ch = S.el.height;
      // ajuste cover
      var scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      var w = img.naturalWidth * scale, h = img.naturalHeight * scale;
      S.ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      S.drawn = idx;
    }

    // ---- worldflight ------------------------------------------------------
    // t é a posição ao longo do voo, medida em alturas de viewport de scroll,
    // então todo número aqui está na mesma unidade em que o autor escreveu os
    // pesos. Não há geometria por segmento para ler: o stage nunca se move, então
    // nada precisa ser medido no scroll.
    function readWorld(W) {
      if (!W.segs.length) return;
      var S = W.seam;
      var t = clamp((y - W.top) / Math.max(vh, 1), 0, W.total);
      var pr = t / W.total;
      var i, s;

      // A perna atual é a última cujo crossfade já começou.
      var k = 0;
      for (i = 0; i < W.segs.length; i++) if (t >= W.segs[i].c0 - S / 2) k = i;

      for (i = 0; i < W.segs.length; i++) {
        s = W.segs[i];
        var local = clamp01((t - s.c0) / Math.max(s.w, 0.001));
        s.local = local;

        // Baixa uma perna só enquanto ela está ao alcance. Carregar o voo inteiro
        // de antemão são dezenas de megabytes antes do primeiro quadro pintar;
        // carregar na chegada significa chegar a um poster.
        if (s.clip && t > s.c0 - 1.6 && t < s.c1 + 1.6) loadClip(s.clip);

        // Opacidade. A perna que entra faz fade PARA CIMA sobre a que sai, que
        // segura em força total por baixo até ser completamente coberta. Fazer
        // fade nas duas metades de um crossfade é o que deixa o chão da página
        // aparecer no meio da costura e parece um flash.
        var op;
        if (i > k) op = 0;
        else if (i === k) op = i === 0 ? 1 : smooth((t - (s.c0 - S / 2)) / S);
        else op = t < s.c1 + S / 2 ? 1 : 0;

        var z = i === k ? 120 : Math.round(100 + op * 10);
        if (op !== s.op) {
          s.el.style.opacity = op.toFixed(3);
          // Uma perna em zero precisa parar de compor por completo. Seis camadas
          // de vídeo sangradas pintando em opacidade 0 custam o mesmo que pintá-las.
          s.el.style.visibility = op > 0.002 ? 'visible' : 'hidden';
          s.op = op;
        }
        if (z !== s.z) { s.el.style.zIndex = String(z); s.z = z; }

        if (s.clip) {
          s.clip.live = op > 0.002;
          s.clip.target = lingerEase(local, s.linger);
        }
        // Até um quadro real ser pintado, o poster carrega o movimento. Uma imagem
        // parada perfeitamente imóvel enquanto a página rola se anuncia como
        // placeholder; um push-in lento parece a câmera já voando.
        if (s.poster && !reduce && !(s.clip && s.clip.painted) && op > 0.002) {
          s.poster.style.transform = 'scale(' + (1.03 + local * 0.14).toFixed(4) + ')';
        }
      }

      for (var c = 0; c < W.copies.length; c++) {
        var q = W.copies[c];
        var win = Math.max(q.to - q.from, 0.001);
        var inEnd = q.from + win * q.rIn;
        var outStart = q.to - win * q.rOut;
        var vis;
        // Um hero declara rIn 0, então inEnd fica exatamente em `from` e o ramo
        // da rampa é pulado: o bloco simplesmente está presente desde o primeiro pixel.
        if (pr < q.from) vis = 0;
        else if (pr < inEnd) vis = smooth((pr - q.from) / Math.max(inEnd - q.from, 0.001));
        else if (pr <= outStart) vis = 1;
        else vis = smooth(1 - (pr - outStart) / Math.max(q.to - outStart, 0.001));
        vis = clamp01(vis);

        // O ÚNICO transform do lado do texto, e tem teto de 4vh ao longo de toda
        // a janela. Qualquer coisa maior deixa de parecer uma camada de parallax
        // sobre um mundo em movimento e passa a parecer uma segunda página rolando
        // em outra velocidade, que é exatamente a baratice que este modo substitui.
        var wp = clamp01((pr - q.from) / win);
        q.el.style.opacity = vis.toFixed(3);
        q.el.style.transform = reduce ? 'none'
          : 'translate3d(0,' + ((0.5 - wp) * 4).toFixed(2) + 'vh,0)';
        var on = vis > 0.5;
        if (on !== (q.state === 1)) { q.state = on ? 1 : 0; q.el.style.pointerEvents = on ? 'auto' : 'none'; }
      }

      // Publica a rota, não desenha nada dela. Um medidor, um mapa, um contador
      // de pernas e um conjunto de pontos de capítulo são os mesmos dois números,
      // e um runtime que entrega um deles entrega para toda página que usa este modo.
      var cur = W.segs[k];
      W.el.style.setProperty('--sc-seg', String(k));
      W.el.style.setProperty('--sc-segp', cur.local.toFixed(4));
      docEl.style.setProperty('--sc-seg', String(k));
      docEl.style.setProperty('--sc-segp', cur.local.toFixed(4));
      if (k !== W.index) {
        W.index = k;
        try {
          W.el.dispatchEvent(new CustomEvent('sc:waypoint', {
            bubbles: true,
            detail: { index: k, count: W.segs.length, label: cur.label, el: cur.el, progress: pr }
          }));
        } catch (e) {}
      }
    }

    // ---- leitura de scroll por quadro ------------------------------------
    function read() {
      if (scDead) return;
      y = scrollY || pageYOffset;
      var driftA = null, driftB = null, driftT = 0;
      var maxY = Math.max((document.documentElement.scrollHeight || 0) - vh, 1);

      for (var i = 0; i < acts.length; i++) {
        var a = acts[i];
        var raw;
        if (a.pinned) {
          var travel = Math.max(a.height - vh, 1);
          raw = clamp01((y - a.top) / travel);
        } else {
          raw = clamp01((y + vh - a.top) / (a.height + vh));
        }
        a.raw = raw;
        a.p = a.dwell ? dwell(raw, a.dwell) : raw;

        // Tempo do clipe NÃO é tempo da deixa. As deixas pertencem ao pin, então
        // continuam usando `p`. O clipe pertence ao stage, e o stage está na tela
        // por um viewport antes de o pin começar e um depois de ele terminar.
        // Guiar o clipe por `p` portanto o estaciona no quadro um durante todo o
        // deslize de entrada e no último quadro durante todo o deslize de saída,
        // que é uma fotografia parada subindo a tela sob a mão do leitor.
        //
        // Então, em vez disso, mapeie o clipe ao longo de toda a vida visível do
        // stage. As duas pontas são limitadas a scroll que existe de fato: um ato
        // no topo do documento não tem deslize de entrada e ainda precisa começar
        // no quadro um, e um ato perto do fim ainda precisa chegar ao último
        // quadro enquanto a página ainda pode rolar.
        a.vp = a.p;
        if (a.pinned && !a.clipTravel) {
          var startY = a.top - Math.min(vh, a.top);
          var endY = Math.min(a.top + a.height, maxY);
          var vraw = clamp01((y - startY) / Math.max(endY - startY, 1));
          a.vp = a.dwell ? dwell(vraw, a.dwell) : vraw;
        }
        a.live = (y > a.top - vh * 1.25) && (y < a.top + a.height + vh * 1.25);
        a.el.style.setProperty('--sc-p', a.p.toFixed(4));

        // Baixa antes de guiar. Um clipe 1080p são megabytes, e um leitor que
        // rola depressa chegaria, sem isso, a um stage ainda baixando e veria um
        // poster onde o movimento de câmera deveria estar.
        var warm = (y > a.top - vh * 3) && (y < a.top + a.height + vh * 1.5);
        if (warm) {
          if (a.video) loadVideo(a);
          if (a.seq) loadSeq(a);
        }
        if (a.live && a.seq) drawSeq(a);
        if (a.video) { a.video.live = a.live; if (a.video.ready) a.video.target = a.vp; }

        // trilho horizontal
        if (a.rail) {
          var over = a.rail.scrollWidth - vw;
          if (over > 0) {
            var extra = over * (a.railExtra || 0);
            a.rail.style.transform = 'translate3d(' + (-(over + extra) * a.p).toFixed(2) + 'px,0,0)';
          }
        }

        if (!a.live) {
          // Um ato que rola para fora do alcance precisa soltar suas deixas em vez
          // de congelá-las no último estado. Uma deixa de "espera" deixada em
          // opacidade 1 mantém seu elemento clicável e pintável muito depois de o
          // ato ter ido, o que aparece como um título perdido sobre uma seção
          // posterior. Zera uma vez, depois deixa em paz.
          if (a.parked !== true) {
            for (var z = 0; z < a.cues.length; z++) {
              var pq = a.cues[z];
              pq.el.style.opacity = '0';
              pq.el.style.pointerEvents = 'none';
              pq.state = 0;
              if (pq.units) for (var zu = 0; zu < pq.units.length; zu++) pq.units[zu].style.opacity = '0';
            }
            a.parked = true;
          }
          continue;
        }
        a.parked = false;

        // deixas
        for (var c = 0; c < a.cues.length; c++) {
          var q = a.cues[c];
          var vis;
          if (q.to === null) {
            vis = smooth((a.p - q.from) / 0.18);
          } else {
            var win = Math.max(q.to - q.from, 0.001);
            var inEnd = q.from + win * q.rIn;        // opacidade total a partir daqui
            var outStart = q.to - win * q.rOut;      // começa a sair aqui
            if (a.p < inEnd) vis = smooth((a.p - q.from) / Math.max(inEnd - q.from, 0.001));
            else if (a.p <= outStart) vis = 1;       // o platô
            else vis = smooth(1 - (a.p - outStart) / Math.max(q.to - outStart, 0.001));
          }
          vis = clamp01(vis);

          if (q.kinetic) {
            if (!q.units) q.units = splitText(q.el, q.kinetic);
            var n = q.units.length;
            // Escalona ao longo da janela de reveal. Uma distribuição de 0.62
            // deixa a cauda da janela para a última unidade terminar, então a
            // linha pousa junta em vez de pingar.
            for (var u = 0; u < n; u++) {
              var uStart = (u / Math.max(n, 1)) * 0.62;
              var uv = clamp01((vis - uStart) / (1 - 0.62 + 0.001));
              uv = smooth(uv);
              q.units[u].style.opacity = uv.toFixed(3);
              q.units[u].style.transform = reduce ? 'none'
                : 'translate3d(0,' + ((1 - uv) * 100).toFixed(2) + '%,0)';
            }
            q.el.style.opacity = '1';
          } else {
            q.el.style.opacity = vis.toFixed(3);
            q.el.style.transform = reduce ? 'none'
              : 'translate3d(0,' + ((1 - vis) * 2.4 * q.rise).toFixed(2) + 'vh,0)';
          }
          var on = vis > 0.5;
          if (on !== (q.state === 1)) { q.state = on ? 1 : 0; q.el.style.pointerEvents = on ? 'auto' : 'none'; }
        }

        // parallax
        if (!reduce) {
          for (var pz = 0; pz < a.parallax.length; pz++) {
            var pp = a.parallax[pz];
            pp.el.style.transform = 'translate3d(0,' + (pp.rate * (a.p - 0.5) * 100).toFixed(2) + 'px,0)';
          }
        }

        // reveals
        for (var rv = 0; rv < a.reveals.length; rv++) {
          var R = a.reveals[rv];
          var t = smooth((a.p - R.from) / Math.max(R.to - R.from, 0.001));
          var pct = ((1 - t) * 100).toFixed(2);
          R.el.style.clipPath =
            R.dir === 'down' ? 'inset(' + pct + '% 0 0 0)' :
            R.dir === 'left' ? 'inset(0 ' + pct + '% 0 0)' :
            R.dir === 'right' ? 'inset(0 0 0 ' + pct + '%)' :
            R.dir === 'iris' ? 'circle(' + (t * 78).toFixed(2) + '% at 50% 50%)' :
                               'inset(0 0 ' + pct + '% 0)';
        }

        // contadores
        for (var ct = 0; ct < a.counts.length; ct++) {
          var K = a.counts[ct];
          var kt = smooth((a.p - K.from) / Math.max(K.to - K.from, 0.001));
          var val = lerp(K.a, K.b, kt);
          var out = formatNum(val, K.tpl);
          if (out !== K.last) { K.el.textContent = out; K.last = out; }
        }
      }

      for (var w = 0; w < worlds.length; w++) readWorld(worlds[w]);

      // drift do fundo
      for (var d = 0; d < drifts.length; d++) {
        var D = drifts[d];
        if (D.act.raw > 0 && D.act.raw < 1) {
          driftA = D; driftT = smooth(D.act.raw / 0.35);
          driftB = drifts[d - 1] || D;
          break;
        }
        if (D.act.raw >= 1) { driftA = D; driftB = D; driftT = 1; }
      }
      if (driftA) {
        docEl.style.setProperty('--sc-canvas', mixColor(driftB.rgb, driftA.rgb, driftT));
      }

      if (progressBar) {
        var max = Math.max(document.body.scrollHeight - vh, 1);
        progressBar.style.transform = 'scaleX(' + clamp01(y / max).toFixed(4) + ')';
      }
    }

    // ---- loop de seek do vídeo --------------------------------------------
    // Separado de read() de propósito: o seek é assíncrono e limitado pela taxa
    // do decodificador, enquanto read() precisa continuar barato o bastante para
    // rodar em todo evento de scroll. O lerp aqui é também o que transforma uma
    // roda trêmula em um deslize.
    function tick() {
      if (scDead) return;
      // Zona morta. O decodificador de um celular não consegue atender um seek
      // a cada quadro, então pedir um custa mais do que mostra; 20ms de clipe é
      // menos que um quadro de filmagem de qualquer jeito.
      var eps = isMobile() ? 0.02 : 0.008;
      for (var i = 0; i < playheads.length; i++) {
        var V = playheads[i];
        if (!V.ready) continue;
        // Nunca enfileire um seek enquanto o decodificador ainda resolve o
        // último. Em um celular, um gesto rápido do contrário empilha seeks e trava
        // o clipe. Mas um seek que nunca termina travaria o clipe pela vida
        // inteira da página por causa desta mesma guarda, então um seek preso por
        // mais de 700ms é reemitido em vez de esperado para sempre.
        if (V.el.seeking) {
          var nw = performance.now();
          if (!V.stuckAt) V.stuckAt = nw;
          else if (nw - V.stuckAt > 700) {
            V.stuckAt = nw;
            try { V.el.currentTime = V.el.currentTime + 0.001; } catch (e) {}
          }
          continue;
        }
        V.stuckAt = 0;
        // Um clipe fora da tela que já chegou deixa de custar qualquer coisa.
        if (!V.live && Math.abs(V.cur - V.target) < 0.002) continue;
        V.cur += (V.target - V.cur) * (reduce ? 1 : V.lerp);
        var dur = V.el.duration || 1;
        var t = clamp(V.cur, 0, 0.999) * dur;
        if (Math.abs(V.el.currentTime - t) > eps) { try { V.el.currentTime = t; } catch (e) {} }
      }
      scTickFrame = requestAnimationFrame(tick);
    }

    // O iOS não pinta um vídeo mudo que nunca recebeu um gesto do usuário, então
    // um clipe pode ser carregado, sofrer seek e ainda não mostrar nada.
    //
    // Isto costumava disparar uma vez, no primeiro toque, em todos os playheads.
    // Isso perde uma corrida que não tem como vencer. O clipe do primeiro ato
    // ainda está sendo baixado quando o primeiro toque do leitor chega (ele toca
    // a tela para rolar, e o clipe são megabytes), então play() é chamado em um
    // vídeo sem fonte, não faz nada, e a única chance é gasta. Todo ato seguinte
    // carrega muito depois desse toque, com a ativação do usuário já concedida, e
    // funciona sem nunca precisar disto. Esse é exatamente o formato do bug: o
    // hero travado, tudo abaixo dele bem.
    //
    // Então: continue ouvindo, prepare cada clipe assim que ele realmente tiver
    // uma fonte, e pare só quando todos estiverem prontos. E force um seek
    // depois, porque um decodificador preparado ainda mostra o quadro velho até
    // algo pedir outro tempo, e a zona morta em tick() não vai pedir se o
    // playhead já está onde deveria.
    var primedCount = 0;
    function primeClip(V) {
      // priming protege a nova tentativa: play() é uma promise, e chamá-lo de
      // novo enquanto o último ainda não resolveu produz "interrupted by pause" e
      // pode deixar o elemento tocando.
      if (V.primed || V.priming || !V.el.src) return;
      V.priming = true;
      var done = function () {
        V.priming = false;
        if (!V.primed) { V.primed = true; primedCount++; }
        try { V.el.pause(); } catch (e) {}
        // repintura: empurra além da zona morta para o próximo tick escrever de verdade
        try {
          var dur = V.el.duration || 1;
          V.cur = clamp(V.cur, 0, 0.999);
          V.el.currentTime = clamp(V.cur * dur + 0.05, 0, dur * 0.999);
        } catch (e) {}
      };
      var fail = function () { V.priming = false; };
      // Uma promise de play() pode ficar pendente para sempre (o iOS faz isso com
      // um vídeo que decidiu não iniciar). Se isso acontecesse aqui, `priming`
      // travaria e nenhum gesto conseguiria tentar de novo, então a flag também é
      // liberada por timer. Uma resolução tardia depois da liberação ainda cai em
      // done(), que é idempotente.
      setTimeout(function () { if (V.priming) fail(); }, 2000);
      var pr;
      try { pr = V.el.play(); } catch (e) { fail(); return; }
      if (pr && pr.then) pr.then(done, fail);
      else done();
    }
    function prime() {
      for (var i = 0; i < playheads.length; i++) primeClip(playheads[i]);
      if (playheads.length && primedCount >= playheads.length) {
        removeEventListener('touchstart', prime);
        removeEventListener('touchend', prime);
        removeEventListener('pointerdown', prime);
        removeEventListener('click', prime);
        removeEventListener('scroll', prime);
      }
    }
    // touchend e click estão aqui porque a lista de eventos que disparam
    // ativação na especificação HTML inclui touchend mas NÃO touchstart. Um
    // aparelho restrito (Modo de Baixo Consumo) que rejeita a preparação no
    // touchstart por falta de ativação ganha uma segunda chance válida no momento
    // em que o dedo levanta.
    on('touchstart', prime, { passive: true });
    on('touchend', prime, { passive: true });
    on('pointerdown', prime, { passive: true });
    on('click', prime, { passive: true });
    on('scroll', prime, { passive: true });

    // ---- dispositivos de ponteiro -----------------------------------------
    var tilts = [], magnets = [], spots = [];
    function initPointer() {
      if (reduce || !fineMQ.matches) return;
      Array.prototype.forEach.call(root.querySelectorAll('[data-sc-tilt]'), function (el) {
        tilts.push({ el: el, max: parseFloat(el.getAttribute('data-sc-tilt')) || 6, x: 0, ty: 0, tx: 0, y: 0 });
      });
      Array.prototype.forEach.call(root.querySelectorAll('[data-sc-magnet]'), function (el) {
        magnets.push({ el: el, k: parseFloat(el.getAttribute('data-sc-magnet')) || 0.3, x: 0, y: 0, tx: 0, ty: 0 });
      });
      Array.prototype.forEach.call(root.querySelectorAll('[data-sc-spotlight]'), function (el) {
        spots.push(el);
      });
      if (!tilts.length && !magnets.length && !spots.length) return;

      on('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        for (var i = 0; i < tilts.length; i++) {
          var T = tilts[i], r = T.el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) { T.tx = 0; T.ty = 0; continue; }
          var nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
          var ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
          var inside = Math.abs(nx) < 1.6 && Math.abs(ny) < 1.6;
          T.tx = inside ? clamp(ny, -1, 1) * -T.max : 0;
          T.ty = inside ? clamp(nx, -1, 1) * T.max : 0;
        }
        for (var m = 0; m < magnets.length; m++) {
          var M = magnets[m], mr = M.el.getBoundingClientRect();
          var dx = e.clientX - (mr.left + mr.width / 2);
          var dy = e.clientY - (mr.top + mr.height / 2);
          var near = Math.abs(dx) < mr.width && Math.abs(dy) < mr.height * 2.5;
          M.tx = near ? dx * M.k : 0;
          M.ty = near ? dy * M.k : 0;
        }
        for (var s = 0; s < spots.length; s++) {
          var sr = spots[s].getBoundingClientRect();
          spots[s].style.setProperty('--sc-mx', clamp01((e.clientX - sr.left) / sr.width).toFixed(3));
          spots[s].style.setProperty('--sc-my', clamp01((e.clientY - sr.top) / sr.height).toFixed(3));
        }
      }, { passive: true });

      (function pointerTick() {
        if (scDead) return;
        // Interpola em direção ao alvo em vez de seguir o ponteiro diretamente.
        // O rastreio direto parece artificial porque não carrega inércia; o lerp
        // dá peso a ele.
        for (var i = 0; i < tilts.length; i++) {
          var T = tilts[i];
          T.x += (T.tx - T.x) * 0.09; T.y += (T.ty - T.y) * 0.09;
          if (Math.abs(T.x) > 0.001 || Math.abs(T.y) > 0.001) {
            T.el.style.transform = 'perspective(1100px) rotateX(' + T.x.toFixed(3) + 'deg) rotateY(' + T.y.toFixed(3) + 'deg)';
          }
        }
        for (var m = 0; m < magnets.length; m++) {
          var M = magnets[m];
          M.x += (M.tx - M.x) * 0.12; M.y += (M.ty - M.y) * 0.12;
          M.el.style.transform = 'translate3d(' + M.x.toFixed(2) + 'px,' + M.y.toFixed(2) + 'px,0)';
        }
        scPointerFrame = requestAnimationFrame(pointerTick);
      })();
    }

    // ---- ligações ---------------------------------------------------------
    var ticking = false;
    on('scroll', function () {
      if (scDead) return;
      if (!ticking) { ticking = true; requestAnimationFrame(function () { if (!scDead) read(); ticking = false; }); }
    }, { passive: true });

    // Foco de teclado em um ato pinado ou de pan. O scroll-into-view do próprio
    // navegador estaciona o elemento focado mal entrando na tela, que é
    // exatamente a posição de scroll em que a deixa dele ainda não abriu, então o
    // foco cai em um controle que ninguém vê e toda verificação automatizada de
    // opacidade ainda passa. Centralizar o ato, em vez disso, é uma posição em
    // que a deixa está acesa por definição. behavior:'instant' de propósito:
    // scrollcraft.css define scroll-behavior:smooth, então o padrão anima o salto
    // e o foco fica fora da tela durante todo um deslize de várias telas.
    on('focusin', function (e) {
      var el = e.target;
      if (!el || !el.closest) return;
      var act = el.closest('[data-sc-act]');
      if (!act || !root.contains(act)) return;
      var cue = el.closest('[data-sc-cue]');
      if (!cue) return;
      if (parseFloat(getComputedStyle(cue).opacity || '1') > 0.85) return;
      el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
    });

    var lastW = innerWidth;
    on('resize', function () {
      // Ignora mudanças de altura causadas só pela barra de URL nos celulares.
      // Refazer o layout nelas faz a página pular sob o dedo do leitor sem motivo.
      if (scDead) return;
      if (innerWidth === lastW && isMobile()) { vh = innerHeight; return; }
      lastW = innerWidth;
      layout();
    }, { passive: true });

    if (document.fonts && document.fonts.ready) {
      // A divisão em linhas mede caixas de linha, então precisa esperar a fonte real.
      document.fonts.ready.then(function () {
        if (scDead) return;
        acts.forEach(function (a) { a.cues.forEach(function (q) { if (q.kinetic && q.units) { q.el.__scSplit = null; q.units = null; } }); });
        layout();
      });
    }

    layout();
    initPointer();
    scTickFrame = requestAnimationFrame(tick);
    document.documentElement.classList.add('sc-ready');

    var api = { layout: layout, read: read, acts: acts, worlds: worlds, clips: playheads, lerp: LERP };
    // Idempotente: uma segunda chamada é no-op, porque o hook de desmontagem de
    // um framework pode rodar depois de o elemento já ter sumido.
    api.destroy = function () {
      if (scDead) return;
      scDead = true;
      for (var i = 0; i < scListeners.length; i++) {
        removeEventListener(scListeners[i][0], scListeners[i][1], scListeners[i][2]);
      }
      scListeners.length = 0;
      if (scTickFrame) { cancelAnimationFrame(scTickFrame); scTickFrame = 0; }
      if (scPointerFrame) { cancelAnimationFrame(scPointerFrame); scPointerFrame = 0; }
      // Os dois observers, ou todo elemento que eles ainda observam continua alcançável.
      if (io) { io.disconnect(); io = null; }
      if (cio) { cio.disconnect(); cio = null; }
      // Uma blob URL é uma referência, pela vida do documento, a um clipe inteiro
      // decodificado, então uma não liberada é a maior coisa que uma remontagem
      // pode vazar. Desanexar a fonte exige o par removeAttribute + load():
      // revogar sozinho deixa o elemento segurando o recurso.
      for (var v = 0; v < playheads.length; v++) {
        var V = playheads[v];
        try { V.el.pause(); } catch (e) {}
        if (V.objectURL) {
          try { V.el.removeAttribute('src'); V.el.load(); } catch (e) {}
          URL.revokeObjectURL(V.objectURL);
          V.objectURL = null;
        }
      }
      var at = global.ScrollCraft.instances.indexOf(api);
      if (at !== -1) global.ScrollCraft.instances.splice(at, 1);
      // Global ao documento, enquanto a instância não é: só a última a sair a
      // remove, ou um segundo stage na página perde sua guarda de sem-transição.
      if (!global.ScrollCraft.instances.length) {
        document.documentElement.classList.remove('sc-ready');
      }
    };
    global.ScrollCraft.instances.push(api);
    return api;
  }

  // A lista de instâncias não é uma API para a página. É como o harness de
  // verificação lê os registros reais do playhead: uma captura de tela tirada no
  // meio do lerp é um quadro que a página nunca segura de fato, então o harness
  // precisa poder perguntar se o playhead chegou em vez de chutar com um timeout.
  global.ScrollCraft = { mount: mount, reduce: reduce, instances: [] };
})(window);
