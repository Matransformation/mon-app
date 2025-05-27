import { useState } from "react";
import axios from "axios";

export default function NewPostForm({ onPostCreated }) {
  const [content, setContent] = useState("");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const formData = new FormData();
    formData.append("content", content);
    if (photo) formData.append("photo", photo);

    setLoading(true);
    try {
      const res = await axios.post("/api/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onPostCreated(res.data);
      setContent("");
      setPhoto(null);
    } catch (err) {
      alert("Erreur création post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea value={content} onChange={e => setContent(e.target.value)} required />
      <input type="file" onChange={e => setPhoto(e.target.files[0])} />
      <button disabled={loading}>Publier</button>
    </form>
  );
}
