export default function DayNav() {
    const jours = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
  
    return (
      <nav className="sticky top-12 z-40 bg-cream-50 py-2 border-b border-gray-200 overflow-x-auto">
        <ul className="flex gap-4 px-4">
          {jours.map(day => (
            <li key={day}>
              <a
                href={`#${day.toLowerCase()}`}
                className="text-sm font-medium text-gray-700 hover:text-green-700"
              >
                {day}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    )
  }
  