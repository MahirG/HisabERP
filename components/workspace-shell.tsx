"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect,useRef } from "react";
import type { UserContext } from "../lib/data/types";
import { LanguageSelector,useLanguage } from "./language-provider";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { Icon,type IconName } from "./ui/icon";

type Props={children:ReactNode;user:UserContext|null};
type NavItem={label:string;href:string;icon:IconName};
const shellExcludedRoutes=["/auth","/onboarding"];
function isActiveRoute(pathname:string,href:string){if(href==="/")return pathname==="/";if(href==="/modules")return pathname==="/modules";return pathname===href||pathname.startsWith(`${href}/`)}

export function WorkspaceShell({children,user}:Props){
 const pathname=usePathname();const workspaceRef=useRef<HTMLDivElement>(null);const {dictionary,language}=useLanguage();
 const isExcluded=shellExcludedRoutes.some(route=>pathname===route||pathname.startsWith(`${route}/`));const show=Boolean(user)&&!isExcluded;
 useEffect(()=>{if(show)workspaceRef.current?.scrollTo({top:0,behavior:"auto"})},[pathname,show]);
 if(!show||!user)return <>{children}</>;
 const d=dictionary.dashboard;
 const sections=language==="am"?{core:"ዋና የስራ ቦታ",phase1:"ዋና ስራዎች",phase2:"ማስፋፊያ ሞጁሎች"}:language==="ti"?{core:"ዋና መስርሕ",phase1:"ቀንዲ ስርሓት",phase2:"ምዕባለ ሞጁላት"}:{core:"Core workspace",phase1:"Core operations",phase2:"Growth modules"};
 const setup=language==="am"?"የኩባንያ ማዋቀር":language==="ti"?"ምድላው ትካል":"Company setup";
 const controls=language==="am"?"የምርት ደህንነት":language==="ti"?"ድሕነት ፕሮዳክሽን":"Production controls";
 const einvoice=language==="am"?"ኤሌክትሮኒክ ደረሰኝ":language==="ti"?"ኤሌክትሮኒካዊ ፋክቱር":"Electronic invoicing";
 const reconciliation=language==="am"?"የባንክ እና ክፍያ ማስታረቅ":language==="ti"?"ምዕራቕ ባንክን ክፍሊትን":"Bank and payment reconciliation";
 const groups:Array<{label:string;items:NavItem[]}>= [
  {label:sections.core,items:[{label:d.nav.overview,href:"/",icon:"home"},{label:d.nav.modules,href:"/modules",icon:"grid"},{label:d.nav.finance,href:"/finance",icon:"landmark"},{label:d.nav.sales,href:"/sales",icon:"shopping-cart"},{label:einvoice,href:"/e-invoicing",icon:"file-check"},{label:reconciliation,href:"/reconciliation",icon:"refresh-cw"},{label:setup,href:"/onboarding",icon:"building"}]},
  {label:sections.phase1,items:[{label:dictionary.moduleItems["purchasing-expenses"].shortTitle,href:"/purchasing",icon:"receipt"},{label:dictionary.moduleItems["inventory-warehouse"].shortTitle,href:"/inventory",icon:"boxes"},{label:dictionary.moduleItems["customers-suppliers"].shortTitle,href:"/modules/customers-suppliers",icon:"users"},{label:dictionary.moduleItems["human-resources-payroll"].shortTitle,href:"/hr",icon:"badge-dollar"},{label:controls,href:"/security",icon:"shield-check"},{label:dictionary.moduleItems["reports-analytics"].shortTitle,href:"/modules/reports-analytics",icon:"chart"}]},
  {label:sections.phase2,items:[{label:dictionary.moduleItems["localization-compliance"].shortTitle,href:"/modules/localization-compliance",icon:"scale"},{label:dictionary.moduleItems["fixed-assets"].shortTitle,href:"/modules/fixed-assets",icon:"package-check"},{label:dictionary.moduleItems["budgeting-projects"].shortTitle,href:"/modules/budgeting-projects",icon:"folder-kanban"},{label:dictionary.moduleItems["integrations-automation"].shortTitle,href:"/modules/integrations-automation",icon:"workflow"}]}
 ];
 const gated=user.mfaRequired&&user.aal!=="aal2"&&pathname!=="/account"?<main className="mfa-required-page"><section className="mfa-required-card"><span className="mfa-required-icon" aria-hidden="true"><Icon name="lock" size={28}/></span><p className="eyebrow">PRIVILEGED SESSION REQUIRED</p><h1>Verify administrator access</h1><p>HisabTech now requires authenticator MFA before an owner or administrator can change financial, inventory, payroll, user or security data.</p><div className="mfa-required-actions"><Link className="primary action-link button-with-icon" href="/account"><Icon name="shield-check" size={18}/><span>Set up or verify MFA</span></Link><Link className="secondary action-link button-with-icon" href="/onboarding"><Icon name="building" size={18}/><span>Review setup progress</span></Link></div><small>Your organization data remains readable. Write operations are blocked at both the application and database layers until the session reaches AAL2.</small></section></main>:children;
 return <div className="erp-shell" data-layout-version="professional-icons-v1"><UserMenu user={user}/><aside className="sidebar" data-docked="true"><div className="brand"><span>H</span><div><strong>Hisab</strong><small>{d.brandSubtitle}</small></div></div><div className="sidebar-preferences"><LanguageSelector compact/><ThemeToggle/></div><nav aria-label="Primary workspace navigation">{groups.map(group=><div className="sidebar-nav-group" key={group.label}><span className="sidebar-section-label">{group.label}</span>{group.items.map(item=>{const active=isActiveRoute(pathname,item.href);return <Link aria-current={active?"page":undefined} className={active?"active":undefined} href={item.href} key={item.href}><Icon className="sidebar-nav-icon" name={item.icon} size={20}/><span>{item.label}</span></Link>})}</div>)}</nav><div className="sidebar-dock-status" aria-label="Navigation is docked"><Icon name="check-circle" size={16}/><strong>{language==="am"?"ምናሌው ተቆልፏል":language==="ti"?"ምናሌ ተሰኪሉ":"Navigation docked"}</strong></div><footer className="sidebar-footer"><p className="powered-by">Powered by <a href="https://www.hisabtechnologies.com" target="_blank" rel="noopener noreferrer">HisabTech</a></p><p>{user.organizationName}<br/>Addis Ababa, Ethiopia</p></footer></aside><div className="workspace" id="workspace-content" ref={workspaceRef}>{gated}</div></div>;
}
