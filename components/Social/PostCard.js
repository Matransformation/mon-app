import Image from "next/image";
import { useState } from "react";
import LikeButton from "./LikeButton";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";
import axios from "axios";
import { formatTimeAgo } from "../../utils/date";

export default function PostCard({
  post,
  currentUserId,
  isAdmin = false,
  onDelete,
  onUpdate,
  onCommentCreated,
}) {
  const [comments, setComments] = useState(post.comments || []);
  const [likes, setLikes] = useState(post.likes || []);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editImageUrl, setEditImageUrl] = useState(post.imageUrl || null);
  const [loading, setLoading] = useState(false);

  const isLiked = likes.some((like) => like.userId === currentUserId);
  const isAuthor = post.authorId === currentUserId;

  // Gère l'ajout d'un nouveau commentaire localement et notifie SocialPage
  const handleNewComment = (comment) => {
    setComments((prev) => [...prev, comment]);
    if (onCommentCreated) {
      onCommentCreated(post.id, comment);
    }
  };

  const handleToggleLike = (updatedLikes) => {
    setLikes(updatedLikes);
  };

  const handleDelete = async () => {
    if (!confirm("Es-tu sûr(e) de vouloir supprimer ce post ?")) return;
    try {
      await axios.delete(`/api/posts/${post.id}`);
      alert("Post supprimé");
      if (onDelete) onDelete(post.id);
    } catch (error) {
      console.error("Erreur suppression post :", error.response || error);
      alert(
        "Erreur lors de la suppression : " + (error.response?.data?.error || error.message)
      );
    }
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      const res = await axios.put(`/api/posts/${post.id}`, {
        content: editContent,
        imageUrl: editImageUrl,
      });
      setEditContent(res.data.content);
      setEditImageUrl(res.data.imageUrl);
      setIsEditing(false);
      alert("Post modifié");
      if (onUpdate) onUpdate(res.data);
    } catch (error) {
      console.error("Erreur mise à jour post :", error);
      alert("Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="max-w-xl mx-auto bg-white rounded-xl shadow-md mb-8 border border-gray-200 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {post.author?.image && (
            <Image
              src={post.author.image}
              alt={`Photo de ${post.author.name}`}
              width={44}
              height={44}
              className="rounded-full object-cover"
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{post.author?.name}</span>
              {post.author?.role === "admin" && (
                <span className="text-xs text-white bg-blue-600 px-2 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </div>
            <time
              className="text-xs text-gray-500"
              dateTime={new Date(post.createdAt).toISOString()}
            >
              {formatTimeAgo(post.createdAt)}
            </time>
          </div>
        </div>
        {(isAuthor || isAdmin) && !isEditing && (
          <div className="flex gap-3 text-sm">
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800 transition"
              aria-label="Modifier le post"
            >
              Modifier
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 transition"
              aria-label="Supprimer le post"
            >
              Supprimer
            </button>
          </div>
        )}
      </header>

      {/* Content */}
      <section className="p-4">
        {isEditing ? (
          <>
            <textarea
              className="w-full border border-gray-300 rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={5}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              disabled={loading}
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleSaveEdit}
                disabled={loading || !editContent.trim()}
                className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                Sauvegarder
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={loading}
                className="border border-gray-300 px-5 py-2 rounded-md hover:bg-gray-100 transition"
              >
                Annuler
              </button>
            </div>
          </>
        ) : (
          <>
            {post.imageUrl && (
              <div className="relative w-full max-h-[500px] rounded-md overflow-hidden mb-4">
                <Image
                  src={post.imageUrl}
                  alt={post.content.slice(0, 30) || "Image du post"}
                  layout="responsive"
                  width={700}
                  height={500}
                  objectFit="cover"
                />
              </div>
            )}
            <p className="text-gray-800 whitespace-pre-line">{editContent}</p>
          </>
        )}
      </section>

      {/* Likes + comment count */}
      <section className="px-4 py-3 flex items-center justify-between border-t border-gray-200 text-sm">
        <div className="flex items-center gap-3">
          <LikeButton
            postId={post.id}
            userId={currentUserId}
            isLiked={isLiked}
            likes={likes}
            onUpdate={handleToggleLike}
          />
          <span className="text-gray-600">
            {likes.length} like{likes.length !== 1 ? "s" : ""}
          </span>
        </div>
        <span className="text-gray-500">
          💬 {comments.length} commentaire{comments.length !== 1 ? "s" : ""}
        </span>
      </section>

      {/* Comments */}
      <section className="px-4 pt-2 pb-6 border-t border-gray-200">
        <CommentList
          comments={comments}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onDeleteComment={(id) =>
            setComments((prev) => prev.filter((c) => c.id !== id))
          }
          onUpdateComment={(updatedComment) =>
            setComments((prev) =>
              prev.map((c) => (c.id === updatedComment.id ? updatedComment : c))
            )
          }
        />
        <CommentForm
          postId={post.id}
          authorId={currentUserId}
          onAdd={handleNewComment}
        />
      </section>
    </article>
  );
}
