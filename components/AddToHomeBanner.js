import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Plus } from "lucide-react";

export default function AddToHomeBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isMobile = /iphone|ipad|ipod|android/i.test(window.navigator.userAgent);
    const alreadyDismissed = localStorage.getItem("hideAddToHomeBanner");

    if (isMobile && !alreadyDismissed) {
      setTimeout(() => setIsVisible(true), 1500);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("hideAddToHomeBanner", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] sm:w-[380px] z-50 animate-slideUp"
      style={{ animation: "slideUp 0.4s ease-out" }}
    >
      <div className="relative bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-xl rounded-3xl p-4 pb-5 overflow-hidden">
        {/* Fermer */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-white/70 hover:text-white transition"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <Image
            src="/favicon-96x96"
            alt="Logo MaTransformation"
            width={40}
            height={40}
            className="rounded-full border border-white/40"
          />
          <div>
            <p className="font-bold text-base leading-tight">MaTransformation</p>
            <p className="text-xs text-white/90">L’expérience nutrition augmentée 🥕</p>
          </div>
        </div>

        {/* Texte */}
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 text-sm leading-snug text-white/90">
          <p>📱 Installe MaTransformation sur ton téléphone :</p>
          <ul className="mt-2 list-disc ml-5 space-y-1">
            <li>Ouvre ce site dans ton navigateur principal</li>
            <li>Appuie sur <strong>Partager</strong></li>
            <li>Sélectionne <strong>“Ajouter à l’écran d’accueil”</strong></li>
          </ul>
        </div>

        {/* Bouton CTA */}
        <button
          onClick={handleClose}
          className="mt-4 flex items-center justify-center gap-2 w-full bg-white text-orange-600 font-semibold py-2.5 rounded-xl shadow hover:bg-orange-50 transition"
        >
          <Plus size={16} /> Ajouter à l’écran d’accueil
        </button>

        {/* Masquer */}
        <button
          onClick={handleClose}
          className="text-white/70 text-xs underline self-center w-full mt-2 hover:text-white transition"
        >
          Masquer ce message
        </button>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
}
