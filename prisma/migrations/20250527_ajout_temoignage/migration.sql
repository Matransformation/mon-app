CREATE TABLE "Temoignage" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  photoUrl TEXT,
  createdAt TIMESTAMP DEFAULT now(),
  validated BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  authorId TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE
);
