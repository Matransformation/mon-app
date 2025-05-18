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
  // cookieDecision : null = pas cliqué, "true" = accepté, "false" = refusé
  const [cookieDecision, setCookieDecision] = useState(null)
  // hasConsent : true seulement si cookieDecision === "true"
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    const consent = Cookies.get("cookieConsent") // "true" | "false" | undefined
    if (consent !== undefined) {
      setCookieDecision(consent)
      if (consent === "true") setHasConsent(true)
    }
  }, [])

  return (
    <SessionProvider session={pageProps.session}>
      <>
        {/* 1) OneSignal SDK — TOUJOURS chargé */}
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
          defer
        />

        {/* 2) GA4 + FB Pixel — UNIQUEMENT si l’utilisateur a accepté */}
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

        {/* 3) Init OneSignal — dès que l’utilisateur a cliqué (accept ou refuse) */}
        {cookieDecision !== null && (
          <Script
            id="onesignal-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.OneSignalDeferred = window.OneSignalDeferred || [];
                OneSignalDeferred.push(async function(OneSignal) {
                  await OneSignal.init({
                    appId: "e05dcce1-435a-4585-a0bb-80a877ad05f7",
                    safari_web_id: "web.onesignal.auto.57daeefd-2777-4d55-aef6-93b3ff4b973a",
                    notifyButton: {
                      enable: true,
                      position: 'top-right',
                      text: {
                        'tip.state.unsubscribed': 'Recevoir les notifications',
                        'tip.state.subscribed': 'Vous êtes abonné',
                        'tip.state.blocked': 'Notifications bloquées',
                        'message.prenotify': "Cliquez pour activer les notifications",
                        'message.action.subscribed': "Merci de vous être abonné !",
                        'message.action.resubscribed': "Vous êtes à nouveau abonné",
                        'message.action.unsubscribed': "Vous ne recevrez plus de notifications",
                        'dialog.main.title': "Gérer les notifications",
                        'dialog.main.button.subscribe': "S’abonner",
                        'dialog.main.button.unsubscribe': "Se désabonner",
                        'dialog.blocked.title': "Débloquez les notifications",
                        'dialog.blocked.message': "Suivez ces instructions pour autoriser les notifications :"
                      }
                    }
                  });
                });
              `,
            }}
          />
        )}

        {/* 4) Le contenu principal */}
        <Component {...pageProps} />

        {/* 5) Bannière cookies */}
        <CookieBanner />

        {/* 6) WhatsApp — uniquement après décision (accept ou refuse) */}
        {cookieDecision !== null && <WhatsappButton />}

        {/* 7) Vercel Speed Insights */}
        <SpeedInsights />
      </>
    </SessionProvider>
  )
}
