// pages/api/send-notification.js
export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end()
  
    const { title, message } = req.body
  
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: "e05dcce1-435a-4585-a0bb-80a877ad05f7",
        headings: { en: title },
        contents: { en: message },
        included_segments: ["Subscribed Users"],
      }),
    })
  
    if (!response.ok) {
      const error = await response.json()
      return res.status(500).json({ error })
    }
  
    res.status(200).json({ success: true })
  }
  