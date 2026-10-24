/* ハンバーガーメニュー */
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
if (hamburger && nav) {
  hamburger.setAttribute('aria-controls', 'nav');
  hamburger.setAttribute('aria-expanded', 'false');
  const setOpen = (open) => {
    nav.classList.toggle('open', open);
    document.body.classList.toggle('nav-open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  };
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!nav.classList.contains('open'));
  });
  // リンクを押した・Esc・メニューの外を押した、で閉じる
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); hamburger.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') && !nav.contains(e.target)) setOpen(false);
  });
}

/* FAQアコーディオン */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    item.classList.toggle('open');
  });
});

/* お問い合わせフォーム送信 */
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const res = await fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      form.reset();
      document.getElementById('form-success').style.display = 'block';
    }
  });
}

/* ヘッダー：少し下に動いたら影を付ける（全ページ共通） */
(function () {
  const header = document.querySelector('header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ============================================================
   ===== トップページ v2 演出（2026-08 リニューアル）=====
   ヒーローが無いページでは何もしない（他ページ共有のため）
   ============================================================ */
(function () {
  const hero = document.querySelector('.hero2');
  if (!hero) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- 1. タイプライター演出（ヒーロー見出し） --- */
  const heading = document.getElementById('tw');
  const lines = heading ? Array.from(heading.querySelectorAll('.tw-line')) : [];

  function finishTypewriter() {
    lines.forEach(el => {
      el.textContent = el.dataset.text;
      el.classList.remove('tw-active');
      el.classList.add('tw-done');
    });
    if (lines.length) lines[lines.length - 1].classList.add('tw-caret-hold');
    hero.classList.add('tw-done');
  }

  if (heading && lines.length && !reduced) {
    // スクリーンリーダーには完成文を先に渡す
    heading.setAttribute('aria-label', lines.map(el => el.dataset.text).join(''));
    lines.forEach(el => { el.setAttribute('aria-hidden', 'true'); el.textContent = ''; });

    let li = 0;
    function typeLine() {
      if (li >= lines.length) {
        lines[lines.length - 1].classList.add('tw-caret-hold');
        hero.classList.add('tw-done');
        return;
      }
      const el = lines[li];
      const text = el.dataset.text;
      el.classList.add('tw-active');
      let ci = 0;
      const timer = setInterval(() => {
        ci++;
        el.textContent = text.slice(0, ci);
        if (ci >= text.length) {
          clearInterval(timer);
          el.classList.remove('tw-active');
          el.classList.add('tw-done');
          li++;
          setTimeout(typeLine, 280);
        }
      }, 72);
    }
    setTimeout(typeLine, 400);
  } else {
    finishTypewriter();
  }

  /* --- 2. スクロール出現（reveal） --- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    // 同じ親内の並び順で少しずつ遅らせる（stagger）
    const groups = new Map();
    reveals.forEach(el => {
      const parent = el.parentElement;
      const n = groups.get(parent) || 0;
      el.style.setProperty('--rd', (n * 0.12) + 's');
      groups.set(parent, n + 1);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => {
      io.observe(el);
      // 出終わったら出現用のクラスを外す（カードのホバーの浮きが効くように）
      el.addEventListener('transitionend', function done(e) {
        if (e.target !== el || e.propertyName !== 'opacity' || !el.classList.contains('is-visible')) return;
        el.removeEventListener('transitionend', done);
        el.classList.remove('reveal', 'is-visible');
        el.style.removeProperty('--rd');
      });
    });
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  /* --- 3. 数字カウントアップ（小数も）＋ 数字の図（棒・星・A社B社） --- */
  const counters = Array.from(document.querySelectorAll('[data-count]'));
  const fmt = (v, d) => (d ? v.toFixed(d) : String(Math.round(v)));
  function animateCount(el) {
    const target = parseFloat(el.dataset.count) || 0;
    const d = parseInt(el.dataset.decimals || '0', 10);
    // 桁が増えても横にずれないよう、完成形の幅で先に固定してから数え始める
    el.textContent = fmt(target, d);
    el.style.display = 'inline-block';
    el.style.minWidth = el.getBoundingClientRect().width + 'px';
    el.textContent = fmt(0, d);
    const dur = 1600;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = fmt(p < 1 ? target * eased : target, d);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const statCards = Array.from(document.querySelectorAll('.stats-row .stat'));
  if ('IntersectionObserver' in window && !reduced) {
    // 見える前は 0 を出しておく（数え始めに 0 → 完成形へ）
    counters.forEach(el => { el.textContent = fmt(0, parseInt(el.dataset.decimals || '0', 10)); });
    const sio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const card = entry.target;
        sio.unobserve(card);
        card.classList.add('is-in');
        const c = card.querySelector('[data-count]');
        if (c) setTimeout(() => animateCount(c), 120);
      });
    }, { threshold: 0.45 });
    statCards.forEach(el => sio.observe(el));
  } else {
    statCards.forEach(el => el.classList.add('is-in'));
    counters.forEach(el => { el.textContent = fmt(parseFloat(el.dataset.count) || 0, parseInt(el.dataset.decimals || '0', 10)); });
  }

  /* --- 3b. 進め方は3段：1 → 線 → 2 → 線 → 3 の順に出す --- */
  const stepItems = Array.from(document.querySelectorAll('.steps2-row > *'));
  if ('IntersectionObserver' in window && !reduced) {
    const stio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        stio.unobserve(entry.target);
        entry.target.classList.add('is-in');
      });
    }, { threshold: 0.35, rootMargin: '0px 0px -40px 0px' });
    stepItems.forEach(el => {
      stio.observe(el);
      // 出終わったら遅れを外す（ホバーの戻りが遅れないように）
      el.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'opacity') el.style.transitionDelay = '0s';
      });
    });
  } else {
    stepItems.forEach(el => el.classList.add('is-in'));
  }

  /* --- 4. ヒーローのブロブをマウスでパララックス --- */
  if (!reduced && window.matchMedia('(pointer: fine)').matches) {
    const blobs = hero.querySelectorAll('.blob');
    hero.addEventListener('mousemove', (e) => {
      const cx = e.clientX / window.innerWidth - 0.5;
      const cy = e.clientY / window.innerHeight - 0.5;
      blobs.forEach((b, i) => {
        const depth = (i + 1) * 12;
        b.style.setProperty('--px', (cx * depth) + 'px');
        b.style.marginTop = (cy * depth * 0.6) + 'px';
      });
    }, { passive: true });
  }

  /* --- 5. 読み進みバー --- */
  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  let barTicking = false;
  function updateBar() {
    barTicking = false;
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(h.scrollTop / max, 1) : 0) + ')';
  }
  window.addEventListener('scroll', () => {
    if (!barTicking) { barTicking = true; requestAnimationFrame(updateBar); }
  }, { passive: true });
  updateBar();
})();
