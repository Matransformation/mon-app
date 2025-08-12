// components/dashboard/Card.js
import React from "react";
import { twMerge } from "tailwind-merge";

export default function Card({
  title,
  icon,
  actions,
  children,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  variant = "default", // default | subtle | glass
}) {
  const base =
    "rounded-2xl border bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]";
  const subtle =
    "rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-sm";
  const glass =
    "rounded-2xl border border-white/60 bg-white/60 backdrop-blur-md shadow-[0_8px_30px_rgba(15,23,42,0.08)]";

  const variants = {
    default: base,
    subtle,
    glass,
  };

  return (
    <section className={twMerge(variants[variant], "overflow-hidden", className)}>
      {(title || icon || actions) && (
        <header
          className={twMerge(
            "flex items-center justify-between px-5 py-4 border-b border-gray-100/80",
            headerClassName
          )}
        >
          <div className="flex items-center gap-2">
            {icon && <span className="text-lg">{icon}</span>}
            {title && (
              <h2 className="text-base md:text-lg font-semibold text-slate-900">
                {title}
              </h2>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={twMerge("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
