import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

let subscribers = new Set();
let idSeq = 1;

// API simple
export function toast({ title, description = "", variant = "info", duration = 2500 }) {
  const id = idSeq++;
  subscribers.forEach(fn => fn({ id, title, description, variant, duration }));
}

// Conteneur global (à monter 1x, par ex. dans _app.js)
export function GlobalToaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const onToast = (t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, t.duration);
    };
    subscribers.add(onToast);
    return () => subscribers.delete(onToast);
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto w-[320px] rounded-xl px-4 py-3 text-sm shadow-lg ring-1 ${
              t.variant === "success"
                ? "bg-emerald-50 text-emerald-900 ring-emerald-200"
                : t.variant === "warning"
                ? "bg-amber-50 text-amber-900 ring-amber-200"
                : t.variant === "error"
                ? "bg-rose-50 text-rose-900 ring-rose-200"
                : "bg-slate-50 text-slate-900 ring-slate-200"
            }`}
          >
            <div className="font-semibold">{t.title}</div>
            {t.description ? <div className="mt-0.5 text-slate-700">{t.description}</div> : null}
          </div>
        ))}
      </div>
    </div>,
    document.body
  );
}
