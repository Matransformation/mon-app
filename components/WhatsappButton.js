import { FaWhatsapp } from "react-icons/fa"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function WhatsappButton() {
  const [visible, setVisible] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [bottomOffset, setBottomOffset] = useState(20)

  // Manage visibility and tooltip timing
  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 1000)
    const tooltipTimeout = setTimeout(() => setShowTooltip(true), 2000)
    const tooltipHide = setTimeout(() => setShowTooltip(false), 8000)

    return () => {
      clearTimeout(timeout)
      clearTimeout(tooltipTimeout)
      clearTimeout(tooltipHide)
    }
  }, [])

  // Adjust bottom offset based on cookie banner presence
  useEffect(() => {
    const updateOffset = () => {
      const banner = document.querySelector(".cookie-banner-container")
      if (banner) {
        const height = banner.offsetHeight
        setBottomOffset(height + 20)
      } else {
        setBottomOffset(20)
      }
    }

    updateOffset()
    window.addEventListener("resize", updateOffset)
    const observer = new MutationObserver(updateOffset)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      window.removeEventListener("resize", updateOffset)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <a
        href="https://wa.me/33658881560?text=Bonjour%20Cl%C3%A9mence%20et%20Romain%2C%20j%27ai%20une%20question%20sur%20votre%20programme"
        target="_blank"
        rel="noopener noreferrer"
        className={`whatsapp-button ${visible ? "visible" : ""}`}
        style={{ bottom: `${bottomOffset}px` }}
      >
        <div className="icon">
          <FaWhatsapp size={22} />
        </div>
        <span className="text">Une question ?</span>
        <div className="mascotte">
          <Image src="/essai.png" alt="Mascotte" width={28} height={28} />
        </div>
      </a>

      {showTooltip && (
        <div className="tooltip-bubble">
          💬 Une question ? Écris-nous sur WhatsApp !
        </div>
      )}

      <style jsx>{`
        .whatsapp-button {
          position: fixed;
          right: 20px;
          z-index: 1000;
          background-color: #25d366;
          color: white;
          border-radius: 9999px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.4s ease, transform 0.4s ease, bottom 0.2s ease;
        }

        .whatsapp-button.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .icon {
          margin-right: 8px;
        }

        .text {
          margin-right: 8px;
        }

        .mascotte {
          border-radius: 50%;
          overflow: hidden;
          width: 28px;
          height: 28px;
        }

        @media (max-width: 600px) {
          .text {
            display: none;
          }
        }

        .tooltip-bubble {
          position: fixed;
          bottom: calc(${bottomOffset}px + 56px);
          right: 20px;
          background: white;
          color: #333;
          padding: 8px 12px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          font-size: 13px;
          animation: fadeInOut 6s ease-in-out forwards;
          z-index: 9999;
        }

        @keyframes fadeInOut {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          10% {
            opacity: 1;
            transform: translateY(0);
          }
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(10px);
          }
        }
      `}</style>
    </>
  )
}
