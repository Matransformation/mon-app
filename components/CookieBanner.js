import CookieConsent, { Cookies } from "react-cookie-consent"

export default function CookieBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="J'accepte"
      declineButtonText="Je refuse"
      enableDeclineButton
      cookieName="cookieConsent"
      style={{ background: "#2B373B" }}
      buttonStyle={{ background: "#22C55E", color: "#fff", borderRadius: "4px", padding: "8px 12px" }}
      declineButtonStyle={{ background: "#EF4444", color: "#fff", borderRadius: "4px", padding: "8px 12px", marginLeft: "8px" }}
      expires={365}
    >
      Ce site utilise des cookies pour améliorer l’expérience utilisateur, mesurer l’audience et personnaliser les publicités.
    </CookieConsent>
  )
}
