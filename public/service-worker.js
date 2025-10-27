self.addEventListener("install", (event) => {
    self.skipWaiting();
  });
  
  self.addEventListener("activate", (event) => {
    console.log("Service worker activated ✅");
  });
  
  self.addEventListener("fetch", () => {
    // On laisse passer toutes les requêtes (cache non utilisé ici)
  });
  