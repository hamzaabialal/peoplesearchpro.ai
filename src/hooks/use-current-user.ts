"use client";

import { useEffect, useState } from "react";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "partner" | "admin";
  image: string | null;
  plan: string | null;
  /** True once the trial has run out with no plan chosen. Always false once `plan` is set. */
  trialExpired: boolean;
  /** Human-readable time left, e.g. "2m left", "6d left", "ended". */
  trialLabel: string;
  /** ISO timestamp the trial ends at, or null once a plan is chosen. */
  trialEndsAt: string | null;
};

/** Client-side hook for the signed-in user, read from `GET /api/me`. */
export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = () => {
    return fetch("/api/me")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => {
        setUser((d?.user as CurrentUser) ?? null);
      })
      .catch(() => {
        setUser(null);
      });
  };

  useEffect(() => {
    let active = true;
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => {
        if (active) setUser((d?.user as CurrentUser) ?? null);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { user, loading, refetch };
}
