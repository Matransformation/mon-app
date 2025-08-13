// components/home/StatsStrip.js
export default function StatsStrip({ usersCount = 0, rating = 4.9, reviews = 97 }) {
    return (
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927a1 1 0 011.902 0l1.286 3.966a1 1 0 00.95.69h4.17c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.967c.3.921-.755 1.688-1.538 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.783.57-1.838-.197-1.538-1.118l1.286-3.967a1 1 0 00-.364-1.118L2.055 9.393c-.783-.57-.38-1.81.588-1.81h4.17a1 1 0 00.95-.69l1.286-3.966z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{rating}/5</span> • {reviews} avis
            </p>
          </div>
  
          <div className="text-sm text-gray-700">
            Une communauté de{" "}
            <span className="font-bold">{Number(usersCount).toLocaleString()}</span> membres
          </div>
  
          <div className="text-sm text-gray-700">
            <span className="font-semibold text-orange-600">Sans privation</span> • Recettes gourmandes
          </div>
        </div>
      </section>
    );
  }
  