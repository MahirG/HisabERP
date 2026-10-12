import { notFound } from "next/navigation";
import { editions,getEdition } from "../../../../news/data";
import { NewsArticle } from "../../../../news/article";
import { articleMetadata } from "../../../../news/seo";
export const dynamicParams=false;
export function generateStaticParams(){return editions.map(e=>({slug:e.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const e=getEdition((await params).slug);return e?articleMetadata(e):{};}
export default async function EditionPage({params}:{params:Promise<{slug:string}>}){const e=getEdition((await params).slug);if(!e)notFound();return <NewsArticle edition={e} basePath="/resources/tech-news" variant="erp" related={editions.filter(a=>a.slug!==e.slug).slice(0,2)}/>;}

