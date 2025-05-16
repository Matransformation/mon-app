// pages/_app.js
import "../styles/globals.css"
import { SessionProvider } from "next-auth/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from "next/script"

export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <>
        {/* Google Analytics GA4 */}
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
        
        <Component {...pageProps} />
        <SpeedInsights />
      </>
    </SessionProvider>
  )
}
