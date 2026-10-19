"use client";

import { useState } from "react";
import { Icon } from "./ui/icon";

/** Only input visibility is tracked; passwords are never kept in component state. */
export function SignUpPasswordFields() {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <label className="biloo-login-field" htmlFor="signup-password">
        <span>Password</span>
        <div className="biloo-login-input-shell biloo-login-password-shell">
          <span className="biloo-login-field-icon is-password" aria-hidden="true"><Icon name="lock" size={18} /></span>
          <input id="signup-password" name="password"
            type={visible ? "text" : "password"}
            autoComplete="new-password" minLength={10}
            placeholder="Create a password" aria-describedby="signup-password-help" required />
          <button type="button" className="biloo-login-password-toggle"
            aria-label={visible ? "Hide passwords" : "Show passwords"}
            aria-pressed={visible}
            onClick={() => setVisible(current => !current)}>
            {visible ? "Hide" : "Show"}
          </button>
        </div>
      </label>
      <label className="biloo-login-field" htmlFor="signup-confirm-password">
        <span>Confirm password</span>
        <div className="biloo-login-input-shell biloo-login-password-shell">
          <span className="biloo-login-field-icon is-password" aria-hidden="true"><Icon name="lock" size={18} /></span>
          <input id="signup-confirm-password" name="confirmPassword"
            type={visible ? "text" : "password"}
            autoComplete="new-password" minLength={10}
            placeholder="Repeat your password" aria-describedby="signup-password-help" required />
        </div>
      </label>
      <p className="biloo-signup-password-help" id="signup-password-help">
        Use at least 10 characters with uppercase, lowercase and a number.
      </p>
    </>
  );
}
