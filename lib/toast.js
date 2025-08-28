// Fallback ultra-simple : alert + console.
// Si tu utilises shadcn-ui, remplace par: import { toast } from "@/components/ui/use-toast";
export function toast({ title, description, variant }) {
    if (typeof window !== "undefined") {
      const msg = [title, description].filter(Boolean).join("\n");
      // Évite d'alerter pour tout, mais c'est utile en dev
      console.log(`[${variant || "info"}] ${msg}`);
    }
  }
  