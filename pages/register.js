import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
    phone: "",
    birthdate: "",
    gender: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);

    try {
      const payload = {
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: form.password,
        phone: form.phone,
        birthdate: form.birthdate,
        gender: form.gender,
      };

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Erreur lors de l’inscription");
      } else {
        router.push("/verify-email");
      }
    } catch {
      setError("Impossible de se connecter au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col-reverse md:flex-row flex-1">
        {/* FORMULAIRE */}
        <div className="w-full md:w-1/2 p-8 lg:p-16">
          <h2 className="text-3xl font-bold mb-8">
            Crée ton compte gratuitement
          </h2>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Prénom</label>
                <input
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Nom</label>
                <input
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mot de passe</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Confirmer mot de passe
              </label>
              <input
                name="confirm"
                type="password"
                value={form.confirm}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Numéro de téléphone</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l border border-r-0 border-gray-300 bg-gray-100 text-gray-600">
                  🇫🇷 +33
                </span>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="flex-1 border border-gray-300 rounded-r px-3 py-2 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date de naissance</label>
              <input
                name="birthdate"
                type="date"
                value={form.birthdate}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Genre</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-orange-500"
              >
                <option value="">Sélectionner</option>
                <option>Homme</option>
                <option>Femme</option>
                <option>Autre</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-orange-500 text-white font-semibold py-3 rounded transition ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-orange-600"
              }`}
            >
              {loading ? "Envoi..." : "S’inscrire"}
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="inline-block border border-gray-300 rounded px-4 py-2 text-sm hover:bg-gray-50"
              >
                Tu as déjà un compte ? S’identifier
              </Link>
            </div>
          </form>
        </div>

        {/* ASIDE PROMO visible partout */}
        <div className="w-full md:w-1/2 bg-[#FE8C15]/10 p-8 lg:p-16 flex items-center justify-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#FE8C15] mb-6 text-center md:text-left">
              Démarre ta transformation dès aujourd’hui.
            </h2>
            <ul className="space-y-3 mb-8 text-gray-800 text-sm md:text-base">
              {[
                "7 jours pour tester MaTransformation gratuitement",
                "Des menus et recettes adaptés à ton métabolisme et tes objectifs",
                "Aucun engagement, annulation en un clic depuis ton compte",
                "Suivi des progrès facile et intuitif",
                "De nombreuses recettes équilibrées et validées nutritionnellement",
                "Une équipe bienveillante à ton écoute chaque jour",
              ].map((txt, i) => (
                <li key={i} className="flex items-start">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-[#FE8C15] mt-1 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" />
                  </svg>
                  <span>{txt}</span>
                </li>
              ))}
            </ul>
            <img
              src="/essai.png"
              alt="Mascotte cœur"
              className="mx-auto mt-4 w-40 h-40 md:w-60 md:h-60 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
