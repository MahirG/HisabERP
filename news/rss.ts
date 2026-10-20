import { editions } from "./data";
import { canonicalUrl,NEWS_ORIGIN } from "./types";
const xml=(s:string)=>s.replace(/[<>&"']/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&apos;"}[c]!));
export function newsRss(){return '<?xml version="1.0" encoding="UTF-8"?>'+`<rss version="2.0"><channel><title>Hisab Ethiopia Tech News</title><link>${NEWS_ORIGIN}/news</link><description>Software, AI, cloud and automation market briefs for Ethiopian businesses.</description><language>en</language>${editions.map(e=>`<item><title>${xml(e.title)}</title><link>${canonicalUrl(e.slug)}</link><guid isPermaLink="true">${canonicalUrl(e.slug)}</guid><pubDate>${new Date(e.publishedAt).toUTCString()}</pubDate><description>${xml(e.summary)}</description></item>`).join("")}</channel></rss>`;}

