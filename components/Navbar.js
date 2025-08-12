// components/Navbar.js
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import Image from "next/image";
import {
  Menu as MenuIcon,
  X,
  Bell,
  Home,
  Dumbbell,
  Utensils,
  User,
  Users,
  Carrot,
  Video,
  Gift,
} from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();

  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // --- Hover intent pour sous-menus desktop
  const closeTimer = useRef(null);
  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const openMenu = (label) => {
    clearCloseTimer();
    setOpenDropdown(label);
  };
  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 220);
  };

  // Charger nb de notifications non lues
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

  // Fermer le menu mobile quand on change de page
  useEffect(() => {
    const handleRoute = () => setMenuOpen(false);
    router.events?.on("routeChangeComplete", handleRoute);
    return () => router.events?.off("routeChangeComplete", handleRoute);
  }, [router.events]);

  // Liens
  const NAV_LINKS = [
    { href: "/dashboard", label: "Dashboard", Icon: Home },
    { href: "/training", label: "Fitness", Icon: Dumbbell },
    {
      label: "Nutrition",
      Icon: Utensils,
      children: [
        { href: "/menu", label: "Menus" },
        { href: "/liste-courses", label: "Liste de courses" },
        { href: "/mes-favoris", label: "Mes favoris" },
        { href: "/recettes", label: "Recettes" },
      ],
    },
    { href: "/mon-compte", label: "Mon compte", Icon: User },
    { href: "/social", label: "Communauté", Icon: Users },
    {
      label: "Récompenses",
      Icon: Gift,
      children: [
        { href: "/user-points", label: "Mes Points Carotte", Icon: Carrot },
        { href: "/roulette", label: "Gagne ton cadeau", Icon: Gift },
      ],
    },
    // CTA
    { href: "/videos", label: "Tutoriels vidéos", Icon: Video, cta: true },
  ];

  // Lien simple
  const renderLink = ({ href, label, Icon, cta }) => {
    const isActive = router.pathname === href;
    if (cta) {
      return (
        <Link
          key={href}
          href={href}
          className="flex items-center gap-2 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded"
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </Link>
      );
    }
    const base = "flex items-center gap-2 text-sm font-medium px-2 py-1";
    const activeClass = isActive
      ? "text-green-700"
      : "text-gray-700 hover:text-green-700";
    return (
      <Link key={href} href={href} className={`${base} ${activeClass}`}>
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <nav
      className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm w-full print:hidden"
      role="navigation"
      aria-label="Menu principal"
    >
      {/* Barre supérieure */}
      <div className="flex justify-between items-center px-4 md:px-8 py-3">
        {/* Logo + nav desktop */}
        <div className="flex items-center gap-6">
          <Link href="/">
            <Image
              src="/matransformation.png"
              alt="Logo MaTransformation"
              width={160}
              height={40}
              className="h-auto w-auto"
              priority
            />
          </Link>

          {session && (
            <div className="hidden md:flex gap-6">
              {NAV_LINKS.map((item) => {
                if (item.children) {
                  return (
                    <div
                      key={item.label}
                      className="relative"
                      onMouseEnter={() => openMenu(item.label)}
                      onMouseLeave={scheduleClose}
                    >
                      {/* Parent */}
                      <button
                        className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-gray-700 hover:text-green-700"
                        aria-haspopup="true"
                        aria-expanded={openDropdown === item.label}
                        onFocus={() => openMenu(item.label)}
                        onBlur={scheduleClose}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") setOpenDropdown(null);
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openDropdown === item.label
                              ? setOpenDropdown(null)
                              : openMenu(item.label);
                          }
                        }}
                      >
                        <item.Icon className="h-4 w-4" />
                        {item.label}
                        <svg className="w-3 h-3 mt-1" viewBox="0 0 10 6" aria-hidden="true">
                          <path d="M0 0 L5 6 L10 0" fill="currentColor" />
                        </svg>
                      </button>

                      {/* Sous-menu */}
                      {openDropdown === item.label && (
                        <div
                          className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 shadow-lg rounded-md py-2 z-50"
                          onMouseEnter={() => openMenu(item.label)}
                          onMouseLeave={scheduleClose}
                        >
                          {item.children.map((child) => (
                            <Link
                              href={child.href}
                              key={child.href}
                              className={`flex items-center gap-2 px-4 py-2 text-sm ${
                                router.pathname === child.href
                                  ? "text-green-700"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                              onClick={() => setOpenDropdown(null)}
                            >
                              {child.Icon && <child.Icon className="h-4 w-4" />}
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return renderLink(item);
              })}
            </div>
          )}
        </div>

        {/* Notifications + session (desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {session && (
            <Link
              href="/notifications"
              className="relative flex items-center text-gray-700 hover:text-green-700"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}
          {session ? (
            <button
              onClick={() => signOut()}
              className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            >
              Se déconnecter
            </button>
          ) : (
            <>
              <button
                onClick={() => router.push("/login")}
                className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
              >
                Se connecter
              </button>
              <button
                onClick={() => router.push("/register")}
                className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded"
              >
                Créer un compte
              </button>
            </>
          )}
        </div>

        {/* Mobile : hamburger + notif */}
        <div className="md:hidden flex items-center gap-3">
          {session && (
            <Link href="/notifications" className="relative text-gray-700">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}
          {session && <span className="text-sm text-gray-700">Menu</span>}
          {session ? (
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className="p-1"
              aria-label="Basculer le menu"
            >
              {menuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
            >
              Se connecter
            </button>
          )}
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && session && (
        <div className="md:hidden flex flex-col gap-3 px-4 pb-3">
          {NAV_LINKS.map((item) => {
            if (item.children) {
              const expanded = openDropdown === item.label;
              return (
                <div key={item.label}>
                  <button
                    onClick={() => setOpenDropdown(expanded ? null : item.label)}
                    className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-gray-700 w-full"
                    aria-expanded={expanded}
                    aria-controls={`submenu-${item.label}`}
                  >
                    <item.Icon className="h-4 w-4" />
                    {item.label}
                    <svg
                      className={`w-3 h-3 ml-auto transform ${expanded ? "rotate-180" : ""}`}
                      viewBox="0 0 10 6"
                    >
                      <path d="M0 0 L5 6 L10 0" fill="currentColor" />
                    </svg>
                  </button>
                  {expanded && (
                    <div id={`submenu-${item.label}`} className="pl-6 mt-1 flex flex-col gap-1">
                      {item.children.map((child) => (
                        <Link
                          href={child.href}
                          key={child.href}
                          className={`flex items-center gap-2 text-sm py-1 ${
                            router.pathname === child.href
                              ? "text-green-700"
                              : "text-gray-700 hover:text-green-700"
                          }`}
                          onClick={() => setMenuOpen(false)}
                        >
                          {child.Icon && <child.Icon className="h-4 w-4" />}
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return renderLink(item);
          })}
          <button
            onClick={() => signOut()}
            className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded w-fit"
          >
            Se déconnecter
          </button>
        </div>
      )}
    </nav>
  );
}
