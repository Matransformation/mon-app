import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const { id } = req.query;
  const userId = session.user.id;
  const isAdmin = session.user.role === 'admin'; // Assure-toi que `role` est dans ton token/session

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID invalide' });
  }

  if (req.method === 'DELETE') {
    try {
      // Vérifie que le post existe
      const { data: post, error: findError } = await supabase
        .from('Post')
        .select('*')
        .eq('id', id)
        .single();

      if (findError || !post) {
        return res.status(404).json({ error: 'Post non trouvé' });
      }

      if (post.authorId !== userId && !isAdmin) {
        return res.status(403).json({ error: 'Accès refusé' });
      }

      // Supprimer les commentaires liés
      await supabase.from('Comment').delete().eq('postId', id);

      // Supprimer les likes liés
      await supabase.from('Like').delete().eq('postId', id);

      // Supprimer le post
      await supabase.from('Post').delete().eq('id', id);

      return res.status(200).json({ message: 'Post supprimé avec succès' });
    } catch (error) {
      console.error('Erreur DELETE Supabase :', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  if (req.method === 'PUT') {
    const { content, imageUrl } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Contenu invalide' });
    }

    try {
      const { data: post, error: findError } = await supabase
        .from('Post')
        .select('*')
        .eq('id', id)
        .single();

      if (findError || !post) {
        return res.status(404).json({ error: 'Post non trouvé' });
      }

      if (post.authorId !== userId && !isAdmin) {
        return res.status(403).json({ error: 'Accès refusé' });
      }

      const { data: updatedPost, error: updateError } = await supabase
        .from('Post')
        .update({ content, imageUrl })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      return res.status(200).json(updatedPost);
    } catch (error) {
      console.error('Erreur PUT Supabase :', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
}
