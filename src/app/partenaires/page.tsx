
"use client";
import Link from &apos;next/link';
import { useState, useEffect } from &apos;react';

export default function PartenairesPage() {
    const [activeTab, setActiveTab] = useState('all');


    // Set default tab on mount
    useEffect(() => {
        // Just setting a default if needed
        if (activeTab === &apos;all') {
            setActiveTab('users'); // Default for parametres
        }
    }, []);

    return (
        <div className="flex h-screen overflow-hidden text-gray-800 bg-slate-50 font-sans">
            

    
    <aside className="w-64 bg-white shadow-xl flex flex-col hidden md:flex z-30 relative shrink-0">
        <div className="p-6 flex items-center justify-center border-b border-gray-100">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg mr-3">
                <i className="fa-solid fa-water"></i>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                Ebrié Lagoon
            </h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            <div className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Principal</div>
            <a href="/" className="sidebar-item text-gray-600 flex items-center px-4 py-3 text-sm font-medium">
                <i className="fa-solid fa-chart-pie w-6"></i> Tableau de bord
            </a>
            <a href="/reservations" className="sidebar-item text-gray-600 flex items-center px-4 py-3 text-sm font-medium">
                <i className="fa-solid fa-calendar-check w-6"></i> Réservations
            </a>
            <a href="/finances" className="sidebar-item text-gray-600 flex items-center px-4 py-3 text-sm font-medium">
                <i className="fa-solid fa-file-invoice-dollar w-6"></i> Finances & Devis
            </a>
            <a href="/flotte" className="sidebar-item text-gray-600 flex items-center px-4 py-3 text-sm font-medium">
                <i className="fa-solid fa-ship w-6"></i> Flotte & Opérations
            </a>
            <a href="/incidents" className="sidebar-item text-gray-600 flex items-center px-4 py-3 text-sm font-medium">
                <i className="fa-solid fa-triangle-exclamation w-6"></i> Incidents
            </a>
            <a href="/partenaires" className="sidebar-item active flex items-center px-4 py-3 text-sm font-medium">
                <i className="fa-solid fa-handshake w-6"></i> Partenaires
            </a>
            
            <div className="px-2 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Administration</div>
            <a href="/clients" className="sidebar-item text-gray-600 flex items-center px-4 py-3 text-sm font-medium">
                <i className="fa-solid fa-users w-6"></i> Clients
            </a>
            <a href="/parametres" className="sidebar-item text-gray-600 flex items-center px-4 py-3 text-sm font-medium">
                <i className="fa-solid fa-gear w-6"></i> Paramètres
            </a>
        </nav>
        <div className="p-4 border-t border-gray-100">
            <button className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:text-red-600 transition">
                <i className="fa-solid fa-sign-out-alt w-6"></i> Déconnexion
            </button>
        </div>
    </aside>

    
    <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-20">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-96 focus-within:ring-2 focus-within:ring-blue-400 transition">
                    <i className="fa-solid fa-search text-gray-400"></i>
                    <input type="text" placeholder="Rechercher un partenaire (Hôtel, Agence)..." className="bg-transparent border-none outline-none ml-2 w-full text-sm" />
                </div>
                <div className="flex items-center space-x-4">
                    <button className="relative p-2 text-gray-400 hover:text-gray-600 transition">
                        <i className="fa-solid fa-bell text-xl"></i>
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <div className="flex items-center space-x-3 border-l pl-4 border-gray-200 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                        <img src="https://ui-avatars.com/api/?name=Lionel+Vithiano&background=0D8ABC&color=fff" alt="User" className="w-9 h-9 rounded-full shadow-sm" />
                        <div className="hidden md:block text-sm">
                            <p className="font-semibold text-gray-700">M. Lionel Vithiano</p>
                            <p className="text-xs text-gray-500">Administrateur</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        
        <div className="p-6 lg:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Réseau de Partenaires</h2>
                    <p className="text-sm text-gray-500 mt-1">Gérez vos collaborations (hôtels, traiteurs, agences de voyage)</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md transition transform hover:-translate-y-0.5 text-sm font-medium flex items-center">
                    <i className="fa-solid fa-plus mr-2"></i> Nouveau Partenaire
                </button>
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-xl font-bold mr-3">
                                <i className="fa-solid fa-hotel"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">Hôtel Ivoire</h3>
                                <p className="text-xs text-purple-600 font-medium">Hôtellerie de luxe</p>
                            </div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">Actif</span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <p><i className="fa-solid fa-percent mr-2 w-4"></i> Commission: 15%</p>
                        <p><i className="fa-solid fa-link mr-2 w-4"></i> Réservations: 12 ce mois</p>
                    </div>
                    <button className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition border border-gray-200">Voir les détails</button>
                </div>

                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-xl font-bold mr-3">
                                <i className="fa-solid fa-utensils"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">Délices d&apos;Abidjan</h3>
                                <p className="text-xs text-orange-600 font-medium">Traiteur & Restauration</p>
                            </div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">Actif</span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <p><i className="fa-solid fa-handshake mr-2 w-4"></i> Type: Prestation externe</p>
                        <p><i className="fa-solid fa-star mr-2 w-4"></i> Note: 4.8/5 (50 avis)</p>
                    </div>
                    <button className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition border border-gray-200">Voir les détails</button>
                </div>

            </div>
        </div>
    </main>


        </div>
    );
}
