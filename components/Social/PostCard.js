import Image from "next/image";
import LikeButton from "./LikeButton";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";
import axios from "axios";
import { formatTimeAgo } from "../../utils/date";

export default function PostCard({ post, currentUserId, isAdmin = false, onDelete, onUpdate, onEdit }) {
  const [comments, setComments] = React.useState(post.comments || []);
  const [likes, setLikes] = React.useState(post.likes || []);

  const isLiked = likes.some((like) => like.userId === currentUserId);
  const isAuthor = post.authorId === currentUserId;

  const handleNewComment = (comment) => setComments((prev) => [...prev, comment]);

  const handleToggleLike = (updatedLikes) => setLikes(updatedLikes);

  const handleDelete = async () => {
    if (!confirm("Es-tu sûr(e) de vouloir supprimer ce post ?")) return;
    try {
      await axios.delete(`/api/posts/${post.id}`);
      alert("Post supprimé");
      if (onDelete) onDelete(post.id);
    } catch (error) {
      console.error("Erreur suppression post :", error.response || error);
      alert("Erreur lors de la suppression : " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <article className="max-w-xl mx-auto bg-white rounded-xl shadow-md mb-8 border border-gray-200 overflow-hidden">
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
                <span className="text-xs text-white bg-blue-600 px-2 py-0.5 rounded-full">Admin</span>
              )}
            </div>
            <time className="text-xs text-gray-500" dateTime={new Date(post.createdAt).toISOString()}>
              {formatTimeAgo(post.createdAt)}
            </time>
          </div>
        </div>
        {(isAuthor || isAdmin) && (
          <div className="flex gap-3 text-sm">
            <button
              onClick={onEdit}
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

      <section className="p-4">
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
        <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
      </section>

      <section className="px-4 py-3 flex items-center justify-between border-t border-gray-200 text-sm">
        <div className="flex items-center gap-3">
          <LikeButton postId={post.id} userId={currentUserId} isLiked={isLiked} likes={likes} onUpdate={handleToggleLike} />
          <span className="text-gray-600">
            {likes.length} like{likes.length !== 1 ? "s" : ""}
          </span>
        </div>
        <span className="text-gray-500">
          💬 {comments.length} commentaire{comments.length !== 1 ? "s" : ""}
        </span>
      </section>

      <section className="px-4 pt-2 pb-6 border-t border-gray-200">
        <CommentList
          comments={comments}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onDeleteComment={(id) => setComments((prev) => prev.filter((c) => c.id !== id))}
          onUpdateComment={(updatedComment) =>
            setComments((prev) => prev.map((c) => (c.id === updatedComment.id ? updatedComment : c)))
          }
        />
        <CommentForm postId={post.id} authorId={currentUserId} onAdd={handleNewComment} />
      </section>
    </article>
  );
}
