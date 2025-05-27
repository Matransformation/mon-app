import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

// Initialise Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ Service role requis pour insert côté serveur
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('Post')
        .select(`
          *,
          Utilisateur (id, name, image),
          Comment (id, content, createdAt, authorId, Utilisateur (id, name, image)),
          Like (id, userId)
        `)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data);
    } catch (error) {
      console.error('Erreur API GET /posts :', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ error: 'Non autorisé' });

    const { content, imageUrl } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Contenu requis' });
    }

    try {
      const { data, error } = await supabase
        .from('Post')
        .insert([
          {
            content,
            imageUrl: imageUrl || null,
            authorId: session.user.id,
          },
        ])
        .select(`
          *,
          Utilisateur (id, name, image),
          Comment (id, content, createdAt, authorId),
          Like (id, userId)
        `);

      if (error) throw error;
      return res.status(201).json(data[0]);
    } catch (error) {
      console.error('Erreur Supabase POST :', error);
      return res.status(500).json({ error: 'Erreur insertion post' });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
}
