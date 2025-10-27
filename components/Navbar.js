import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import Image from "next/image";
import {
  Bell,
  Home,
  Dumbbell,
  Utensils,
  User,
  Gift,
  Video,
  Plus,
  X,
  LogOut,
  Users,
  MessageCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Charger nb notifications non lues
  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchCount = async () => {
      try {
        const res = await axios.get(`/api/notifications/unreadCount?userId=${session.user.id}`);
        setUnreadCount(res.data.count);
      } catch (err) {
        console.error("Erreur chargement unreadCount:", err);
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [session]);

  return (
    <>
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm w-full print:hidden">
        <div className="flex justify-between items-center px-6 py-3">
          {/* Logo */}
          <Link href="/">
            <Image
              src="/matransformation.png"
              alt="Logo MaTransformation"
              width={120}
              height={30}
              className="h-auto w-auto"
              priority
            />
          </Link>

          {/* Notifications + Profil */}
          {session && (
            <div className="flex items-center gap-4">
              <Link href="/notifications" className="relative text-gray-700 hover:text-orange-500">
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <Link
                href="/mon-compte"
                className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold"
              >
                {session?.user?.name?.[0]?.toUpperCase() || "U"}
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* --- MENU FIXE BAS (TOUS ÉCRANS) --- */}
      {session && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_6px_rgba(0,0,0,0.1)]">
          <div className="flex justify-around items-center h-20 relative">
            {/* Dashboard */}
            <Link
              href="/dashboard"
              className={`flex flex-col items-center text-sm ${
                router.pathname === "/dashboard" ? "text-orange-500" : "text-gray-500"
              }`}
            >
              <Home className="h-6 w-6" />
              <span className="mt-2">Dashboard</span>
            </Link>

            {/* Nutrition */}
            <Link
              href="/nutrition"
              className={`flex flex-col items-center text-sm ${
                router.pathname.startsWith("/nutrition") ? "text-orange-500" : "text-gray-500"
              }`}
            >
              <Utensils className="h-6 w-6" />
              <span className="mt-2">Nutrition</span>
            </Link>

            {/* Bouton central + */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className={`absolute -top-11 left-1/2 -translate-x-1/2 bg-orange-500 hover:bg-orange-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-xl border-4 border-white transition-all duration-200 ${
                !menuOpen ? "animate-glow" : ""
              }`}
            >
              {menuOpen ? <X size={32} /> : <Plus size={32} />}
            </button>

            {/* Fitness */}
            <Link
              href="/training"
              className={`flex flex-col items-center text-sm ${
                router.pathname.startsWith("/training") ? "text-orange-500" : "text-gray-500"
              }`}
            >
              <Dumbbell className="h-6 w-6" />
              <span className="mt-2">Fitness</span>
            </Link>

            {/* Profil */}
            <Link
              href="/mon-compte"
              className={`flex flex-col items-center text-sm ${
                router.pathname.startsWith("/mon-compte") ? "text-orange-500" : "text-gray-500"
              }`}
            >
              <User className="h-6 w-6" />
              <span className="mt-2">Profil</span>
            </Link>

            {/* --- MENU FLOTTANT + --- */}
            {menuOpen && (
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-xl shadow-xl py-3 px-4 flex flex-col gap-2 w-48 animate-fade-in">
                <Link
                  href="/social"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-orange-500"
                >
                  <Users className="h-4 w-4 text-orange-500" />
                  Communauté
                </Link>
                <Link
                  href="/user-points"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-orange-500"
                >
                  <Gift className="h-4 w-4 text-orange-500" />
                  Récompenses
                </Link>
                <Link
                  href="/videos"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-orange-500"
                >
                  <Video className="h-4 w-4 text-orange-500" />
                  Tutoriels
                </Link>
                <a
                  href="https://wa.me/33658881560?text=Bonjour%20Cl%C3%A9mence%20et%20Romain%2C%20j%27ai%20une%20question%20sur%20votre%20programme"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 font-medium"
                >
                  <MessageCircle className="h-4 w-4 text-orange-500" />
                  Contact
                </a>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    signOut();
                  }}
                  className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Animation glow optionnelle */}
      <style jsx>{`
        @keyframes glow {
          0% {
            box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.6);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(249, 115, 22, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(249, 115, 22, 0);
          }
        }
        .animate-glow {
          animation: glow 2.4s infinite;
        }
      `}</style>
    </>
  );
}
