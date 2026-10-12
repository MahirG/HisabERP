import type { Metadata } from "next";
import { canonicalUrl,NEWS_ORIGIN,type NewsEdition } from "./types";
export function articleMetadata(e:NewsEdition):Metadata {
 const url=canonicalUrl(e.slug), image=NEWS_ORIGIN+"/news/"+e.slug+"/opengraph-image";
 return {title:e.title,description:e.summary,alternates:{canonical:url,languages:{}},keywords:["Ethiopia tech news","Ethiopia software market","AI Ethiopia","cloud Ethiopia","business automation Ethiopia",...e.topics],openGraph:{type:"article",title:e.title,description:e.summary,url,siteName:"Hisab Technologies",publishedTime:e.publishedAt,modifiedTime:e.updatedAt,authors:[NEWS_ORIGIN],images:[{url:image,width:1200,height:630,alt:e.title}]},twitter:{card:"summary_large_image",title:e.title,description:e.summary,images:[image]}};
}
export function indexMetadata(url:string):Metadata {return {title:"Ethiopia Tech News — Software, AI, Cloud & Automation",description:"Weekly source-linked Ethiopia technology news and business analysis: software, AI, cloud, digital government and automation.",alternates:{canonical:url,languages:{},types:{"application/rss+xml":url+"/rss.xml"}},openGraph:{type:"website",title:"Ethiopia Tech News",url,description:"Weekly evidence-backed developments for Ethiopian businesses.",images:[{url:NEWS_ORIGIN+"/news/opengraph-image",width:1200,height:630}]},twitter:{card:"summary_large_image",images:[NEWS_ORIGIN+"/news/opengraph-image"]}};}

