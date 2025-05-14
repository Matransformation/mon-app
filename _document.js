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
          <Main/>
          <NextScript/>
        </body>
      </Html>
    )
  }
}
