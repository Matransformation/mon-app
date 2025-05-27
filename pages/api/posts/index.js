import formidable from "formidable";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY // autorisé ici car on n’écrit rien côté client
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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Non autorisé" });

  const form = formidable({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Erreur parse formulaire :", err);
      return res.status(500).json({ error: "Erreur parsing" });
    }

    const { content } = fields;
    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "Contenu requis" });
    }

    let imageUrl = null;

    if (files.photo) {
      try {
        imageUrl = await cloudinaryUpload(files.photo);
      } catch (uploadErr) {
        console.error("Erreur upload Cloudinary :", uploadErr);
        return res.status(500).json({ error: "Erreur upload image" });
      }
    }

    try {
      const { data, error } = await supabase
        .from("Post")
        .insert([
          {
            content,
            imageUrl,
            authorId: session.user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    } catch (error) {
      console.error("Erreur Supabase :", error);
      return res.status(500).json({ error: "Erreur enregistrement" });
    }
  });
}
