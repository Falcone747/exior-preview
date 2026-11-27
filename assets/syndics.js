(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var offre = window.EXIOR_OFFRE_SYNDICS || {};
  var typeText = window.exiorTypeText;

  document.querySelectorAll("[data-offre-s]").forEach(function (el) {
    var key = el.getAttribute("data-offre-s");
    if (offre[key]) el.textContent = offre[key];
  });
  document.querySelectorAll("[data-stripe]").forEach(function (a) {
    if (offre.stripe) a.href = offre.stripe;
  });
  document.querySelectorAll("[data-mail]").forEach(function (a) {
    if (offre.email) {
      var href = a.getAttribute("href") || "";
      a.href = href.indexOf("mailto:") === 0 ? href : "mailto:" + offre.email;
      if (a.getAttribute("data-mail") === "replace") a.href = "mailto:" + offre.email;
    }
  });

  document.querySelectorAll("details.drawer a").forEach(function (a) {
    a.addEventListener("click", function () {
      var box = a.closest("details");
      if (box) box.removeAttribute("open");
    });
  });

  var sticky = document.querySelector(".sticky-guide");
  var heroBtn = document.querySelector(".hero .btn-primary");
  if (sticky && heroBtn && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      sticky.classList.toggle("on", !e.isIntersecting);
    }, { threshold: 0.6 }).observe(heroBtn);
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

  document.querySelectorAll('[data-live="triage"]').forEach(function (root) {
    var bridge = root.querySelector(".triage-bridge");
    var msgs = Array.prototype.slice.call(root.querySelectorAll(".msg"));
    var cards = Array.prototype.slice.call(root.querySelectorAll(".acard"));
    if (!msgs.length || !cards.length) return;
    var token = 0;
    function reset() {
      msgs.forEach(function (el) { el.classList.remove("on"); });
      cards.forEach(function (el) {
        el.classList.remove("on");
        var pill = el.querySelector(".pill");
        if (pill) pill.classList.remove("on");
        var typed = el.querySelector(".typed");
        if (typed) typed.textContent = "";
      });
      if (bridge) bridge.classList.remove("on");
    }
    function play() {
      var mine = ++token;
      var alive = function () { return mine === token; };
      root.classList.remove("is-static");
      reset();
      var i = 0;
      function step() {
        if (!alive()) return;
        if (i >= msgs.length) {
          setTimeout(function () { if (alive()) play(); }, 3000);
          return;
        }
        var msg = msgs[i];
        var card = cards[i];
        var text = card.getAttribute("data-text") || "";
        i += 1;
        msg.classList.add("on");
        setTimeout(function () {
          if (!alive()) return;
          if (bridge) {
            bridge.classList.remove("on");
            void bridge.offsetWidth;
            bridge.classList.add("on");
          }
          card.classList.add("on");
          var typed = card.querySelector(".typed");
          var pill = card.querySelector(".pill");
          if (!typeText || !typed) {
            if (typed) typed.textContent = text;
            if (pill) pill.classList.add("on");
            setTimeout(step, 900);
            return;
          }
          typeText(typed, text, alive, function () {
            if (!alive()) return;
            if (pill) pill.classList.add("on");
            setTimeout(step, 900);
          });
        }, 280);
      }
      step();
    }
    if (reduce) return;
    watch(root, play, function () { token += 1; });
  });

  document.querySelectorAll("[data-tabs]").forEach(function (box) {
    var tabs = Array.prototype.slice.call(box.querySelectorAll('[role="tab"]'));
    function select(tab) {
      tabs.forEach(function (item) {
        var on = item === tab;
        item.setAttribute("aria-selected", on ? "true" : "false");
        item.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(item.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
    }
    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () { select(tab); });
      tab.addEventListener("keydown", function (event) {
        var next = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = tabs[(index + 1) % tabs.length];
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = tabs[(index - 1 + tabs.length) % tabs.length];
        if (event.key === "Home") next = tabs[0];
        if (event.key === "End") next = tabs[tabs.length - 1];
        if (!next) return;
        event.preventDefault();
        select(next);
        next.focus();
      });
    });
  });

  function messageFor(el) {
    if (el.validity.valueMissing) return "Ce champ est obligatoire.";
    if (el.validity.typeMismatch) return "Indiquez une adresse e-mail valide.";
    if (el.validity.tooLong) return "1 000 caractères maximum.";
    return "Vérifiez ce champ.";
  }

  function fieldError(el) {
    var box = el.closest(".field") || el.closest("fieldset");
    return box ? box.querySelector(".field-error") : null;
  }

  function showError(el) {
    var slot = fieldError(el);
    if (!slot) return;
    slot.hidden = false;
    slot.textContent = messageFor(el);
    el.setAttribute("aria-invalid", "true");
  }

  function clearError(el) {
    var slot = fieldError(el);
    if (slot) { slot.hidden = true; slot.textContent = ""; }
    el.removeAttribute("aria-invalid");
  }

  function syncChecks(group) {
    var boxes = Array.prototype.slice.call(group.querySelectorAll('input[type="checkbox"]'));
    if (!boxes.length) return;
    var any = boxes.some(function (box) { return box.checked; });
    boxes.forEach(function (box, index) {
      if (any) box.required = false;
      else box.required = index === 0;
    });
  }

  function validate(form) {
    var ok = true;
    form.querySelectorAll("fieldset.checks").forEach(syncChecks);
    Array.prototype.forEach.call(form.querySelectorAll("input, select, textarea"), function (el) {
      if (el.closest("[hidden]") || el.type === "hidden" || el.classList.contains("hp")) return;
      if (!el.checkValidity()) { showError(el); ok = false; }
      else clearError(el);
    });
    return ok;
  }

  function linesOf(form) {
    var rows = [];
    var seen = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.type === "submit" || el.classList.contains("hp")) return;
      if (el.closest("[hidden]")) return;
      if (el.type === "checkbox") {
        if (!el.checked) return;
        if (!seen[el.name]) { seen[el.name] = []; rows.push([el.name, seen[el.name]]); }
        seen[el.name].push(el.value);
        return;
      }
      if (el.type === "radio" && !el.checked) return;
      var value = (el.value || "").trim();
      if (!value) return;
      rows.push([el.name, value]);
    });
    return rows.map(function (row) {
      return row[0] + " : " + (Array.isArray(row[1]) ? row[1].join(", ") : row[1]);
    });
  }

  function cabinetOf(form) {
    var input = form.querySelector('[name="Cabinet"]');
    return input ? input.value.trim() : "";
  }

  function showDone(form, text) {
    var done = form.parentElement.querySelector(".form-done");
    if (!done) return;
    form.hidden = true;
    done.hidden = false;
    done.textContent = text;
  }

  function mailtoFallback(form, subject, body) {
    var email = offre.email || "exior.tech@gmail.com";
    window.location.href = "mailto:" + email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    showDone(form, "Merci. Votre e-mail est prêt dans votre messagerie\u00a0: envoyez-le, EXIOR vous répond par écrit avec un devis détaillé.");
  }

  document.querySelectorAll("form[data-quote]").forEach(function (form) {
    form.querySelectorAll("fieldset.checks").forEach(function (group) {
      group.addEventListener("change", function () { syncChecks(group); });
    });
    var logiciel = form.querySelector("[data-autre]");
    if (logiciel) {
      var extra = document.getElementById(logiciel.getAttribute("data-autre"));
      var free = extra ? extra.querySelector("input") : null;
      function toggleAutre() {
        var on = logiciel.value === "Autre";
        if (extra) extra.hidden = !on;
        if (free) free.required = on;
      }
      logiciel.addEventListener("change", toggleAutre);
      toggleAutre();
    }
    Array.prototype.forEach.call(form.querySelectorAll("input, select, textarea"), function (el) {
      el.addEventListener("input", function () { if (el.getAttribute("aria-invalid")) clearError(el); });
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (form.querySelector(".hp") && form.querySelector(".hp").value) return;
      if (!validate(form)) {
        var first = form.querySelector("[aria-invalid='true']");
        if (first) first.focus();
        return;
      }
      var button = form.querySelector('[type="submit"]');
      var subject = form.getAttribute("data-subject") + "\u00a0: " + cabinetOf(form);
      var body = linesOf(form).join("\n");
      var payload = {
        _subject: subject,
        _template: "table",
        _captcha: "false",
        _replyto: (form.querySelector('[type="email"]') || {}).value || ""
      };
      linesOf(form).forEach(function (line) {
        var cut = line.indexOf(" : ");
        payload[line.slice(0, cut)] = line.slice(cut + 3);
      });
      if (button) { button.disabled = true; button.textContent = "Envoi…"; }
      var endpoint = "https://formsubmit.co/ajax/" + encodeURIComponent(offre.email || "exior.tech@gmail.com");
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      }).then(function (res) {
        return res.json().then(function (data) { return { ok: res.ok && String(data.success) === "true", data: data }; });
      }).then(function (result) {
        if (result.ok) showDone(form, "Merci. Votre demande est envoyée. EXIOR vous répond par écrit avec un devis détaillé.");
        else mailtoFallback(form, subject, body);
      }).catch(function () {
        mailtoFallback(form, subject, body);
      });
    });
  });
})();
