// hooks/useMenu.js
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { addWeeks, subWeeks, startOfWeek } from "date-fns";

const TZ = "Europe/Paris";

// Formatte une date en YYYY-MM-DD dans le fuseau Europe/Paris
function formatYMDParis(date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year").value;
  const m = parts.find((p) => p.type === "month").value;
  const d = parts.find((p) => p.type === "day").value;
  return `${y}-${m}-${d}`;
}

// Calcule le lundi (ISO) de la semaine courante dans le fuseau Europe/Paris
function startOfParisWeek(date = new Date()) {
  const parisLocal = new Date(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date)
  );
  return startOfWeek(parisLocal, { weekStartsOn: 1 });
}

export default function useMenu() {
  const { data: session, status } = useSession();

  const [menu, setMenu] = useState([]);
  const [user, setUser] = useState(null);
  const [weekStart, setWeekStart] = useState(startOfParisWeek());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pour annuler les requêtes en cours + ignorer les réponses obsolètes
  const abortRef = useRef(null);
  const requestIdRef = useRef(0);

  const loadData = useCallback(
    async (opts = {}) => {
      if (status !== "authenticated" || !session?.user?.id) return;

      const silent = !!opts.silent;

      if (!silent) {
        setLoading(true);
        setError(null);
      }

      const reqId = ++requestIdRef.current;
      abortRef.current?.abort?.();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const qsWeekStart = formatYMDParis(weekStart);

        const [menuRes, userRes] = await Promise.all([
          axios.get(`/api/menu/${session.user.id}`, {
            params: { weekStart: qsWeekStart },
            signal: controller.signal,
          }),
          axios.get(`/api/utilisateur/${session.user.id}`, {
            signal: controller.signal,
          }),
        ]);

        if (requestIdRef.current !== reqId) return; // réponse obsolète

        setMenu(Array.isArray(menuRes.data) ? menuRes.data : []);
        setUser(userRes.data || null);
      } catch (err) {
        const canceled =
          axios.isCancel?.(err) || err?.name === "CanceledError" || err?.code === "ERR_CANCELED";
        if (canceled) return;
        setError(err);
        console.error("Erreur chargement menu/utilisateur :", err);
      } finally {
        if (!silent && requestIdRef.current === reqId) setLoading(false);
      }
    },
    [status, session?.user?.id, weekStart]
  );

  useEffect(() => {
    loadData(); // premier chargement (non-silent)
  }, [loadData]);

  useEffect(() => {
    return () => abortRef.current?.abort?.();
  }, []);

  const prevWeek = useCallback(() => setWeekStart((ws) => subWeeks(ws, 1)), []);
  const nextWeek = useCallback(() => setWeekStart((ws) => addWeeks(ws, 1)), []);
  const goToWeek = useCallback((date) => setWeekStart(startOfParisWeek(date)), []);
  const goToToday = useCallback(() => setWeekStart(startOfParisWeek()), []);

  return {
    menu,
    setMenu,
    user,
    weekStart,
    prevWeek,
    nextWeek,
    goToWeek,
    goToToday,
    reload: loadData, // ⬅️ accepte { silent: true }
    loading,
    error,
    timeZone: TZ,
  };
}
