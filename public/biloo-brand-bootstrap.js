(function () {
  var NAME_REPLACEMENTS = [
    [/Hisab Technologies/g, "Biloo"],
    [/HisabTech/g, "Biloo"],
    [/HisabERP/g, "Biloo ERP"],
    [/Hisab ERP/g, "Biloo ERP"],
    [/HISAB ERP/g, "BILOO ERP"],
    [/ሂሳብ ቴክኖሎጂስ/g, "Biloo"],
    [/የሂሳብ ERP/g, "የBiloo ERP"],
    [/ሂሳብ ERP/g, "Biloo ERP"]
  ];
  var ATTRIBUTES = ["aria-label", "title", "alt", "placeholder"];
  var SKIP_SELECTOR = "script:not([type='application/ld+json']),style,code,pre,textarea,[contenteditable='true'],[data-brand-legacy]";

  function renameBrand(value) {
    var next = value || "";
    for (var index = 0; index < NAME_REPLACEMENTS.length; index += 1) {
      next = next.replace(NAME_REPLACEMENTS[index][0], NAME_REPLACEMENTS[index][1]);
    }
    return next;
  }

  function updateTextNode(node) {
    var current = node.nodeValue || "";
    var next = renameBrand(current);
    if (current.trim() === "info@hisabtech.com") {
      next = current.replace("info@hisabtech.com", "Email support");
    }
    if (next !== current) node.nodeValue = next;
  }

  function updateElement(element) {
    if (element.matches && element.matches("script[type='application/ld+json']")) {
      var structuredData = element.textContent || "";
      var renamedStructuredData = renameBrand(structuredData);
      if (renamedStructuredData !== structuredData) element.textContent = renamedStructuredData;
      return;
    }
    if (element.closest && element.closest(SKIP_SELECTOR)) return;

    for (var index = 0; index < ATTRIBUTES.length; index += 1) {
      var attribute = ATTRIBUTES[index];
      if (!element.hasAttribute || !element.hasAttribute(attribute)) continue;
      var current = element.getAttribute(attribute) || "";
      var next = renameBrand(current);
      if (next !== current) element.setAttribute(attribute, next);
    }

    if (element.tagName === "A" && element.getAttribute("href") === "https://www.hisabtechnologies.com") {
      element.setAttribute("href", "/about");
      element.removeAttribute("target");
      element.removeAttribute("rel");
    }
  }

  function updateSubtree(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      updateTextNode(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;

    if (root.nodeType === Node.ELEMENT_NODE) updateElement(root);
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    var node = walker.nextNode();
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) updateTextNode(node);
      else updateElement(node);
      node = walker.nextNode();
    }
  }

  function updateHead() {
    if (document.title) document.title = renameBrand(document.title);
    var metadata = document.querySelectorAll("meta[name='description'],meta[property='og:title'],meta[property='og:description'],meta[name='twitter:title'],meta[name='twitter:description'],meta[name='application-name']");
    for (var index = 0; index < metadata.length; index += 1) {
      var current = metadata[index].getAttribute("content") || "";
      var next = renameBrand(current);
      if (next !== current) metadata[index].setAttribute("content", next);
    }
  }

  var observer = new MutationObserver(function (mutations) {
    for (var index = 0; index < mutations.length; index += 1) {
      var mutation = mutations[index];
      if (mutation.type === "characterData") updateTextNode(mutation.target);
      if (mutation.type === "attributes" && mutation.target.nodeType === Node.ELEMENT_NODE) updateElement(mutation.target);
      if (mutation.type === "childList") {
        for (var childIndex = 0; childIndex < mutation.addedNodes.length; childIndex += 1) {
          updateSubtree(mutation.addedNodes[childIndex]);
        }
      }
    }
    updateHead();
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRIBUTES
  });

  function initialize() {
    updateSubtree(document.documentElement);
    updateHead();
    document.documentElement.dataset.brand = "biloo";
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
