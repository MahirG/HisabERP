import { editions } from "../../../news/data";
import { NewsIndex } from "../../../news/index";
import { indexMetadata } from "../../../news/seo";
export const metadata=indexMetadata("https://www.hisabtech.com/resources/tech-news");
export default function NewsPage(){return <NewsIndex editions={editions} basePath="/resources/tech-news" variant="erp" brand="Biloo / HisabTech"/>;}

