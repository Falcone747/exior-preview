(function () {
  var root = document.documentElement;
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

  var reveals = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  var schema = document.querySelector("[data-schema]");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
    if (schema) schema.querySelectorAll("[data-node]").forEach(function (n) { n.classList.add("on"); });
  } else {
    var queue = [];
    var running = false;
    function pump() {
      if (running) return;
      var job = queue.shift();
      if (!job) return;
      running = true;
      job();
    }
    function done(ms) {
      setTimeout(function () {
        running = false;
        pump();
      }, ms);
    }
    reveals.forEach(function (el) {
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        queue.push(function () {
          el.classList.add("in");
          done(220);
        });
        pump();
      }, { threshold: 0.18 });
      io.observe(el);
    });
    if (schema) {
      var sio = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        sio.disconnect();
        queue.push(function () {
          var nodes = schema.querySelectorAll("[data-node]");
          nodes.forEach(function (n, i) {
            setTimeout(function () { n.classList.add("on"); }, i * 400);
          });
          done(Math.max(400, nodes.length * 400));
        });
        pump();
      }, { threshold: 0.35 });
      sio.observe(schema);
    }
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
