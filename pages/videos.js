// pages/videos.js
import React from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer"; // optionnel si tu l’utilises

const videos = [
    {
      title: "Comment s'inscrire",
      youtubeUrl: "https://www.youtube.com/embed/QPafoRuT3cE",
    },
    {
      title: "Avant de commencer – Dashboard",
      youtubeUrl: "https://www.youtube.com/embed/Iyo8DIHvfQo",
    },
    {
      title: "Explication du menu",
      youtubeUrl: "https://www.youtube.com/embed/jzRXgjNKqB0",
    },
    {
      title: "Listes de courses",
      youtubeUrl: "https://www.youtube.com/embed/3Ge2GHTmjhY",
    },
    {
      title: "Mon compte – explication",
      youtubeUrl: "https://www.youtube.com/embed/DmV3PWmsnfU",
    },
    {
      title: "Petit déjeuner et repas personnalisé / repas extérieur",
      youtubeUrl: "https://www.youtube.com/embed/OSyNwFKPsi4",
    },
    {
      title: "Recettes",
      youtubeUrl: "https://www.youtube.com/embed/vUGr4LHqvD4",
    },
  ];
  

export default function VideosPage() {
  return (
    <>
      <Head>
        <title>Vidéos explicatives | MaTransformation</title>
        <meta
          name="description"
          content="Découvrez en vidéos comment utiliser MaTransformation pour atteindre vos objectifs."
        />
      </Head>

      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold mb-10 text-center">Vidéos explicatives</h1>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {videos.map((video, i) => (
            <div key={i} className="border rounded-lg shadow p-4 bg-white">
              <h2 className="font-semibold mb-3 text-center">{video.title}</h2>
              <div className="aspect-video rounded overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src={video.youtubeUrl}
                  title={video.title}
                  frameBorder="0"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          ))}
        </div>

        <section className="space-y-12">
          <div>
            <h2 className="text-xl font-bold text-center mb-4">
              📱 Astuce : Ajoutez un raccourci sur votre écran d’accueil iPhone
            </h2>
            <img
  src="/iphone-ajout.jpg"
  alt="Ajouter à l'écran d'accueil iPhone"
  className="rounded shadow mx-auto w-full max-w-md sm:max-w-lg md:max-w-xl"
/>

<img
  src="/android-ajout.jpg"
  alt="Ajouter à l'écran d'accueil Android"
  className="rounded shadow mx-auto w-full max-w-md sm:max-w-lg md:max-w-xl"
/>

          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
