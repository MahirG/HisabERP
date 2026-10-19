import type { SupportedLanguage as Language } from "./translations";

export type TranslationValues = ReadonlyArray<string | number> | Record<string, string | number>;

export function normalizeUiText(value: string) {
  return value.replace(/\\s+/g, " ").trim();
}

function interpolate(source: string, values?: TranslationValues) {
  if (!values) return source;
  return source.replace(/\\{([A-Za-z0-9_]+)\\}/g, (token, key: string) => {
    const value = Array.isArray(values)
      ? values[Number(key)]
      : (values as Record<string, string | number>)[key];
    return value === undefined ? token : String(value);
  });
}

/** Only English UI is rendered, including when an obsolete language key is supplied. */
export function translateUiText(sourceText: string, _language: Language, values?: TranslationValues) {
  return interpolate(sourceText, values);
}

export function hasUiTranslation(sourceText: string) {
  return /[A-Za-z]/.test(normalizeUiText(sourceText));
}

export const uiTranslationStats = Object.freeze({
  catalogEntries: 0,
  totalSourceStrings: 0,
  languages: ["en"] as const,
  fallback: "english-source-copy",
});
