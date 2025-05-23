// hooks/useMenu.js

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { addWeeks, subWeeks, startOfWeek } from "date-fns";

export default function useMenu() {
  const { data: session, status } = useSession();
  const [menu, setMenu] = useState([]);
  const [user, setUser] = useState(null);
  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [loading, setLoading] = useState(false);

  const formatDateLocal = (date) => {
    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")
    );
  };

  const loadData = async () => {
    if (status !== "authenticated" || !session?.user?.id) return;
    setLoading(true);
    try {
      const [menuRes, userRes] = await Promise.all([
        axios.get(`/api/menu/${session.user.id}`, {
          params: { weekStart: formatDateLocal(weekStart) }, // ✅ en local, pas UTC
        }),
        axios.get(`/api/utilisateur/${session.user.id}`),
      ]);
      setMenu(menuRes.data);
      setUser(userRes.data);
    } catch (err) {
      console.error("Erreur chargement menu/utilisateur :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [status, session, weekStart]);

  const prevWeek = () => setWeekStart(ws => subWeeks(ws, 1));
  const nextWeek = () => setWeekStart(ws => addWeeks(ws, 1));

  return {
    menu,
    setMenu,
    user,
    weekStart,
    prevWeek,
    nextWeek,
    reload: loadData,
    loading,
  };
}
