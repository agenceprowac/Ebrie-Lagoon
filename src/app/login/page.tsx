"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function LoginPage() {
    const router = useRouter();
    const [pseudo, setPseudo] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        // Récupérer les utilisateurs
        const savedUsers = localStorage.getItem('ebrie_users');
        let users = [];
        if (savedUsers) {
            users = JSON.parse(savedUsers);
        } else {
            // Utilisateurs par défaut si non trouvés (au cas où la page Paramètres n'a jamais été visitée)
            users = [
                { id: '1', pseudo: 'Admin', password: 'admin123', name: 'Lionel Vithiano', roleId: 'admin', status: 'actif' }
            ];
        }

        // Vérifier les identifiants
        const validUser = users.find((u: any) => u.pseudo.toLowerCase() === pseudo.toLowerCase() && u.password === password);

        if (validUser) {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('currentUser', JSON.stringify(validUser));
            window.dispatchEvent(new Event('authChange'));
            router.push('/');
        } else {
            setErrorMsg("Identifiants incorrects.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex text-gray-800 font-sans relative overflow-hidden bg-slate-50">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400 opacity-20 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-400 opacity-20 blur-[120px] pointer-events-none"></div>

            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 z-10 w-full lg:w-1/2">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-xl mb-4 transform hover:scale-105 transition-transform duration-300">
                            <i className="fa-solid fa-water"></i>
                        </div>
                        <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 tracking-tight">
                            Ebrié Lagoon
                        </h2>
                        <p className="mt-2 text-sm text-gray-500 font-medium">Portail Administratif & Suivi</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-white/50 sm:px-10">
                        <form className="space-y-6" onSubmit={handleLogin}>
                            <div>
                                <label htmlFor="pseudo" className="block text-sm font-semibold text-gray-700 mb-1">
                                    Identifiant (Pseudo)
                                </label>
                                <div className="mt-1 relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i className="fa-solid fa-user text-gray-400"></i>
                                    </div>
                                    <input
                                        id="pseudo"
                                        name="pseudo"
                                        type="text"
                                        autoComplete="username"
                                        required
                                        value={pseudo}
                                        onChange={(e) => setPseudo(e.target.value)}
                                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 sm:text-sm"
                                        placeholder="Votre pseudo (ex: Admin)"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                                    Mot de passe
                                </label>
                                <div className="mt-1 relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i className="fa-solid fa-lock text-gray-400"></i>
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 sm:text-sm"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                    >
                                        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                            </div>

                            {errorMsg && (
                                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center">
                                    <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                                    {errorMsg}
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer">
                                        Se souvenir de moi
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a href="#" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                                        Mot de passe oublié ?
                                    </a>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-70 transform hover:-translate-y-0.5"
                                >
                                    {loading ? (
                                        <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Connexion en cours...</>
                                    ) : (
                                        'Se connecter'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            
            {/* Visual Section */}
            <div className="hidden lg:block relative w-0 flex-1 bg-gray-900">
                <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-blue-900 via-gray-900 to-black overflow-hidden">
                    {/* Decorative Image or Pattern */}
                    <img
                        className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay"
                        src="https://images.unsplash.com/photo-1605281317010-fe5ffe798166?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                        alt="Ebrié Lagoon background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    
                    <div className="absolute bottom-12 left-12 right-12 text-white">
                        <h2 className="text-4xl font-bold mb-4 tracking-tight">Gérez votre flotte et vos réservations avec excellence.</h2>
                        <p className="text-lg text-gray-300 max-w-2xl font-light">
                            L'outil tout-en-un conçu pour simplifier l'administration de vos activités sur la Lagune Ebrié. Tableau de bord, finances, opérations en temps réel.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
