import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "../components/Social/PostCard";
import NewPostForm from "../components/Social/NewPostForm";
import Navbar from "../components/Navbar";

export default function SocialPage() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("recent");
  const [visibleCount, setVisibleCount] = useState(6);

  const currentUserId = session?.user?.id;
  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchPosts = async () => {
      try {
        const res = await axios.get("/api/posts");
        setPosts(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement des posts :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [status]);

  // Award points for actions via your API
  const awardPoints = async (actionKey) => {
    try {
      await axios.post("/api/user-points", { actionKey });
    } catch (err) {
      console.error("Erreur lors de l'attribution des points :", err);
    }
  };

  const handleNewPost = async (post) => {
    setPosts((prev) => [post, ...prev]);
    // Award 5 points for creating a post
    await awardPoints("create_post");
  };

  const handleCommentCreated = async (postId, comment) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
      )
    );
    // Award 2 points for adding a comment
    await awardPoints("add_comment");
  };

  const handleDeletePost = (id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdatePost = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortOption === "likes") return b.likes.length - a.likes.length;
    if (sortOption === "comments") return b.comments.length - a.comments.length;
    if (sortOption === "admin") return a.author?.role === "admin" ? -1 : 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const visiblePosts = sortedPosts.slice(0, visibleCount);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="text-gray-500">Chargement...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-center text-gray-600 max-w-md">
          Tu dois être connecté(e) pour accéder au fil d’actualité.
        </p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6 text-center text-gray-900">
            Fil d’actualité – Partage tes repas, ta motivation, tes exploits ❤️
          </h1>

          {/* Filtres */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { label: "🕓 Récents", value: "recent" },
              { label: "❤️ Likés", value: "likes" },
              { label: "💬 Commentés", value: "comments" },
              { label: "👑 Admin", value: "admin" },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => {
                  setSortOption(value);
                  setVisibleCount(6);
                }}
                className={`px-4 py-1 rounded-full text-sm border transition ${
                  sortOption === value
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Pass authorId to NewPostForm */}
          <NewPostForm
            authorId={currentUserId}
            onPostCreated={handleNewPost}
          />

          {loading ? (
            <p className="text-center text-gray-500 mt-10">Chargement des posts...</p>
          ) : visiblePosts.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">Aucun post pour le moment.</p>
          ) : (
            <> 
              {visiblePosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  onDelete={handleDeletePost}
                  onUpdate={handleUpdatePost}
                  onCommentCreated={handleCommentCreated}
                />
              ))}

              {visibleCount < sortedPosts.length && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setVisibleCount((c) => c + 6)}
                    className="text-sm px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full transition"
                  >
                    Voir plus
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
