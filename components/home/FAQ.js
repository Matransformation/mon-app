import { useState } from "react";
import Link from "next/link";

export default function FAQ({ title = "Questions fréquentes", faqs = [], contact }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="bg-white px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 sm:text-4xl">
          {title}
        </h2>
        {/* trait orange pour matcher le site */}
        <div className="mx-auto mt-3 h-1 w-24 -skew-x-6 rounded bg-[#fb8905]" />

        <div className="mt-10 space-y-4">
          {faqs.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition">
                <button
                  className="flex w-full items-center justify-between p-4"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                >
                  <span className={`text-left text-lg font-medium transition ${isOpen ? "text-[#fb8905]" : "text-gray-900"}`}>
                    {item.question}
                  </span>
                  <svg
                    className={`h-5 w-5 transform transition-transform ${isOpen ? "rotate-180 text-[#fb8905]" : "text-gray-400"}`}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="border-t px-4 pb-4 text-gray-700">
                    <p className="whitespace-pre-line">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {contact && (
          <div className="mt-12 text-center">
            <p className="mb-4 text-gray-700">
              Une question ? Écris-nous à{" "}
              <a href={`mailto:${contact.email}`} className="text-[#fb8905] underline-offset-2 hover:underline">
                {contact.email}
              </a>
              .
            </p>
            <Link
              href={contact.ctaHref}
              className="inline-block rounded-full bg-[#fb8905] px-6 py-3 font-semibold text-white transition hover:brightness-95"
            >
              {contact.ctaText}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
