(function () {
  var KEY = "exior-syndics-k";
  var READ = "exior-syndics-lus";
  var LAST = "exior-syndics-last";
  var gate = document.getElementById("gate");
  var shell = document.getElementById("shell");
  var form = document.getElementById("gate-form");
  var error = document.getElementById("gate-error");
  var button = form.querySelector("button");
  var manifest = null;
  var catalog = [];
  var searchDocs = [];
  var contentKey = null;

  function b64ToBuf(value) {
    var bin = atob(value);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
    return out;
  }
  function bufToB64(buf) {
    var bytes = new Uint8Array(buf);
    var bin = "";
    for (var i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function readSet() {
    try { return JSON.parse(localStorage.getItem(READ) || "[]"); } catch (e) { return []; }
  }
  function remember(id) {
    var list = readSet();
    if (list.indexOf(id) === -1) list.push(id);
    localStorage.setItem(READ, JSON.stringify(list));
    localStorage.setItem(LAST, id);
  }
  function fold(value) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }
  function fail(message) {
    error.hidden = false;
    error.textContent = message;
  }
  function setBusy(on) {
    button.disabled = on;
    button.textContent = on ? "Vérification…" : "Entrer";
  }

  async function unwrapAll(code, keys) {
    var baseKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(code),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    for (var i = 0; i < keys.envelopes.length; i += 1) {
      var env = keys.envelopes[i];
      try {
        var derived = await crypto.subtle.deriveKey(
          { name: "PBKDF2", salt: b64ToBuf(env.salt), iterations: keys.iterations, hash: "SHA-256" },
          baseKey,
          { name: "AES-GCM", length: 256 },
          false,
          ["decrypt"]
        );
        return await crypto.subtle.decrypt(
          { name: "AES-GCM", iv: b64ToBuf(env.iv) },
          derived,
          b64ToBuf(env.wrapped)
        );
      } catch (e) { /* enveloppe suivante */ }
    }
    return null;
  }

  async function importContent(raw) {
    contentKey = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["decrypt"]);
  }

  async function decryptBuf(buf) {
    var bytes = new Uint8Array(buf);
    var plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: bytes.slice(0, 12) },
      contentKey,
      bytes.slice(12)
    );
    return new TextDecoder().decode(plain);
  }

  async function loadIndex() {
    var res = await fetch("data/c/index.bin");
    if (!res.ok) throw new Error("index");
    var doc = JSON.parse(await decryptBuf(await res.arrayBuffer()));
    searchDocs = doc.chapters || [];
  }

  function flatChapters() {
    var list = [];
    manifest.parts.forEach(function (part) {
      part.chapters.forEach(function (ch) {
        list.push({
          id: ch.id,
          num: ch.num,
          title: ch.title,
          summary: ch.summary,
          partNum: part.num,
          partTitle: part.title,
          partId: part.id
        });
      });
    });
    return list;
  }

  function chapterById(id) {
    for (var i = 0; i < catalog.length; i += 1) if (catalog[i].id === id) return catalog[i];
    return null;
  }

  function renderSidebar() {
    var read = readSet();
    var nav = document.getElementById("toc");
    nav.innerHTML = manifest.parts.map(function (part) {
      var links = part.chapters.map(function (ch) {
        var cls = "ch" + (read.indexOf(ch.id) !== -1 ? " is-read" : "");
        return '<a class="' + cls + '" data-id="' + ch.id + '" href="#/' + ch.id + '">' + ch.num + ". " + escapeText(ch.title) + "</a>";
      }).join("");
      return "<details open><summary>Partie " + part.num + " · " + escapeText(part.title) + "</summary>" + links + "</details>";
    }).join("");
  }

  function escapeText(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "\u2019" }[c];
    });
  }

  function markCurrent(id) {
    document.querySelectorAll("#toc a.ch").forEach(function (a) {
      a.classList.toggle("is-current", a.getAttribute("data-id") === id);
      if (a.getAttribute("data-id") === id) a.classList.add("is-read");
    });
  }

  function renderHome() {
    document.title = "Votre dossier d\u2019architecture — EXIOR";
    var last = localStorage.getItem(LAST);
    var lastCh = last ? chapterById(last) : null;
    var resume = lastCh
      ? '<p class="resume"><span>Reprendre la lecture · ' + escapeText(lastCh.title) + '</span><a class="btn btn-primary" href="#/' + lastCh.id + '">Reprendre</a></p>'
      : "";
    var cards = manifest.parts.map(function (part) {
      return '<a class="home-card" href="#/' + part.chapters[0].id + '"><span class="num">' + String(part.num).padStart(2, "0") + '</span><strong>' + escapeText(part.title) + "</strong><span>" + part.chapters.length + " chapitres</span></a>";
    }).join("");
    document.getElementById("chapter").innerHTML = '<h1>Votre dossier d\u2019architecture</h1><p class="crumb">Dix parties. Le chapitre s\u2019ouvre après le déchiffrement dans votre navigateur.</p>' + resume + '<div class="home-grid">' + cards + "</div>";
    document.getElementById("crumb").textContent = "";
    document.getElementById("pager").innerHTML = "";
    document.getElementById("page-toc").innerHTML = "";
    markCurrent("");
  }

  function pager(index) {
    var prev = catalog[index - 1];
    var next = catalog[index + 1];
    document.getElementById("pager").innerHTML =
      (prev ? '<a href="#/' + prev.id + '">Précédent · ' + escapeText(prev.title) + "</a>" : "<span></span>") +
      (next ? '<a href="#/' + next.id + '">Suivant · ' + escapeText(next.title) + "</a>" : "<span></span>");
  }

  function pageToc() {
    var heads = document.querySelectorAll("#chapter h2");
    var box = document.getElementById("page-toc");
    if (!heads.length) { box.innerHTML = ""; return; }
    var items = Array.prototype.map.call(heads, function (h) {
      return '<li><a href="#' + h.id + '">' + escapeText(h.textContent) + "</a></li>";
    }).join("");
    box.innerHTML = '<p>Dans ce chapitre</p><ol>' + items + "</ol>";
  }

  async function renderChapter(id) {
    var meta = chapterById(id);
    var article = document.getElementById("chapter");
    if (!meta) {
      article.innerHTML = "<h1>Chapitre introuvable</h1>";
      return;
    }
    document.getElementById("crumb").textContent = "Partie " + meta.partNum + " › " + meta.title;
    var res = await fetch("data/c/" + id + ".bin");
    if (!res.ok) {
      article.innerHTML = "<h1>" + escapeText(meta.title) + "</h1><p>Ce chapitre n’est pas dans le jeu chiffré de cette publication. Le sommaire reste visible. Le texte complet est ajouté quand le dossier est chiffré hors du dépôt.</p>";
      document.title = meta.title + " — EXIOR";
      pager(catalog.indexOf(meta));
      pageToc();
      markCurrent(id);
      return;
    }
    article.innerHTML = "<h1>" + escapeText(meta.title) + "</h1>" + await decryptBuf(await res.arrayBuffer());
    document.title = meta.title + " — EXIOR";
    remember(id);
    pager(catalog.indexOf(meta));
    pageToc();
    markCurrent(id);
  }

  function currentId() {
    return decodeURIComponent((location.hash || "").replace(/^#\/?/, ""));
  }

  async function render() {
    closeSearch();
    var id = currentId();
    if (!id) renderHome();
    else await renderChapter(id);
    var here = document.querySelector("#toc a.is-current");
    if (here) here.scrollIntoView({ block: "nearest" });
  }

  function foldMap(source) {
    var folded = "";
    var map = [];
    for (var i = 0; i < source.length; i += 1) {
      var piece = fold(source[i]);
      for (var j = 0; j < piece.length; j += 1) {
        folded += piece[j];
        map.push(i);
      }
    }
    return { folded: folded, map: map };
  }

  function excerpt(text, terms) {
    var source = text.replace(/\s+/g, " ").trim();
    var mapped = foldMap(source);
    var at = -1;
    var term = terms[0];
    terms.forEach(function (item) {
      var found = mapped.folded.indexOf(item);
      if (found !== -1 && (at === -1 || found < at)) { at = found; term = item; }
    });
    if (at === -1) return escapeText(source.slice(0, 140));
    var startFold = Math.max(0, at - 50);
    var endFold = Math.min(mapped.folded.length - 1, at + term.length + 90);
    var start = mapped.map[startFold];
    var end = mapped.map[endFold] + 1;
    var markStart = mapped.map[at];
    var markEnd = mapped.map[at + term.length - 1] + 1;
    return (start ? "…" : "") + escapeText(source.slice(start, markStart)) + "<mark>" + escapeText(source.slice(markStart, markEnd)) + "</mark>" + escapeText(source.slice(markEnd, end)) + "…";
  }

  function closeSearch() {
    var box = document.getElementById("search-results");
    box.hidden = true;
    box.innerHTML = "";
  }

  function search(query) {
    var box = document.getElementById("search-results");
    var status = document.getElementById("search-status");
    var terms = fold(query).split(/\s+/).filter(function (t) { return t.length > 1; });
    if (!terms.length) { closeSearch(); status.textContent = ""; return; }
    var hits = searchDocs.map(function (doc) {
      var hay = fold(doc.title + "\n" + (doc.headings || []).join("\n") + "\n" + doc.text);
      var score = 0;
      terms.forEach(function (term) { if (hay.indexOf(term) !== -1) score += 1; });
      return { doc: doc, score: score };
    }).filter(function (hit) { return hit.score === terms.length; });
    status.textContent = hits.length ? hits.length + " chapitre" + (hits.length > 1 ? "s" : "") : "Aucun chapitre";
    box.hidden = false;
    box.innerHTML = hits.length ? hits.map(function (hit) {
      return '<a href="#/' + hit.doc.id + '"><strong>' + escapeText(hit.doc.title) + "</strong><span>" + excerpt(hit.doc.text, terms) + "</span></a>";
    }).join("") : "<p class=\"note\">Aucun chapitre pour cette recherche.</p>";
  }

  async function openWithRaw(raw) {
    await importContent(raw);
    await loadIndex();
    catalog = flatChapters();
    gate.hidden = true;
    shell.hidden = false;
    renderSidebar();
    await render();
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    error.hidden = true;
    var code = document.getElementById("code").value.trim();
    if (!code) { fail("Indiquez votre code d’accès."); return; }
    setBusy(true);
    try {
      var keys = await fetch("data/keys.json").then(function (r) { return r.json(); });
      var raw = await unwrapAll(code, keys);
      if (!raw) { fail("Ce code ne correspond à aucun accès."); setBusy(false); return; }
      sessionStorage.setItem(KEY, bufToB64(raw));
      await openWithRaw(raw);
    } catch (e) {
      fail("Le déchiffrement n’a pas abouti. Vérifiez le code, puis réessayez.");
      setBusy(false);
    }
  });

  document.getElementById("logout").addEventListener("click", function () {
    sessionStorage.removeItem(KEY);
    contentKey = null;
    location.reload();
  });
  document.getElementById("print-chapter").addEventListener("click", function () { window.print(); });
  document.getElementById("q").addEventListener("input", function (event) { search(event.target.value); });
  document.addEventListener("keydown", function (event) {
    var tag = (event.target.tagName || "").toLowerCase();
    if (event.key === "/" && tag !== "input" && tag !== "textarea") {
      event.preventDefault();
      document.getElementById("q").focus();
    }
    if (event.key === "Escape") {
      document.getElementById("q").value = "";
      closeSearch();
    }
  });
  window.addEventListener("hashchange", function () { render(); });

  fetch("data/manifest.public.json").then(function (r) { return r.json(); }).then(async function (data) {
    manifest = data;
    var saved = sessionStorage.getItem(KEY);
    if (!saved) return;
    try {
      setBusy(true);
      await openWithRaw(b64ToBuf(saved));
    } catch (e) {
      sessionStorage.removeItem(KEY);
      setBusy(false);
    }
  });
})();
