import "server-only";
import type { SupportedLanguage as Language } from "./translations";
import { translateUiText, type TranslationValues } from "./ui-translations";

/** Old Amharic locale cookies must not alter server-rendered pages. */
export async function getRequestLanguage(): Promise<Language> {
  return "en";
}

export async function getServerTranslator() {
  const language = await getRequestLanguage();
  return {
    language,
    t(source: string, values?: TranslationValues) {
      return translateUiText(source, language, values);
    },
  };
}
