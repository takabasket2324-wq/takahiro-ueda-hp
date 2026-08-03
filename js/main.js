/* ハンバーガーメニュー */
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
if (hamburger && nav) {
  hamburger.addEventListener('click', () => {
    nav.classList.toggle('open');
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
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  /* --- 3. 数字カウントアップ --- */
  const counters = document.querySelectorAll('[data-count]');
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    const dur = 1300;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window && !reduced) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(el => cio.observe(el));
  } else {
    counters.forEach(el => { el.textContent = el.dataset.count; });
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
  function updateBar() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', updateBar, { passive: true });
  updateBar();
})();
