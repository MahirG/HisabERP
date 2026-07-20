import {
  saveMpesaDarajaCredentials,
  testMpesaDarajaConnection,
} from "../lib/actions/reconciliation";
import type { DarajaConnectionStatus } from "../lib/data/reconciliation-types";
import { PaymentBrand } from "./payment-brand";
import { Icon } from "./ui/icon";

function checkedAt(value: string) {
  return new Intl.DateTimeFormat("en-ET", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Addis_Ababa",
  }).format(new Date(value));
}

export function DarajaCredentialPanel({
  status,
  canConfigure,
}: {
  status: DarajaConnectionStatus;
  canConfigure: boolean;
}) {
  return (
    <section className="recon-page" aria-labelledby="daraja-credentials-title">
      <article className="recon-panel">
        <div className="recon-panel-head">
          <div>
            <p className="eyebrow icon-action">
              <Icon name="key-round" size={16} />
              Server-only integration credentials
            </p>
            <h2 id="daraja-credentials-title">Safaricom Daraja OAuth</h2>
          </div>
          <PaymentBrand brand="mpesa" compact />
        </div>

        <p className="recon-panel-intro">
          Save the Consumer Key and Consumer Secret in encrypted, organization-scoped Supabase Vault storage. Hisab validates them only against Safaricom OAuth and never exposes the values to the browser after submission.
        </p>

        <div className="recon-compact-list">
          <article>
            <div>
              <strong>Credential status</strong>
              <small>Storage: {status.credentialSource.replaceAll("_", " ")}</small>
            </div>
            <span className={`recon-status ${status.configured ? "matched" : "disputed"}`}>
              {status.configured ? "Configured" : "Not configured"}
            </span>
          </article>
          <article>
            <div>
              <strong>Detected environment</strong>
              <small>Sandbox is tested before production when auto-detect is selected.</small>
            </div>
            <span>{status.environment || "Not verified"}</span>
          </article>
          <article>
            <div>
              <strong>Callback protection</strong>
              <small>The callback token is separate from the Consumer Secret.</small>
            </div>
            <span>{status.callbackTokenConfigured ? "Configured" : "Still required"}</span>
          </article>
          {status.lastCheck && (
            <article>
              <div>
                <strong>Latest OAuth check</strong>
                <small>{checkedAt(status.lastCheck.checkedAt)} · {status.lastCheck.environment}</small>
              </div>
              <span className={`recon-status ${status.lastCheck.status === "verified" ? "matched" : "disputed"}`}>
                {status.lastCheck.status}
              </span>
            </article>
          )}
        </div>

        <form action={saveMpesaDarajaCredentials} className="recon-form">
          <label>
            Consumer Key
            <input
              name="consumerKey"
              type="password"
              required
              minLength={20}
              maxLength={500}
              autoComplete="off"
              spellCheck={false}
              disabled={!canConfigure}
              placeholder="Paste the Daraja Consumer Key"
            />
          </label>
          <label>
            Consumer Secret
            <input
              name="consumerSecret"
              type="password"
              required
              minLength={20}
              maxLength={500}
              autoComplete="new-password"
              spellCheck={false}
              disabled={!canConfigure}
              placeholder="Paste the Daraja Consumer Secret"
            />
          </label>
          <label className="full">
            Environment verification
            <select name="darajaEnvironment" defaultValue="auto" disabled={!canConfigure}>
              <option value="auto">Auto-detect sandbox or production</option>
              <option value="sandbox">Sandbox only</option>
              <option value="production">Production only</option>
            </select>
          </label>
          <button className="primary full" disabled={!canConfigure}>
            <Icon name="shield-check" size={18} />
            <span>Encrypt, save and verify OAuth</span>
          </button>
        </form>

        {status.configured && (
          <form action={testMpesaDarajaConnection} className="recon-source-actions">
            <button className="secondary" disabled={!canConfigure}>
              <Icon name="refresh-cw" size={17} />
              <span>Retest stored Daraja credentials</span>
            </button>
          </form>
        )}

        {!canConfigure && (
          <small className="recon-readonly">
            Only an MFA-verified finance user can manage Daraja credentials.
          </small>
        )}
      </article>
    </section>
  );
}
