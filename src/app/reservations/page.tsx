
"use client";
import Link from &apos;next/link';
import { useState, useEffect } from &apos;react';

export default function ReservationsPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);


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
            <a href="/reservations" className="sidebar-item active flex items-center px-4 py-3 text-sm font-medium">
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
            <a href="/partenaires" className="sidebar-item text-gray-600 flex items-center px-4 py-3 text-sm font-medium">
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

    
    <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50 relative">
        
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-20">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-96 focus-within:ring-2 focus-within:ring-blue-400 transition">
                    <i className="fa-solid fa-search text-gray-400"></i>
                    <input type="text" placeholder="Rechercher une réservation (N°, Nom, Téléphone)..." className="bg-transparent border-none outline-none ml-2 w-full text-sm" />
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

        
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Gestion des Réservations</h2>
                    <p className="text-sm text-gray-500">Suivi complet des prestations clients</p>
                </div>
                <button onClick={() => setIsReservationModalOpen(!isReservationModalOpen)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg shadow-md transition transform hover:-translate-y-0.5 text-sm font-medium flex items-center">
                    <i className="fa-solid fa-plus mr-2"></i> Nouvelle Réservation
                </button>
            </div>

            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Recherche (Nom, Contact)</label>
                    <div className="relative">
                        <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input type="text" id="searchInput"  placeholder="Ex: Armand, 0707..." className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Période (Date)</label>
                    <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Statut</label>
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Tous les statuts</option>
                        <option value="brouillon">Brouillon</option>
                        <option value="attente">En attente d&apos;acompte</option>
                        <option value="confirmee">Confirmée</option>
                        <option value="terminee">Terminée</option>
                        <option value="annulee">Annulée</option>
                    </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Partenaire / Bateau</label>
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Tous les bateaux</option>
                        <option value="b1">Catamaran "Lagune Express"</option>
                        <option value="b2">Yacht "VIP Ebrié"</option>
                        <option value="b3">Speedboat "Rapide"</option>
                    </select>
                </div>
                <div>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center h-10">
                        <i className="fa-solid fa-filter mr-2"></i> Filtrer
                    </button>
                </div>
            </div>

            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium">N° Réservation</th>
                                <th className="px-6 py-4 font-medium">Client & Contact</th>
                                <th className="px-6 py-4 font-medium">Prestation (Date & Heure)</th>
                                <th className="px-6 py-4 font-medium">Partenaire / Bateau</th>
                                <th className="px-6 py-4 font-medium">Statut</th>
                                <th className="px-6 py-4 font-medium text-right">Montant (FCFA)</th>
                                <th className="px-6 py-4 font-medium text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="reservationsTableBody" className="text-sm divide-y divide-gray-100">
                            
                            <tr className="hover:bg-blue-50/50 transition">
                                <td className="px-6 py-4">
                                    <span className="font-semibold text-gray-900">RES-2026-068</span>
                                    <div className="text-xs text-gray-400 mt-0.5">Créé le 10/06/2026</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-800">Koffi Armand</div>
                                    <div className="text-xs text-gray-500 mt-0.5"><i className="fa-brands fa-whatsapp text-green-500 mr-1"></i>07 07 12 34 56</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-gray-800"><i className="fa-regular fa-calendar mr-1"></i>12 Juin 2026</div>
                                    <div className="text-xs text-gray-500 mt-0.5"><i className="fa-regular fa-clock mr-1"></i>14:00 (3h) • 15 Pax</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">Catamaran "Lagune Express"</td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200">Confirmée</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="font-bold text-gray-800">150 000</div>
                                    <div className="text-xs text-green-600 mt-0.5">Solde: 0</div>
                                </td>
                                <td className="px-6 py-4 text-center space-x-2">
                                    <button  className="text-blue-500 hover:text-blue-700 transition" title="Voir détails"><i className="fa-solid fa-eye"></i></button>
                                    <button className="text-gray-400 hover:text-gray-600 transition" title="Modifier"><i className="fa-solid fa-pen"></i></button>
                                    <button className="text-gray-400 hover:text-green-600 transition" title="Paiement"><i className="fa-solid fa-money-bill"></i></button>
                                </td>
                            </tr>
                            
                            
                            <tr className="hover:bg-blue-50/50 transition">
                                <td className="px-6 py-4">
                                    <span className="font-semibold text-gray-900">RES-2026-069</span>
                                    <div className="text-xs text-gray-400 mt-0.5">Créé le 11/06/2026</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-800">Sylla Fatou</div>
                                    <div className="text-xs text-gray-500 mt-0.5"><i className="fa-solid fa-phone text-gray-400 mr-1"></i>01 02 03 04 05</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-gray-800"><i className="fa-regular fa-calendar mr-1"></i>15 Juin 2026</div>
                                    <div className="text-xs text-gray-500 mt-0.5"><i className="fa-regular fa-clock mr-1"></i>09:30 (Demi-journée) • 5 Pax</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">Speedboat "Rapide"</td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold border border-yellow-200">Attente Acompte</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="font-bold text-gray-800">85 000</div>
                                    <div className="text-xs text-red-500 mt-0.5">Solde: 85 000</div>
                                </td>
                                <td className="px-6 py-4 text-center space-x-2">
                                    <button  className="text-blue-500 hover:text-blue-700 transition" title="Voir détails"><i className="fa-solid fa-eye"></i></button>
                                    <button className="text-gray-400 hover:text-gray-600 transition" title="Modifier"><i className="fa-solid fa-pen"></i></button>
                                    <button className="text-gray-400 hover:text-green-600 transition" title="Paiement"><i className="fa-solid fa-money-bill"></i></button>
                                </td>
                            </tr>

                            
                            <tr className="hover:bg-blue-50/50 transition">
                                <td className="px-6 py-4">
                                    <span className="font-semibold text-gray-900">RES-2026-070</span>
                                    <div className="text-xs text-gray-400 mt-0.5">Créé le 11/06/2026</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-800">Entreprise Tiemoko</div>
                                    <div className="text-xs text-gray-500 mt-0.5"><i className="fa-solid fa-envelope text-gray-400 mr-1"></i>contact@tiemoko.ci</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-gray-800"><i className="fa-regular fa-calendar mr-1"></i>20 Juin 2026</div>
                                    <div className="text-xs text-gray-500 mt-0.5"><i className="fa-regular fa-clock mr-1"></i>10:00 (Journée) • 40 Pax</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">Yacht "VIP Ebrié"</td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">Brouillon</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="font-bold text-gray-800">450 000</div>
                                    <div className="text-xs text-orange-500 mt-0.5">Acompte: 150 000</div>
                                </td>
                                <td className="px-6 py-4 text-center space-x-2">
                                    <button  className="text-blue-500 hover:text-blue-700 transition" title="Voir détails"><i className="fa-solid fa-eye"></i></button>
                                    <button className="text-gray-400 hover:text-gray-600 transition" title="Modifier"><i className="fa-solid fa-pen"></i></button>
                                    <button className="text-gray-400 hover:text-green-600 transition" title="Paiement"><i className="fa-solid fa-money-bill"></i></button>
                                </td>
                            </tr>
                            
                            
                            
                            <tr className="hover:bg-blue-50/50 transition">
                                <td className="px-6 py-4"><span className="font-semibold text-gray-900">RES-2026-071</span></td>
                                <td className="px-6 py-4"><div className="font-medium text-gray-800">Aka Serge</div><div className="text-xs text-gray-500">05 05 05 05 05</div></td>
                                <td className="px-6 py-4"><div className="text-gray-800">22 Juin 2026</div></td>
                                <td className="px-6 py-4 text-gray-600">Catamaran "Lagune Express"</td>
                                <td className="px-6 py-4"><span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Confirmée</span></td>
                                <td className="px-6 py-4 text-right"><div className="font-bold text-gray-800">200 000</div></td>
                                <td className="px-6 py-4 text-center space-x-2">
                                    <button onClick={() => setIsDetailsModalOpen(!isDetailsModalOpen)} className="text-blue-500 hover:text-blue-700 transition" title="Voir détails"><i className="fa-solid fa-eye"></i></button>
                                    <button className="text-gray-400 hover:text-gray-600 transition" title="Modifier"><i className="fa-solid fa-pen"></i></button>
                                    <button className="text-gray-400 hover:text-green-600 transition" title="Paiement"><i className="fa-solid fa-money-bill"></i></button>
                                </td>
                            </tr>
                            <tr className="hover:bg-blue-50/50 transition">
                                <td className="px-6 py-4"><span className="font-semibold text-gray-900">RES-2026-072</span></td>
                                <td className="px-6 py-4"><div className="font-medium text-gray-800">Traoré Ismael</div><div className="text-xs text-gray-500">01 01 01 01 01</div></td>
                                <td className="px-6 py-4"><div className="text-gray-800">23 Juin 2026</div></td>
                                <td className="px-6 py-4 text-gray-600">Speedboat "Rapide"</td>
                                <td className="px-6 py-4"><span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">Terminée</span></td>
                                <td className="px-6 py-4 text-right"><div className="font-bold text-gray-800">120 000</div></td>
                                <td className="px-6 py-4 text-center space-x-2">
                                    <button onClick={() => setIsDetailsModalOpen(!isDetailsModalOpen)} className="text-blue-500 hover:text-blue-700 transition" title="Voir détails"><i className="fa-solid fa-eye"></i></button>
                                    <button className="text-gray-400 hover:text-gray-600 transition" title="Modifier"><i className="fa-solid fa-pen"></i></button>
                                    <button className="text-gray-400 hover:text-green-600 transition" title="Paiement"><i className="fa-solid fa-money-bill"></i></button>
                                </td>
                            </tr>
                            <tr className="hover:bg-blue-50/50 transition">
                                <td className="px-6 py-4"><span className="font-semibold text-gray-900">RES-2026-073</span></td>
                                <td className="px-6 py-4"><div className="font-medium text-gray-800">Tourisme CI</div><div className="text-xs text-gray-500">contact@tourisme.ci</div></td>
                                <td className="px-6 py-4"><div className="text-gray-800">25 Juin 2026</div></td>
                                <td className="px-6 py-4 text-gray-600">Yacht "VIP Ebrié"</td>
                                <td className="px-6 py-4"><span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Confirmée</span></td>
                                <td className="px-6 py-4 text-right"><div className="font-bold text-gray-800">1 500 000</div></td>
                                <td className="px-6 py-4 text-center space-x-2">
                                    <button onClick={() => setIsDetailsModalOpen(!isDetailsModalOpen)} className="text-blue-500 hover:text-blue-700 transition" title="Voir détails"><i className="fa-solid fa-eye"></i></button>
                                    <button className="text-gray-400 hover:text-gray-600 transition" title="Modifier"><i className="fa-solid fa-pen"></i></button>
                                    <button className="text-gray-400 hover:text-green-600 transition" title="Paiement"><i className="fa-solid fa-money-bill"></i></button>
                                </td>
                            </tr>
                            <tr className="hover:bg-blue-50/50 transition">
                                <td className="px-6 py-4"><span className="font-semibold text-gray-900">RES-2026-074</span></td>
                                <td className="px-6 py-4"><div className="font-medium text-gray-800">Bamba Ali</div><div className="text-xs text-gray-500">07 88 99 00 11</div></td>
                                <td className="px-6 py-4"><div className="text-gray-800">26 Juin 2026</div></td>
                                <td className="px-6 py-4 text-gray-600">Catamaran "Lagune Express"</td>
                                <td className="px-6 py-4"><span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Annulée</span></td>
                                <td className="px-6 py-4 text-right"><div className="font-bold text-gray-800">150 000</div></td>
                                <td className="px-6 py-4 text-center space-x-2">
                                    <button onClick={() => setIsDetailsModalOpen(!isDetailsModalOpen)} className="text-blue-500 hover:text-blue-700 transition" title="Voir détails"><i className="fa-solid fa-eye"></i></button>
                                    <button className="text-gray-400 hover:text-gray-600 transition" title="Modifier"><i className="fa-solid fa-pen"></i></button>
                                    <button className="text-gray-400 hover:text-green-600 transition" title="Paiement"><i className="fa-solid fa-money-bill"></i></button>
                                </td>
                            </tr>
                            <tr className="hover:bg-blue-50/50 transition">
                                <td className="px-6 py-4"><span className="font-semibold text-gray-900">RES-2026-075</span></td>
                                <td className="px-6 py-4"><div className="font-medium text-gray-800">Diomandé Eric</div><div className="text-xs text-gray-500">05 66 77 88 99</div></td>
                                <td className="px-6 py-4"><div className="text-gray-800">28 Juin 2026</div></td>
                                <td className="px-6 py-4 text-gray-600">Speedboat "Rapide"</td>
                                <td className="px-6 py-4"><span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Attente Acompte</span></td>
                                <td className="px-6 py-4 text-right"><div className="font-bold text-gray-800">90 000</div></td>
                                <td className="px-6 py-4 text-center space-x-2">
                                    <button className="text-blue-500 hover:text-blue-700 transition" title="Voir détails"><i className="fa-solid fa-eye"></i></button>
                                    <button className="text-gray-400 hover:text-gray-600 transition" title="Modifier"><i className="fa-solid fa-pen"></i></button>
                                    <button className="text-gray-400 hover:text-green-600 transition" title="Paiement"><i className="fa-solid fa-money-bill"></i></button>
                                </td>
                            </tr>
                            <tr className="hover:bg-blue-50/50 transition">
                                <td className="px-6 py-4"><span className="font-semibold text-gray-900">RES-2026-076</span></td>
                                <td className="px-6 py-4"><div className="font-medium text-gray-800">Kouamé Yves</div><div className="text-xs text-gray-500">01 23 45 67 89</div></td>
                                <td className="px-6 py-4"><div className="text-gray-800">29 Juin 2026</div></td>
                                <td className="px-6 py-4 text-gray-600">Catamaran "Lagune Express"</td>
                                <td className="px-6 py-4"><span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Confirmée</span></td>
                                <td className="px-6 py-4 text-right"><div className="font-bold text-gray-800">180 000</div></td>
                                <td className="px-6 py-4 text-center"><button className="text-blue-500 hover:text-blue-700"><i className="fa-solid fa-eye"></i></button></td>
                            </tr>
                            <tr className="hover:bg-blue-50/50 transition">
                                <td className="px-6 py-4"><span className="font-semibold text-gray-900">RES-2026-077</span></td>
                                <td className="px-6 py-4"><div className="font-medium text-gray-800">Soro Naminata</div><div className="text-xs text-gray-500">07 11 22 33 44</div></td>
                                <td className="px-6 py-4"><div className="text-gray-800">30 Juin 2026</div></td>
                                <td className="px-6 py-4 text-gray-600">Speedboat "Rapide"</td>
                                <td className="px-6 py-4"><span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Brouillon</span></td>
                                <td className="px-6 py-4 text-right"><div className="font-bold text-gray-800">85 000</div></td>
                                <td className="px-6 py-4 text-center"><button className="text-blue-500 hover:text-blue-700"><i className="fa-solid fa-eye"></i></button></td>
                            </tr>
                            <tr className="hover:bg-blue-50/50 transition">
                                <td className="px-6 py-4"><span className="font-semibold text-gray-900">RES-2026-078</span></td>
                                <td className="px-6 py-4"><div className="font-medium text-gray-800">Yao Patrick</div><div className="text-xs text-gray-500">05 99 88 77 66</div></td>
                                <td className="px-6 py-4"><div className="text-gray-800">02 Juil 2026</div></td>
                                <td className="px-6 py-4 text-gray-600">Yacht "VIP Ebrié"</td>
                                <td className="px-6 py-4"><span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Confirmée</span></td>
                                <td className="px-6 py-4 text-right"><div className="font-bold text-gray-800">600 000</div></td>
                                <td className="px-6 py-4 text-center"><button className="text-blue-500 hover:text-blue-700"><i className="fa-solid fa-eye"></i></button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Afficher</span>
                        <select className="border border-gray-200 rounded text-sm text-gray-700 py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="10">11</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                        <span className="text-sm text-gray-500">par page</span>
                    </div>
                    <span className="text-sm text-gray-500">Affichage 1 à 11 sur 124 réservations</span>
                    <div className="flex space-x-1">
                        <button className="px-3 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50" disabled><i className="fa-solid fa-chevron-left text-xs"></i></button>
                        <button className="px-3 py-1 rounded bg-blue-600 text-white font-medium">1</button>
                        <button className="px-3 py-1 rounded border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium">2</button>
                        <button className="px-3 py-1 rounded border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium">3</button>
                        <span className="px-3 py-1 text-gray-500">...</span>
                        <button className="px-3 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50"><i className="fa-solid fa-chevron-right text-xs"></i></button>
                    </div>
                </div>
            </div>
        </div>
    </main>

    
    <div id="reservationModal" className={`fixed inset-0 z-50 items-center justify-center p-4 ${isReservationModalOpen ? &apos;flex&apos; : &apos;hidden'}`}>
        
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsReservationModalOpen(!isReservationModalOpen)}></div>
        
        
        <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col transform transition-all scale-100 opacity-100 duration-300 ease-in-out" id="modalPanel">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                <h3 className="text-lg font-bold text-gray-800">Créer une Réservation</h3>
                <button onClick={() => setIsReservationModalOpen(!isReservationModalOpen)} className="text-gray-400 hover:text-red-500 transition text-xl">
                    <i className="fa-solid fa-times"></i>
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                <div>
                    <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 border-b pb-2"><i className="fa-solid fa-user mr-2"></i>Informations Client</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Client / Raison Sociale *</label>
                            <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone / WhatsApp *</label>
                            <input type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Canal d&apos;acquisition</label>
                            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                <option>WhatsApp</option>
                                <option>Site Web</option>
                                <option>Appel Téléphonique</option>
                                <option>Partenaire / Apporteur</option>
                            </select>
                        </div>
                    </div>
                </div>

                
                <div>
                    <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 border-b pb-2"><i className="fa-solid fa-ship mr-2"></i>Détails Prestation</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pack Principal *</label>
                            <select id="resPack"  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50">
                                <option value="" data-price="0">-- Choisir un pack --</option>
                                <option value="mariage" data-price="800000">Demande en mariage Premium (800 000 FCFA)</option>
                                <option value="anniversaire" data-price="600000">Anniversaire Premium (600 000 FCFA)</option>
                                <option value="corporate" data-price="1000000">Corporate Premium (1 000 000 FCFA)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date Prévue *</label>
                            <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Heure de Départ *</label>
                            <input type="time" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nb Participants *</label>
                            <input type="number" min="1" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bateau / Partenaire Alloué</label>
                            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                <option>-- À définir --</option>
                                <option>Catamaran "Lagune Express"</option>
                                <option>Yacht "VIP Ebrié"</option>
                            </select>
                        </div>
                    </div>
                </div>

                
                <div>
                    <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 border-b pb-2"><i className="fa-solid fa-coins mr-2"></i>Aspect Financier</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Montant Calculé (FCFA) *</label>
                            <input type="number" id="resMontant" step="1000" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900 bg-gray-100 cursor-not-allowed" readOnly placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Acompte Payé (FCFA)</label>
                            <input type="number" step="1000" placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-green-600 font-medium" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mode de Paiement (Acompte)</label>
                            <div className="flex space-x-4 mt-2">
                                <label className="flex items-center text-sm cursor-pointer"><input type="radio" name="pay" className="mr-2" /> Wave/Orange/MTN</label>
                                <label className="flex items-center text-sm cursor-pointer"><input type="radio" name="pay" className="mr-2" /> Virement / Chèque</label>
                                <label className="flex items-center text-sm cursor-pointer"><input type="radio" name="pay" className="mr-2" /> Espèces</label>
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Options Additionnelles</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <label className="flex items-center text-sm cursor-pointer"><input type="checkbox" id="opt_deco" defaultValue="deco_romantique" data-price="50000"  className="mr-2" /> Décoration romantique (+50K)</label>
                                <label className="flex items-center text-sm cursor-pointer"><input type="checkbox" id="opt_photo" defaultValue="photo" data-price="100000"  className="mr-2" /> Photographe (+100K)</label>
                                <label className="flex items-center text-sm cursor-pointer"><input type="checkbox" id="opt_dj" defaultValue="dj" data-price="200000"  className="mr-2" /> DJ professionnel (+200K)</label>
                            </div>
                        </div>
                        <div className="col-span-2 mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Observations spécifiques</label>
                            <textarea rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Traiteur, allergies..." defaultValue={``} />
                        </div>
                    </div>
                </div>
            </div>
            
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                <button onClick={() => setIsReservationModalOpen(!isReservationModalOpen)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition">Annuler</button>
                <button className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-md">Enregistrer la réservation</button>
            </div>
        </div>
    </div>

    
    <div id="detailsModal" className={`fixed inset-0 z-50 items-center justify-center p-4 ${isDetailsModalOpen ? &apos;flex&apos; : &apos;hidden'}`}>
        
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsDetailsModalOpen(!isDetailsModalOpen)}></div>
        
        
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col transform transition-all scale-100 opacity-100 duration-300 ease-in-out">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                <h3 className="text-lg font-bold text-gray-800">Détails de la Réservation <span className="text-blue-600">RES-2026-068</span></h3>
                <button onClick={() => setIsDetailsModalOpen(!isDetailsModalOpen)} className="text-gray-400 hover:text-red-500 transition text-xl">
                    <i className="fa-solid fa-times"></i>
                </button>
            </div>
            
            <div className="p-6 space-y-6">
                
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Client</h4>
                        <p className="font-medium text-gray-800">Koffi Armand</p>
                        <p className="text-sm text-gray-500"><i className="fa-brands fa-whatsapp text-green-500 mr-1"></i>07 07 12 34 56</p>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Prestation</h4>
                        <p className="font-medium text-gray-800">Catamaran "Lagune Express"</p>
                        <p className="text-sm text-gray-500"><i className="fa-regular fa-clock mr-1"></i>12 Juin 2026, 14:00 (3h)</p>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Finances</h4>
                        <p className="font-medium text-gray-800">Total : 150 000 FCFA</p>
                        <p className="text-sm text-green-600 font-medium">Solde restant : 0 FCFA</p>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Statut</h4>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200">Confirmée</span>
                    </div>
                </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between rounded-b-2xl">
                <button onClick={() => setIsDetailsModalOpen(!isDetailsModalOpen)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition">Fermer</button>
                <div className="space-x-3">
                    <a href="finances_prototype.html?action=new_doc&type=devis&client=Koffi+Armand&pack=mariage" id="btnDevis" className="px-5 py-2.5 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition shadow-sm inline-flex items-center">
                        <i className="fa-solid fa-file-signature mr-2"></i> Générer Devis
                    </a>
                    <a href="finances_prototype.html?action=new_doc&type=facture&client=Koffi+Armand&pack=mariage" id="btnFacture" className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-md inline-flex items-center">
                        <i className="fa-solid fa-file-invoice-dollar mr-2"></i> Générer Facture
                    </a>
                </div>
            </div>
        </div>
    </div>

    

        </div>
    );
}
