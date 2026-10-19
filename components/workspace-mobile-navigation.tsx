"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState } from "react";
import { Icon, type IconName } from "./ui/icon";
import styles from "./workspace-mobile-navigation.module.css";

type Group = { label: string; items: Array<{ label: string; href: string; icon: IconName }> };
type Props = {
  open: boolean;
  onDismiss: () => void;
  groups: Group[];
  pathname: string;
  organizationName: string;
  organizationMark: string;
  activeLabel: string;
  label: string;
};

/** A native modal lives above every application stacking context, including
 * sticky utility bars and account controls. Its styles do not use legacy
 * sidebar classes, and its footer never shares the navigation scroll layer. */
export function WorkspaceMobileNavigation({ open, onDismiss, groups, pathname, organizationName, organizationMark, activeLabel, label }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  // Close the native top-layer dialog immediately on activation. The parent
  // state remains the source of truth, but no render/effect cycle is needed
  // before the visible drawer becomes dismissible again.
  const closeNavigation = () => {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    dismissRef.current();
  };

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!mounted || !dialog) return;
    if (open) {
      if (!dialog.open) {
        dialog.showModal();
        dialog.querySelector<HTMLButtonElement>('button[aria-label="Close navigation"]')?.focus({ preventScroll: true });
      }
      return;
    }
    if (dialog.open) dialog.close();
  }, [open, mounted]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 961px)");
    const dismissOnDesktop = () => { if (desktop.matches) dismissRef.current(); };
    desktop.addEventListener("change", dismissOnDesktop);
    return () => desktop.removeEventListener("change", dismissOnDesktop);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <dialog
      id="mobile-workspace-navigation"
      data-workspace-navigation=""
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-modal="true"
      onCancel={(event) => { event.preventDefault(); closeNavigation(); }}
      onClose={() => {
        // A delayed native close event must not dismiss a newly reopened menu.
        if (!dialogRef.current?.open) dismissRef.current();
      }}
      onClick={(event) => { if (event.target === event.currentTarget) closeNavigation(); }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not([disabled])'));
        const destination = event.shiftKey && document.activeElement === controls[0]
          ? controls.at(-1)
          : !event.shiftKey && document.activeElement === controls.at(-1) ? controls[0] : null;
        if (destination) { event.preventDefault(); destination.focus(); }
      }}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <div className={styles.identity}>
            <h2 id={titleId}>{label}</h2>
          </div>
          <button className={styles.close} type="button" aria-label="Close navigation" onClick={closeNavigation}>
            <Icon name="x" size={20} />
          </button>
        </header>

        <Link href="/workspace-home" className={styles.organization} onClick={closeNavigation} title={organizationName}>
          <span className={styles.mark} aria-hidden="true">{organizationMark}</span>
          <div><strong>{organizationName}</strong><span>{activeLabel}</span></div>
          <Icon name="building" size={18} />
        </Link>

        <nav className={styles.navigation} aria-label={label}>
          {groups.map((group, index) => (
            <section className={styles.group} key={group.label} aria-labelledby={`${titleId}-${index}`}>
              <h3 id={`${titleId}-${index}`}>{group.label}</h3>
              <div className={styles.links}>
                {group.items.map((item) => {
                  const active = item.href === "/workspace-home" ? pathname === "/" || pathname === "/workspace-home" : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link href={item.href} key={item.href} onClick={closeNavigation} aria-current={active ? "page" : undefined} className={styles.link}>
                      <span className={styles.icon}><Icon name={item.icon} size={18} /></span>
                      <span className={styles.label}>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        <footer className={styles.footer}>
          <span className={styles.security}><Icon name="shield-check" size={15} />Business operating system</span>
          <a href="https://www.hisabtech.com" target="_blank" rel="noopener noreferrer">Powered by <strong>Hisab Technologies</strong><Icon name="arrow-right" size={14} /></a>
        </footer>
      </div>
    </dialog>,
    document.body,
  );
}
