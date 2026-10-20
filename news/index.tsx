"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { NewsEdition } from "./types";
import { formatNewsDate } from "./types";
import { NewsGraphic, NewsIcon } from "./icon";
import s from "./news.module.css";
const topics=["All","Software","AI","Cloud","Automation","Public sector"];
export function NewsIndex({editions,basePath="/news",brand="Hisab Technologies",variant="company"}:{editions:NewsEdition[];basePath?:string;brand?:string;variant?:"company"|"erp"}) {
 const [query,setQuery]=useState(""); const [topic,setTopic]=useState("All");
 const results=useMemo(()=>editions.filter(e=>(topic==="All"||e.topics.includes(topic))&&` ${e.title} ${e.summary} ${e.items.map(i=>i.title+" "+i.fact).join(" ")} `.toLowerCase().includes(query.trim().toLowerCase())),[editions,topic,query]);
 const latest=editions[0];
 return <div className={s.root+" "+(variant==="erp"?s.erp:s.company)} lang="en">
 <header className={s.hero}><div><span className={s.eyebrow}><NewsIcon/> {brand} · Market intelligence</span><h1>Ethiopia.<br/>Technology.<br/><em>What matters next.</em></h1><p>Software, AI, cloud and business automation—source-linked developments with practical context for Ethiopian businesses.</p><div className={s.meta}><span>Weekly editions</span><span>Independent summaries</span><a href={basePath+"/rss.xml"}>RSS feed ↗</a></div></div><div className={s.heroArt}><NewsGraphic accent={variant==="erp"?"#7db4ff":"#da7757"}/><p>Evidence first. Implications clearly labeled.</p></div></header>
 {latest&&<section className={s.feature}><div><span className={s.eyebrow}>Latest edition · {latest.coverage}</span><h2><Link href={basePath+"/"+latest.slug}>{latest.title}</Link></h2><p>{latest.summary}</p></div><Link className={s.button} href={basePath+"/"+latest.slug}>Read the briefing <span aria-hidden="true">↗</span></Link></section>}
 <section className={s.archive} aria-labelledby="archive-heading"><div className={s.archiveTop}><div><span className={s.eyebrow}>The archive</span><h2 id="archive-heading">Signal over noise.</h2></div><label className={s.search}>Search editions<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try ERP, payments, cloud…" /></label></div>
 <div className={s.filters} aria-label="Filter by topic">{topics.map(t=><button type="button" key={t} aria-pressed={topic===t} onClick={()=>setTopic(t)}>{t!=="All"&&<NewsIcon topic={t}/>} {t}</button>)}</div><p className={s.result} role="status">{results.length} {results.length===1?"edition":"editions"}</p>
 <div className={s.cards}>{results.map((e,index)=><article key={e.slug} className={s.card}><div className={s.cardVisual}><NewsIcon topic={e.topics[0]} large/><span aria-hidden="true">MARKET BRIEF / {e.coverage}</span></div><div className={s.cardBody}><div className={s.meta}><time dateTime={e.publishedAt}>{formatNewsDate(e.publishedAt)}</time><span>{e.readingMinutes} min read</span></div><h3><Link href={basePath+"/"+e.slug}>{e.title}</Link></h3><p>{e.summary}</p><div className={s.tags}>{e.topics.map(t=><span key={t}>{t}</span>)}</div><Link className={s.read} href={basePath+"/"+e.slug}>Read edition <span aria-hidden="true">→</span></Link></div></article>)}</div>
 {results.length===0&&<div className={s.empty}><h3>No editions match this search.</h3><p>Try another topic or a shorter keyword.</p><button onClick={()=>{setQuery("");setTopic("All");}}>Clear filters</button></div>}</section>
 <aside className={s.editorial}><NewsIcon topic="Public sector"/><div><h2>How we report</h2><p>We link to original sources where accessible, distinguish plans from delivery, and label business implications as analysis. Procurement dates are a snapshot: always confirm current documents and amendments with the buyer. Graphics are editorial illustrations, not event photographs.</p><p>Published by Hisab Technologies. Corrections: <a href="mailto:mahir@hisabtech.com?subject=Tech%20news%20correction">mahir@hisabtech.com</a>. English editions; no unverified translations.</p></div></aside>
 </div>;
}

