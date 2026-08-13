'use client';

import Link from 'next/link';
import { Check, IconoirProvider } from 'iconoir-react';
import { useState } from 'react';
import { pricingAddOns, pricingPlans } from '../lib/marketing-pricing';

function formatEtb(value: number) {
  return new Intl.NumberFormat('en-ET', { maximumFractionDigits: 0 }).format(value);
}

const comparisonRows: Array<{ label: string; values: Array<boolean | string> }> = [
  { label: 'Users included', values: ['Up to 2', 'Up to 8', 'Up to 25', 'Custom'] },
  { label: 'Business locations', values: ['1 location', 'Up to 2', 'Up to 5', 'Custom'] },
  { label: 'Sales, expenses & customer balances', values: [true, true, true, true] },
  { label: 'Inventory & warehouse controls', values: [false, true, true, true] },
  { label: 'Purchasing & supplier obligations', values: [false, true, true, true] },
  { label: 'Finance, cash flow & reconciliation', values: [false, false, true, true] },
  { label: 'Multi-branch reporting', values: [false, false, true, true] },
  { label: 'Advanced roles & approvals', values: [false, true, true, true] },
  { label: 'Implementation support', values: ['Email', 'Priority', 'Guided', 'Dedicated'] },
];

function MatrixValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check aria-label="Included" />;
  if (value === false) return <span className="pricing-not-included" aria-label="Not included">—</span>;
  return <span>{value}</span>;
}

export function PricingExperience() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
  const annual = billing === 'annual';

  return (
    <IconoirProvider iconProps={{ width: 17, height: 17, strokeWidth: 1.6, 'aria-hidden': true }}>
      <div className="pricing-controls" aria-label="Access period">
        <button type="button" className={!annual ? 'active' : undefined} aria-pressed={!annual} onClick={() => setBilling('monthly')}>Monthly access</button>
        <button type="button" className={annual ? 'active' : undefined} aria-pressed={annual} onClick={() => setBilling('annual')}>Annual access <span>Save about 2 months</span></button>
      </div>

      <div className="pricing-comparison-wrap">
        <table className="pricing-comparison-table">
          <thead>
            <tr>
              <th>Plan comparison</th>
              {pricingPlans.map((plan) => {
                const amount = annual ? plan.annualEtb : plan.monthlyEtb;
                return <th className={plan.badge ? 'featured' : undefined} key={plan.code}><span>{plan.badge || plan.audience}</span><strong>{plan.name}</strong><b>{amount === null ? 'Custom' : `ETB ${formatEtb(amount)}`}</b><small>{amount === null ? 'Scoped to your organization' : annual ? 'for one year' : 'per month'}</small></th>;
              })}
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row) => <tr key={row.label}><th>{row.label}</th>{row.values.map((value, index) => <td className={pricingPlans[index].badge ? 'featured' : undefined} key={`${row.label}-${pricingPlans[index].code}`}><MatrixValue value={value} /></td>)}</tr>)}
            <tr className="pricing-comparison-actions"><th>Choose your workspace</th>{pricingPlans.map((plan) => { const href = plan.code === 'enterprise' ? plan.href : `/checkout?plan=${plan.code}&billing=${billing}`; return <td className={plan.badge ? 'featured' : undefined} key={plan.code}><Link href={href} className={plan.badge ? 'marketing-start' : 'marketing-demo'}>{plan.cta}</Link></td>; })}</tr>
          </tbody>
        </table>
      </div>

      <div className="pricing-addons">
        <div><span className="marketing-eyebrow">Optional additions</span><h2>Know what changes the final commercial scope.</h2><p>These items stay separate so your team can compare software access with migration, branch growth and specialized implementation work.</p></div>
        <div>{pricingAddOns.map((item) => <article key={item.label}><span><strong>{item.label}</strong><small>{item.detail}</small></span><b>{item.price}</b></article>)}</div>
      </div>
    </IconoirProvider>
  );
}
