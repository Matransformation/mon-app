import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import withAuthProtection from "../lib/withAuthProtection";
import Navbar from "../components/Navbar";

function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On ne considère plus session.user.id, on affiche la notif globale
    const fetchNotifications = async () => {
      try {
        // Récupère toutes les notifications
        const res = await axios.get(`/api/notifications`);
        // Garde seulement celles globales
        const globalNotifs = res.data.filter((n) => n.global);
        setNotifications(globalNotifs);

        // Marquer comme lues les globales non ouvertes
        const unread = globalNotifs.filter((n) => !n.opened);
        await Promise.all(
          unread.map((n) =>
            axios.put(`/api/notifications/${n.id}`, { opened: true })
          )
        );
      } catch (err) {
        console.error("Erreur chargement notifications :", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Notifications</h1>

        {loading ? (
          <p>Chargement...</p>
        ) : notifications.length === 0 ? (
          <p>Aucune notification pour le moment.</p>
        ) : (
          <ul className="space-y-4">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`p-4 border rounded-lg shadow-sm transition ${
                  n.opened ? "bg-gray-100" : "bg-white"
                }`}
              >
                <p className="text-sm text-gray-600 mb-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
                <p className="text-gray-800">{n.message}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default withAuthProtection(NotificationsPage);
