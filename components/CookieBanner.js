// components/CookieBanner.js
import Image from "next/image"
import CookieConsent from "react-cookie-consent"

export default function CookieBanner() {
  return (
    <CookieConsent
      containerClasses="cookie-banner-container"
      buttonText="J'accepte"
      declineButtonText="Je refuse"
      enableDeclineButton
      cookieName="cookieConsent"
      style={{
        background: "#fff7f1",
        color: "#333",
        padding: "16px 24px",
        borderTop: "1px solid #eee",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
        fontFamily: "'Poppins', sans-serif",
        fontSize: "16px",
        zIndex: 9999,
      }}
      buttonStyle={{
        background: "#22C55E",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "10px 18px",
        fontWeight: "600",
        cursor: "pointer",
      }}
      declineButtonStyle={{
        background: "#EF4444",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "10px 18px",
        marginLeft: "12px",
        fontWeight: "600",
        cursor: "pointer",
      }}
      expires={365}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
      }}>
        <div style={{ minWidth: "60px" }}>
          <Image
            src="/essai.png"
            alt="Mascotte"
            width={48}
            height={48}
            style={{ borderRadius: "50%" }}
          />
        </div>
        <div>
          Ce site utilise des cookies pour améliorer l’expérience utilisateur, mesurer l’audience et personnaliser les publicités.
        </div>
      </div>
    </CookieConsent>
  )
}
