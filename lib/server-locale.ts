import { getFoundationCopy } from "./foundation-copy";
import type { SupportedLanguage as Language } from "./translations";

/** English is the only supported website and ERP locale. Legacy cookies are ignored. */
export async function getServerLanguage(): Promise<Language> {
  return "en";
}

export async function getServerFoundationCopy() {
  const language = await getServerLanguage();
  return { language, copy: getFoundationCopy(language) };
}
