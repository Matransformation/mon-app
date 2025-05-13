// pages/auth/signin.js

import { getCsrfToken, signIn } from "next-auth/react";
import { useState } from "react";

export default function SignIn({ csrfToken }) {
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const email = e.currentTarget.email.value;
    const password = e.currentTarget.password.value;

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res.error) {
      setError("Identifiants invalides");
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-sm p-8 rounded shadow"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Connexion</h1>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

        <label className="block mb-4">
          <span className="text-sm font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            placeholder="email@example.com"
            className="mt-1 block w-full border border-gray-300 bg-white rounded py-2 px-3 
                       focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </label>

        <label className="block mb-6">
          <span className="text-sm font-medium">Mot de passe</span>
          <input
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="mt-1 block w-full border border-gray-300 bg-white rounded py-2 px-3 
                       focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </label>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded"
        >
          Se connecter
        </button>

        <p className="text-center text-sm mt-4">
          Pas encore de compte ?{" "}
          <a href="/register" className="text-green-600 underline">
            S’inscrire
          </a>
        </p>
      </form>
    </div>
  );
}

// Pour récupérer le token CSRF nécessaire au form
export async function getServerSideProps(context) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}
