// pages/_app.js
import "../styles/globals.css"
import { SessionProvider } from "next-auth/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from "next/script"
import CookieBanner from "../components/CookieBanner"
import WhatsappButton from "../components/WhatsappButton"
import { useEffect, useState } from "react"
import { Cookies } from "react-cookie-consent"

export default function App({ Component, pageProps }) {
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    const consent = Cookies.get("cookieConsent") // "true" si accepté
    if (consent === "true") {
      setHasConsent(true)
    }
  }, [])

  return (
    <SessionProvider session={pageProps.session}>
      <>
        {/* 1) Scripts marketing (GA4 + FB Pixel) si l’utilisateur a accepté */}
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

        {/* 2) Contenu principal */}
        <Component {...pageProps} />

        {/* 3) Bannière cookie avec mascotte */}
        <CookieBanner />

        {/* 4) Bouton WhatsApp — se positionne automatiquement */}
        <WhatsappButton />

        {/* 5) Speed Insights (Vercel) */}
        <SpeedInsights />
      </>
    </SessionProvider>
  )
}
