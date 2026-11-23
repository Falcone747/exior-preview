(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var offre = window.EXIOR_OFFRE;

  if (offre) {
    document.querySelectorAll("[data-stripe]").forEach(function (a) {
      if (offre.stripe) a.href = offre.stripe;
    });
    document.querySelectorAll("[data-offre]").forEach(function (el) {
      var key = el.getAttribute("data-offre");
      if (offre[key]) el.textContent = offre[key];
    });
    document.querySelectorAll("[data-mail]").forEach(function (a) {
      if (offre.email) a.href = "mailto:" + offre.email;
    });
  }

  document.querySelectorAll("details.drawer a").forEach(function (a) {
    a.addEventListener("click", function () {
      a.closest("details").removeAttribute("open");
    });
  });

  document.querySelectorAll("[data-reveal], .stagger").forEach(function (el) {
    if (reduce || !("IntersectionObserver" in window)) {
      el.classList.add("in");
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      el.classList.add("in");
      io.disconnect();
    }, { threshold: 0.16 });
    io.observe(el);
  });

  document.querySelectorAll("[data-node]").forEach(function (n) { if (reduce) n.classList.add("on"); });
  var schema = document.querySelector("[data-schema]");
  if (schema && !reduce && "IntersectionObserver" in window) {
    var sio = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      schema.querySelectorAll("[data-node]").forEach(function (n, i) {
        setTimeout(function () { n.classList.add("on"); }, i * 400);
      });
      sio.disconnect();
    }, { threshold: 0.3 });
    sio.observe(schema);
  }

  function watch(el, onEnter, onLeave) {
    if (reduce || !("IntersectionObserver" in window)) {
      onEnter();
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) onEnter();
      else if (onLeave) onLeave();
    }, { threshold: 0.35 });
    io.observe(el);
  }

  function typeText(target, text, alive, done) {
    var i = 0;
    function tick() {
      if (!alive()) return;
      i += 1;
      target.textContent = text.slice(0, i);
      if (i < text.length) setTimeout(tick, 14);
      else if (done) done();
    }
    tick();
  }
  function typeAppend(target, addition, alive, done) {
    var base = target.textContent;
    typeText({
      set textContent(v) { target.textContent = base + v; },
      get textContent() { return target.textContent.slice(base.length); }
    }, addition, alive, done);
  }

  document.querySelectorAll('[data-live="code"]').forEach(function (block) {
    var pre = block.querySelector(".term-out");
    var lines = pre.textContent.replace(/^\n|\n$/g, "").split("\n");
    var token = 0;
    function play() {
      var mine = ++token;
      var alive = function () { return mine === token; };
      var n = 0;
      pre.textContent = "";
      function next() {
        if (!alive()) return;
        if (n >= lines.length) {
          setTimeout(function () { if (alive()) play(); }, 2200);
          return;
        }
        var line = (n ? "\n" : "") + lines[n];
        n += 1;
        typeAppend(pre, line, alive, function () { setTimeout(next, 220); });
      }
      next();
    }
    if (reduce) return;
    watch(block, play, function () { token++; });
  });

  document.querySelectorAll('[data-live="chat"]').forEach(function (chat) {
    var items = Array.prototype.map.call(chat.querySelectorAll(".bubble"), function (b) {
      return { cls: b.className, who: b.querySelector("b").textContent, text: b.querySelector("span").textContent };
    });
    var token = 0;
    function play() {
      var mine = ++token;
      var alive = function () { return mine === token; };
      var n = 0;
      chat.innerHTML = "";
      function next() {
        if (!alive()) return;
        if (n >= items.length) {
          setTimeout(function () { if (alive()) play(); }, 2400);
          return;
        }
        var item = items[n++];
        var bubble = document.createElement("p");
        bubble.className = item.cls;
        var who = document.createElement("b");
        who.textContent = item.who;
        var span = document.createElement("span");
        bubble.appendChild(who);
        bubble.appendChild(span);
        chat.appendChild(bubble);
        typeText(span, item.text, alive, function () { setTimeout(next, 280); });
      }
      next();
    }
    if (reduce) return;
    watch(chat, play, function () { token++; });
  });

  var feed = document.querySelector('[data-live="feed"]');
  var ask = document.querySelector('[data-live="ask"]');
  var reply = document.querySelector('[data-live="reply"]');
  if (feed && ask) {
    var feedLines = Array.prototype.map.call(feed.querySelectorAll("li"), function (li) {
      var span = li.querySelector("span");
      return { text: span.textContent, html: span.innerHTML };
    });
    var question = ask.getAttribute("data-question") || "";
    var askSpan = ask.querySelector("span");
    var replyText = reply ? reply.querySelector("span").textContent : "";
    var token = 0;
    function playHero() {
      var mine = ++token;
      var alive = function () { return mine === token; };
      feed.innerHTML = "";
      askSpan.textContent = "Demander à EXIOR...";
      askSpan.classList.remove("on");
      if (reply) reply.classList.remove("on");
      var n = 0;
      function feedNext() {
        if (!alive()) return;
        if (n >= feedLines.length) {
          askSpan.classList.add("on");
          typeText(askSpan, question, alive, function () {
            if (!alive() || !reply) return;
            reply.classList.add("on");
            var span = reply.querySelector("span");
            span.textContent = "";
            typeText(span, replyText, alive, function () {
              setTimeout(function () { if (alive()) playHero(); }, 2600);
            });
          });
          return;
        }
        var li = document.createElement("li");
        li.innerHTML = '<i class="dot"></i><span></span>';
        feed.appendChild(li);
        var row = feedLines[n];
        var span = li.querySelector("span");
        typeText(span, row.text, alive, function () {
          span.innerHTML = row.html;
          n += 1;
          setTimeout(feedNext, 160);
        });
      }
      feedNext();
    }
    if (!reduce) watch(feed, playHero, function () { token++; });
  }

  var land = document.querySelector(".land");
  if (land && !reduce) {
    var ticking = false;
    function parallax() {
      ticking = false;
      var box = land.parentElement.getBoundingClientRect();
      var shift = Math.max(-28, Math.min(28, -box.top * 0.05));
      land.style.transform = "translate3d(0," + shift.toFixed(2) + "px,0)";
    }
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(parallax);
    }, { passive: true });
    parallax();
  }

  var sticky = document.querySelector(".sticky");
  var heroBtn = document.querySelector(".hero .btn");
  if (sticky && heroBtn && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      sticky.classList.toggle("on", !e.isIntersecting && e.boundingClientRect.top < 0);
    }, { threshold: 0 }).observe(heroBtn);
  }
})();
