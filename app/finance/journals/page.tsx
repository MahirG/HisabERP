import { DemoNotice } from "../../../components/demo-notice";
import { SectionShell } from "../../../components/section-shell";
import { listJournals } from "../../../lib/data/erp";
import { getServerFoundationCopy } from "../../../lib/server-locale";

export const metadata = { title: "Journal entries" };
export const dynamic = "force-dynamic";

export default async function JournalsPage() {
  const [data, localized] = await Promise.all([listJournals(), getServerFoundationCopy()]);
  const { mode, records } = data;
  const c = localized.copy.journals;
  return <SectionShell title={c.title} description={c.description}><DemoNotice mode={mode}/><section className="data-panel"><div className="table-wrap"><table className="erp-table"><thead><tr><th>{c.entry}</th><th>{c.date}</th><th>{c.memo}</th><th>{c.status}</th><th>{c.debit}</th><th>{c.credit}</th></tr></thead><tbody>{records.map((journal) => <tr key={journal.id}><td>{journal.number}</td><td>{journal.date}</td><td>{journal.memo}</td><td><span className="status-badge">{journal.status}</span></td><td>ETB {journal.debit.toLocaleString()}</td><td>ETB {journal.credit.toLocaleString()}</td></tr>)}</tbody></table></div></section></SectionShell>;
}
