import type { CSSProperties } from "react";
export function NewsIcon({topic="Software",large=false}:{topic?:string;large?:boolean}) {
 const paths:Record<string,string>={Software:"M8 8 4 12l4 4m8-8 4 4-4 4M14 5l-4 14",AI:"M9 4h6v4h4v8h-4v4H9v-4H5V8h4V4m0 4h6v8H9V8",Cloud:"M6 18a4 4 0 0 1-1-8 7 7 0 0 1 13-2 5 5 0 0 1 0 10H6",Automation:"M4 8h12l-3-3m7 11H8l3 3M4 8v8m16 0V8","Public sector":"M3 10l9-6 9 6H3m3 0v9m6-9v9m6-9v9M3 20h18"};
 return <svg width={large?56:24} height={large?56:24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[topic]||paths.Software}/></svg>;
}
export function NewsGraphic({label="ETHIOPIA / TECH",accent="#da7757"}:{label?:string;accent?:string}) {
 return <svg viewBox="0 0 700 360" role="img" aria-label="Abstract editorial illustration of connected digital systems" style={{width:"100%",height:"auto",display:"block",color:accent} as CSSProperties}>
 <defs><pattern id="news-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="currentColor" strokeOpacity=".13"/></pattern></defs>
 <rect width="700" height="360" rx="20" fill="#111827"/><rect width="700" height="360" rx="20" fill="url(#news-grid)"/>
 <g fill="none" stroke="currentColor" strokeWidth="2"><path d="M140 180H250m200 0h110M350 100V60m0 240v-40M180 80l70 60m200 80 75 60"/><rect x="250" y="100" width="200" height="160" rx="24"/><rect x="278" y="128" width="144" height="104" rx="12" strokeOpacity=".4"/><path d="M305 155h90m-90 26h55m-55 26h76"/><circle cx="120" cy="180" r="20"/><circle cx="580" cy="180" r="20"/><circle cx="350" cy="40" r="20"/><circle cx="350" cy="320" r="20"/><circle cx="165" cy="65" r="20"/><circle cx="540" cy="295" r="20"/></g>
 <text x="26" y="326" fontSize="13" fontFamily="Arial,sans-serif" fill="#cbd5e1" letterSpacing="3">{label}</text><text x="520" y="42" fontSize="12" fontFamily="Arial,sans-serif" fill="#cbd5e1" letterSpacing="2">HISAB / JOURNAL</text></svg>;
}

