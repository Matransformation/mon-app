// components/BottomNav.js
import Link from 'next/link'
import {
  HomeIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  ChatBubbleBottomCenterTextIcon,
  SpeakerphoneIcon,
} from '@heroicons/react/24/outline'

export default function BottomNav() {
  const items = [
    { href: '/', label: 'Accueil', icon: HomeIcon },
    { href: '/help', label: 'Aide', icon: QuestionMarkCircleIcon },
    { href: '/tasks', label: 'Tâches', icon: CheckCircleIcon },
    { href: '/conversations', label: 'Conversatio', icon: ChatBubbleBottomCenterTextIcon, badge: 4 },
    { href: '/news', label: 'Actualités', icon: SpeakerphoneIcon },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <ul className="flex justify-around">
        {items.map(({ href, label, icon: Icon, badge }) => (
          <li key={href} className="relative flex-1">
            <Link href={href} className="flex flex-col items-center py-2 text-gray-500 hover:text-orange-500">
              <div className="relative">
                <Icon className="h-6 w-6" />
                {badge && (
                  <span className="absolute -top-1 -right-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                    {badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
