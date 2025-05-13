import { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col-reverse md:flex-row flex-1">
        {/* === FORMULAIRE CONNEXION === */}
        <div className="w-full md:w-1/2 p-8 lg:p-16">
          <h2 className="text-3xl font-bold mb-8">Se connecter à MaTransformation</h2>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-orange-500 text-white font-semibold py-3 rounded transition ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600'
              }`}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>

            <div className="flex justify-between text-sm">
              <Link href="/forgot-password" className="hover:text-orange-500">
                Mot de passe oublié ?
              </Link>
              <Link href="/register" className="hover:text-orange-500">
                Nouveau sur MaTransformation ? S'inscrire
              </Link>
            </div>
          </form>
        </div>

        {/* === BLOC PROMO (mobile + desktop) === */}
        <div className="w-full md:w-1/2 bg-[#FE8C15]/10 p-8 lg:p-16 flex items-center justify-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#FE8C15] mb-6 text-center md:text-left">
              Reprends le contrôle sur ton alimentation.
            </h2>
            <ul className="space-y-3 mb-8 text-gray-800 text-sm md:text-base">
              {[
                "Connexion à ton tableau de bord personnalisé",
                "Visualisation de tes menus, recettes et objectifs",
                "Modifications faciles depuis ton espace personnel",
                "Annulation possible à tout moment",
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
              alt="Mascotte MaTransformation"
              className="mx-auto mt-4 w-40 h-40 md:w-60 md:h-60 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
