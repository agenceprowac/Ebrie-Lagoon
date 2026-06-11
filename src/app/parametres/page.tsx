
"use client";
import Link from &apos;next/link';
import { useState, useEffect } from &apos;react';

export default function ParametresPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);


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
            <div
                className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg mr-3">
                <i className="fa-solid fa-water"></i>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                Ebrié Lagoon
            </h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            <div className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Principal</div>
            <a href="/"
                className="sidebar-item text-gray-600 flex items-center px-4 py-3 text-sm font-medium">
                <i className="fa-solid fa-chart-pie w-6"></i> Tableau de bord
            </a>
            <a href="/reservations"
                className="sidebar-item text-gray-600 flex items-center px-4 py-3 text-sm font-medium">
                <i className="fa-solid fa-calendar-check w-6"></i> Réservations
            </a>
            <a href="/finances"
                className="sidebar-item text-gray-600 flex items-center px-4 py-3 text-sm font-medium">
                <i className="fa-solid fa-file-invoice-dollar w-6"></i> Finances & Devis
            </a>
            <a href="/flotte"
                className="sidebar-item text-gray-600 flex items-center px-4 py-3 text-sm font-medium">
                <i className="fa-solid fa-ship w-6"></i> Flotte & Opérations
            </a>
            <a href="/incidents"
                className="sidebar-item text-gray-600 flex items-center px-4 py-3 text-sm font-medium">
                <i className="fa-solid fa-triangle-exclamation w-6"></i> Incidents
            </a>
            <a href="/partenaires"
                className="sidebar-item text-gray-600 flex items-center px-4 py-3 text-sm font-medium">
                <i className="fa-solid fa-handshake w-6"></i> Partenaires
            </a>

            <div className="px-2 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Administration
            </div>
            <a href="/clients"
                className="sidebar-item text-gray-600 flex items-center px-4 py-3 text-sm font-medium">
                <i className="fa-solid fa-users w-6"></i> Clients
            </a>
            <a href="/parametres"
                className="sidebar-item active flex items-center px-4 py-3 text-sm font-medium">
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
                <div
                    className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-96 focus-within:ring-2 focus-within:ring-blue-400 transition opacity-0">
                    
                    <i className="fa-solid fa-search text-gray-400"></i>
                    <input type="text" className="bg-transparent border-none outline-none ml-2 w-full text-sm" />
                </div>
                <div className="flex items-center space-x-4">
                    <button className="relative p-2 text-gray-400 hover:text-gray-600 transition">
                        <i className="fa-solid fa-bell text-xl"></i>
                        <span
                            className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <div
                        className="flex items-center space-x-3 border-l pl-4 border-gray-200 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                        <img src="https://ui-avatars.com/api/?name=Lionel+Vithiano&background=0D8ABC&color=fff"
                            alt="User" className="w-9 h-9 rounded-full shadow-sm" />
                        <div className="hidden md:block text-sm">
                            <p className="font-semibold text-gray-700">M. Lionel Vithiano</p>
                            <p className="text-xs text-gray-500">Administrateur</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        
        <div className="p-6 lg:p-8 flex-1 flex flex-col">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Paramètres de l&apos;Application</h2>
                <p className="text-sm text-gray-500">Configurez votre environnement, vos utilisateurs et vos tarifs</p>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">

                
                <div className="w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-1 h-fit">
                    <button id="btn-tab-societe" onClick={() => setActiveTab('societe')}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition border-l-3 border-transparent ${activeTab === &apos;societe&apos; ? &apos;tab-active&apos; : &apos;text-gray-600 hover:bg-gray-50'}`}>
                        <i className="fa-solid fa-building mr-2 w-4"></i> Informations Société
                    </button>
                    <button id="btn-tab-users" onClick={() => setActiveTab('users')}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm transition ${activeTab === &apos;users&apos; ? &apos;tab-active&apos; : &apos;text-gray-600 hover:bg-gray-50'}`}>
                        <i className="fa-solid fa-users-gear mr-2 w-4"></i> Utilisateurs & Rôles
                    </button>
                    <button id="btn-tab-tarifs" onClick={() => setActiveTab('tarifs')}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition border-l-3 border-transparent ${activeTab === &apos;tarifs&apos; ? &apos;tab-active&apos; : &apos;text-gray-600 hover:bg-gray-50'}`}>
                        <i className="fa-solid fa-tags mr-2 w-4"></i> Tarification & Packs
                    </button>
                    <button id="btn-tab-pdf" onClick={() => setActiveTab('pdf')}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition border-l-3 border-transparent ${activeTab === &apos;pdf&apos; ? &apos;tab-active&apos; : &apos;text-gray-600 hover:bg-gray-50'}`}>
                        <i className="fa-solid fa-file-invoice mr-2 w-4"></i> Modèles PDF
                    </button>
                    <button id="btn-tab-notifications" onClick={() => setActiveTab('notifications')}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition border-l-3 border-transparent ${activeTab === &apos;notifications&apos; ? &apos;tab-active&apos; : &apos;text-gray-600 hover:bg-gray-50'}`}>
                        <i className="fa-solid fa-bell mr-2 w-4"></i> Notifications
                    </button>
                </div>

                
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto relative">

                    
                    <div id="tab-societe" className={`p-6 md:p-8  ${activeTab === &apos;societe&apos; ? &apos;block&apos; : &apos;hidden'}`}>
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Informations de la Société</h3>
                            <p className="text-sm text-gray-500">Ces informations apparaîtront sur vos devis et factures.
                            </p>
                        </div>

                        <div className="space-y-6 max-w-3xl">
                            
                            <div className="flex items-center space-x-6 border-b border-gray-100 pb-6">
                                <div
                                    className="w-24 h-24 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                                    <i className="fa-solid fa-image text-gray-400 text-2xl"></i>
                                </div>
                                <div>
                                    <button
                                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                                        <i className="fa-solid fa-upload mr-2"></i> Télécharger le Logo
                                    </button>
                                    <p className="text-xs text-gray-500 mt-2">Format recommandé: PNG ou JPG, max 2MB.
                                        500x500px.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Raison Sociale *</label>
                                    <input type="text" defaultValue="Ebrié Lagoon CI"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Registre de Commerce
                                        (RCCM)</label>
                                    <input type="text" defaultValue="CI-ABJ-2023-B-12345"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Compte Contribuable
                                        (CC)</label>
                                    <input type="text" defaultValue="1234567 A"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>

                                <div className="col-span-2">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4 mb-2">
                                        Coordonnées</h4>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Adresse Complète</label>
                                    <input type="text" defaultValue="Abidjan, Marcory Zone 4, Rue Pierre et Marie Curie"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Téléphone
                                        Principal</label>
                                    <input type="text" defaultValue="+225 07 00 11 22 33"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Email de Contact</label>
                                    <input type="email" defaultValue="contact@ebrielagoon.com"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>

                                <div className="col-span-2">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4 mb-2">
                                        Informations Bancaires</h4>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Détails Bancaires (RIB,
                                        IBAN, Nom de la banque)</label>
                                    <textarea rows={3}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={`Banque: Ecobank CI
Titulaire: Ebrié Lagoon CI
RIB: CI059 01001 12345678901 23`} />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                <button
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md transition text-sm font-medium">
                                    Enregistrer les informations
                                </button>
                            </div>
                        </div>
                    </div>

                    
                    <div id="tab-pdf" className={`p-6 md:p-8  ${activeTab === &apos;pdf&apos; ? &apos;block&apos; : &apos;hidden'}`}>
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Personnalisation des Documents PDF</h3>
                            <p className="text-sm text-gray-500">Gérez le design visuel de vos devis et factures.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Couleur
                                        Principale</label>
                                    <div className="flex items-center space-x-3">
                                        <input type="color" defaultValue="#2563EB"
                                            className="w-10 h-10 p-1 rounded border border-gray-300 cursor-pointer" />
                                        <span className="text-sm text-gray-600">#2563EB (Bleu Ebrié Lagoon)</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pied de page
                                        (Footer)</label>
                                    <textarea rows={3}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={`Ebrié Lagoon CI au capital de 1 000 000 FCFA - RCCM: CI-ABJ-2023-B-12345 - CC: 1234567 A
Siège social : Abidjan, Marcory Zone 4`} />
                                    <p className="text-xs text-gray-500 mt-1">Apparaît en bas de chaque page du PDF.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mentions légales de
                                        facturation</label>
                                    <textarea rows={2}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={`En cas de retard de paiement, une pénalité de 3% par mois sera appliquée.
Validité du devis : 15 jours.`} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Signature & Cachet par
                                        défaut</label>
                                    <div
                                        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                                        <div className="text-center">
                                            <i className="fa-solid fa-signature text-gray-400 text-2xl mb-2"></i>
                                            <p className="text-xs text-gray-500">Cliquer pour uploader une image PNG
                                                transparente</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md transition text-sm font-medium">
                                        Sauvegarder le modèle
                                    </button>
                                </div>
                            </div>

                            
                            <div
                                className="bg-gray-100 rounded-xl p-4 flex items-center justify-center border border-gray-200 min-h-[500px]">
                                <div className="bg-white shadow-xl w-full max-w-sm aspect-[1/1.4] p-6 text-[10px] relative">
                                    
                                    <div className="flex justify-between border-b-2 border-blue-600 pb-4 mb-4">
                                        <div
                                            className="w-16 h-8 bg-gray-200 flex items-center justify-center text-gray-400">
                                            LOGO</div>
                                        <div className="text-right">
                                            <h1 className="text-sm font-bold text-blue-600">FACTURE N° FAC-001</h1>
                                            <p className="text-gray-500">Date: 10/06/2026</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between mb-6">
                                        <div>
                                            <p className="font-bold">Ebrié Lagoon CI</p>
                                            <p className="text-gray-500">Zone 4, Abidjan</p>
                                        </div>
                                        <div className="text-right bg-gray-50 p-2 rounded">
                                            <p className="font-bold">Facturé à:</p>
                                            <p className="text-gray-700">Koffi Armand</p>
                                            <p className="text-gray-500">07 07 12 34 56</p>
                                        </div>
                                    </div>
                                    <table className="w-full mb-6"><tbody>
<tr className="bg-blue-50 text-blue-800 font-bold">
                                            <th className="text-left p-1">Désignation</th>
                                            <th className="text-right p-1">Total</th>
                                        </tr>
                                        <tr>
                                            <td className="p-1 border-b text-gray-600">Pack Mariage</td>
                                            <td className="text-right p-1 border-b font-medium">800 000</td>
                                        </tr>
                                    
</tbody></table>
                                    <div
                                        className="absolute bottom-6 left-6 right-6 text-center text-gray-400 border-t pt-2">
                                        Ebrié Lagoon CI - RCCM: CI-ABJ-2023-B-12345
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    
                    <div id="tab-users" className={`p-6 md:p-8  ${activeTab === &apos;users&apos; ? &apos;block&apos; : &apos;hidden'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Utilisateurs & Rôles</h3>
                                <p className="text-sm text-gray-500">Gérez les accès à la plateforme Ebrié Lagoon</p>
                            </div>
                            <button onClick={() => setIsNewUserModalOpen(!isNewUserModalOpen)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition text-sm font-medium flex items-center">
                                <i className="fa-solid fa-plus mr-2"></i> Ajouter Utilisateur
                            </button>
                        </div>

                        
                        <div className="border border-gray-200 rounded-xl overflow-hidden mb-8">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead>
                                    <tr
                                        className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                                        <th className="px-6 py-4 font-medium">Utilisateur</th>
                                        <th className="px-6 py-4 font-medium">Rôle</th>
                                        <th className="px-6 py-4 font-medium">Dernière connexion</th>
                                        <th className="px-6 py-4 font-medium text-center">Statut</th>
                                        <th className="px-6 py-4 font-medium text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-100">
                                    <tr className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <img src="https://ui-avatars.com/api/?name=Lionel+Vithiano&background=0D8ABC&color=fff"
                                                    className="w-8 h-8 rounded-full mr-3" />
                                                <div>
                                                    <div className="font-bold text-gray-900">Lionel Vithiano</div>
                                                    <div className="text-xs text-gray-500">l.vithiano@ebrielagoon.com</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">Administrateur</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">Il y a 2 minutes</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-400">
                                            <button className="hover:text-blue-600 transition mx-1"><i
                                                    className="fa-solid fa-pen"></i></button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <img src="https://ui-avatars.com/api/?name=Marc+Pilote&background=10B981&color=fff"
                                                    className="w-8 h-8 rounded-full mr-3" />
                                                <div>
                                                    <div className="font-bold text-gray-900">Marc Assouman</div>
                                                    <div className="text-xs text-gray-500">m.assouman@ebrielagoon.com</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">Pilote
                                                / Staff</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">Hier, 18:30</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-400">
                                            <button className="hover:text-blue-600 transition mx-1"><i
                                                    className="fa-solid fa-pen"></i></button>
                                            <button className="hover:text-red-600 transition mx-1"><i
                                                    className="fa-solid fa-trash"></i></button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <hr className="border-gray-200 my-8" />
                    </div>

                    
                    <div id="tab-tarifs" className={`p-6 md:p-8  ${activeTab === &apos;tarifs&apos; ? &apos;block&apos; : &apos;hidden'}`}>
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Catalogue des Tarifs (Aperçu)</h3>
                            <p className="text-sm text-gray-500">Modifier les prix de base utilisés dans le générateur de
                                devis</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <div className="border border-gray-200 rounded-xl p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-gray-700"><i
                                            className="fa-solid fa-box mr-2 text-blue-500"></i>Packs Principaux</h4>
                                    <button className="text-blue-600 text-xs font-semibold hover:underline">+
                                        Ajouter</button>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-800 font-medium">Demande en mariage Premium</span>
                                        <input type="text" defaultValue="800 000"
                                            className="w-24 border border-gray-300 rounded px-2 py-1 text-right text-gray-700 font-medium" />
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-800 font-medium">Anniversaire Premium</span>
                                        <input type="text" defaultValue="600 000"
                                            className="w-24 border border-gray-300 rounded px-2 py-1 text-right text-gray-700 font-medium" />
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-800 font-medium">Corporate Premium</span>
                                        <input type="text" defaultValue="1 000 000"
                                            className="w-24 border border-gray-300 rounded px-2 py-1 text-right text-gray-700 font-medium" />
                                    </div>
                                </div>
                            </div>

                            
                            <div className="border border-gray-200 rounded-xl p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-gray-700"><i
                                            className="fa-solid fa-layer-group mr-2 text-orange-500"></i>Options
                                        Additionnelles</h4>
                                    <button className="text-blue-600 text-xs font-semibold hover:underline">+
                                        Ajouter</button>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-800 font-medium">Décoration romantique</span>
                                        <input type="text" defaultValue="50 000"
                                            className="w-24 border border-gray-300 rounded px-2 py-1 text-right text-gray-700 font-medium" />
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-800 font-medium">Photographe</span>
                                        <input type="text" defaultValue="100 000"
                                            className="w-24 border border-gray-300 rounded px-2 py-1 text-right text-gray-700 font-medium" />
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-800 font-medium">DJ professionnel</span>
                                        <input type="text" defaultValue="200 000"
                                            className="w-24 border border-gray-300 rounded px-2 py-1 text-right text-gray-700 font-medium" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg shadow transition text-sm font-medium">
                                Sauvegarder les tarifs
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </main>

    
    <div id="newUserModal" className={`fixed inset-0 z-50 items-center justify-center p-4 ${isNewUserModalOpen ? &apos;flex&apos; : &apos;hidden'}`}>
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsNewUserModalOpen(!isNewUserModalOpen)}></div>
        <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col transform transition-all scale-100 opacity-100 duration-300 ease-in-out">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Ajouter un Utilisateur</h3>
                <button onClick={() => setIsNewUserModalOpen(!isNewUserModalOpen)}
                    className="text-gray-400 hover:text-red-500 transition text-xl"><i
                        className="fa-solid fa-times"></i></button>
            </div>
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nom Complet</label>
                    <input type="text" placeholder="Ex: Jean Dupont"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email (Identifiant)</label>
                    <input type="email" placeholder="jean@ebrielagoon.com"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Rôle</label>
                    <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="admin">Administrateur</option>
                        <option value="commercial">Commercial / Vente</option>
                        <option value="pilote">Pilote / Staff Technique</option>
                    </select>
                </div>
                <div className="flex items-center mt-2">
                    <input type="checkbox" id="sendInvite" className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                        defaultChecked />
                    <label htmlFor="sendInvite" className="ml-2 text-sm text-gray-700">Envoyer un email d&apos;invitation avec mot de
                        passe temporaire</label>
                </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 rounded-b-2xl">
                <button onClick={() => setIsNewUserModalOpen(!isNewUserModalOpen)}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition">Annuler</button>
                <button
                    className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-md">Ajouter</button>
            </div>
        </div>
    </div>

    

        </div>
    );
}
