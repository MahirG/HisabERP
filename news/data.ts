import content from "./editions.json";
import type { NewsEdition } from "./types";
export const editions: NewsEdition[] = content;
export const getEdition=(slug:string)=>editions.find(edition=>edition.slug===slug);

