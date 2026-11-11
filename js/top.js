/* トップ（2026-11 作り直し）の動き。外部ライブラリなし。
   1) LINEのやりとりの見本を、見えた時に1回だけ「送る→入力中→返信」の順に出す
   2) 最初のLINEボタンが見えなくなったら、画面の下にLINEボタンを出す（最後のボタンが見えたら引っ込む） */
(function () {
  var hasIO = 'IntersectionObserver' in window;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var talk = document.getElementById('talk');
  if (talk && hasIO && !reduce) {
    talk.classList.add('is-ready');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        talk.classList.add('is-play');
        io.disconnect();
        // 返信が出終わったら「入力中」の点を止める
        var bot = talk.querySelector('.tp-bot');
        if (bot) bot.addEventListener('animationend', function () { talk.classList.add('is-done'); }, { once: true });
      });
    }, { threshold: 0.3 });
    io.observe(talk);
  }

  var dock = document.getElementById('dock');
  var first = document.getElementById('cta-hero');
  var last = document.getElementById('cta-fin');
  if (dock && first && hasIO) {
    dock.hidden = false;
    var firstIn = true, lastIn = false;
    var update = function () {
      var on = !firstIn && !lastIn;
      dock.classList.toggle('is-on', on);
      dock.inert = !on;
    };
    new IntersectionObserver(function (es) { firstIn = es[es.length - 1].isIntersecting; update(); }).observe(first);
    if (last) new IntersectionObserver(function (es) { lastIn = es[es.length - 1].isIntersecting; update(); }).observe(last);
    update();
  }
})();
