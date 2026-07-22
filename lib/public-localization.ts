import { cookies } from "next/headers";

export type PublicLanguage = "en" | "am";
export type LocalizedText = Readonly<{ en: string; am: string }>;

export async function getPublicLanguage(): Promise<PublicLanguage> {
  const cookieStore = await cookies();
  return cookieStore.get("hisab_locale")?.value === "am" ? "am" : "en";
}

export function localize(value: LocalizedText, language: PublicLanguage) {
  return value[language];
}

export function localizedList(values: readonly LocalizedText[], language: PublicLanguage) {
  return values.map((value) => localize(value, language));
}
