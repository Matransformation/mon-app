// File: hooks/useMenu.js
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

  // ✅ Permet de forcer un menu à la main, ou de recharger depuis l'API
  const loadData = async (manualMenu = null) => {
    if (manualMenu) {
      // Si on fournit un menu, on l'utilise directement
      setMenu(manualMenu);
      return;
    }

    if (status !== "authenticated" || !session?.user?.id) return;
    setLoading(true);
    try {
      const [menuRes, userRes] = await Promise.all([
        axios.get(`/api/menu/${session.user.id}`, {
          params: { weekStart: formatDateLocal(weekStart) },
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

  // Chargement initial & à chaque changement de semaine
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
    reload: loadData, // <-- reload(manualMenu?) met à jour menu local ou refetch
    loading,
  };
}
