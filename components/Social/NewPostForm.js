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

      if (res.status === 201) {
        onPostCreated(res.data);
        setContent("");
        setPhoto(null);
      }
    } catch (error) {
      console.error("Erreur création post :", error);
      alert("Erreur lors de la création du post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow">
      <textarea
        className="w-full border p-3 rounded"
        placeholder="Exprime-toi..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        required
        disabled={loading}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setPhoto(e.target.files[0])}
        className="mt-3"
        disabled={loading}
      />

      <button
        type="submit"
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Publication..." : "Publier"}
      </button>
    </form>
  );
}
