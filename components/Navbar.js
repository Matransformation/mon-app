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
  const [menuVisible, setMenuVisible] = useState(false);

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

  const toggleMenu = () => {
    if (menuOpen) {
      setMenuVisible(false);
      setTimeout(() => setMenuOpen(false), 250);
    } else {
      setMenuOpen(true);
      setTimeout(() => setMenuVisible(true), 10);
    }
  };

  return (
    <>
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm w-full print:hidden">
        <div className="flex justify-between items-center px-6 py-3">
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

          {session && (
            <div className="flex items-center gap-4">
              <Link href="/notifications" className="relative text-gray-700 hover:text-orange-500">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <Link
                href="/mon-compte"
                className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm"
              >
                {session?.user?.name?.[0]?.toUpperCase() || "U"}
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* --- MENU BAS FIXE --- */}
      {session && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-3px_8px_rgba(0,0,0,0.08)] h-[86px]">
          <div className="flex justify-around items-center h-full relative text-xs px-2">
            {/* Dashboard */}
            <Link
              href="/dashboard"
              className={`flex flex-col items-center ${
                router.pathname === "/dashboard" ? "text-orange-500" : "text-gray-500"
              }`}
            >
              <Home className="h-5 w-5 mb-[2px]" />
              <span className="text-[11px] font-medium">Accueil</span>
            </Link>

            {/* Nutrition */}
            <Link
              href="/nutrition"
              className={`flex flex-col items-center ${
                router.pathname.startsWith("/nutrition") ? "text-orange-500" : "text-gray-500"
              }`}
            >
              <Utensils className="h-5 w-5 mb-[2px]" />
              <span className="text-[11px] font-medium">Nutrition</span>
            </Link>

            {/* Bouton central + */}
            <div className="relative flex flex-col items-center -translate-y-[2px]">
              <button
                onClick={toggleMenu}
                className={`rounded-full w-[58px] h-[58px] flex items-center justify-center shadow-lg border-[3px] border-white transition-all duration-300 ${
                  menuOpen
                    ? "bg-gradient-to-br from-orange-600 to-orange-400 text-white"
                    : "bg-orange-500 hover:bg-orange-600 text-white animate-glow"
                }`}
              >
                <Plus size={28} />
              </button>
            </div>

            {/* Fitness */}
            <Link
              href="/training"
              className={`flex flex-col items-center ${
                router.pathname.startsWith("/training") ? "text-orange-500" : "text-gray-500"
              }`}
            >
              <Dumbbell className="h-5 w-5 mb-[2px]" />
              <span className="text-[11px] font-medium">Fitness</span>
            </Link>

            {/* Profil */}
            <Link
              href="/mon-compte"
              className={`flex flex-col items-center ${
                router.pathname.startsWith("/mon-compte") ? "text-orange-500" : "text-gray-500"
              }`}
            >
              <User className="h-5 w-5 mb-[2px]" />
              <span className="text-[11px] font-medium">Profil</span>
            </Link>

            {/* --- MENU FLOTTANT --- */}
            {menuOpen && (
              <>
                {/* Fond flouté */}
                <div
                  onClick={toggleMenu}
                  className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
                    menuVisible ? "opacity-100" : "opacity-0"
                  }`}
                ></div>

                {/* Menu flottant avec bouton fermer */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-2xl shadow-xl py-4 px-5 flex flex-col gap-3 w-56 z-50 transform transition-all duration-300 ${
                    menuVisible
                      ? "bottom-[120px] opacity-100 translate-y-0"
                      : "bottom-[90px] opacity-0 translate-y-4"
                  }`}
                >
                  {/* Header du menu avec croix */}
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">Menu rapide</h3>
                    <button
                      onClick={toggleMenu}
                      className="text-gray-400 hover:text-orange-500 transition"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Liens */}
                  {[
                    { href: "/social", icon: <Users className="h-4 w-4 text-orange-500" />, label: "Communauté" },
                    { href: "/user-points", icon: <Gift className="h-4 w-4 text-orange-500" />, label: "Récompenses" },
                    { href: "/videos", icon: <Video className="h-4 w-4 text-orange-500" />, label: "Tutoriels" },
                  ].map((item, i) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 text-sm text-gray-700 hover:text-orange-500 transition-all duration-300"
                      style={{
                        transitionDelay: `${i * 60}ms`,
                        opacity: menuVisible ? 1 : 0,
                        transform: menuVisible ? "translateY(0)" : "translateY(8px)",
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}

                  <a
                    href="https://wa.me/33658881560?text=Bonjour%20Cl%C3%A9mence%20et%20Romain%2C%20j%27ai%20une%20question%20sur%20votre%20programme"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 font-medium transition"
                  >
                    <MessageCircle className="h-4 w-4 text-orange-500" />
                    Contact
                  </a>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      signOut();
                    }}
                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- Animations --- */}
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
