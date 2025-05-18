// components/dashboard/UserHeader.js
import React from "react";

export default function UserHeader({ utilisateur }) {
  const { nom, age, taille, poids } = utilisateur;

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold text-gray-900">
        Bonjour, {nom} !
      </h1>
      <div className="text-gray-700">
        <p>Âge : {age ?? "—"} ans</p>
        <p>Taille : {taille ?? "—"} cm</p>
        <p>Poids : {poids ?? "—"} kg</p>
      </div>
    </div>
  );
}
