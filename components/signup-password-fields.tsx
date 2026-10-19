"use client";
import { useState } from "react";
import { Icon } from "./ui/icon";

/** Visibility changes input types, never stores password values in React state. */
export function SignUpPasswordFields() {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <div className="auth-standard-field-grid auth-signup-password-grid">
        <label className="auth-standard-field" htmlFor="signup-password">
          <span>Password</span>
          <span className="auth-signup-password-control">
            <input id="signup-password" name="password"
              type={visible ? "text" : "password"}
              autoComplete="new-password" minLength={10}
              placeholder="Create a password" aria-describedby="signup-password-help" required />
          </span>
        </label>
        <label className="auth-standard-field" htmlFor="signup-confirm-password">
          <span>Confirm password</span>
          <span className="auth-signup-password-control">
            <input id="signup-confirm-password" name="confirmPassword"
              type={visible ? "text" : "password"}
              autoComplete="new-password" minLength={10}
              placeholder="Repeat your password" aria-describedby="signup-password-help" required />
          </span>
        </label>
      </div>
      <div className="auth-signup-password-guidance">
        <p className="auth-standard-password-help" id="signup-password-help">
          At least 10 characters, including uppercase, lowercase and a number.
        </p>
        <button type="button" className="auth-signup-visibility"
          aria-label={visible ? "Hide passwords" : "Show passwords"}
          aria-pressed={visible}
          onClick={() => setVisible(previous => !previous)}>
          <Icon name={visible ? "eye-off" : "eye"} size={16} />
          {visible ? "Hide passwords" : "Show passwords"}
        </button>
      </div>
    </>
  );
}
