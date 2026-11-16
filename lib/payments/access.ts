export type AccessPeriod = { tx_ref: string; plan_code: string; starts_at: string; ends_at: string; revoked_at: string | null };

export function currentPaidPeriod(periods: AccessPeriod[], now = Date.now()) {
  const valid = periods.filter((p) => !p.revoked_at && new Date(p.ends_at).getTime() > now).sort((a,b) => Date.parse(a.starts_at)-Date.parse(b.starts_at));
  const current = valid.find((p) => Date.parse(p.starts_at) <= now && Date.parse(p.ends_at) > now);
  if (!current) return null;
  let end = current.ends_at;
  for (const p of valid) {
    if (p.plan_code === current.plan_code && Date.parse(p.starts_at) <= Date.parse(end) && Date.parse(p.ends_at) > Date.parse(end)) end = p.ends_at;
  }
  return { ...current, ends_at: end };
}
