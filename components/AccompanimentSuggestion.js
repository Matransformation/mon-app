// components/AccompanimentSuggestion.js
import React from "react";

export default function AccompanimentSuggestion({ ingredient, currentMacros, targetMacros }) {
  const contribution = {
    p: ingredient.protein || 0,
    f: ingredient.fat || 0,
    g: ingredient.carbs || 0,
  };

  const missing = {
    p: targetMacros.protein - currentMacros.protein,
    f: targetMacros.fat - currentMacros.fat,
    g: targetMacros.carbs - currentMacros.carbs,
  };

  const messages = [];

  if (contribution.p > 0 && missing.p > 0)
    messages.push("contribue à l'apport en protéines");
  if (contribution.g > 0 && missing.g > 0)
    messages.push("apporte des glucides");
  if (contribution.f > 0 && missing.f > 0)
    messages.push("complète les lipides");

  return (
    <p className="text-xs text-gray-500 mt-1 italic">
      👉 {messages.join(" + ") || "accompagnement ajouté"}
    </p>
  );
}
