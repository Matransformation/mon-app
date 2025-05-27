import formidable from "formidable";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export const config = { api: { bodyParser: false } };

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
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Non autorisé" });

  const form = formidable({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Erreur parsing formulaire" });

    const content = fields.content;
    if (!content) return res.status(400).json({ error: "Contenu requis" });

    let imageUrl = null;
    if (files.photo) {
      try {
        imageUrl = await uploadToCloudinary(files.photo);
      } catch (error) {
        return res.status(500).json({ error: "Erreur upload image" });
      }
    }

    const { data, error } = await supabase
      .from("Post")
      .insert([{ content, imageUrl, authorId: session.user.id }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json(data);
  });
}
