import dynamic from "next/dynamic"
const Line = dynamic(() => import("react-chartjs-2").then(mod => mod.Line), { ssr: false })
export default function WeightChart({ historiquePoids }) {
  const data = {
    labels: historiquePoids.map(i => new Date(i.date).toLocaleDateString("fr-FR")),
    datasets: [{ label: "Poids (kg)", data: historiquePoids.map(i => i.poids), borderColor: "rgb(75,192,192)", backgroundColor: "rgba(75,192,192,0.2)", fill: true }]
  }
  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="font-semibold text-lg mb-2">Évolution du poids</h2>
      <Line data={data} />
    </div>
  )
}
