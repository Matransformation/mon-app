// components/dashboard/WeightChart.js
import dynamic from "next/dynamic";
const Line = dynamic(() => import("react-chartjs-2").then(mod => mod.Line), { ssr: false });

export default function WeightChart({ historiquePoids }) {
  // 1. On filtre les entrées avec dates valides
  const cleanedData = (historiquePoids || []).filter(i => {
    const d = new Date(i.date);
    return !isNaN(d.getTime());
  });

  // 2. Préparation des données pour le graphique
  const data = {
    labels: cleanedData.map(i => new Date(i.date).toLocaleDateString("fr-FR")),
    datasets: [
      {
        label: "Poids (kg)",
        data: cleanedData.map(i => i.poids),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  // 3. Options de configuration (facultatives mais utiles)
  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { title: { display: true, text: "Date" } },
      y: { title: { display: true, text: "Poids (kg)" }, beginAtZero: false }
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="font-semibold text-lg mb-2">Évolution du poids</h2>
      {cleanedData.length > 0 ? (
        <Line data={data} options={options} />
      ) : (
        <p className="text-gray-500">Aucune donnée disponible pour le moment.</p>
      )}
    </div>
  );
}
