import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("dedicated core operation routes replace generic workspaces", async () => {
  const [purchasingRoute, inventoryRoute, hrRoute, moduleRoute, shell] = await Promise.all([
    read("app/purchasing/page.tsx"),
    read("app/inventory/page.tsx"),
    read("app/hr/page.tsx"),
    read("app/modules/[slug]/page.tsx"),
    read("components/workspace-shell.tsx"),
  ]);
  assert.match(purchasingRoute, /getPurchasingSnapshot/);
  assert.match(inventoryRoute, /getInventoryOperationsSnapshot/);
  assert.match(hrRoute, /getHrPayrollSnapshot/);
  assert.match(moduleRoute, /redirect\("\/purchasing"\)/);
  assert.match(moduleRoute, /redirect\("\/inventory"\)/);
  assert.match(moduleRoute, /redirect\("\/hr"\)/);
  assert.match(shell, /href: "\/purchasing"/);
  assert.match(shell, /href: "\/inventory"/);
  assert.match(shell, /href: "\/hr"/);
});

test("purchasing UI exposes complete procure-to-pay workflow", async () => {
  const [workspace, actions] = await Promise.all([
    read("components/purchasing-workspace.tsx"),
    read("lib/actions/purchasing.ts"),
  ]);
  for (const term of ["Suppliers", "Requests", "Supplier quotes", "Purchase orders", "Goods receipts", "Supplier bills", "Purchase returns"]) assert.match(workspace, new RegExp(term, "i"));
  for (const action of ["createSupplierAction", "createPurchaseRequestAction", "createSupplierQuoteAction", "recordGoodsReceiptAction", "postSupplierBillAction", "recordSupplierPaymentAction", "postPurchaseReturnAction"]) assert.match(actions, new RegExp(action));
});

test("inventory UI exposes transfers counts adjustments and traceability", async () => {
  const [workspace, actions] = await Promise.all([
    read("components/inventory-operations-workspace.tsx"),
    read("lib/actions/inventory-operations.ts"),
  ]);
  for (const term of ["Transfers", "Stock counts", "Adjustments", "Lots & serials"]) assert.match(workspace, new RegExp(term, "i"));
  for (const action of ["createStockTransferAction", "completeStockTransferAction", "createStockCountAction", "submitStockCountAction", "postStockCountAction", "postInventoryAdjustmentAction", "registerInventoryTrackingAction"]) assert.match(actions, new RegExp(action));
});

test("HR UI exposes employee attendance leave salary and payroll controls", async () => {
  const [workspace, actions] = await Promise.all([
    read("components/hr-payroll-workspace.tsx"),
    read("lib/actions/hr-payroll.ts"),
  ]);
  for (const term of ["Employees", "Attendance", "Leave", "Payroll", "Set salary structure"]) assert.match(workspace, new RegExp(term, "i"));
  for (const action of ["createEmployeeAction", "recordAttendanceAction", "createLeaveRequestAction", "setSalaryStructureAction", "createPayrollRunAction", "approvePayrollRunAction", "postPayrollRunAction", "markPayrollPaidAction"]) assert.match(actions, new RegExp(action));
  assert.match(workspace, /professional review/i);
});

test("permissions include purchasing and HR without expanding staff writes", async () => {
  const context = await read("lib/data/context.ts");
  assert.match(context, /manage_purchasing/);
  assert.match(context, /manage_hr/);
  assert.match(context, /staff: \[\]/);
});
