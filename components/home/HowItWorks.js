// components/home/HowItWorks.js
import { Calculator, Utensils, ListChecks, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Calculator,
    title: "Calcule tes besoins",
    desc: "On estime ton métabolisme pour définir des apports adaptés.",
  },
  {
    icon: Utensils,
    title: "Reçois tes menus",
    desc: "Des recettes équilibrées et faciles pour toute la semaine.",
  },
  {
    icon: ListChecks,
    title: "Fais tes courses",
    desc: "Ta liste est prête, imprimable ou exportable.",
  },
  {
    icon: TrendingUp,
    title: "Suis tes progrès",
    desc: "Poids, mensurations et objectifs—sans surcharge mentale.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <h2 className="text-3xl font-bold text-center mb-10">Comment ça marche ?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 text-center">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Icon className="text-orange-600" size={22} />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-gray-600 text-sm mt-2">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
