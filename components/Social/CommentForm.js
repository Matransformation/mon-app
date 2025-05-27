import { useState } from "react";
import axios from "axios";

export default function CommentForm({ postId, authorId, onAdd }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post("/api/comments", {
        postId,
        authorId,
        content,
      });
      onAdd(res.data);
      setContent("");
    } catch (error) {
      console.error("Erreur lors du commentaire :", error);
      alert("Erreur lors de l'ajout du commentaire.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-3 max-w-xl mx-auto">
      <input
        type="text"
        className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
        placeholder="Ajouter un commentaire..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
        aria-label="Ajouter un commentaire"
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md px-5 py-2 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading || !content.trim()}
        aria-label="Publier le commentaire"
      >
        {loading ? "Envoi..." : "Publier"}
      </button>
    </form>
  );
}
