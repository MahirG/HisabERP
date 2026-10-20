import { newsRss } from "../../../../news/rss";
export const dynamic="force-static";
export function GET(){return new Response(newsRss(),{headers:{"Content-Type":"application/rss+xml; charset=utf-8","Cache-Control":"public, max-age=300","X-Content-Type-Options":"nosniff"}});}

