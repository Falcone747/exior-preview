(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var pay = document.querySelector("[data-stripe]");
  if (pay && window.EXIOR_OFFRE) pay.href = EXIOR_OFFRE.stripe;

  if (!reduce && "IntersectionObserver" in window) {
    document.querySelectorAll(".reveal").forEach(function (el) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("on");
          io.unobserve(e.target);
        });
      }, { threshold: 0.16 });
      io.observe(el);
    });
    document.querySelectorAll(".chain").forEach(function (el) {
      if (el.classList.contains("chain-live")) return;
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        el.classList.add("lit");
        io.disconnect();
      }, { threshold: 0.35 });
      io.observe(el);
    });
  }

  var top = document.querySelector(".top");
  if (top) {
    var onScroll = function () {
      top.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  var glow = document.querySelector(".glow");
  if (glow && !reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener("pointermove", function (e) {
      glow.style.transform = "translate3d(" + e.clientX + "px," + e.clientY + "px,0)";
    }, { passive: true });
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
