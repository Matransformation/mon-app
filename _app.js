// pages/_app.js
import "../styles/globals.css"    // ← impératif
import { SessionProvider } from "next-auth/react"

export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
