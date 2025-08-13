// components/home/Testimonials.js
export default function Testimonials({ items = [] }) {
    return (
      <section className="py-20 bg-gray-50 text-center px-6">
        <h2 className="text-3xl font-bold mb-10">Elles en parlent mieux que nous</h2>
  
        <div className="max-w-3xl mx-auto grid gap-8 text-gray-700">
          {items.map((t, i) => (
            <figure
              key={i}
              className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 text-left"
            >
              <blockquote className="italic text-lg leading-relaxed">
                “{t.text}”
              </blockquote>
              <figcaption className="not-italic font-medium text-sm text-orange-600 mt-3">
                — {t.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    );
  }
  