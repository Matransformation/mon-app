// pages/_document.js
import Document, { Html, Head, Main, NextScript } from "next/document"

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="fr">
        <Head>
          {/* ← OBLIGATOIRE pour l’injection automatique de globals.css */}
          <noscript id="__next_css__DO_NOT_USE__" />
        </Head>
        <body>
          <Main />
          <NextScript />

          {/* Facebook Pixel noscript fallback */}
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src="https://www.facebook.com/tr?id=582481197693399&ev=PageView&noscript=1"
              alt="fb-pixel"
            />
          </noscript>

          {/* Google Analytics noscript fallback */}
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=G-J3JHVGXW4Z"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            ></iframe>
          </noscript>
        </body>
      </Html>
    )
  }
}
