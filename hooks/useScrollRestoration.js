// hooks/useScrollRestoration.js
import { useEffect } from "react";
import { useRouter } from "next/router";

/**
 * Restaure la position de scroll après reload / navigation.
 * - Sauvegarde la position avant de quitter la page
 * - La restaure quand on revient sur la même route
 */
export default function useScrollRestoration() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("scrollRestoration" in window.history)) return;

    // Désactive le scroll auto du navigateur
    window.history.scrollRestoration = "manual";

    const keyFor = (url) => `__scroll:${url}`;

    const save = (url) => {
      try {
        sessionStorage.setItem(keyFor(url), String(window.scrollY));
      } catch {}
    };

    const restore = (url) => {
      try {
        const y = Number(sessionStorage.getItem(keyFor(url)) || 0);
        // attendre le paint avant de scroller
        requestAnimationFrame(() => {
          window.scrollTo({ top: y, behavior: "auto" });
        });
      } catch {}
    };

    const onStart = () => save(router.asPath);
    const onComplete = (url) => restore(url);

    router.events.on("routeChangeStart", onStart);
    router.events.on("routeChangeComplete", onComplete);

    // si on rafraîchit la page / ferme l’onglet
    const beforeUnload = () => save(router.asPath);
    window.addEventListener("beforeunload", beforeUnload);

    // 1re restauration (cas reload direct)
    restore(router.asPath);

    return () => {
      router.events.off("routeChangeStart", onStart);
      router.events.off("routeChangeComplete", onComplete);
      window.removeEventListener("beforeunload", beforeUnload);
      window.history.scrollRestoration = "auto";
    };
  }, [router]);
}
