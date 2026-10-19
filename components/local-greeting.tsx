"use client";

import { useEffect, useState } from "react";

type GreetingPeriod = "morning" | "afternoon" | "evening" | "night";

const ENGLISH_GREETINGS: Record<GreetingPeriod, string> = {
  morning: "good morning",
  afternoon: "good afternoon",
  evening: "good evening",
  night: "wishing you a peaceful night",
};


export function getGreetingPeriod(hour: number): GreetingPeriod {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export function formatLocalGreeting(language: string, firstName: string, date: Date) {
  const period = getGreetingPeriod(date.getHours());

  return `Selam, ${firstName} — ${ENGLISH_GREETINGS[period]}`;
}

export function formatLocalDate(language: string, date: Date) {
  return new Intl.DateTimeFormat("en-ET", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function LocalGreeting({ language, firstName }: { language: string; firstName: string }) {
  const [localTime, setLocalTime] = useState<Date | null>(null);

  useEffect(() => {
    const updateLocalTime = () => setLocalTime(new Date());

    updateLocalTime();
    const timer = window.setInterval(updateLocalTime, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  if (!localTime) {
    return <span>{`Selam, ${firstName}`}</span>;
  }

  return (
    <>
      <span>{formatLocalGreeting(language, firstName, localTime)}</span>
      <span aria-hidden="true"> · </span>
      <time dateTime={localTime.toISOString()}>{formatLocalDate(language, localTime)}</time>
    </>
  );
}
