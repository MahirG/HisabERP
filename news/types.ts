export const NEWS_ORIGIN = "https://www.hisabtechnologies.com";
export type NewsItem = {category:string;date:string;title:string;status:string;fact:string;why:string;action:string;sources:{name:string;url:string}[]};
export type NewsEdition = {slug:string;title:string;summary:string;publishedAt:string;updatedAt:string;coverage:string;readingMinutes:number;topics:string[];lead:string;items:NewsItem[]};
export const formatNewsDate=(date:string)=>new Intl.DateTimeFormat("en", {day:"numeric",month:"long",year:"numeric",timeZone:"Africa/Addis_Ababa"}).format(new Date(date));
export const canonicalUrl=(slug:string)=>`${NEWS_ORIGIN}/news/${slug}`;
export const safeJson=(value:unknown)=>JSON.stringify(value).replace(/</g,"\\u003c");

