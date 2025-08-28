// lib/preserveScroll.js
export async function preserveScroll(work, { anchor } = {}) {
    try {
      const scroller = document.scrollingElement || document.documentElement || document.body;
      const startY = window.scrollY || scroller.scrollTop || 0;
  
      // On capture la position relative de l’ancre si elle existe
      const startTop = anchor?.getBoundingClientRect?.().top ?? null;
  
      const result = await work();
  
      // Laisse le layout se stabiliser (double rAF pour être safe)
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => requestAnimationFrame(r));
  
      if (anchor && startTop != null) {
        const endTop = anchor?.getBoundingClientRect?.().top ?? null;
        if (endTop != null) {
          const diff = endTop - startTop;
          window.scrollTo({ top: (window.scrollY || scroller.scrollTop || 0) + diff, behavior: "auto" });
          return result;
        }
      }
  
      // Fallback si l’ancre a été démontée ou remplacée
      window.scrollTo({ top: startY, behavior: "auto" });
      return result;
    } catch (e) {
      // En cas d’erreur, on ne casse pas l’action utilisateur
      return await work();
    }
  }
  