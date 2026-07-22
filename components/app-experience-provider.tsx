"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLanguage } from "./language-provider";

const experienceCopy = {
  en: {
    loading: "Preparing your workspace",
    loadingDetail: "Securing the update and refreshing your records…",
    done: "Done",
    completed: "Completed successfully",
    created: "was created successfully.",
    updated: "was updated successfully.",
    money: "was recorded successfully.",
  },
  am: {
    loading: "የስራ ቦታዎ እየተዘጋጀ ነው",
    loadingDetail: "ለውጡን በደህንነት እያስቀመጥን መዝገቦችን እያደስን ነው…",
    done: "ተጠናቋል",
    completed: "በተሳካ ሁኔታ ተጠናቋል",
    created: "በተሳካ ሁኔታ ተፈጥሯል።",
    updated: "በተሳካ ሁኔታ ተዘምኗል።",
    money: "በተሳካ ሁኔታ ተመዝግቧል።",
  },
  ti: {
    loading: "መስርሕ ስራሕካ ይዳሎ ኣሎ",
    loadingDetail: "ለውጢ ብውሑስ መንገዲ እናዓቀብና መዛግብቲ ነሐድስ ኣለና…",
    done: "ተዛዚሙ",
    completed: "ብዓወት ተዛዚሙ",
    created: "ብዓወት ተፈጢሩ።",
    updated: "ብዓወት ተዓሪዩ።",
    money: "ብዓወት ተመዝጊቡ።",
  },
} as const;

type ToastState = { title: string; detail: string } | null;

const publicRoutes = new Set(["/", "/request-demo", "/product-tour", "/ethiopia", "/industries", "/pricing", "/customer-stories", "/trust", "/integrations", "/migration", "/compare", "/help-center", "/resources", "/about"]);
const publicPrefixes = ["/auth/", "/product/", "/industries/", "/compare/", "/help-center/", "/resources/"];

function isPublicRoute(pathname: string) {
  return publicRoutes.has(pathname) || publicPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function money(value: string | null) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB", maximumFractionDigits: 2 }).format(Number.isFinite(amount) ? amount : 0);
}

function BrandLoader({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="experience-loader-card brand-loader-card">
      <div className="brand-loader-mark" aria-hidden="true">
        <span className="brand-loader-ring" />
        <span className="brand-loader-logo-shell">
          <img src="/hisab-logo.svg" alt="" width="48" height="48" decoding="async" />
        </span>
      </div>
      <div className="brand-loader-copy">
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
      <div className="brand-loader-progress" aria-hidden="true"><span /></div>
    </div>
  );
}

export function AppExperienceProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const copy = experienceCopy[language];
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const busyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastToastKey = useRef("");
  const publicNavigation = isPublicRoute(pathname);

  useEffect(() => {
    function start() {
      setBusy(true);
      if (busyTimer.current) clearTimeout(busyTimer.current);
      busyTimer.current = setTimeout(() => setBusy(false), 20_000);
    }

    function showSuccess() {
      const params = new URLSearchParams(window.location.search);
      const successCode = params.get("successCode");
      const legacySuccess = params.get("success") || params.get("created") || params.get("updated");
      if (!successCode && !legacySuccess) return;

      const record = params.get("record") || legacySuccess || "Record";
      const key = `${window.location.pathname}|${successCode}|${record}|${params.get("status")}|${params.get("amount")}`;
      if (lastToastKey.current === key) return;
      lastToastKey.current = key;

      let detail = legacySuccess || copy.completed;
      if (successCode === "recordCreated") detail = `${record} ${copy.created}`;
      if (successCode === "recordUpdated") detail = `${record} ${copy.updated}`;
      if (successCode === "moneyRecorded") detail = `${record} · ${money(params.get("amount"))} ${copy.money}`;

      setToast({ title: copy.done, detail });
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 5_500);
    }

    function complete() {
      if (busyTimer.current) clearTimeout(busyTimer.current);
      setBusy(false);
      window.setTimeout(showSuccess, 60);
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(target instanceof HTMLAnchorElement) || target.target === "_blank" || target.hasAttribute("download")) return;
      const url = new URL(target.href, window.location.href);
      if (url.origin !== window.location.origin || url.href === window.location.href || url.hash) return;
      start();
    }

    function onSubmit(event: SubmitEvent) {
      const form = event.target;
      if (form instanceof HTMLFormElement && form.dataset.noLoading !== "true") start();
    }

    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);
    window.history.pushState = (...args) => {
      originalPushState(...args);
      window.dispatchEvent(new Event("hisab:navigation-complete"));
    };
    window.history.replaceState = (...args) => {
      originalReplaceState(...args);
      window.dispatchEvent(new Event("hisab:navigation-complete"));
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    window.addEventListener("popstate", complete);
    window.addEventListener("hisab:navigation-complete", complete);
    window.addEventListener("hisab:busy", start);
    window.addEventListener("hisab:done", complete);
    showSuccess();

    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      window.removeEventListener("popstate", complete);
      window.removeEventListener("hisab:navigation-complete", complete);
      window.removeEventListener("hisab:busy", start);
      window.removeEventListener("hisab:done", complete);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      if (busyTimer.current) clearTimeout(busyTimer.current);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [copy]);

  useEffect(() => {
    window.dispatchEvent(new Event("hisab:done"));
  }, [pathname]);

  return (
    <>
      {children}
      {busy && publicNavigation && (
        <div className="public-route-progress app-navigation-progress" role="status" aria-live="polite" aria-label={copy.loadingDetail}>
          <span aria-hidden="true" />
          <b className="sr-only">{copy.loadingDetail}</b>
        </div>
      )}
      {busy && !publicNavigation && (
        <div className="experience-overlay brand-route-loading" role="status" aria-live="polite" aria-atomic="true" aria-label={copy.loading}>
          <BrandLoader title={copy.loading} detail={copy.loadingDetail} />
        </div>
      )}
      {toast && (
        <div className="experience-toast" role="status" aria-live="polite">
          <span className="experience-toast-check" aria-hidden="true">✓</span>
          <div><strong>{toast.title}</strong><p>{toast.detail}</p></div>
          <button type="button" onClick={() => setToast(null)} aria-label="Close">×</button>
        </div>
      )}
    </>
  );
}
