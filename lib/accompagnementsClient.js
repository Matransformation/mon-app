// lib/accompagnementsClient.js
export async function applyAccompagnements(repas, payload) {
    // payload = { [type]: id } OU { [type]: { id, quantity } }
    const menuId = repas?.id;
    if (!menuId) throw new Error("applyAccompagnements: repas.id manquant");
  
    const [type, val] = Object.entries(payload)[0];
    const ingredientId = typeof val === "object" ? val.id : val;
    const quantity =
      typeof val === "object" ? val.quantity ?? val.qty ?? undefined : undefined;
  
    const res = await fetch(`/api/menus/${menuId}/accompagnements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, ingredientId, quantity }),
    });
  
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || "Échec applyAccompagnements");
    }
    // { quantity, reason? }
    return await res.json();
  }
  
  export async function removeAccompagnements(repas, ingredientId) {
    const menuId = repas?.id;
    if (!menuId) throw new Error("removeAccompagnements: repas.id manquant");
  
    const res = await fetch(
      `/api/menus/${menuId}/accompagnements?ingredientId=${encodeURIComponent(
        ingredientId
      )}`,
      { method: "DELETE" }
    );
  
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || "Échec removeAccompagnements");
    }
    return await res.json(); // { ok: true }
  }
  