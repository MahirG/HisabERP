(function () {
  var root = document.documentElement;
  root.dataset.theme = "light";
  root.style.colorScheme = "light";
  try { window.localStorage.setItem("hisab-theme", "light"); } catch (_) {}
  document.cookie = "hisab_theme=light; Path=/; Max-Age=31536000; SameSite=Lax";

  var VIEWPORT_CONTENT = "width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";

  function lockViewport() {
    var viewport = document.querySelector("meta[name='viewport']");
    if (!viewport) {
      viewport = document.createElement("meta");
      viewport.setAttribute("name", "viewport");
      document.head.appendChild(viewport);
    }
    if (viewport.getAttribute("content") !== VIEWPORT_CONTENT) {
      viewport.setAttribute("content", VIEWPORT_CONTENT);
    }
  }

  lockViewport();
  if (document.head) {
    new MutationObserver(lockViewport).observe(document.head, {
      childList: true,
      subtree: true
    });
  }
  window.addEventListener("pageshow", lockViewport);

  var WORKSPACE_STYLES = [
    {
      id: "biloo-workspace-utility-header",
      href: "/biloo-workspace-utility-header.css?v=20260802-3"
    },
    {
      id: "biloo-mobile-navigation-v4",
      href: "/biloo-mobile-navigation-v4.css?v=20260802-2"
    },
    {
      id: "biloo-marketing-navigation-v5",
      href: "/biloo-marketing-navigation-v5.css?v=20260802-1"
    }
  ];

  function ensureWorkspaceStyles() {
    for (var index = 0; index < WORKSPACE_STYLES.length; index += 1) {
      var stylesheet = WORKSPACE_STYLES[index];
      if (document.getElementById(stylesheet.id)) continue;
      var link = document.createElement("link");
      link.id = stylesheet.id;
      link.rel = "stylesheet";
      link.href = stylesheet.href;
      document.head.appendChild(link);
    }
  }

  ensureWorkspaceStyles();

  var NAME_REPLACEMENTS = [
    [/Hisab Technologies/g, "Biloo"],
    [/HisabTech/g, "Biloo"],
    [/Hisab AI/g, "Biloo AI"],
    [/HISAB AI/g, "BILOO AI"],
    [/HisabERP/g, "Biloo ERP"],
    [/Hisab ERP/g, "Biloo ERP"],
    [/HISAB ERP/g, "BILOO ERP"],
    [/ሂሳብ ቴክኖሎጂስ/g, "Biloo"],
    [/የሂሳብ ERP/g, "የBiloo ERP"],
    [/ሂሳብ ERP/g, "Biloo ERP"]
  ];
  var ATTRIBUTES = ["aria-label", "title", "alt", "placeholder"];
  var SKIP_SELECTOR = "script:not([type='application/ld+json']),style,code,pre,textarea,[contenteditable='true'],[data-brand-legacy]";
  var TEXT_SKIP_SELECTOR = "script,style,code,pre,textarea,[contenteditable='true'],[data-brand-legacy]";
  var queuedRoots = [];
  var queued = false;

  function renameBrand(value) {
    var next = value || "";
    for (var index = 0; index < NAME_REPLACEMENTS.length; index += 1) {
      next = next.replace(NAME_REPLACEMENTS[index][0], NAME_REPLACEMENTS[index][1]);
    }
    return next;
  }

  function updateTextNode(node) {
    if (node.parentElement && node.parentElement.closest(TEXT_SKIP_SELECTOR)) return;
    var current = node.nodeValue || "";
    if (!/Hisab|HISAB|ሂሳብ/.test(current)) return;
    var next = renameBrand(current);
    if (current.trim() === "info@hisabtech.com") {
      next = current.replace("info@hisabtech.com", "Email support");
    }
    if (next !== current) node.nodeValue = next;
  }

  function updateElement(element) {
    if (element.matches && element.matches("script[type='application/ld+json']")) {
      var structuredData = element.textContent || "";
      if (!/Hisab|HISAB|ሂሳብ/.test(structuredData)) return;
      var renamedStructuredData = renameBrand(structuredData);
      if (renamedStructuredData !== structuredData) element.textContent = renamedStructuredData;
      return;
    }
    if (element.closest && element.closest(SKIP_SELECTOR)) return;

    for (var index = 0; index < ATTRIBUTES.length; index += 1) {
      var attribute = ATTRIBUTES[index];
      if (!element.hasAttribute || !element.hasAttribute(attribute)) continue;
      var current = element.getAttribute(attribute) || "";
      if (!/Hisab|HISAB|ሂሳብ/.test(current)) continue;
      var next = renameBrand(current);
      if (next !== current) element.setAttribute(attribute, next);
    }

    if (element.tagName === "A" && element.getAttribute("href") === "https://www.hisabtechnologies.com") {
      element.setAttribute("href", "/about");
      element.removeAttribute("target");
      element.removeAttribute("rel");
    }
  }

  function updateSubtree(subtreeRoot) {
    if (!subtreeRoot) return;
    if (subtreeRoot.nodeType === Node.TEXT_NODE) {
      updateTextNode(subtreeRoot);
      return;
    }
    if (subtreeRoot.nodeType !== Node.ELEMENT_NODE && subtreeRoot.nodeType !== Node.DOCUMENT_NODE) return;

    if (subtreeRoot.nodeType === Node.ELEMENT_NODE) updateElement(subtreeRoot);
    var walker = document.createTreeWalker(subtreeRoot, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    var node = walker.nextNode();
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) updateTextNode(node);
      else updateElement(node);
      node = walker.nextNode();
    }
  }

  function updateHead() {
    lockViewport();
    if (document.title && /Hisab|HISAB|ሂሳብ/.test(document.title)) document.title = renameBrand(document.title);
    var metadata = document.querySelectorAll("meta[name='description'],meta[property='og:title'],meta[property='og:description'],meta[name='twitter:title'],meta[name='twitter:description'],meta[name='application-name']");
    for (var index = 0; index < metadata.length; index += 1) {
      var current = metadata[index].getAttribute("content") || "";
      if (!/Hisab|HISAB|ሂሳብ/.test(current)) continue;
      var next = renameBrand(current);
      if (next !== current) metadata[index].setAttribute("content", next);
    }
  }

  function runWhenIdle(callback) {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(callback, { timeout: 800 });
      return;
    }
    window.setTimeout(callback, 32);
  }

  function flushQueuedRoots() {
    queued = false;
    var roots = queuedRoots.splice(0, queuedRoots.length);
    for (var index = 0; index < roots.length; index += 1) updateSubtree(roots[index]);
    updateHead();
  }

  function queueRoot(node) {
    if (!node) return;
    queuedRoots.push(node);
    if (queued) return;
    queued = true;
    runWhenIdle(flushQueuedRoots);
  }

  function startMigration() {
    lockViewport();
    ensureWorkspaceStyles();
    root.dataset.brand = "biloo";
    queueRoot(document.body);

    var observer = new MutationObserver(function (mutations) {
      for (var index = 0; index < mutations.length; index += 1) {
        var mutation = mutations[index];
        if (mutation.type !== "childList") continue;
        for (var childIndex = 0; childIndex < mutation.addedNodes.length; childIndex += 1) {
          queueRoot(mutation.addedNodes[childIndex]);
        }
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true
    });
  }

  function initializeAfterPaint() {
    window.requestAnimationFrame(function () {
      runWhenIdle(startMigration);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeAfterPaint, { once: true });
  else initializeAfterPaint();
})();
