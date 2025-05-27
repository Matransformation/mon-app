import { useState } from "react";
import Image from "next/image";
import axios from "axios";
import { formatTimeAgo } from "../../utils/date";

export default function CommentList({
  comments,
  currentUserId,
  isAdmin,
  onDeleteComment,
  onUpdateComment,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const startEditing = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent("");
  };

  const saveEdit = async (id) => {
    if (!editContent.trim()) {
      alert("Le contenu ne peut pas être vide.");
      return;
    }
    try {
      const res = await axios.put(`/api/comments/${id}`, {
        content: editContent.trim(),
      });
      onUpdateComment(res.data);
      cancelEditing();
    } catch (error) {
      alert("Erreur lors de la modification");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce commentaire ?")) return;
    try {
      await axios.delete(`/api/comments/${id}`);
      onDeleteComment(id);
    } catch (error) {
      alert("Erreur lors de la suppression");
      console.error(error);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      {comments.map((comment) => {
        const canEdit = comment.authorId === currentUserId || isAdmin;
        const isEditing = editingId === comment.id;

        return (
          <div
            key={comment.id}
            className="flex items-start gap-3 text-sm bg-gray-50 rounded-lg p-3 shadow-sm animate-fade-in"
            aria-live="polite"
          >
            {comment.author?.image && (
              <Image
                src={comment.author.image}
                alt={`Photo de ${comment.author.name}`}
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 font-semibold text-gray-800 mb-1">
                {comment.author?.name}
                {comment.author?.role === "admin" && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </div>

              <time
                className="text-xs text-gray-500"
                dateTime={new Date(comment.createdAt).toISOString()}
              >
                {formatTimeAgo(comment.createdAt)}
              </time>

              {isEditing ? (
                <>
                  <textarea
                    className="w-full border border-gray-300 rounded-md p-2 text-sm mt-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    aria-label="Modifier le commentaire"
                    rows={3}
                  />
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => saveEdit(comment.id)}
                      className="text-blue-600 hover:underline text-sm font-semibold disabled:opacity-50"
                      disabled={!editContent.trim()}
                    >
                      Sauvegarder
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="text-gray-600 hover:underline text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-gray-700 mt-1 whitespace-pre-wrap">{comment.content}</p>
              )}
            </div>

            {canEdit && !isEditing && (
              <div className="flex flex-col gap-1 ml-2">
                <button
                  onClick={() => startEditing(comment)}
                  className="text-blue-600 hover:underline text-xs"
                  aria-label={`Modifier le commentaire de ${comment.author?.name}`}
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-red-600 hover:underline text-xs"
                  aria-label={`Supprimer le commentaire de ${comment.author?.name}`}
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
