"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";

export default function useQueries() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const get = (key: string) => searchParams.get(key);
  const getAll = () => Object.fromEntries(searchParams.entries());

  const has = (key: string) => searchParams.has(key);

  const set = useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      });

      const qs = newParams.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      router.push(url);
    },
    [router, pathname, searchParams]
  );

  return { get, getAll, has, set };
}
