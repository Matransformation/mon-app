import { useState } from "react";
import axios from "axios";

export default function EditPostForm({ post, onPostUpdated, onCancel }) {
  const [content, setContent] = useState(post.content || "");
  const [newPhoto, setNewPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e) => {
    setNewPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("content", content);
    if (newPhoto) formData.append("photo", newPhoto);

    setLoading(true);
    try {
      const res = await axios.put(`/api/posts/${post.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200) {
        onPostUpdated(res.data);
      }
    } catch (error) {
      alert("Erreur lors de la mise à jour du post.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-md max-w-xl mx-auto">
      <textarea
        className="w-full border p-3 rounded mb-4"
        rows={5}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
        required
      />

      {post.imageUrl && !newPhoto && (
        <img src={post.imageUrl} alt="Image actuelle" className="mb-4 max-h-64 w-auto rounded" />
      )}

      <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={loading} className="mb-4" />

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Sauvegarde..." : "Sauvegarder"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
