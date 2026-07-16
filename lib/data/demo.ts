import type { CustomerRecord, DashboardSnapshot, JournalRecord, ProductRecord } from "./types";

export const demoDashboard: DashboardSnapshot = {
  mode: "demo",
  userName: "Mahir",
  organizationName: "Hisab Trading Enterprise",
  metrics: { sales: 48_250, expenses: 12_840, cash: 186_400, debt: 74_600 },
  monthlyRevenue: [42_000, 56_000, 48_000, 68_000, 61_000, 78_000, 72_000, 88_000, 82_000, 96_000, 91_000, 108_000],
  recentTransactions: [
    { id: "TRX-1048", description: "Wholesale order — Abebe Market", category: "Sales", date: new Date().toISOString(), amount: 18_500, type: "income" },
    { id: "TRX-1047", description: "Office internet and utilities", category: "Operations", date: new Date().toISOString(), amount: 4_250, type: "expense" },
    { id: "TRX-1046", description: "Retail sales — Bole branch", category: "Sales", date: new Date(Date.now() - 86_400_000).toISOString(), amount: 12_800, type: "income" },
    { id: "TRX-1045", description: "Inventory restock", category: "Purchases", date: new Date(Date.now() - 86_400_000).toISOString(), amount: 8_590, type: "expense" },
  ],
  health: { score: 86, cashFlow: "strong", expenseControl: "good", debtCollection: "attention" },
};

export const demoCustomers: CustomerRecord[] = [
  { id: "demo-c1", name: "Selam Trading PLC", email: "purchase@selamtrading.et", phone: "+251 911 234 567", tin: "0012345678", creditLimit: 250_000 },
  { id: "demo-c2", name: "Bekele Retail Store", email: "bekele.retail@example.com", phone: "+251 911 345 678", tin: null, creditLimit: 75_000 },
];

export const demoProducts: ProductRecord[] = [
  { id: "demo-p1", sku: "BS-500", name: "Berbere Spice 500g", quantity: 248, reorderLevel: 50, unitPrice: 300, warehouseName: "Addis Ababa" },
  { id: "demo-p2", sku: "YC-1KG", name: "Yirgacheffe Coffee 1kg", quantity: 18, reorderLevel: 30, unitPrice: 600, warehouseName: "Addis Ababa" },
];

export const demoJournals: JournalRecord[] = [
  { id: "demo-j1", number: "JE-2026-0001", date: new Date().toISOString().slice(0, 10), memo: "Opening balances", status: "posted", debit: 1_000_000, credit: 1_000_000 },
];
