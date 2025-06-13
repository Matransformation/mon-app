// pages/admin/notifications.js
import { useState, useEffect } from "react";
import axios from "axios";
import withAuthProtection from "../../lib/withAuthProtection";
import Navbar from "../../components/Navbar";

function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  // Charger uniquement les notifications globales
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/api/notifications");
      // Ne garder que les notifications globales
      setNotifications(res.data.filter(n => n.global));
    } catch (err) {
      console.error("Erreur chargement notifications :", err.response?.data || err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setStatus({ type: 'error', text: 'Veuillez saisir un message.' });
      return;
    }
    setSending(true);
    setStatus(null);
    try {
      // Notification globale unique
      await axios.post("/api/notifications", { message, global: true });

      setStatus({ type: 'success', text: 'Notification globale envoyée !' });
      setMessage("");
      fetchNotifications();
    } catch (err) {
      console.error("Notification POST error:", err.response?.data || err);
      setStatus({ type: 'error', text: err.response?.data?.error || 'Erreur lors de l’envoi.' });
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette notification ?")) return;
    try {
      await axios.delete(`/api/notifications/${id}`);
      setNotifications(n => n.filter(item => item.id !== id));
    } catch (err) {
      console.error("Erreur suppression :", err.response?.data || err);
    }
  };

  const handleEdit = async (id) => {
    const newMsg = prompt("Modifier le message :", notifications.find(n => n.id === id)?.message || "");
    if (newMsg == null) return;
    try {
      await axios.put(`/api/notifications/${id}`, { message: newMsg });
      setNotifications(n => n.map(nt => nt.id === id ? { ...nt, message: newMsg } : nt));
    } catch (err) {
      console.error("Erreur mise à jour :", err.response?.data || err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto p-6 space-y-8">

        {/* Liste des notifications globales */}
        <section>
          <h1 className="text-2xl font-bold mb-4">Notifications globales</h1>
          {notifications.length === 0 ? (
            <p>Aucune notification globale.</p>
          ) : (
            <ul className="space-y-4">
              {notifications.map(n => (
                <li key={n.id} className="border p-4 rounded bg-white flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">{new Date(n.createdAt).toLocaleString()}</p>
                    <p className="text-gray-800">{n.message}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(n.id)} className="text-blue-600 hover:underline text-sm">Modifier</button>
                    <button onClick={() => handleDelete(n.id)} className="text-red-600 hover:underline text-sm">Supprimer</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Formulaire d'envoi global */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Publier une notification globale</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Message</label>
              <textarea
                className="w-full border p-2 rounded"
                rows={3}
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              {sending ? 'Envoi...' : 'Envoyer'}
            </button>
            {status && (
              <p className={`mt-2 ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{status.text}</p>
            )}
          </form>
        </section>

      </main>
    </div>
  );
}

export default withAuthProtection(AdminNotifications);
