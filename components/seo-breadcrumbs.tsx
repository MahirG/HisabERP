import Link from "next/link";
import { breadcrumbData } from "../lib/seo";
import { SeoJsonLd } from "./seo-json-ld";

export function SeoBreadcrumbs({ items }: { items: Array<{ name: string; path: string }> }) {
  return <>
    <SeoJsonLd data={breadcrumbData(items)} />
    <nav className="seo-breadcrumbs" aria-label="Breadcrumb"><ol>{items.map((item, index) => <li key={item.path}>{index === items.length - 1 ? <span aria-current="page">{item.name}</span> : <Link href={item.path}>{item.name}</Link>}</li>)}</ol></nav>
  </>;
}
