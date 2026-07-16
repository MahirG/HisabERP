import { cookies } from "next/headers";
import { getFoundationCopy } from "./foundation-copy";
import type { Language } from "./translations";

export async function getServerLanguage(): Promise<Language> {
  const value = (await cookies()).get("hisab_locale")?.value;
  return value === "am" || value === "ti" ? value : "en";
}

export async function getServerFoundationCopy() {
  const language = await getServerLanguage();
  return { language, copy: getFoundationCopy(language) };
}
