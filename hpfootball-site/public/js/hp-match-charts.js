/* HPAnalytic match charts: momentum, proxy ball-circulation network,
   team percentile radar and player percentile radar.
   Data comes from a <script type="application/json" id="hpc-data"> block on the page.
   Evidence rules (HPA-LOZA): no pass arrows without a verified receiver; colour never
   carries meaning alone (team B is also dashed); every figure states its class. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var dataEl = document.getElementById('hpc-data');
  if (!dataEl) return;
  var D;
  try { D = JSON.parse(dataEl.textContent); } catch (e) { return; }
  var C = D.colors; // {a, b, opp, ink, mute, line}

  function el(tag, attrs, parent, text) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    if (text !== undefined) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }
  function clear(svg) { while (svg.lastChild) svg.removeChild(svg.lastChild); }
  // px -> viewBox units so labels stay ~the same on-screen size at every width
  function px(svg, vbW, size) {
    var w = svg.getBoundingClientRect().width || vbW;
    return size * vbW / Math.max(300, w);
  }
  var redraws = [];
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { redraws.forEach(function (f) { f(); }); }, 200); });
  function surname(p) { var s = String(p).split(' '); return s.length > 1 ? s.slice(1).join(' ') : p; }
  function pressGroup(root, onPick) {
    var btns = root.querySelectorAll('button[data-k]');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        onPick(b.getAttribute('data-k'), b);
      });
    });
  }

  /* ---------- 1. Momentum ---------- */
  function momentum(fig) {
    var svg = fig.querySelector('svg'), out = fig.querySelector('.hpc-readout');
    var cur;
    function draw(key) {
      cur = key;
      var m = D.mom[key], meta = D.momMeta[key];
      clear(svg);
      var narrow = (svg.getBoundingClientRect().width || 760) < 600;
      var W = narrow ? 420 : 760, f = px(svg, W, 13), H = Math.round(W * (narrow ? .62 : .36) + f * 4), L = f * .6, R = f * .6, T = f * 2.2, B = f * 3.6, mid = T + (H - T - B) / 2;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      var n = m.v.length, maxAbs = Math.max(4, Math.max.apply(null, m.v.map(Math.abs)));
      var x = function (min) { return L + (W - L - R) * Math.min(min, 96) / 96; };
      var y = function (v) { return mid - (v / maxAbs) * ((H - T - B) / 2 - 6); };
      el('rect', { x: L, y: T, width: W - L - R, height: (mid - T), fill: meta.teamColor, opacity: .07 }, svg);
      [15, 30, 45, 60, 75, 90].forEach(function (t) {
        el('line', { x1: x(t), x2: x(t), y1: T, y2: H - B, stroke: C.line, 'stroke-width': t === 45 ? 1.4 : .8, 'stroke-dasharray': t === 45 ? '' : '2 4' }, svg);
        el('text', { x: x(t), y: H - B + f * 1.3, 'text-anchor': 'middle', fill: C.mute, 'font-size': f }, svg, t + "'");
      });
      el('text', { x: x(45) + f * .3, y: T + f, fill: C.mute, 'font-size': f * .9 }, svg, 'Devre');
      el('line', { x1: L, x2: W - R, y1: mid, y2: mid, stroke: C.ink, 'stroke-width': 1, opacity: .5 }, svg);
      var up = 'M' + x(0) + ' ' + mid, dn = 'M' + x(0) + ' ' + mid;
      for (var i = 0; i < n; i++) {
        var cx = x((i + .5) * m.bin), v = m.v[i];
        up += ' L' + cx + ' ' + y(Math.max(v, 0));
        dn += ' L' + cx + ' ' + y(Math.min(v, 0));
      }
      up += ' L' + x(96) + ' ' + mid + ' Z'; dn += ' L' + x(96) + ' ' + mid + ' Z';
      el('path', { d: up, fill: meta.teamColor, opacity: .85 }, svg);
      el('path', { d: dn, fill: C.opp, opacity: .75 }, svg);
      el('text', { x: L, y: T - f * .6, fill: C.ink, 'font-size': f, 'font-weight': 600 }, svg, '▲ ' + meta.team + ' baskın');
      el('text', { x: L, y: H - f * .5, fill: C.ink, 'font-size': f, 'font-weight': 600 }, svg, '▼ ' + meta.opp + ' baskın');
      m.goals.forEach(function (g) {
        var mine = g.t === meta.teamKey, gx = x(g.m), gy = mine ? T + 2 : H - B - 2;
        var gy2 = mine ? y(maxAbs * .9) : y(-maxAbs * .9);
        el('circle', { cx: gx, cy: gy2, r: f * .55, fill: 'none', stroke: mine ? meta.teamColor : C.ink, 'stroke-width': f * .15 }, svg);
        el('circle', { cx: gx, cy: gy2, r: f * .2, fill: mine ? meta.teamColor : C.ink }, svg);
        el('title', {}, svg.lastChild, 'Gol ' + Math.ceil(g.m) + "' · " + g.p);
      });
      out.innerHTML = meta.read;
    }
    pressGroup(fig, draw);
    draw(fig.querySelector('button[aria-pressed="true"]').getAttribute('data-k'));
    redraws.push(function () { draw(cur); });
  }

  /* ---------- pitch ---------- */
  function pitch(svg, pad) {
    var g = el('g', { fill: 'none', stroke: C.line, 'stroke-width': .35 }, svg);
    el('rect', { x: 0, y: 0, width: 105, height: 68 }, g);
    el('line', { x1: 52.5, x2: 52.5, y1: 0, y2: 68 }, g);
    el('circle', { cx: 52.5, cy: 34, r: 9.15 }, g);
    el('rect', { x: 0, y: 13.84, width: 16.5, height: 40.32 }, g);
    el('rect', { x: 88.5, y: 13.84, width: 16.5, height: 40.32 }, g);
    el('rect', { x: 0, y: 24.84, width: 5.5, height: 18.32 }, g);
    el('rect', { x: 99.5, y: 24.84, width: 5.5, height: 18.32 }, g);
    [35, 70].forEach(function (z) { el('line', { x1: z, x2: z, y1: 0, y2: 68, 'stroke-dasharray': '1 1.4', opacity: .7 }, g); });
    return g;
  }

  /* ---------- 2. Proxy network ---------- */
  function network(fig) {
    var svg = fig.querySelector('svg'), out = fig.querySelector('.hpc-readout');
    var cur;
    function draw(key) {
      cur = key;
      var N = D.net[key], meta = D.netMeta[key], col = meta.color;
      clear(svg);
      svg.setAttribute('viewBox', '-3 -3 111 80');
      var f = px(svg, 111, 12);
      pitch(svg);
      el('text', { x: 52.5, y: 74.5, 'text-anchor': 'middle', fill: C.mute, 'font-size': f }, svg, meta.team + ' hücum yönü →');
      var pos = {}; N.nodes.forEach(function (n) { pos[n.p] = n; });
      var maxW = Math.max.apply(null, N.edges.map(function (e) { return e.w; }));
      var maxP = Math.max.apply(null, N.nodes.map(function (n) { return n.pass; })) || 1;
      var eg = el('g', {}, svg), ng = el('g', {}, svg), edgeEls = [], labels = [];
      N.edges.slice(0, 22).forEach(function (e) {
        var a = pos[e.a], b = pos[e.b];
        var ln = el('line', { x1: a.x, y1: 68 - a.y, x2: b.x, y2: 68 - b.y, stroke: col, 'stroke-width': .25 + 1.6 * Math.sqrt(e.w / maxW), 'stroke-linecap': 'round', opacity: .25 + .6 * Math.sqrt(e.w / maxW) }, eg);
        el('title', {}, ln, surname(e.a) + ' ↔ ' + surname(e.b) + ': ' + e.w);
        edgeEls.push({ el: ln, e: e });
      });
      function focus(p) {
        edgeEls.forEach(function (o) {
          var on = !p || o.e.a === p || o.e.b === p;
          o.el.style.opacity = on ? '' : '.06';
        });
        if (!p) { out.innerHTML = meta.read; return; }
        var mine = N.edges.filter(function (e) { return e.a === p || e.b === p; }).slice(0, 3)
          .map(function (e) { return '<b>' + surname(e.a === p ? e.b : e.a) + '</b> (' + e.w + ')'; });
        out.innerHTML = '<b>' + p + '</b>: ' + pos[p].pass + ' isabetli pas. En sık tahmini bağlantılar: ' + (mine.join(', ') || 'eşik altında') + '.';
      }
      N.nodes.forEach(function (n) {
        var r = f * (.75 + .75 * Math.sqrt(n.pass / maxP));
        var g = el('g', { tabindex: 0, role: 'button', 'aria-label': n.p + ', ' + n.pass + ' isabetli pas', style: 'cursor:pointer' }, ng);
        el('circle', { cx: n.x, cy: 68 - n.y, r: r, fill: '#0B1530', stroke: col, 'stroke-width': .7 }, g);
        el('text', { x: n.x, y: 68 - n.y + f * .36, 'text-anchor': 'middle', fill: C.ink, 'font-size': f, 'font-weight': 700 }, g, n.num || '');
        var lb = el('text', { x: n.x, y: 68 - n.y + r + f * .95, 'text-anchor': 'middle', fill: C.ink, 'font-size': f * .85, stroke: '#0B1530', 'stroke-width': f * .25, 'paint-order': 'stroke' }, g, surname(n.p));
        labels.push({ el: lb, x: n.x, y: 68 - n.y + r + f * .6, w: surname(n.p).length * f * .47, h: f * .9, pass: n.pass });
        var on = false;
        function t() { on = !on; ng.querySelectorAll('g').forEach(function (x) { x.style.opacity = ''; }); focus(on ? n.p : null); }
        g.addEventListener('click', t);
        g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); t(); } });
      });
      // hide name labels that would collide; numbers + key below stay
      var placed = [];
      labels.sort(function (a, b) { return b.pass - a.pass; }).forEach(function (L) {
        var hit = placed.some(function (P) { return Math.abs(P.x - L.x) < (P.w + L.w) / 2 && Math.abs(P.y - L.y) < (P.h + L.h) / 2; });
        if (hit) L.el.style.display = 'none'; else placed.push(L);
      });
      var key = fig.querySelector('.hpc-numkey');
      if (!key) { key = document.createElement('p'); key.className = 'hpc-numkey hpc-n'; fig.querySelector('.figure').after(key); }
      key.textContent = N.nodes.slice().sort(function (a, b) { return (+a.num || 0) - (+b.num || 0); }).map(function (n) { return n.num + ' ' + surname(n.p); }).join(' · ');
      focus(null);
    }
    pressGroup(fig, draw);
    draw(fig.querySelector('button[aria-pressed="true"]').getAttribute('data-k'));
    redraws.push(function () { draw(cur); });
  }

  /* ---------- radar ---------- */
  function radar(svg, axes, series) {
    clear(svg);
    var Wd = 540, Ht = 470, cx = Wd / 2, cy = Ht / 2 + 2, n = axes.length;
    svg.setAttribute('viewBox', '0 0 ' + Wd + ' ' + Ht);
    var f = Math.min(px(svg, Wd, 13), 20), R = 190 - f * 3.2;
    var ang = function (i) { return -Math.PI / 2 + i * 2 * Math.PI / n; };
    var pt = function (i, v) { return [cx + Math.cos(ang(i)) * R * v / 100, cy + Math.sin(ang(i)) * R * v / 100]; };
    [25, 50, 75, 100].forEach(function (lv) {
      var d = axes.map(function (_, i) { return (i ? 'L' : 'M') + pt(i, lv).join(' '); }).join(' ') + 'Z';
      el('path', { d: d, fill: 'none', stroke: C.line, 'stroke-width': lv === 50 ? 1.3 : .8, 'stroke-dasharray': lv === 50 ? '4 4' : '' }, svg);
    });
    el('text', { x: cx + 4, y: cy - R / 2 - 3, fill: C.mute, 'font-size': f * .8 }, svg, 'medyan');
    axes.forEach(function (a, i) {
      var e = pt(i, 100), l = pt(i, 100 + f * 1.1 * 100 / R);
      el('line', { x1: cx, y1: cy, x2: e[0], y2: e[1], stroke: C.line, 'stroke-width': .8 }, svg);
      var anchor = Math.abs(l[0] - cx) < 12 ? 'middle' : (l[0] > cx ? 'start' : 'end');
      var words = a.split(' '), lines = [];
      words.forEach(function (w) { var last = lines[lines.length - 1]; if (last && (last + ' ' + w).length <= 13) lines[lines.length - 1] = last + ' ' + w; else lines.push(w); });
      lines.forEach(function (ln, j) {
        el('text', { x: l[0], y: l[1] + f * .35 + (j - (lines.length - 1) / 2) * f * 1.15, 'text-anchor': anchor, fill: C.ink, 'font-size': f }, svg, ln);
      });
    });
    series.forEach(function (s) {
      var d = s.v.map(function (v, i) { return (i ? 'L' : 'M') + pt(i, Math.max(v, 3)).join(' '); }).join(' ') + 'Z';
      el('path', { d: d, fill: s.color, 'fill-opacity': s.dash ? .08 : .22, stroke: s.color, 'stroke-width': f * .2, 'stroke-dasharray': s.dash ? '7 5' : '', 'stroke-linejoin': 'round' }, svg);
      s.v.forEach(function (v, i) {
        var p = pt(i, Math.max(v, 3));
        var q = f * .32;
        var mk = s.dash ? el('rect', { x: p[0] - q, y: p[1] - q, width: q * 2, height: q * 2, fill: '#0B1530', stroke: s.color, 'stroke-width': f * .14 }, svg)
          : el('circle', { cx: p[0], cy: p[1], r: q * 1.1, fill: s.color }, svg);
        el('title', {}, mk, s.name + ' · ' + axes[i] + ': ' + v + '. yüzdelik');
      });
    });
  }

  /* ---------- 3. Team radar ---------- */
  function teamRadar(fig) {
    var svg = fig.querySelector('svg'), tbl = fig.querySelector('.hpc-table');
    var T = D.team, axes = T.axes.map(function (a) { return a.r || a.l; }), cur = 'ab';
    function draw(key) {
      cur = key;
      var s = [];
      if (key !== 'b') s.push({ name: D.names.a, v: T.teams[D.keys.a].map(function (x) { return x.pct; }), color: C.a });
      if (key !== 'a') s.push({ name: D.names.b, v: T.teams[D.keys.b].map(function (x) { return x.pct; }), color: C.b, dash: true });
      radar(svg, axes, s);
    }
    var rows = T.axes.map(function (a, i) {
      var A = T.teams[D.keys.a][i], B = T.teams[D.keys.b][i];
      var f = function (v) { return a.k === 'poss' ? Math.round(v * 100) + '%' : String(v).replace('.', ','); };
      return '<tr><th scope="row">' + a.l + (a.hb ? '' : ' <small>(düşük iyi)</small>') + '</th><td>' + f(A.v) + ' <small>' + A.pct + '.</small></td><td>' + f(B.v) + ' <small>' + B.pct + '.</small></td></tr>';
    }).join('');
    tbl.innerHTML = '<thead><tr><th></th><th>' + D.names.a + '</th><th>' + D.names.b + '</th></tr></thead><tbody>' + rows + '</tbody>';
    pressGroup(fig, draw);
    draw('ab');
    redraws.push(function () { draw(cur); });
  }

  /* ---------- 4. Player radar ---------- */
  function playerRadar(fig) {
    var svg = fig.querySelector('svg'), grpBox = fig.querySelector('.hpc-groups'), pa = fig.querySelector('.hpc-pa'), pb = fig.querySelector('.hpc-pb'), out = fig.querySelector('.hpc-readout');
    var P = D.players, groups = Object.keys(P.groups), sel = { a: null, b: null }, cur = null;
    grpBox.innerHTML = groups.map(function (g, i) {
      return '<button type="button" data-g="' + g + '" aria-pressed="' + (i === 0) + '">' + g + '</button>';
    }).join('');
    function chips(box, team, key) {
      var list = P.players.filter(function (p) { return p.grp === cur && p.team === team; });
      if (!list.length) { box.innerHTML = '<span class="hpc-none">Bu mevkide en az ' + P.min + ' dakikası olan oyuncu yok</span>'; sel[key] = null; return; }
      if (!sel[key] || sel[key].grp !== cur) sel[key] = list[0];
      box.innerHTML = list.map(function (p) {
        return '<button type="button" data-p="' + p.p + '" aria-pressed="' + (p === sel[key]) + '">' + surname(p.p) + ' <small>' + p.min + "'</small></button>";
      }).join('');
      box.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          sel[key] = list.filter(function (p) { return p.p === b.getAttribute('data-p'); })[0];
          chips(box, team, key); render();
        });
      });
    }
    function render() {
      var g = P.groups[cur], s = [];
      if (sel.a) s.push({ name: sel.a.p, v: sel.a.axes.map(function (x) { return x.pct; }), color: C.a });
      if (sel.b) s.push({ name: sel.b.p, v: sel.b.axes.map(function (x) { return x.pct; }), color: C.b, dash: true });
      radar(svg, g.axes, s);
      var line = function (p) {
        if (!p) return '';
        var best = p.axes.slice().sort(function (x, y) { return y.pct - x.pct; })[0], low = p.axes.slice().sort(function (x, y) { return x.pct - y.pct; })[0];
        return '<b>' + p.p + '</b> (' + p.pos + ', ' + p.min + ' dk): en güçlü eksen ' + best.a + ' (' + best.pct + '.), en zayıf ' + low.a + ' (' + low.pct + '.). ';
      };
      out.innerHTML = line(sel.a) + line(sel.b) + '<span class="hpc-n">Kıyas: Şampiyonlar Ligi\'nde bu mevkide en az ' + P.min + ' dakika oynayan ' + g.n + ' oyuncu.</span>';
    }
    function setGroup(g) {
      cur = g;
      grpBox.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-g') === g)); });
      chips(pa, 'a', 'a'); chips(pb, 'b', 'b'); render();
    }
    grpBox.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { setGroup(b.getAttribute('data-g')); }); });
    setGroup(D.players.start || groups[0]);
    redraws.push(render);
  }

  var map = { momentum: momentum, network: network, teamradar: teamRadar, playerradar: playerRadar };
  document.querySelectorAll('[data-hpc]').forEach(function (fig) {
    var f = map[fig.getAttribute('data-hpc')];
    if (f) try { f(fig); } catch (e) { fig.classList.add('hpc-failed'); }
  });
})();
