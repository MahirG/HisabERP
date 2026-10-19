// Browser-only visual fixtures. This file is bundled by the test server, never by Next.
// Real UI components + read-only demo data; no authentication or network bypass.
import React from "react";
import { createRoot } from "react-dom/client";
import { LanguageProvider } from "../../components/language-provider";
import { AppExperienceProvider } from "../../components/app-experience-provider";
import { WorkspaceShell } from "../../components/workspace-shell";
import { Dashboard } from "../../components/dashboard";
import { FinanceWorkspaceV2 } from "../../components/finance-workspace-v2";
import { SalesWorkspace } from "../../components/sales-workspace";
import { PurchasingWorkspace } from "../../components/purchasing-workspace";
import { InventoryOperationsWorkspace } from "../../components/inventory-operations-workspace";
import { HrPayrollWorkspace } from "../../components/hr-payroll-workspace";
import { ReconciliationWorkspace } from "../../components/reconciliation-workspace";
import { EInvoicingWorkspace } from "../../components/e-invoicing-workspace";
import { HelpCenterPage } from "../../components/help-center-page";
import { demoDashboard, demoFinance } from "../../lib/data/demo";
import { demoSales } from "../../lib/data/sales-demo";
import { demoReconciliation } from "../../lib/data/reconciliation-demo";
import { demoEInvoicing } from "../../lib/data/e-invoicing-demo";
import "../../app/public-styles";
import "../../app/internal-styles";
import "../../app/account/account-v2.css";
import "../../app/sales/sales-contrast-final.css";

const user = { userId: "ui-fixture", email: "fixture@example.test", fullName: "Visual Quality Review", organizationId: "fixture", organizationName: "Biloo UI Review", branchId: null, role: "viewer" as const, aal: "aal1" as const, mfaRequired: false, avatarUrl: null, provider: null };
const base = { mode: "demo" as const, organizationName: user.organizationName };
const inventory = { ...base, products: [], warehouses: [], transfers: [], counts: [], adjustments: [], lots: [], serials: [] };
const purchasing = { ...base, suppliers: [], requests: [], quotes: [], orders: [], receipts: [], bills: [], returns: [], products: [], warehouses: [], expenseAccounts: [] };
const hr = { ...base, employees: [], attendance: [], leaves: [], payrollRuns: [], cashAccounts: [] };
const path = location.pathname;
const tab = new URLSearchParams(location.search).get("tab") ?? undefined;
const content = path === "/finance" ? <FinanceWorkspaceV2 snapshot={demoFinance} initialTab={tab ?? "overview"} canManage={false} />
  : path === "/sales" ? <SalesWorkspace snapshot={demoSales} initialTab={tab ?? "overview"} canManage={false} />
  : path === "/inventory" ? <InventoryOperationsWorkspace snapshot={inventory} initialTab={tab} canManage={false} />
  : path === "/purchasing" ? <PurchasingWorkspace snapshot={purchasing} initialTab={tab} canManage={false} />
  : path === "/hr" ? <HrPayrollWorkspace snapshot={hr} initialTab={tab} canManage={false} />
  : path === "/reconciliation" ? <ReconciliationWorkspace snapshot={demoReconciliation} canConfigure={false} canImport={false} canPost={false} />
  : path === "/e-invoicing" ? <EInvoicingWorkspace snapshot={demoEInvoicing} canConfigure={false} canQueue={false} canClear={false} />
  : path === "/docs/setup" ? <HelpCenterPage />
  : <Dashboard snapshot={demoDashboard} user={user} />;
createRoot(document.getElementById("root")!).render(<LanguageProvider><AppExperienceProvider><WorkspaceShell user={user}>{content}</WorkspaceShell></AppExperienceProvider></LanguageProvider>);
