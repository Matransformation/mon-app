// components/dashboard/WeightChart.js
import dynamic from "next/dynamic";

const Line = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Line),
  { ssr: false }
);

export default function WeightChart({ historiquePoids }) {
  const cleanedData = (historiquePoids || []).filter((i) => {
    const d = new Date(i.date);
    return !isNaN(d.getTime());
  });

  const labels = cleanedData.map((i) =>
    new Date(i.date).toLocaleDateString("fr-FR")
  );
  const values = cleanedData.map((i) => i.poids);

  const data = {
    labels,
    datasets: [
      {
        label: "Poids (kg)",
        data: values,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderColor: "#F97316",
        backgroundColor: "rgba(249,115,22,0.2)",
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { boxWidth: 12, padding: 16 },
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Date", color: "#374151" },
        grid: { display: false },
        ticks: { color: "#6B7280" },
      },
      y: {
        title: { display: true, text: "Poids (kg)", color: "#374151" },
        grid: { color: "#E5E7EB" },
        ticks: { color: "#6B7280" },
      },
    },
  };

  return (
    <div style={{ height: 300 }} className="bg-white p-4 rounded-xl">
      {cleanedData.length > 0 ? (
        <Line data={data} options={options} />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          Aucune donnée disponible pour le moment.
        </div>
      )}
    </div>
  );
}
