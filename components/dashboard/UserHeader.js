// components/dashboard/UserHeader.js
import React, { useMemo } from "react";
import Link from "next/link";
import {
  UserCircle2,
  Info,
  Utensils,
  CalendarCheck,
  Target,
  Scale,
} from "lucide-react";

/**
 * variant:
 *  - "full"    : avec bannière Bonjour + actions + stats + note
 *  - "compact" : sans bannière Bonjour (stats + note uniquement) -> recommandé si un header global dit déjà "Bonjour"
 */
export default function UserHeader({ utilisateur, variant = "full" }) {
  const { nom, age, taille, poids, objectifPoids } = utilisateur || {};
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  // Progression vers l’objectif (si on a objectifPoids + poids)
  const progress = useMemo(() => {
    if (typeof objectifPoids !== "number" || typeof poids !== "number")
      return null;
    const delta = poids - objectifPoids; // >0 reste à perdre, <0 objectif dépassé
    const pct = Math.max(
      0,
      Math.min(100, objectifPoids > 0 ? (objectifPoids / Math.max(poids, objectifPoids)) * 100 : 0)
    );
    return { delta, pct: Math.round(pct) };
  }, [objectifPoids, poids]);

  return (
    <div className="space-y-5">
      {/* Bannière de bienvenue (optionnelle) */}
      {variant === "full" && (
        <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-100">
          <div className="flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-orange-400 to-orange-300">
            <UserCircle2 size={48} className="text-white" />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-white truncate">
                {timeGreeting}
                {nom ? `, ${nom}` : ""} 👋
              </h1>
              <p className="text-sm text-orange-50/95">
                Heureux·se de vous revoir — continuez sur votre lancée !
              </p>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="px-5 py-4 bg-white flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/recettes"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 text-white font-medium px-4 py-2 hover:brightness-110 transition"
              >
                <Utensils size={18} />
                Recettes
              </Link>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 font-medium text-gray-900 hover:bg-gray-50 transition"
              >
                <CalendarCheck size={18} />
                Menu perso
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              Explorez nos suggestions pour rester motivé·e.
            </p>
          </div>
        </div>
      )}

      {/* Statistiques utilisateur */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 flex flex-col items-center">
          <span className="text-xs uppercase tracking-wide text-gray-500">
            Âge
          </span>
          <span className="mt-1 text-lg font-semibold text-gray-900">
            {age ?? "—"} <span className="text-sm font-normal text-gray-500">ans</span>
          </span>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 flex flex-col items-center">
          <span className="text-xs uppercase tracking-wide text-gray-500">
            Taille
          </span>
          <span className="mt-1 text-lg font-semibold text-gray-900">
            {taille ?? "—"} <span className="text-sm font-normal text-gray-500">cm</span>
          </span>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 flex flex-col items-center">
          <span className="text-xs uppercase tracking-wide text-gray-500">
            Poids
          </span>
          <span className="mt-1 text-lg font-semibold text-gray-900">
            {poids ?? "—"} <span className="text-sm font-normal text-gray-500">kg</span>
          </span>
        </div>
      </div>

      {/* Progression vers l’objectif (optionnelle) */}
      {progress && (
        <div className="rounded-2xl border border-orange-100 bg-orange-50 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
              <Target size={18} className="text-orange-600" />
              Objectif :
              <span className="font-semibold text-gray-900">
                {objectifPoids} kg
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Scale size={16} className="text-gray-500" />
              Actuel :
              <span className="font-semibold text-gray-900">{poids} kg</span>
            </div>
          </div>

          <div className="mt-3 h-2.5 w-full rounded-full bg-white border border-orange-200 overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-[width] duration-500"
              style={{ width: `${progress.pct}%` }}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress.pct}
              role="progressbar"
            />
          </div>

          <div className="mt-2 text-xs text-gray-600">
            {progress.delta > 0
              ? `Encore ${progress.delta.toFixed(1)} kg pour atteindre l’objectif.`
              : progress.delta < 0
              ? `Objectif dépassé de ${Math.abs(progress.delta).toFixed(1)} kg — bravo !`
              : `Vous êtes exactement sur l’objectif.`}
          </div>
        </div>
      )}

      {/* Note d’importance */}
      <div className="flex items-start gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3">
        <Info size={20} className="text-orange-500 mt-0.5" />
        <p className="text-sm text-gray-700">
          Pensez à mettre régulièrement à jour votre poids.{" "}
          <strong>Le calcul de votre métabolisme s’ajuste</strong> en fonction
          de vos dernières mesures, pour que les menus proposés correspondent
          toujours au mieux à vos besoins.
        </p>
      </div>
    </div>
  );
}
