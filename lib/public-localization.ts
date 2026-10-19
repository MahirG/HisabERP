export type PublicLanguage = "en";
/** Legacy localized source shapes remain accepted; only English is rendered. */
export type LocalizedText = Readonly<{ en: string; am?: string; ti?: string }>;

/** Public marketing content is English-only and remains CDN-cacheable. */
export async function getPublicLanguage(): Promise<PublicLanguage> {
  return "en";
}

export function localize(value: LocalizedText, _language: PublicLanguage) {
  return value.en;
}

export function localizedList(values: readonly LocalizedText[], language: PublicLanguage) {
  return values.map(value => localize(value, language));
}
