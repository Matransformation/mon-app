export default function Abonnement() {
    return (
      <div className="min-h-screen bg-white px-4 py-12 font-sans text-gray-800">
        <h1 className="text-4xl font-bold text-center mb-10">Choisis ta formule</h1>
  
        {/* Tarifs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mb-16">
          {/* 1 mois */}
          <div className="border rounded-lg p-6 shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">1 mois</h2>
            <p className="text-4xl font-bold mb-4">9,99€</p>
            <ul className="text-sm text-gray-600 mb-6 space-y-2">
              <li>Accès au menu personnalisé</li>
              <li>Recettes illimitées</li>
              <li>Calcul des apports</li>
            </ul>
            <button className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800">
              S'abonner
            </button>
          </div>
  
          {/* 3 mois - mise en avant */}
          <div className="border-4 border-green-600 rounded-lg p-6 shadow-lg bg-green-50 relative">
            <span className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl">⭐ Populaire</span>
            <h2 className="text-xl font-semibold mb-2">3 mois</h2>
            <p className="text-4xl font-bold mb-4">24,99€</p>
            <ul className="text-sm text-gray-700 mb-6 space-y-2">
              <li>+ Suivi du métabolisme</li>
              <li>+ Favoris & impression</li>
              <li>+ Accès prioritaire aux menus</li>
            </ul>
            <button className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800">
              Je choisis cette offre
            </button>
          </div>
  
          {/* 6 mois */}
          <div className="border rounded-lg p-6 shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">6 mois</h2>
            <p className="text-4xl font-bold mb-4">44,99€</p>
            <ul className="text-sm text-gray-600 mb-6 space-y-2">
              <li>Inclus : menus + suivi complet</li>
              <li>Support personnalisé</li>
              <li>Accès recettes avancées</li>
            </ul>
            <button className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800">
              S'abonner
            </button>
          </div>
  
          {/* 1 an */}
          <div className="border rounded-lg p-6 shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">1 an</h2>
            <p className="text-4xl font-bold mb-4">79,99€</p>
            <ul className="text-sm text-gray-600 mb-6 space-y-2">
              <li>Offre complète premium</li>
              <li>Accès illimité aux mises à jour</li>
              <li>Coaching communautaire</li>
            </ul>
            <button className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800">
              S'abonner
            </button>
          </div>
        </div>
  
        {/* FAQ */}
        <section className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">FAQ</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold">Puis-je résilier quand je veux ?</h3>
              <p className="text-sm text-gray-600">Oui, tu peux résilier ton abonnement à tout moment directement depuis ton espace personnel.</p>
            </div>
            <div>
              <h3 className="font-semibold">Les recettes sont-elles accessibles sans abonnement ?</h3>
              <p className="text-sm text-gray-600">Tu peux voir les recettes, mais les valeurs nutritionnelles et les menus sont réservés aux abonnés.</p>
            </div>
            <div>
              <h3 className="font-semibold">Quels moyens de paiement sont acceptés ?</h3>
              <p className="text-sm text-gray-600">Carte bancaire via Stripe (100 % sécurisé).</p>
            </div>
          </div>
        </section>
      </div>
    );
  }
  