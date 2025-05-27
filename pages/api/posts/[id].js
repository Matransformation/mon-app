import formidable from "formidable";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export const config = {
  api: {
    bodyParser: false, // important pour formidable
  },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(file.filepath));
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!data.secure_url) throw new Error("Erreur upload Cloudinary");
  return data.secure_url;
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Non authentifié" });

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "ID de post invalide" });
  }

  if (req.method === "PUT") {
    const form = formidable({ multiples: false, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: "Erreur parsing formulaire" });

      const content = fields.content;
      if (!content) return res.status(400).json({ error: "Contenu requis" });

      // Vérifier que le post existe
      const { data: post, error: findError } = await supabase
        .from("Post")
        .select("*")
        .eq("id", id)
        .single();

      if (findError || !post) return res.status(404).json({ error: "Post non trouvé" });
      if (post.authorId !== session.user.id && session.user.role !== "admin") {
        return res.status(403).json({ error: "Accès refusé" });
      }

      let imageUrl = post.imageUrl;

      if (files.photo) {
        try {
          imageUrl = await uploadToCloudinary(files.photo);
        } catch (uploadErr) {
          return res.status(500).json({ error: "Erreur upload image" });
        }
      }

      const { data: updatedPost, error: updateError } = await supabase
        .from("Post")
        .update({ content, imageUrl })
        .eq("id", id)
        .select()
        .single();

      if (updateError) return res.status(500).json({ error: "Erreur mise à jour post" });

      res.status(200).json(updatedPost);
    });
  } else if (req.method === "DELETE") {
    // Suppression, si tu veux gérer ici
    // ...
    res.status(405).json({ error: "Méthode non autorisée" });
  } else {
    res.status(405).json({ error: "Méthode non autorisée" });
  }
}
