// lib/access.js
export function getAccessRights(user) {
    const now = Date.now();
    const trialEndsAt = user.trialEndsAt ? new Date(user.trialEndsAt).getTime() : 0;
    const subEndsAt   = user.stripeCurrentPeriodEnd
      ? new Date(user.stripeCurrentPeriodEnd).getTime()
      : 0;
  
    const inTrial      = trialEndsAt > now;
    const fullSub      = user.isSubscribed && subEndsAt > now;
    const recipesSub   = user.stripePriceId === process.env.NEXT_PUBLIC_PRICE_RECIPES && subEndsAt > now;
    const cancelPending = user.cancelAtPeriodEnd && subEndsAt > now;
  
    return {
      canAccessFull: inTrial || fullSub,
      canAccessRecipesOnly: recipesSub,
      hasNoAccess: !inTrial && !fullSub && !recipesSub,
      cancelPending,
    };
  }
  