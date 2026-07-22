"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { dictionaries, type Dictionary, type SupportedLanguage as Language } from "../lib/translations";
import { translateUiText, type TranslationValues } from "../lib/ui-translations";

const STORAGE_KEY = "hisab-erp-language";
const COOKIE_NAME = "hisab_locale";
const TRANSLATED_ATTRIBUTES = ["placeholder", "title", "aria-label", "alt"] as const;
const SKIP_SELECTOR = "code,pre,script,style,textarea,[contenteditable='true'],[data-i18n-skip]";

const originalText = new WeakMap<Text, string>();
const appliedText = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();
const appliedAttributes = new WeakMap<Element, Map<string, string>>();
let originalDocumentTitle: string | null = null;
const originalMetaContent = new WeakMap<HTMLMetaElement, string>();

type LanguageContextValue = {
  language: Language;
  dictionary: Dictionary;
  setLanguage: (language: Language) => void;
  t: (source: string, values?: TranslationValues) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function shouldSkip(node: Node) {
  const element = node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement;
  return Boolean(element?.closest(SKIP_SELECTOR));
}

function sourceAttributeMap(store: WeakMap<Element, Map<string, string>>, element: Element) {
  let map = store.get(element);
  if (!map) {
    map = new Map<string, string>();
    store.set(element, map);
  }
  return map;
}

function localizeTextNode(node: Text, language: Language) {
  if (shouldSkip(node)) return;
  const current = node.nodeValue ?? "";
  const lastApplied = appliedText.get(node);
  let source = originalText.get(node);
  if (source === undefined || current !== lastApplied) {
    source = current;
    originalText.set(node, source);
  }
  const translated = language === "en" ? source : translateUiText(source, language);
  if (current !== translated) node.nodeValue = translated;
  appliedText.set(node, translated);
}

function localizeElementAttributes(element: Element, language: Language) {
  if (shouldSkip(element)) return;
  const sources = sourceAttributeMap(originalAttributes, element);
  const applied = sourceAttributeMap(appliedAttributes, element);
  for (const attribute of TRANSLATED_ATTRIBUTES) {
    if (!element.hasAttribute(attribute)) continue;
    const current = element.getAttribute(attribute) ?? "";
    const lastApplied = applied.get(attribute);
    let source = sources.get(attribute);
    if (source === undefined || current !== lastApplied) {
      source = current;
      sources.set(attribute, source);
    }
    const translated = language === "en" ? source : translateUiText(source, language);
    if (current !== translated) element.setAttribute(attribute, translated);
    applied.set(attribute, translated);
  }
  if (element instanceof HTMLInputElement && ["submit", "button", "reset"].includes(element.type)) {
    const sourcesForInput = sourceAttributeMap(originalAttributes, element);
    const appliedForInput = sourceAttributeMap(appliedAttributes, element);
    const current = element.value;
    const lastApplied = appliedForInput.get("value");
    let source = sourcesForInput.get("value");
    if (source === undefined || current !== lastApplied) {
      source = current;
      sourcesForInput.set("value", source);
    }
    const translated = language === "en" ? source : translateUiText(source, language);
    if (current !== translated) element.value = translated;
    appliedForInput.set("value", translated);
  }
}

function localizeHead(language: Language) {
  if (originalDocumentTitle === null) originalDocumentTitle = document.title;
  document.title = language === "en" ? originalDocumentTitle : translateUiText(originalDocumentTitle, language);
  document.querySelectorAll<HTMLMetaElement>('meta[name="description"],meta[property="og:title"],meta[property="og:description"],meta[name="twitter:title"],meta[name="twitter:description"]').forEach((meta) => {
    if (!originalMetaContent.has(meta)) originalMetaContent.set(meta, meta.content);
    const source = originalMetaContent.get(meta) ?? meta.content;
    meta.content = language === "en" ? source : translateUiText(source, language);
  });
}

function localizeSubtree(root: Node, language: Language) {
  if (root.nodeType === Node.TEXT_NODE) {
    localizeTextNode(root as Text, language);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
  const element = root.nodeType === Node.ELEMENT_NODE ? root as Element : null;
  if (element && shouldSkip(element)) return;
  if (element) localizeElementAttributes(element, language);

  const ownerDocument = root.ownerDocument ?? document;
  const walker = ownerDocument.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (node !== root && shouldSkip(node)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let node = walker.nextNode();
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) localizeTextNode(node as Text, language);
    else localizeElementAttributes(node as Element, language);
    node = walker.nextNode();
  }
}

export function LanguageProvider({ children, initialLanguage = "en" }: { children: ReactNode; initialLanguage?: Language }) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if ((saved === "en" || saved === "am") && saved !== language) setLanguageState(saved);
    // The server cookie remains the first-render source of truth.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dataset.language = language;
    document.documentElement.dir = "ltr";
    document.documentElement.setAttribute("aria-busy", "true");
    window.localStorage.setItem(STORAGE_KEY, language);
    document.cookie = `${COOKIE_NAME}=${language}; Path=/; Max-Age=31536000; SameSite=Lax`;

    localizeSubtree(document.documentElement, language);
    localizeHead(language);

    const pending = new Set<Node>();
    let scheduled = false;
    const flush = () => {
      scheduled = false;
      for (const node of pending) localizeSubtree(node, language);
      pending.clear();
      localizeHead(language);
    };
    const schedule = (node: Node) => {
      pending.add(node);
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(flush);
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") schedule(mutation.target);
        if (mutation.type === "attributes") schedule(mutation.target);
        if (mutation.type === "childList") mutation.addedNodes.forEach(schedule);
      }
    });

    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TRANSLATED_ATTRIBUTES],
    });

    const finish = window.setTimeout(() => {
      document.documentElement.classList.remove("i18n-switching");
      document.documentElement.removeAttribute("aria-busy");
      window.dispatchEvent(new Event("hisab:done"));
    }, 180);

    return () => {
      observer.disconnect();
      window.clearTimeout(finish);
    };
  }, [language]);

  const t = useCallback((source: string, values?: TranslationValues) => translateUiText(source, language, values), [language]);
  const value = useMemo<LanguageContextValue>(() => ({ language, dictionary: dictionaries[language], setLanguage: setLanguageState, t }), [language, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}

const languageCodes: Array<{ value: Language; short: string }> = [
  { value: "en", short: "EN" },
  { value: "am", short: "አማ" },
];

function LanguageGlobeIcon() {
  return (
    <svg aria-hidden="true" className="app-icon" fill="none" height="19" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="19">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18" />
      <path d="M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { language, dictionary, setLanguage } = useLanguage();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!compact || !open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [compact, open]);

  function chooseLanguage(next: Language) {
    setOpen(false);
    if (next === language) return;
    document.documentElement.classList.add("i18n-switching");
    window.dispatchEvent(new Event("hisab:busy"));
    window.localStorage.setItem(STORAGE_KEY, next);
    document.cookie = `${COOKIE_NAME}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    startTransition(() => {
      setLanguage(next);
      router.refresh();
    });
  }

  const names: Record<Language, string> = { en: dictionary.language.english, am: dictionary.language.amharic };

  if (compact) {
    return (
      <div className="language-selector language-icon-selector compact" ref={rootRef} data-i18n-skip>
        <button
          className="language-icon-trigger preference-icon-button"
          type="button"
          aria-label={dictionary.language.label}
          aria-haspopup="menu"
          aria-expanded={open}
          title={dictionary.language.label}
          onClick={() => setOpen((current) => !current)}
        >
          <LanguageGlobeIcon />
        </button>
        {open && (
          <div className="language-icon-menu" role="menu" aria-label={dictionary.language.label}>
            {languageCodes.map((item) => (
              <button
                type="button"
                key={item.value}
                role="menuitemradio"
                aria-checked={language === item.value}
                className={language === item.value ? "active" : ""}
                onClick={() => chooseLanguage(item.value)}
              >
                <span>{names[item.value]}</span>
                <b>{item.short}</b>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="language-selector language-segmented" role="group" aria-label={dictionary.language.label} data-i18n-skip>
      <span>{dictionary.language.label}</span>
      <div>{languageCodes.map((item) => <button type="button" key={item.value} className={language === item.value ? "active" : ""} aria-pressed={language === item.value} title={names[item.value]} onClick={() => chooseLanguage(item.value)}>{item.short}</button>)}</div>
    </div>
  );
}
