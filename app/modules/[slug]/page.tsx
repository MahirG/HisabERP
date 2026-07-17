import { notFound, redirect } from "next/navigation";
import { ModuleDetail } from "../../../components/module-detail";
import { erpModules, getErpModule } from "../../../lib/erp-modules";

export function generateStaticParams() {
  return erpModules.map((module) => ({ slug: module.slug }));
}

export default async function ModuleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "finance-accounting") redirect("/finance");
  if (slug === "sales-invoicing") redirect("/sales");
  if (!getErpModule(slug)) notFound();
  return <ModuleDetail slug={slug}/>;
}
