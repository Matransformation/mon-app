// File: components/roulette/LuckyWheel.jsx
"use client"

import dynamic from "next/dynamic"
import { useState, useEffect, useRef } from "react"
import { Button } from "../ui/button"

// Chargement dynamique pour éviter l'erreur SSR
const Wheel = dynamic(
  () => import("react-custom-roulette").then(mod => mod.Wheel),
  { ssr: false }
)

export default function LuckyWheel({ data, onComplete, disabled }) {
  const [mustSpin, setMustSpin] = useState(false)
  const [prizeNumber, setPrizeNumber] = useState(0)
  const containerRef = useRef(null)
  const [radius, setRadius] = useState(150)

  // Ajuste le rayon pour remplir le conteneur
  useEffect(() => {
    function updateSize() {
      const w = containerRef.current?.offsetWidth ?? 300
      setRadius(Math.floor(w / 2 - 20))
    }
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  // Palette de couleurs distinctes
  const palette = [
    "#EF4444", "#3B82F6", "#10B981", "#F59E0B",
    "#8B5CF6", "#EC4899", "#14B8A6", "#EAB308"
  ]
  const segmentColors = data.map((_, idx) =>
    palette[idx % palette.length]
  )

  const handleSpin = () => {
    if (disabled || mustSpin) return
    const total = data.reduce((sum, i) => sum + i.probability, 0)
    let rand = Math.random() * total, cum = 0, idx = 0
    for (let i = 0; i < data.length; i++) {
      cum += data[i].probability
      if (rand <= cum) { idx = i; break }
    }
    setPrizeNumber(idx)
    setMustSpin(true)
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div ref={containerRef} className="w-full max-w-xl">
        <div className="relative pt-[100%]">
          <div className="absolute inset-0 flex items-center justify-center">
            <Wheel
              mustStartSpinning={mustSpin}
              prizeNumber={prizeNumber}
              // Texte désactivé sur la roue
              data={data.map(() => ({ option: "" }))}
              outerBorderWidth={5}
              outerBorderColor="#333"
              innerBorderWidth={5}
              innerBorderColor="#fff"
              backgroundColors={segmentColors}
              textColors={["#fff"]}
              radius={radius}
              textDistance={0} // pas de texte
              spinDuration={0.6}
              perpendicularText={false}
              onStopSpinning={() => {
                setMustSpin(false)
                onComplete(data[prizeNumber])
              }}
            />
            {/* Indicateur */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2
                            border-l-[12px] border-l-transparent
                            border-r-[12px] border-r-transparent
                            border-b-[16px] border-b-red-500" />
          </div>
        </div>
      </div>

      <Button
        onClick={handleSpin}
        disabled={disabled || mustSpin}
        className={
          `px-6 py-3 rounded-lg font-bold text-white
          ${disabled ? "bg-gray-400 cursor-not-allowed"
            : mustSpin ? "bg-yellow-500"
            : "bg-blue-600 hover:bg-blue-700"}`
        }
      >
        {mustSpin
          ? "La roue tourne..."
          : disabled
            ? "Déjà joué aujourd’hui"
            : "🎡 Tourner la roue"}
      </Button>

      {/* LÉGENDE SOUS LA ROUE */}
      <div className="w-full max-w-xl grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
        {data.map((item, idx) => (
          <div key={item.id || idx} className="flex items-center gap-3">
            <span
              className="w-5 h-5 block rounded"
              style={{ backgroundColor: segmentColors[idx] }}
            />
            <span className="text-sm">
              {item.label.split("\\n").map((line, i) => (
                <span key={i}>
                  {line}
                  {i < item.label.split("\\n").length - 1 && <br />}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
