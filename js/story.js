/* ============================================================
   物語型トップ（完成版の候補）2026-10-24 ハック
   - 土台は見本（js/story-sample.js）。第1幕の動きは見本のまま
   - 「動きを減らす」設定・背の低い画面では何もしない（縦に並べた形で全部読める）
   - ヘッダーと全画面メニューは js/main.js がそのまま動かす
   ============================================================ */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || window.innerHeight < 520) return;

  var root = document.documentElement;
  root.classList.add('story-on');

  var header = document.querySelector('header');
  var hero = document.querySelector('.sh');
  var story = document.getElementById('numbers');
  var stage = document.getElementById('story-stage');
  var val = document.getElementById('nums-val');
  var ticks = stage ? Array.prototype.slice.call(stage.querySelectorAll('.tick')) : [];

  var flowTrack = document.getElementById('flow-track');
  var steps = flowTrack ? Array.prototype.slice.call(flowTrack.querySelectorAll('.fstep')) : [];
  var vows = Array.prototype.slice.call(document.querySelectorAll('.vow'));
  var inter = document.querySelector('.inter');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.act-nav a'));
  var acts = Array.prototype.slice.call(document.querySelectorAll('[data-act]'));

  function clamp(v) { return Math.min(1, Math.max(0, v)); }
  function seg(p, a, b) { return clamp((p - a) / (b - a)); }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function r4(v) { return (Math.round(v * 10000) / 10000).toString(); }
  function set(k, v) { stage.style.setProperty(k, r4(v)); }

  /* ---------- 読み進みの線（画面のいちばん上） ---------- */
  var bar = document.createElement('div');
  bar.className = 'progress-bar';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  /* ---------- 入ってきたら出す（.fx・幕の見出し・2社・約束の札・写真の輪・終幕） ---------- */
  var groups = new Map();
  Array.prototype.forEach.call(document.querySelectorAll('.fx'), function (el) {
    var parent = el.parentElement;
    var n = groups.get(parent) || 0;
    el.style.setProperty('--rd', (n * 0.1) + 's');
    groups.set(parent, n + 1);
  });

  function countUp(el, to, dur) {
    var start = performance.now();
    function tick(now) {
      var t = Math.min((now - start) / dur, 1);
      el.textContent = String(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        el.classList.add('is-in');
        if (el.classList.contains('works')) {
          var wv = el.querySelector('.works-val');
          if (wv) { wv.textContent = '0'; setTimeout(function () { countUp(wv, 2, 900); }, 250); }
        }
        if (el.classList.contains('fx')) {
          // 出終わったら出現用の印を外す（ボタンやカードのホバーの手ざわりを元に戻す）
          el.addEventListener('transitionend', function done(e) {
            if (e.target !== el || e.propertyName !== 'opacity') return;
            el.removeEventListener('transitionend', done);
            el.classList.remove('fx', 'fx-side', 'is-in');
            el.style.removeProperty('--rd');
          });
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    Array.prototype.forEach.call(
      document.querySelectorAll('.fx, .act-head, .works, .vow, .maker-photo, .fin'),
      function (el) { io.observe(el); }
    );
  } else {
    root.classList.remove('story-on');
    return;
  }

  /* ---------- スクロールに合わせて動かす部分 ---------- */
  var lastP = -1, lastHp = -1, lastTick = -1, lastVal = -1, lastAct = '', ticking = false;

  function renderAct1(headH) {
    if (!story || !stage) return;
    var r = story.getBoundingClientRect();
    var total = r.height - stage.offsetHeight;
    var p = total > 0 ? clamp((headH - r.top) / total) : 0;
    if (Math.abs(p - lastP) < 0.0002) return;
    lastP = p;

    // 場面1：散らばった札（スクロールで少しずつ外へ流れる）
    set('--d', seg(p, 0, 0.22));
    set('--o1', 1 - seg(p, 0.24, 0.30));
    set('--y1', -40 * seg(p, 0.24, 0.30));

    // 場面2：札が1枚に収まる → チェックが付く
    set('--t', ease(seg(p, 0.20, 0.42)));
    set('--tk', seg(p, 0.40, 0.47));
    set('--o2', seg(p, 0.29, 0.36) * (1 - seg(p, 0.56, 0.62)));
    set('--y2', 40 * (1 - seg(p, 0.29, 0.36)) - 40 * seg(p, 0.56, 0.62));
    var cOut = ease(seg(p, 0.56, 0.64));
    set('--co', 1 - cOut);
    set('--cs', 1 - 0.22 * cOut);

    // 場面3：数字が動く（記録の2点 160 → 207 の間を数える。間の日付は出さない）
    set('--o3', seg(p, 0.62, 0.68));
    set('--y3', 24 * (1 - seg(p, 0.62, 0.68)));
    var no = ease(seg(p, 0.62, 0.70));
    set('--no', no);
    set('--ny', 40 * (1 - no));
    var g = ease(seg(p, 0.68, 0.84));
    set('--g', g);
    var v = Math.round(160 + 47 * g);
    if (v !== lastVal && val) { val.textContent = String(v); lastVal = v; }
    set('--dz', ease(seg(p, 0.84, 0.89)));
    set('--sf', ease(seg(p, 0.86, 0.94)));
    set('--nn', seg(p, 0.90, 0.96));

    // 目盛りと進みの線
    set('--p', p);
    var ti = p < 0.31 ? 0 : (p < 0.60 ? 1 : 2);
    if (ti !== lastTick) {
      ticks.forEach(function (el, i) { el.classList.toggle('is-on', i === ti); });
      lastTick = ti;
    }
  }

  function render() {
    ticking = false;
    var vh = window.innerHeight;
    var headH = header ? header.offsetHeight : 0;

    // 読み進みの線
    var max = root.scrollHeight - root.clientHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';

    // 幕開け：下に送ると、文字が少し寄って消えていく
    if (hero) {
      var hr = hero.getBoundingClientRect();
      if (hr.bottom > -50) {
        var hp = clamp((headH - hr.top) / hr.height);
        if (Math.abs(hp - lastHp) > 0.0005) { hero.style.setProperty('--hp', hp.toFixed(4)); lastHp = hp; }
      }
    }

    // 第1幕
    renderAct1(headH);

    // 第2幕：線が伸びて、届いた段から灯る（画面の6割の高さが目安）
    if (flowTrack) {
      var fr = flowTrack.getBoundingClientRect();
      if (fr.top < vh && fr.bottom > 0) {
        var anchor = vh * 0.62;
        flowTrack.style.setProperty('--fp', r4(clamp((anchor - fr.top) / fr.height)));
        steps.forEach(function (st) {
          var n = st.querySelector('.fstep-num').getBoundingClientRect();
          st.classList.toggle('is-lit', n.top + n.height / 2 < anchor);
        });
      }
    }

    // 第3幕：上に札が重なってきたら、下の札を少し小さく・暗く
    for (var i = 0; i < vows.length - 1; i++) {
      var a = vows[i].getBoundingClientRect();
      if (a.bottom < -200 || a.top > vh) continue;
      var b = vows[i + 1].getBoundingClientRect();
      var cover = clamp(1 - (b.top - a.top - 18) / a.height);
      vows[i].style.setProperty('--vs', r4(1 - 0.05 * cover));
      vows[i].style.setProperty('--vd', r4(0.22 * cover));
    }

    // 幕間：真ん中に来るほど、画面のまわりに明かりが集まる
    if (inter) {
      var ir = inter.getBoundingClientRect();
      if (ir.top < vh && ir.bottom > 0) {
        var d = Math.abs((ir.top + ir.height / 2) - vh / 2) / (vh * 0.9);
        inter.style.setProperty('--lp', r4(1 - clamp(d)));
      }
    }

    // 右の目次：いまいる幕に印
    var cur = 'top';
    for (var k = 0; k < acts.length; k++) {
      if (acts[k].getBoundingClientRect().top <= vh * 0.4) cur = acts[k].getAttribute('data-act');
    }
    if (cur !== lastAct) {
      navLinks.forEach(function (l) { l.classList.toggle('is-on', l.getAttribute('data-for') === cur); });
      lastAct = cur;
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(render); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { lastP = -1; lastHp = -1; onScroll(); });
  render();
})();
