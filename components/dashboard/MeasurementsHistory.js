export default function MeasurementsHistory({ mensurations }) {
    if (!mensurations?.length) return null
    const histos = [...mensurations].sort((a,b) => new Date(b.date) - new Date(a.date))
    const keys = ["taille","hanches","cuisses","bras","poitrine","mollets","masseGrasse"]
    function variation(curr, next) { if (!next) return null; const diff=curr-next; return diff===0?" (–)":` (${diff>0?"+"+diff:diff})` }
    return (
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Historique mensurations</h2>
        {histos.map((m,idx) => (
          <div key={m.id} className="border-b py-2 text-sm">
            <p className="font-semibold">{new Date(m.date).toLocaleDateString("fr-FR")}</p>
            {keys.map(key => m[key]!=null && <p key={key}>{key} : {m[key]}<span className="text-gray-500">{variation(m[key], histos[idx+1]?.[key])}</span></p>)}
          </div>
        ))}
      </div>
    )
  }
  