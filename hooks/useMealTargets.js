const REPARTITION = { "petit-dejeuner": 0.3, dejeuner: 0.4, collation: 0.05, diner: 0.25 };

export function useMealTargets(user, repasType) {
  const ratio = REPARTITION[repasType] || 0;
  const calObj = Math.round(user.metabolismeCible * ratio);
  const pObj = Math.round(user.poids * 1.8 * ratio);
  const fObj = Math.round(((user.metabolismeCible * 0.3) / 9) * ratio);
  const cObj = Math.round(
    ((user.metabolismeCible - user.poids * 1.8 * 4 - user.metabolismeCible * 0.3) / 4) * ratio
  );
  return { calObj, pObj, cObj, fObj };
}
