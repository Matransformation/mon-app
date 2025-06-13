import { useEffect, useState } from "react";
import axios from "axios";
import { Bell } from "lucide-react";
import Link from "next/link";

export default function NotificationBell({ userId }) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    // fetch une première fois
    axios
      .get(`/api/notifications/unreadCount?userId=${userId}`)
      .then((res) => setUnread(res.data.unread))
      .catch(console.error);

    // puis toutes les 30s
    const id = setInterval(() => {
      axios
        .get(`/api/notifications/unreadCount?userId=${userId}`)
        .then((res) => setUnread(res.data.unread))
        .catch(console.error);
    }, 30000);

    return () => clearInterval(id);
  }, [userId]);

  return (
    <Link href="/notifications" className="relative p-2">
      <Bell className="w-6 h-6 text-gray-700 hover:text-gray-900" />
      {unread > 0 && (
        <span
          className="
            absolute -top-1 -right-1 
            bg-red-600 text-white text-xs 
            rounded-full w-5 h-5 flex 
            items-center justify-center
          "
        >
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
