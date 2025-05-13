import multer from "multer";
import path from "path";
import fs from "fs";
import prisma from "../../../lib/prisma"; // Assurez-vous que cela pointe vers votre configuration Prisma

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./public/uploads";
    // Créer le dossier si il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir); // Définir le répertoire de destination
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Utilise le timestamp comme nom de fichier
  },
});

// Initialiser multer
const upload = multer({ storage });

export default function handler(req, res) {
  if (req.method === "POST") {
    // Utilisation de multer pour gérer l'upload de la photo
    upload.single("photo")(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ message: "Erreur lors de l'upload de la photo", error: err });
      }

      const { utilisateurId } = req.body;
      const photoUrl = `/uploads/${req.file.filename}`; // URL du fichier téléchargé

      try {
        // Mise à jour de l'URL de la photo dans la base de données
        const utilisateur = await prisma.utilisateur.update({
          where: { id: utilisateurId },
          data: { photoUrl: photoUrl },
        });

        return res.status(200).json({ message: "Photo mise à jour avec succès", utilisateur });
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la photo dans la base de données:", error);
        return res.status(500).json({ message: "Erreur serveur lors de la mise à jour de la photo" });
      }
    });
  } else {
    res.status(405).json({ message: "Méthode non autorisée" });
  }
}
