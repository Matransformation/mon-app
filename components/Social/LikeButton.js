import { useState } from "react";
import axios from "axios";
import { Heart } from "lucide-react";

export default function LikeButton({ postId, userId, isLiked, likes, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const toggleLike = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await axios.post(`/api/likes/index`, {
        postId,
        userId,
      });

      if (res.data && res.data.updatedLikes) {
        onUpdate(res.data.updatedLikes);
      }
    } catch (error) {
      console.error("Erreur like :", error);
      alert("Une erreur est survenue lors du like.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleLike}
      aria-label={isLiked ? "Retirer le like" : "Ajouter un like"}
      disabled={loading}
      className={`transition-all flex items-center justify-center w-9 h-9 rounded-full 
        ${isLiked ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"} 
        hover:scale-110 active:scale-95 disabled:opacity-50`}
    >
      <Heart
        size={20}
        fill={isLiked ? "#dc2626" : "none"}
        strokeWidth={2}
        className="transition-colors"
      />
    </button>
  );
}
