import "../styles/globals.css"
import { SessionProvider } from "next-auth/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from "next/script"
import CookieBanner from "../components/CookieBanner"
import WhatsappButton from "../components/WhatsappButton"
import { useEffect, useState } from "react"
import { Cookies } from "react-cookie-consent"

export default function App({ Component, pageProps }) {
  // undefined tant que la bannière n'a pas été cliquée, "true"/"false" après
  const [cookieDecision, setCookieDecision] = useState(undefined)

  useEffect(() => {
    const consent = Cookies.get("cookieConsent") // "true" | "false" | undefined
    if (consent !== undefined) {
      setCookieDecision(consent)
    }
  }, [])

  // hasConsent pour GA et Pixel
  const hasConsent = cookieDecision === "true"

  return (
    <SessionProvider session={pageProps.session}>
      <>
        {/* 1) OneSignal SDK peut rester chargé ici si nécessaire */}

        {/* 2) GA4 + Facebook Pixel — UNIQUEMENT si l’utilisateur a accepté */}
        {hasConsent && (
          <>
            {/* Google Analytics 4 */}
            <Script
              strategy="afterInteractive"
              src="https://www.googletagmanager.com/gtag/js?id=G-J3JHVGXW4Z"
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-J3JHVGXW4Z');
                `,
              }}
            />

            {/* Facebook Pixel */}
            <Script
              id="fb-pixel"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '582481197693399');
                  fbq('track', 'PageView');
                `,
              }}
            />
          </>
        )}

        {/* Contenu de la page */}
        <Component {...pageProps} />

        {/* Bannière cookie avec mascotte */}
        <CookieBanner />

        {/* Bouton WhatsApp — uniquement après décision cookie */}
        {cookieDecision !== undefined && <WhatsappButton />}

        {/* Outil Vercel */}
        <SpeedInsights />
      </>
    </SessionProvider>
  )
}
