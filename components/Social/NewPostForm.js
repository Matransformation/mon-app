import { useState } from "react";

export default function NewPostForm({ authorId, onPostCreated }) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log("📷 Image sélectionnée :", file);
    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      console.warn("⚠️ Contenu vide !");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("authorId", authorId);
      if (imageFile) {
        formData.append("image", imageFile);
        console.log("📤 Ajout de l'image au FormData :", imageFile.name);
      }

      console.log("📨 Envoi du post...");
      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("📬 Réponse API :", data);

      if (!res.ok) {
        throw new Error(data.error || "Erreur inconnue");
      }

      onPostCreated(data);
      setContent("");
      setImageFile(null);
    } catch (error) {
      console.error("❌ Erreur création post :", error);
      alert("Erreur lors de la création du post : " + error.message);
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
        htmlFor="image-upload"
        className="block mt-4 text-gray-700 text-sm cursor-pointer"
      >
        {imageFile ? `Image sélectionnée : ${imageFile.name}` : "Ajouter une image (optionnel)"}
      </label>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mt-1 block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100
          disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Publication..." : "Publier"}
      </button>
    </form>
  );
}
