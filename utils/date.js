import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Retourne une chaîne "il y a 2h", "il y a 3 jours", etc.
 * @param {string|Date} date
 * @returns {string}
 */
export function formatTimeAgo(date) {
  if (!date) return "";
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: fr,
  });
}
