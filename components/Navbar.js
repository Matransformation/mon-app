// components/Navbar.js
import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { Menu, X, Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Charger le nombre de notifications non lues
  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchCount = async () => {
      try {
        const res = await axios.get(
          `/api/notifications/unreadCount?userId=${session.user.id}`
        );
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
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm px-4 md:px-8 py-3 mb-0 w-full">
        <div className="flex justify-between items-center w-full">
          {/* Logo + menu desktop */}
          <div className="flex items-center gap-6">
            <Link href="/">
              <Image
                src="/matransformation.png"
                alt="Logo"
                width={160}
                height={40}
                className="h-auto w-auto"
              />
            </Link>
            {session && (
              <div className="hidden md:flex gap-6">
                <Link href="/dashboard" className="text-sm text-gray-700 hover:text-green-700 font-medium">
                  Dashboard
                </Link>
                <Link href="/training" className="text-sm text-gray-700 hover:text-green-700 font-medium">
                  Fitness
                </Link>
                <Link href="/recettes" className="text-sm text-gray-700 hover:text-green-700 font-medium">
                  Recettes
                </Link>
                <Link href="/menu" className="text-sm text-gray-700 hover:text-green-700 font-medium">
                  Menus
                </Link>
                <Link href="/liste-courses" className="text-sm text-gray-700 hover:text-green-700 font-medium">
                  Liste de courses
                </Link>
                <Link href="/mes-favoris" className="text-sm text-gray-700 hover:text-green-700 font-medium">
                  Mes favoris
                </Link>
                <Link href="/mon-compte" className="text-sm text-gray-700 hover:text-green-700 font-medium">
                  Mon compte
                </Link>
                <Link href="/social" className="text-sm text-gray-700 hover:text-green-700 font-medium">
                  Communauté
                </Link>
                <Link href="/user-points" className="text-sm text-gray-700 hover:text-green-700 font-medium">
                  Mes Points Carotte 🥕
                </Link>
                <Link href="/videos" className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 rounded">
                  Tutoriels vidéos
                </Link>
              </div>
            )}
          </div>

          {/* Zone droite desktop */}
          <div className="hidden md:flex items-center gap-4">
            {session && (
              <Link href="/notifications" className="relative">
                <Bell className="text-gray-700 hover:text-green-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}
            {session ? (
              <button onClick={() => signOut()} className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">
                Se déconnecter
              </button>
            ) : (
              <>
                <button onClick={() => window.location.href = "/login"} className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">
                  Se connecter
                </button>
                <button onClick={() => window.location.href = "/register"} className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded">
                  Créer un compte
                </button>
              </>
            )}
          </div>

          {/* Mobile : burger + Menu label + notif + signout */}
          <div className="md:hidden flex items-center gap-3">
            {session && (
              <Link href="/notifications" className="relative">
                <Bell className="text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}
            {session && <span className="text-sm text-gray-700">Menu</span>}
            {session ? (
              <button onClick={toggleMenu} className="p-1">
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            ) : (
              <button onClick={() => window.location.href = "/login"} className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">
                Se connecter
              </button>
            )}
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {menuOpen && session && (
          <div className="mt-3 flex flex-col gap-3 md:hidden">
            <Link href="/dashboard" className="text-sm text-gray-700 hover:text-green-700 font-medium">
              Dashboard
            </Link>
            <Link href="/training" className="text-sm text-gray-700 hover:text-green-700 font-medium">
              Fitness
            </Link>
            <Link href="/recettes" className="text-sm text-gray-700 hover:text-green-700 font-medium">
              Recettes
            </Link>
            <Link href="/menu" className="text-sm text-gray-700 hover:text-green-700 font-medium">
              Menus
            </Link>
            <Link href="/liste-courses" className="text-sm text-gray-700 hover:text-green-700 font-medium">
              Liste de courses
            </Link>
            <Link href="/mes-favoris" className="text-sm text-gray-700 hover:text-green-700 font-medium">
              Mes favoris
            </Link>
            <Link href="/mon-compte" className="text-sm text-gray-700 hover:text-green-700 font-medium">
              Mon compte
            </Link>
            <Link href="/social" className="text-sm text-gray-700 hover:text-green-700 font-medium">
              Communauté
            </Link>
            <Link href="/user-points" className="text-sm text-gray-700 hover:text-green-700 font-medium">
              Mes Points Carotte 🥕
            </Link>
            <Link href="/videos" className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 rounded">
              Tutoriels vidéos
            </Link>
            <Link href="/notifications" className="relative text-gray-700 hover:text-green-700 font-medium">
              Notifications
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
            <button onClick={() => signOut()} className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded w-fit">
              Se déconnecter
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
