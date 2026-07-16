export type Metric = {
  label: string;
  value: string;
  change: string;
  tone: "positive" | "warning" | "neutral";
  icon: "sales" | "expense" | "cash" | "debt";
};

export type Transaction = {
  id: string;
  description: string;
  category: string;
  date: string;
  amount: string;
  type: "income" | "expense";
};

export const metrics: Metric[] = [
  { label: "Today’s sales", value: "ETB 48,250", change: "+12.4%", tone: "positive", icon: "sales" },
  { label: "Today’s expenses", value: "ETB 12,840", change: "3 payments", tone: "warning", icon: "expense" },
  { label: "Cash on hand", value: "ETB 186,400", change: "Healthy", tone: "positive", icon: "cash" },
  { label: "Outstanding debt", value: "ETB 74,600", change: "8 customers", tone: "neutral", icon: "debt" },
];

export const transactions: Transaction[] = [
  { id: "TRX-1048", description: "Wholesale order — Abebe Market", category: "Sales", date: "Today, 10:42", amount: "+ ETB 18,500", type: "income" },
  { id: "TRX-1047", description: "Office internet and utilities", category: "Operations", date: "Today, 09:18", amount: "− ETB 4,250", type: "expense" },
  { id: "TRX-1046", description: "Retail sales — Bole branch", category: "Sales", date: "Yesterday, 17:35", amount: "+ ETB 12,800", type: "income" },
  { id: "TRX-1045", description: "Inventory restock", category: "Purchases", date: "Yesterday, 14:12", amount: "− ETB 8,590", type: "expense" },
];

export const monthlyPerformance = [42, 56, 48, 68, 61, 78, 72, 88, 82, 96, 91, 108];
