(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var voo = document.getElementById('inicio');
  var segs = Array.prototype.map.call(voo.querySelectorAll('[data-sc-segment]'), function (s) { return parseFloat(s.getAttribute('data-sc-w')) || 1.3; });
  var c0 = []; var total = 0; segs.forEach(function (w) { c0.push(total); total += w; });

  // A api fica em window.__sc para os scripts de verificação da skill (worldflight-assert).
  window.__sc = ScrollCraft.mount(document.body);

  // O espaçador é dimensionado uma vez; um resize depois das fontes e do load mede de novo (worldflight.md §7b).
  function relayout() { dispatchEvent(new Event('resize')); }
  addEventListener('load', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);

  // ---- o mapa ----------------------------------------------------------
  var botoes = document.querySelectorAll('.rota button');
  // Cada waypoint leva ao ponto do trilho em que o bloco de texto daquela perna
  // já está em opacidade total (logo depois da rampa de entrada da janela), e não
  // ao começo da perna, onde o quadro ainda está no degradê de chegada.
  function topoDaPerna(i) {
    var base = voo.getBoundingClientRect().top + scrollY;
    var copias = (window.__sc && window.__sc.worlds && window.__sc.worlds[0]) ? window.__sc.worlds[0].copies : [];
    var q = copias[i];
    var pr;
    if (i === 0 || !q) pr = 0;
    else {
      var win = q.to - q.from;
      var inEnd = q.from + win * q.rIn;
      var outStart = q.to - win * q.rOut;
      pr = inEnd + (outStart - inEnd) * 0.2;
    }
    return base + pr * total * innerHeight;
  }
  botoes.forEach(function (b) {
    b.addEventListener('click', function () {
      scrollTo({ top: topoDaPerna(+b.getAttribute('data-perna')), behavior: reduce ? 'auto' : 'smooth' });
    });
  });
  document.querySelector('.marca').addEventListener('click', function (e) { e.preventDefault(); scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  addEventListener('sc:waypoint', function (e) {
    botoes.forEach(function (b) { b.setAttribute('aria-current', String(+b.getAttribute('data-perna') === e.detail.index)); });
  });

  // ---- o telefone que você conduz ----------------------------------------
  var fone = document.getElementById('fone');
  var lista = document.getElementById('fone-lista');
  var campo = document.getElementById('fone-campo');
  var enviar = document.getElementById('fone-enviar');
  var nome = document.getElementById('fone-nome');
  var status = document.getElementById('fone-status');
  var avatar = document.getElementById('fone-avatar');

  // Conversa ilustrativa (clínica odontológica). O texto é HTML de verdade.
  var ROTEIRO = [
    { em: 0, de: 'eles', t: 'Oi, boa tarde! Vocês têm horário pra limpeza essa semana?', h: '12:47' },
    { em: 0.040, de: 'sistema', t: 'Recepção no almoço. Ninguém viu a mensagem.' },
    { em: 0.075, de: 'nos', t: 'Boa tarde, Carla! Temos sim. Quinta às 15h ou sexta às 9h30. Qual prefere?', h: '12:47' },
    { em: 0.110, de: 'eles', t: 'Sexta às 9h30, por favor.', h: '12:49' },
    { em: 0.140, de: 'nos', t: 'Fechado: sexta, 16/10, às 9h30 com a Dra. Ana. Eu te lembro um dia antes.', h: '12:49' },
    { em: 0.215, de: 'ok', t: 'Agendamento confirmado na agenda da clínica.' },
    { em: 0.300, de: 'nos', t: 'Oi, Carla. Lembrete da sua limpeza amanhã às 9h30. Posso confirmar?', h: 'qui 08:00' },
    { em: 0.340, de: 'eles', t: 'Confirmado!', h: 'qui 08:12' },
    { em: 0.480, de: 'nos', t: 'Perfeito. Até amanhã. Se precisar remarcar, é só me dizer por aqui.', h: 'qui 08:12' },
    { em: 0.680, de: 'ok', t: 'Paciente atendida, agendada e lembrada. Nenhuma mensagem perdida.' }
  ];
  var ROTEIRO_FIM = [
    { em: 0.845, de: 'eles', t: 'Oi! Sou o agente da Automatize.AI. Me conta como é o atendimento no seu negócio hoje?', h: 'agora' }
  ];
  function msg(m) {
    var el = document.createElement('div');
    el.className = 'msg ' + (m.de === 'eles' ? 'msg--eles' : m.de === 'nos' ? 'msg--nos' : 'msg--sistema' + (m.de === 'ok' ? ' msg--ok' : ''));
    el.textContent = m.t;
    if (m.h) { var tm = document.createElement('time'); tm.textContent = m.h; el.appendChild(tm); }
    return el;
  }
  var nosFim = false;
  var mostrados = -1;
  function montar(roteiro, ate) {
    lista.innerHTML = '';
    roteiro.forEach(function (m) { if (m.em <= ate) { var el = msg(m); lista.appendChild(el); requestAnimationFrame(function () { el.classList.add('on'); }); } });
  }
  function atualizarConversa(pr) {
    var fim = pr >= 0.82;
    if (fim !== nosFim) {
      nosFim = fim; mostrados = -1;
      nome.textContent = fim ? 'Automatize.AI' : 'Clínica Sorriso (exemplo)';
      status.textContent = fim ? 'nosso agente · responde na hora' : 'Gestor de Atendimento · online';
      avatar.innerHTML = fim ? '<img src="assets/simbolo.svg" alt="">' : '<span style="font:600 .8rem Inter;color:#07121E">C</span>';
      document.getElementById('fone-rotulo').textContent = fim ? 'Esta conversa é real: abre o nosso WhatsApp' : 'Conversa ilustrativa';
      fone.classList.toggle('ativo', fim);
      enviar.setAttribute('tabindex', fim ? '0' : '-1');
      if (fim) { campo.textContent = 'Quero saber como funciona no meu negócio'; campo.classList.remove('vazio'); }
      else { campo.textContent = 'Mensagem'; campo.classList.add('vazio'); }
    }
    var rot = fim ? ROTEIRO_FIM : ROTEIRO;
    var n = 0; rot.forEach(function (m) { if (m.em <= pr) n++; });
    if (n !== mostrados) { mostrados = n; montar(rot, pr); }
  }

  // Posição do telefone por perna: [x em fração da largura, y em fração da altura, escala]
  var mobile = matchMedia('(max-width: 860px)');
  function alvo(pr) {
    var m = mobile.matches;
    var P = m
      ? [[0.5, 0.36, 1], [0.78, 0.26, 0.5], [0.78, 0.26, 0.5], [0.78, 0.26, 0.5], [0.5, 0.25, 0.78]]
      : [[0.74, 0.5, 1], [0.87, 0.24, 0.56], [0.87, 0.24, 0.56], [0.87, 0.24, 0.56], [0.72, 0.5, 1]];
    // qual perna e quanto dentro dela
    var t = pr * total, i = 0; while (i < c0.length - 1 && t >= c0[i + 1]) i++;
    var local = (t - c0[i]) / segs[i];
    var a = P[i], b = P[Math.min(i + 1, P.length - 1)];
    // a troca de posição acontece nos últimos 22% de cada perna
    var k = i === P.length - 1 ? 0 : Math.max(0, (local - 0.78) / 0.22); k = k * k * (3 - 2 * k);
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  }
  var ultimo = '';
  function pintar() {
    var cs = getComputedStyle(document.documentElement);
    var seg = parseInt(cs.getPropertyValue('--sc-seg')) || 0;
    var segp = parseFloat(cs.getPropertyValue('--sc-segp')) || 0;
    var pr = Math.min(1, (c0[seg] + segp * segs[seg]) / total);
    var p = alvo(pr);
    var fw = fone.offsetWidth, fh = fone.offsetHeight;
    var x = p[0] * innerWidth - fw / 2, y = p[1] * innerHeight - fh / 2;
    var tr = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + p[2].toFixed(3) + ')';
    if (tr !== ultimo) { fone.style.transform = tr; ultimo = tr; }
    atualizarConversa(pr);
    requestAnimationFrame(pintar);
  }
  requestAnimationFrame(pintar);

  // ---- os números sobem uma vez, quando o bloco de resultados está legível ----
  var contados = false;
  var bloco = document.querySelector('.copy--resultados');
  var fmt = function (v, dec) { return v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
  function contar() {
    document.querySelectorAll('[data-conta]').forEach(function (el) {
      var alvoTxt = el.getAttribute('data-conta');
      var dec = alvoTxt.indexOf(',') >= 0 ? 1 : 0;
      var fimV = parseFloat(alvoTxt.replace(/\./g, '').replace(',', '.'));
      if (reduce) { el.textContent = fmt(fimV, dec); return; }
      var t0 = null;
      function q(now) {
        if (t0 === null) t0 = now;
        var u = Math.min((now - t0) / 1400, 1); var e = 1 - Math.pow(1 - u, 3);
        el.textContent = fmt(fimV * e, dec);
        if (u < 1) requestAnimationFrame(q);
      }
      requestAnimationFrame(q);
    });
  }
  (function vigiar() {
    if (!contados && parseFloat(bloco.style.opacity || 0) > 0.5) { contados = true; contar(); return; }
    requestAnimationFrame(vigiar);
  })();

  document.getElementById('ano').textContent = String(new Date().getFullYear());
})();
