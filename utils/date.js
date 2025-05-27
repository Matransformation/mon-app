// utils/date.js

export function formatTimeAgo(dateInput) {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
  
    const intervals = [
      { label: "an", seconds: 31536000 },
      { label: "mois", seconds: 2592000 },
      { label: "jour", seconds: 86400 },
      { label: "heure", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "seconde", seconds: 1 },
    ];
  
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count > 0) {
        return `il y a ${count} ${interval.label}${count > 1 ? "s" : ""}`;
      }
    }
  
    return "à l’instant";
  }
  