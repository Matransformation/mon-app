import { useState } from "react";
import axios from "axios";

export default function EditPostForm({ post, onPostUpdated, onCancel }) {
  const [content, setContent] = useState(post.content || "");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("content", content);
    if (photo) formData.append("photo", photo);

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
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto mb-8 p-6 bg-white rounded-lg shadow-md"
    >
      <textarea
        className="w-full border border-gray-300 rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Exprime-toi..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
        rows={4}
        required
      />
      <label
        htmlFor={`edit-image-${post.id}`}
        className="block mt-4 text-gray-700 text-sm cursor-pointer"
      >
        {photo ? `Nouvelle image : ${photo.name}` : "Changer l’image (optionnel)"}
      </label>
      <input
        id={`edit-image-${post.id}`}
        type="file"
        accept="image/*"
        onChange={(e) => setPhoto(e.target.files[0])}
        className="mt-1 block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100
          disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      />
      <div className="flex gap-4 mt-6">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sauvegarde..." : "Sauvegarder"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 rounded-md transition disabled:opacity-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
