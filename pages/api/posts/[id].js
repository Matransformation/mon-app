import formidable from "formidable";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Anon OK si RLS désactivé ou contrôlé côté serveur
);

const cloudinaryUpload = async (file) => {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(file.filepath));
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!data.secure_url) throw new Error("Échec de l’upload Cloudinary");
  return data.secure_url;
};

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Non authentifié" });

  const { id } = req.query;
  const userId = session.user.id;
  const isAdmin = session.user.role === "admin";

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "ID de post invalide" });
  }

  // 🔁 Mise à jour d’un post
  if (req.method === "PUT") {
    const form = formidable({ multiples: false, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: "Erreur parsing formulaire" });

      const { content } = fields;
      if (!content || typeof content !== "string") {
        return res.status(400).json({ error: "Contenu requis" });
      }

      // Vérifier que le post existe
      const { data: post, error: findError } = await supabase
        .from("Post")
        .select("*")
        .eq("id", id)
        .single();

      if (findError || !post) return res.status(404).json({ error: "Post non trouvé" });
      if (post.authorId !== userId && !isAdmin) {
        return res.status(403).json({ error: "Accès refusé" });
      }

      let imageUrl = post.imageUrl;

      // Si une nouvelle image est envoyée → on l’upload
      if (files.photo) {
        try {
          imageUrl = await cloudinaryUpload(files.photo);
        } catch (uploadErr) {
          console.error("Erreur upload image :", uploadErr);
          return res.status(500).json({ error: "Échec upload image" });
        }
      }

      // Mise à jour du post
      const { data: updatedPost, error: updateError } = await supabase
        .from("Post")
        .update({ content, imageUrl })
        .eq("id", id)
        .select()
        .single();

      if (updateError) return res.status(500).json({ error: "Erreur mise à jour post" });

      return res.status(200).json(updatedPost);
    });
  }

  // 🗑️ Suppression
  if (req.method === "DELETE") {
    const { data: post, error: findError } = await supabase
      .from("Post")
      .select("*")
      .eq("id", id)
      .single();

    if (findError || !post) return res.status(404).json({ error: "Post non trouvé" });
    if (post.authorId !== userId && !isAdmin) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    // Supprimer les commentaires et likes liés
    await supabase.from("Comment").delete().eq("postId", id);
    await supabase.from("Like").delete().eq("postId", id);
    await supabase.from("Post").delete().eq("id", id);

    return res.status(200).json({ message: "Post supprimé avec succès" });
  }

  return res.status(405).json({ error: "Méthode non autorisée" });
}
