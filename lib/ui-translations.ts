import catalog01 from "./locales/ui-catalog-01.json";
import catalog02 from "./locales/ui-catalog-02.json";
import catalog03 from "./locales/ui-catalog-03.json";
import catalog04 from "./locales/ui-catalog-04.json";
import catalog05 from "./locales/ui-catalog-05.json";
import catalog06 from "./locales/ui-catalog-06.json";
import catalog07 from "./locales/ui-catalog-07.json";
import { dictionaries, type Language } from "./translations";

export type TranslationValues = ReadonlyArray<string | number> | Record<string, string | number>;

type UiCatalogEntry = { source: string; am: string; ti: string };
type TranslationEntry = Record<Language, string>;
type CompiledPattern = { source: string; regex: RegExp; keys: string[]; entry: TranslationEntry };

const catalogs = [catalog01, catalog02, catalog03, catalog04, catalog05, catalog06, catalog07] as UiCatalogEntry[][];
const exactTranslations = new Map<string, TranslationEntry>();
const compiledPatterns: CompiledPattern[] = [];

export function normalizeUiText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function flattenDictionary(
  english: unknown,
  amharic: unknown,
  tigrinya: unknown,
) {
  if (typeof english === "string") {
    const source = normalizeUiText(english);
    if (!source) return;
    exactTranslations.set(source, {
      en: source,
      am: typeof amharic === "string" ? normalizeUiText(amharic) : source,
      ti: typeof tigrinya === "string" ? normalizeUiText(tigrinya) : source,
    });
    return;
  }

  if (Array.isArray(english)) {
    english.forEach((value, index) => {
      flattenDictionary(
        value,
        Array.isArray(amharic) ? amharic[index] : undefined,
        Array.isArray(tigrinya) ? tigrinya[index] : undefined,
      );
    });
    return;
  }

  if (english && typeof english === "object") {
    Object.entries(english as Record<string, unknown>).forEach(([key, value]) => {
      const amValue = amharic && typeof amharic === "object"
        ? (amharic as Record<string, unknown>)[key]
        : undefined;
      const tiValue = tigrinya && typeof tigrinya === "object"
        ? (tigrinya as Record<string, unknown>)[key]
        : undefined;
      flattenDictionary(value, amValue, tiValue);
    });
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function compilePattern(source: string, entry: TranslationEntry) {
  const keys: string[] = [];
  const parts = source.split(/(\{[A-Za-z0-9_]+\})/g);
  const regexSource = parts.map((part) => {
    const match = part.match(/^\{([A-Za-z0-9_]+)\}$/);
    if (!match) return escapeRegExp(part);
    keys.push(match[1]);
    return "(.+?)";
  }).join("");
  compiledPatterns.push({ source, regex: new RegExp(`^${regexSource}$`), keys, entry });
}

function registerEntry(entry: TranslationEntry) {
  const source = normalizeUiText(entry.en);
  if (!source) return;
  const normalized = {
    en: source,
    am: normalizeUiText(entry.am) || source,
    ti: normalizeUiText(entry.ti) || source,
  } satisfies TranslationEntry;
  exactTranslations.set(source, normalized);
  if (/\{[A-Za-z0-9_]+\}/.test(source)) compilePattern(source, normalized);
}

flattenDictionary(dictionaries.en, dictionaries.am, dictionaries.ti);
for (const catalog of catalogs) {
  for (const item of catalog) registerEntry({ en: item.source, am: item.am, ti: item.ti });
}

function interpolate(template: string, values: TranslationValues | undefined) {
  if (!values) return template;
  return template.replace(/\{([A-Za-z0-9_]+)\}/g, (token, key: string) => {
    const value = Array.isArray(values)
      ? values[Number(key)]
      : (values as Record<string, string | number>)[key];
    return value === undefined ? token : String(value);
  });
}

function matchPattern(source: string, language: Language) {
  for (const pattern of compiledPatterns) {
    const match = source.match(pattern.regex);
    if (!match) continue;
    const values: Record<string, string> = {};
    pattern.keys.forEach((key, index) => { values[key] = match[index + 1]; });
    return interpolate(pattern.entry[language], values);
  }
  return null;
}

export function translateUiText(
  sourceText: string,
  language: Language,
  values?: TranslationValues,
) {
  if (!sourceText) return sourceText;
  const normalized = normalizeUiText(sourceText);
  if (!normalized) return sourceText;

  const direct = exactTranslations.get(normalized);
  const translated = direct
    ? interpolate(direct[language], values)
    : matchPattern(normalized, language) ?? normalized;

  const leading = sourceText.match(/^\s*/)?.[0] ?? "";
  const trailing = sourceText.match(/\s*$/)?.[0] ?? "";
  return `${leading}${translated}${trailing}`;
}

export function hasUiTranslation(sourceText: string) {
  const normalized = normalizeUiText(sourceText);
  if (exactTranslations.has(normalized)) return true;
  return compiledPatterns.some((pattern) => pattern.regex.test(normalized));
}

export const uiTranslationStats = Object.freeze({
  catalogEntries: catalogs.reduce((count, catalog) => count + catalog.length, 0),
  totalSourceStrings: exactTranslations.size,
  languages: ["en", "am", "ti"] as const,
});
