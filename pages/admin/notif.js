// pages/admin/notif.js
import { useState } from "react"
import axios from "axios"
import withAuthProtection from "../../lib/withAuthProtection";

function NotificationAdminPage() {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState(null)

  const sendNotification = async () => {
    if (!title || !message) {
      setStatus("Veuillez remplir tous les champs.")
      return
    }

    try {
      await axios.post("/api/send-notification", { title, message })
      setStatus("✅ Notification envoyée avec succès !")
      setTitle("")
      setMessage("")
    } catch (err) {
      console.error(err)
      setStatus("❌ Erreur lors de l'envoi de la notification.")
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h1>Envoyer une notification</h1>
      <input
        type="text"
        placeholder="Titre"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
      />
      <textarea
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        style={{ display: "block", width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
      />
      <button onClick={sendNotification} style={{ background: "#22C55E", color: "#fff", padding: "0.75rem 1.5rem", border: "none", borderRadius: "8px" }}>
        Envoyer la notification
      </button>
      {status && <p style={{ marginTop: "1rem" }}>{status}</p>}
    </div>
  )
}
export default withAuthProtection(NotificationAdminPage);
