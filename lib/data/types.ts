export type UserContext = {
  userId: string;
  email: string;
  fullName: string;
  organizationId: string;
  organizationName: string;
  branchId: string | null;
  role: "owner" | "admin" | "accountant" | "sales" | "inventory" | "viewer";
};

export type DashboardSnapshot = {
  mode: "demo" | "live";
  userName: string;
  organizationName: string;
  metrics: {
    sales: number;
    expenses: number;
    cash: number;
    debt: number;
  };
  monthlyRevenue: number[];
  recentTransactions: Array<{
    id: string;
    description: string;
    category: string;
    date: string;
    amount: number;
    type: "income" | "expense";
  }>;
  health: {
    score: number;
    cashFlow: "strong" | "good" | "attention";
    expenseControl: "strong" | "good" | "attention";
    debtCollection: "strong" | "good" | "attention";
  };
};

export type CustomerRecord = { id: string; name: string; email: string | null; phone: string | null; tin: string | null; creditLimit: number };
export type ProductRecord = { id: string; sku: string; name: string; quantity: number; reorderLevel: number; unitPrice: number; warehouseName: string };
export type JournalRecord = { id: string; number: string; date: string; memo: string; status: string; debit: number; credit: number };
