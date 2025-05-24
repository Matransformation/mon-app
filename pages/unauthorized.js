// pages/unauthorized.js
export default function Unauthorized() {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-4">
        <h1 className="text-4xl font-bold text-red-600 mb-4">⛔ Accès refusé</h1>
        <p className="text-lg text-gray-700">
          Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
        </p>
      </div>
    );
  }
  