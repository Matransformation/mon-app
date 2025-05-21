// File: components/Menu/MealCard.js
import React, { useState, useEffect, useMemo } from "react";
import AccompanimentSelector from "./AccompanimentSelector";
import useSuggestedAccompagnements from "../../hooks/useSuggestedAccompagnements";

const REPARTITION = {
  "petit-dejeuner": 0.3,
  dejeuner: 0.4,
  collation: 0.05,
  diner: 0.25,
};

const COLORS = {
  "petit-dejeuner": "bg-orange-100",
  dejeuner: "bg-green-100",
  collation: "bg-blue-100",
  diner: "bg-yellow-100",
};

const MacroProgressBar = ({ label, value, target }) => {
  const percent = Math.min((value / target) * 100, 100);
  const color =
    percent < 80
      ? "bg-yellow-400"
      : percent > 100
      ? "bg-red-400"
      : "bg-green-500";
  const unit = label === "Calories" ? "kcal" : "g";
  return (
    <div className="mb-1">
      <div className="flex justify-between text-xs text-gray-600 mb-0.5">
        <span>{label}</span>
        <span>
          {Math.round(value)} / {Math.round(target)} {unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 h-2 rounded overflow-hidden">
        <div className={`${color} h-full`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

export default function MealCard({
  repas,
  user,
  recipeFactor = 1,
  openModal,
  allIngredients,
  applyAccompagnements,
  removeAccompagnements,
}) {
  const { recette } = repas;
  const bgColor = COLORS[repas.repasType] || "bg-gray-100";

  const [currentFactor, setCurrentFactor] = useState(recipeFactor);
  const [localAcc, setLocalAcc] = useState(repas.accompagnements || []);
  const [selection, setSelection] = useState({});

  const baseRecipeMacros = useMemo(() => {
    if (!recette) return { protein: 0, fat: 0, carbs: 0 };
    return recette.ingredients.reduce(
      (sum, ri) => {
        const f = (ri.quantity || 0) / 100;
        return {
          protein: sum.protein + (ri.ingredient.protein || 0) * f,
          fat: sum.fat + (ri.ingredient.fat || 0) * f,
          carbs: sum.carbs + (ri.ingredient.carbs || 0) * f,
        };
      },
      { protein: 0, fat: 0, carbs: 0 }
    );
  }, [recette]);

  useEffect(() => {
    setLocalAcc(repas.accompagnements || []);
    setSelection({});
  }, [repas.accompagnements]);

  useEffect(() => {
    if (!recette) return;

    const sideMacros = localAcc.reduce(
      (sum, a) => {
        const ing = allIngredients.find((i) => i.id === a.ingredient.id) || {};
        const f = (a.quantity || 0) / 100;
        return {
          protein: sum.protein + (ing.protein || 0) * f,
          fat: sum.fat + (ing.fat || 0) * f,
          carbs: sum.carbs + (ing.carbs || 0) * f,
        };
      },
      { protein: 0, fat: 0, carbs: 0 }
    );

    const ratio = REPARTITION[repas.repasType] || 0;
    const targetMacros = {
      protein: user.poids * 1.8 * ratio,
      fat: (user.metabolismeCible * 0.3 / 9) * ratio,
      carbs: ((user.metabolismeCible - user.poids * 1.8 * 4 - user.metabolismeCible * 0.3) / 4) * ratio,
    };

    const remaining = {
      protein: Math.max(0, targetMacros.protein - sideMacros.protein),
      fat: Math.max(0, targetMacros.fat - sideMacros.fat),
      carbs: Math.max(0, targetMacros.carbs - sideMacros.carbs),
    };

    const factorP = baseRecipeMacros.protein > 0 ? remaining.protein / baseRecipeMacros.protein : Infinity;
    const factorF = baseRecipeMacros.fat > 0 ? remaining.fat / baseRecipeMacros.fat : Infinity;
    const factorC = baseRecipeMacros.carbs > 0 ? remaining.carbs / baseRecipeMacros.carbs : Infinity;

    const rawFactor = Math.min(factorP, factorF, factorC, 10);
    setCurrentFactor(rawFactor);
  }, [localAcc, user.poids, user.metabolismeCible, repas.repasType, baseRecipeMacros, recette]);

  const ratio = REPARTITION[repas.repasType] || 0;
  const calObj = Math.round(user.metabolismeCible * ratio);
  const pObj = Math.round(user.poids * 1.8 * ratio);
  const fObj = Math.round((user.metabolismeCible * 0.3 / 9) * ratio);
  const cObj = Math.round(((user.metabolismeCible - user.poids * 1.8 * 4 - user.metabolismeCible * 0.3) / 4) * ratio);

  const recetteTotals = recette ? recette.ingredients.reduce((sum, ri) => {
    const nameLower = ri.ingredient.name.toLowerCase();
    const rawQty = (ri.quantity || 0) * currentFactor;
    const isWhite = /blanc d['’]?oeuf/.test(nameLower);
    const isEgg = /(?:oeuf|œuf)/i.test(nameLower) && !isWhite;
    const unitSize = isWhite ? 33 : isEgg ? 50 : 0;
    let qty;
    if (isWhite) qty = Math.floor(rawQty / unitSize) * unitSize;
    else if (isEgg) qty = Math.round(rawQty / unitSize) * unitSize;
    else qty = Math.round(rawQty);
    if ((isEgg || isWhite) && qty < unitSize) qty = unitSize;
    const f = qty / 100;
    return {
      cal: sum.cal + ri.ingredient.calories * f,
      p: sum.p + ri.ingredient.protein * f,
      f: sum.f + ri.ingredient.fat * f,
      c: sum.c + ri.ingredient.carbs * f,
    };
  }, { cal: 0, p: 0, f: 0, c: 0 }) : { cal: 0, p: 0, f: 0, c: 0 };

  const sidesTotals = localAcc.reduce((sum, a) => {
    const ing = allIngredients.find(i => i.id === a.ingredient.id) || {};
    const f = (a.quantity || 0) / 100;
    return {
      cal: sum.cal + (ing.calories || 0) * f,
      p: sum.p + (ing.protein || 0) * f,
      f: sum.f + (ing.fat || 0) * f,
      c: sum.c + (ing.carbs || 0) * f,
    };
  }, { cal: 0, p: 0, f: 0, c: 0 });

  const pCon = recetteTotals.p + sidesTotals.p;
  const cCon = recetteTotals.c + sidesTotals.c;
  const fCon = recetteTotals.f + sidesTotals.f;
  const calCon = pCon * 4 + cCon * 4 + fCon * 9;

  const handleAdd = async () => {
    const sel = Object.entries(selection).find(([, v]) => v);
    if (!sel) return;
    const [type, id] = sel;
    await applyAccompagnements(repas, { [type]: id });
    const ing = allIngredients.find(i => i.id === id);
    let qty = 0;
    if (type === "VEGETABLE_SIDE") qty = 150;
    else if (["DAIRY", "FRUIT_SIDE"].includes(type)) qty = 100;
    else {
      const restP = Math.max(0, pObj - pCon);
      const restC = Math.max(0, cObj - cCon);
      const restF = Math.max(0, fObj - fCon);
      const perGram = { p: ing.protein / 100, c: ing.carbs / 100, f: ing.fat / 100 };
      qty = Math.floor(
        Math.min(
          perGram.p > 0 ? restP / perGram.p : Infinity,
          perGram.c > 0 ? restC / perGram.c : Infinity,
          perGram.f > 0 ? restF / perGram.f : Infinity
        )
      );
    }
    setLocalAcc(acc => [...acc, { ingredient: ing, quantity: qty }]);
    setSelection({});
  };

  const handleDelete = async id => {
    await removeAccompagnements(repas, id);
    setLocalAcc(acc => acc.filter(a => a.ingredient.id !== id));
    setSelection({});
  };

  const suggestions = useSuggestedAccompagnements({ repas: { ...repas, recipeFactor: currentFactor }, user, allIngredients });
  const vegOptions = allIngredients.filter(i => (i.sideTypes || []).includes("VEGETABLE_SIDE"));
  const dairyOptions = allIngredients.filter(i => (i.sideTypes || []).includes("DAIRY"));
  const requireVegetable = ["dejeuner", "diner"].includes(repas.repasType) && (!recette?.ingredients?.some(ri => (ri.ingredient.sideTypes || []).includes("VEGETABLE_SIDE")) && !localAcc.some(a => (a.ingredient.sideTypes || []).includes("VEGETABLE_SIDE")));
  const totalDairy = localAcc.reduce((s, a) => (a.ingredient.sideTypes || []).includes("DAIRY") ? s + a.quantity : s, 0);
  const suggestionsExt = { ...suggestions, ...(requireVegetable && { VEGETABLE_SIDE: vegOptions }), ...(["dejeuner", "diner", "collation"].includes(repas.repasType) && { DAIRY: dairyOptions }) };

  return (
    <div key={currentFactor} className={`${bgColor} rounded-2xl p-6 shadow-md flex flex-col`}>
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-gray-700">{repas.repasType.toUpperCase()}</span>
        {recette && <button onClick={() => openModal(repas)} className="text-sm text-blue-500 hover:underline">✏️ Changer</button>}
      </div>

      {recette?.photoUrl && (
        <img src={recette.photoUrl} alt={recette.name} className="w-full h-28 object-cover rounded-lg mb-3" />
      )}
      {recette && <p className="font-bold text-center mb-2">{recette.name}</p>}

      <div className="mb-4">
        <MacroProgressBar label="Protéines" value={pCon} target={pObj} />
        <MacroProgressBar label="Glucides" value={cCon} target={cObj} />
        <MacroProgressBar label="Lipides" value={fCon} target={fObj} />
        <MacroProgressBar label="Calories" value={calCon} target={calObj} />
      </div>

      {calCon >= calObj * 0.7 && <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded mb-4 text-sm text-center">🎉 Parfait, ton repas est validé, tu n'es pas obligé d'ajouter d'autres accompagnements !</div>}
      {requireVegetable && <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4 text-sm">Choix obligatoire d’un légume (150 g).</div>}

      {recette && (
        <div className="mb-4">
          <h4 className="font-medium mb-1">Ingrédients :</h4>
          <ul className="text-sm text-gray-800 list-disc list-inside space-y-1">
            {recette.ingredients.map(ri => {
              const nameLower = ri.ingredient.name.toLowerCase();
              const rawQty = (ri.quantity || 0) * currentFactor;
              const isWhite = /blanc d['’]?oeuf/.test(nameLower);
              const isEgg = /(?:oeuf|œuf)/i.test(nameLower) && !isWhite;
              const unitSize = isWhite ? 33 : isEgg ? 50 : 0;
              let qty;
              if (isWhite) qty = Math.floor(rawQty / unitSize) * unitSize;
              else if (isEgg) qty = Math.round(rawQty / unitSize) * unitSize;
              else qty = Math.round(rawQty);
              if ((isEgg || isWhite) && qty < unitSize) qty = unitSize;
              return (
                <li key={ri.ingredient.id}>
                  {ri.ingredient.name} — {qty}{ri.ingredient.unit}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {localAcc.length > 0 && (
        <div className="bg-white p-3 rounded-lg mb-4 text-sm space-y-2">
          <h4 className="font-medium">Accompagnements :</h4>
          {localAcc.map(a => (
            <div key={a.ingredient.id} className="flex justify-between">
              <span>{a.ingredient.name} — {a.quantity} g</span>
              <button onClick={() => handleDelete(a.ingredient.id)} className="text-red-500 hover:underline text-xs">Annuler</button>
            </div>
          ))}
        </div>
      )}

      <AccompanimentSelector suggestions={suggestionsExt} selection={selection} setSelection={setSelection} onAdd={handleAdd} totalDairy={totalDairy} requireVegetable={requireVegetable} />
    </div>
  );
}