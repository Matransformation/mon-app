'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { accessRules } from "./accessRules";

export default function withAuthProtection(Component) {
  return function ProtectedComponent(props) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === "loading") return;

      const rule = accessRules[router.pathname];
      if (!rule) return;

      const user = session?.user;
      const now = new Date();

      if (!user) {
        router.replace("/login");
        return;
      }

      if (rule.role && user.role !== rule.role) {
        router.replace("/unauthorized");
        return;
      }

      const inTrial = user.trialEndsAt && new Date(user.trialEndsAt) > now;
      const stillActive =
        user.stripeCurrentPeriodEnd &&
        new Date(user.stripeCurrentPeriodEnd) > now;

      const planAllowed = rule.plans?.includes(user.stripePriceId);
      const hasValidPlan = planAllowed && (user.isSubscribed || stillActive);
      const hasTrialAccess = rule.allowTrial && inTrial;
      const needsPlanCheck = rule.plans && rule.plans.length > 0;
      console.log("🧠 Vérification d'accès : ", {
        isSubscribed: user.isSubscribed,
        stripePriceId: user.stripePriceId,
        stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
        stillActive,
        planAllowed,
        hasValidPlan,
        hasTrialAccess,
        needsPlanCheck,
      });
      
      if (needsPlanCheck && !(hasValidPlan || hasTrialAccess)) {
        router.replace("/mon-compte");
        return;
      }
    }, [session, status, router]);

    return <Component {...props} />;
  };
}
