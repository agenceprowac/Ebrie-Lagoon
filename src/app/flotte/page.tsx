"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

type Navire = {
    id: string;
    nom_navire: string;
    type_navire: string;
    capacite: number;
    moteur: string;
    statut: string;
    raison_immobilisation?: string;
};

export default function FlottePage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    
    // Supabase states
    const [navires, setNavires] = useState<Navire[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddShipModalOpen, setIsAddShipModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);

    // Form fields
    const [nomNavire, setNomNavire] = useState('');
    const [typeNavire, setTypeNavire] = useState('Catamaran');
    const [capacite, setCapacite] = useState<number>(10);
    const [moteur, setMoteur] = useState('');
    const [statut, setStatut] = useState('Disponible');

    // Nouveaux états pour Carburant et Affectation
    const [isCarburantModalOpen, setIsCarburantModalOpen] = useState(false);
    const [isAffectationModalOpen, setIsAffectationModalOpen] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

    // Formulaire Carburant
    const [carbNavireId, setCarbNavireId] = useState('');
    const [carbDate, setCarbDate] = useState('');
    const [carbQuantite, setCarbQuantite] = useState<number>(0);
    const [carbMontant, setCarbMontant] = useState<number>(0);

    // Formulaire Affectation
    const [affNavireId, setAffNavireId] = useState('');
    const [affType, setAffType] = useState('Course');
    const [affEquipage, setAffEquipage] = useState('');
    const [affDate, setAffDate] = useState('');

    useEffect(() => {
        fetchNavires();
    }, []);

    const fetchNavires = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('flotte').select('*').order('created_at', { ascending: true });
        if (data) setNavires(data as Navire[]);
        if (error) console.error(error);
        setIsLoading(false);
    };

    const handleAddNavire = async () => {
        if (!nomNavire || !typeNavire || !capacite) return alert('Veuillez remplir les champs obligatoires.');
        setIsSubmitting(true);
        const { data, error } = await supabase.from('flotte').insert([{
            nom_navire: nomNavire,
            type_navire: typeNavire,
            capacite,
            moteur,
            statut
        }]).select();
        
        if (error) {
            console.error(error);
            alert('Erreur lors de l\'ajout: ' + error.message);
        } else if (data) {
            setNavires([...navires, data[0] as Navire]);
            setIsAddShipModalOpen(false);
            setNomNavire(''); setMoteur(''); setCapacite(10);
            alert('Navire ajouté avec succès !');
        }
        setIsSubmitting(false);
    };

    const handleSaveCarburant = async () => {
        if (!carbNavireId || !carbDate || carbQuantite <= 0) {
            setNotification({ message: 'Veuillez remplir les champs obligatoires.', type: 'error' });
            setTimeout(() => setNotification(null), 3000);
            return;
        }
        setIsSubmitting(true);
        // Simulation d'enregistrement en attendant la création de la table
        setTimeout(() => {
            setIsSubmitting(false);
            setIsCarburantModalOpen(false);
            setNotification({ message: 'Saisie de carburant enregistrée avec succès !', type: 'success' });
            setCarbNavireId(''); setCarbDate(''); setCarbQuantite(0); setCarbMontant(0);
            setTimeout(() => setNotification(null), 3000);
        }, 800);
    };

    const handleSaveAffectation = async () => {
        if (!affNavireId || !affDate || !affType) {
            setNotification({ message: 'Veuillez remplir les champs obligatoires.', type: 'error' });
            setTimeout(() => setNotification(null), 3000);
            return;
        }
        setIsSubmitting(true);
        // Simulation d'enregistrement en attendant la création de la table
        setTimeout(() => {
            setIsSubmitting(false);
            setIsAffectationModalOpen(false);
            setNotification({ message: 'Nouvelle affectation enregistrée avec succès !', type: 'success' });
            setAffNavireId(''); setAffType('Course'); setAffEquipage(''); setAffDate('');
            setTimeout(() => setNotification(null), 3000);
        }, 800);
    };

    return (
        <div className="flex h-screen overflow-hidden text-gray-800 bg-slate-50 font-sans">
            {/* Overlay mobile */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-gray-900/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            <aside className={"w-64 bg-white shadow-xl flex flex-col z-50 fixed inset-y-0 left-0 transform " + (isSidebarOpen ? "translate-x-0" : "-translate-x-full") + " md:relative md:translate-x-0 transition-transform duration-300 ease-in-out shrink-0"}>
                <button onClick={() => setIsSidebarOpen(false)} className="absolute right-4 top-4 md:hidden text-gray-400 hover:text-gray-600 z-50">
                    <i className="fa-solid fa-times text-xl"></i>
                </button>
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
                    <a href="/flotte" className="sidebar-item active flex items-center px-4 py-3 text-sm font-medium">
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
                        <div className="flex items-center space-x-3">
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition">
                        <i className="fa-solid fa-bars text-xl"></i>
                    </button>
                    <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-2 w-72 md:w-96 focus-within:ring-2 focus-within:ring-blue-400 transition">
                            <i className="fa-solid fa-search text-gray-400"></i>
                            <input type="text" placeholder="Rechercher un bateau, un pilote..." className="bg-transparent border-none outline-none ml-2 w-full text-sm" />
                        </div>
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
                            <h2 className="text-2xl font-bold text-gray-800">Flotte & Opérations</h2>
                            <p className="text-sm text-gray-500">Gestion des catamarans, équipages et plannings du jour</p>
                        </div>
                        <div className="flex space-x-3">
                            <button onClick={() => setIsCarburantModalOpen(true)} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl shadow-sm transition text-sm font-medium flex items-center">
                                <i className="fa-solid fa-gas-pump mr-2 text-orange-500"></i> Saisir Carburant
                            </button>
                            <button onClick={() => setIsAffectationModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md transition transform hover:-translate-y-0.5 text-sm font-medium flex items-center">
                                <i className="fa-solid fa-plus mr-2"></i> Nouvelle Affectation
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Navires Actifs</p>
                                <h3 className="text-2xl font-bold text-gray-800">{navires.length}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xl">
                                <i className="fa-solid fa-ship"></i>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">En Course (Actuel)</p>
                                <h3 className="text-2xl font-bold text-green-600">{navires.filter(n => n.statut === 'En Course').length}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-xl">
                                <i className="fa-solid fa-water"></i>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">En Maintenance</p>
                                <h3 className="text-2xl font-bold text-red-600">{navires.filter(n => n.statut === 'Maintenance').length}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 text-xl">
                                <i className="fa-solid fa-screwdriver-wrench"></i>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Équipage Dispo.</p>
                                <h3 className="text-2xl font-bold text-gray-800">8</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 text-xl">
                                <i className="fa-solid fa-users-gear"></i>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Navires de la Flotte</h3>
                            <button onClick={() => setIsAddShipModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm">
                                <i className="fa-solid fa-plus mr-2"></i> Ajouter un navire
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {isLoading ? (
                                <div className="col-span-full text-center py-10 text-gray-500">Chargement de la flotte...</div>
                            ) : navires.length === 0 ? (
                                <div className="col-span-full text-center py-10 text-gray-500">Aucun navire dans la flotte.</div>
                            ) : (
                                navires.slice((currentPage - 1) * itemsPerPage, (currentPage - 1) * itemsPerPage + itemsPerPage).map(navire => (
                                    <div key={navire.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition">
                                        <div className="h-48 bg-gray-200 relative overflow-hidden">
                                            <div className={`absolute inset-0 opacity-80 group-hover:scale-105 transition duration-500 ${navire.statut === 'Maintenance' ? 'bg-gradient-to-br from-gray-600 to-gray-800 grayscale' : navire.statut === 'En Course' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-blue-400 to-cyan-600'}`}></div>
                                            <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-gray-900/80 to-transparent">
                                                <h4 className="text-white font-bold text-xl">{navire.nom_navire}</h4>
                                                <p className="text-blue-100 text-sm flex items-center mt-1">
                                                    <i className="fa-solid fa-users mr-1.5"></i> Capacité: {navire.capacite} pax
                                                </p>
                                            </div>
                                            <div className={`absolute top-4 right-4 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm ${navire.statut === 'Maintenance' ? 'bg-red-500' : navire.statut === 'En Course' ? 'bg-blue-500' : 'bg-green-500'}`}>
                                                {navire.statut}
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                                <div>
                                                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Moteur</p>
                                                    <p className="text-gray-800 font-medium">{navire.moteur || 'Non spécifié'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Type</p>
                                                    <p className="text-gray-800 font-medium">{navire.type_navire}</p>
                                                </div>
                                                {navire.statut === 'Maintenance' && (
                                                    <div className="col-span-2 mt-2">
                                                        <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Raison de l'immobilisation</p>
                                                        <p className="text-red-600 font-medium bg-red-50 p-2 rounded-lg text-sm border border-red-100">{navire.raison_immobilisation || 'Non spécifiée'}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex border-t border-gray-100 pt-4 space-x-2">
                                                <button className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium transition">Détails</button>
                                                <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-medium transition">Planifier</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {navires.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 mt-6 bg-white rounded-2xl shadow-sm">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500">Afficher</span>
                                    <select value={itemsPerPage} onChange={(e) => {setItemsPerPage(Number(e.target.value)); setCurrentPage(1);}} className="border border-gray-200 rounded text-sm text-gray-700 py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="6">6</option>
                                        <option value="12">12</option>
                                        <option value="24">24</option>
                                    </select>
                                    <span className="text-sm text-gray-500">par page</span>
                                </div>
                                <span className="text-sm text-gray-500">Affichage {navires.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} à {Math.min(((currentPage - 1) * itemsPerPage) + itemsPerPage, navires.length)} sur {navires.length} navires</span>
                                <div className="flex space-x-1">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"><i className="fa-solid fa-chevron-left text-xs"></i></button>
                                    
                                    {Array.from({ length: Math.ceil(navires.length / itemsPerPage) }, (_, i) => i + 1)
                                        .filter(p => p === 1 || p === Math.ceil(navires.length / itemsPerPage) || Math.abs(p - currentPage) <= 1)
                                        .map((p, i, arr) => {
                                            const btn = <button key={p} onClick={() => setCurrentPage(p)} className={`px-3 py-1 rounded font-medium ${currentPage === p ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>{p}</button>;
                                            if (i > 0 && arr[i - 1] !== p - 1) {
                                                return <span key={`ellipsis-${p}`} className="flex items-center"><span className="px-2 text-gray-500">...</span>{btn}</span>;
                                            }
                                            return btn;
                                        })
                                    }

                                    <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(navires.length / itemsPerPage), p + 1))} disabled={currentPage === Math.ceil(navires.length / itemsPerPage) || Math.ceil(navires.length / itemsPerPage) === 0} className="px-3 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"><i className="fa-solid fa-chevron-right text-xs"></i></button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal Ajouter Navire */}
            {isAddShipModalOpen && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-800">Ajouter un Navire</h3>
                            <button onClick={() => setIsAddShipModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition"><i className="fa-solid fa-times text-xl"></i></button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Navire *</label>
                                    <input type="text" value={nomNavire} onChange={e => setNomNavire(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                                        <select value={typeNavire} onChange={e => setTypeNavire(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                            <option>Catamaran</option>
                                            <option>Speedboat</option>
                                            <option>Yacht</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacité (Pax) *</label>
                                        <input type="number" min="1" value={capacite} onChange={e => setCapacite(parseInt(e.target.value) || 1)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Moteur</label>
                                    <input type="text" placeholder="ex: 2x 250 CV Yamaha" value={moteur} onChange={e => setMoteur(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut *</label>
                                    <select value={statut} onChange={e => setStatut(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option>Disponible</option>
                                        <option>En Course</option>
                                        <option>Maintenance</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                            <button onClick={() => setIsAddShipModalOpen(false)} disabled={isSubmitting} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition">Annuler</button>
                            <button onClick={handleAddNavire} disabled={isSubmitting} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-md disabled:opacity-50">
                                {isSubmitting ? 'Ajout...' : 'Ajouter le Navire'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal Saisir Carburant */}
            {isCarburantModalOpen && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-800">Saisir Carburant</h3>
                            <button onClick={() => setIsCarburantModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition"><i className="fa-solid fa-times text-xl"></i></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Navire *</label>
                                <select value={carbNavireId} onChange={e => setCarbNavireId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="">-- Sélectionner un navire --</option>
                                    {navires.map(n => <option key={n.id} value={n.id}>{n.nom_navire}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                                <input type="date" value={carbDate} onChange={e => setCarbDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantité (L) *</label>
                                    <input type="number" min="0" value={carbQuantite} onChange={e => setCarbQuantite(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA)</label>
                                    <input type="number" min="0" value={carbMontant} onChange={e => setCarbMontant(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                            <button onClick={() => setIsCarburantModalOpen(false)} disabled={isSubmitting} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition">Annuler</button>
                            <button onClick={handleSaveCarburant} disabled={isSubmitting} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition shadow-md disabled:opacity-50">
                                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Nouvelle Affectation */}
            {isAffectationModalOpen && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-800">Nouvelle Affectation</h3>
                            <button onClick={() => setIsAffectationModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition"><i className="fa-solid fa-times text-xl"></i></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Navire *</label>
                                <select value={affNavireId} onChange={e => setAffNavireId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="">-- Sélectionner un navire --</option>
                                    {navires.map(n => <option key={n.id} value={n.id}>{n.nom_navire}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                                    <select value={affType} onChange={e => setAffType(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option>Course</option>
                                        <option>Maintenance</option>
                                        <option>Transfert</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                                    <input type="date" value={affDate} onChange={e => setAffDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Équipage (Capitaine, etc.)</label>
                                <input type="text" placeholder="ex: Cpt. Kouassi, Marin Bamba" value={affEquipage} onChange={e => setAffEquipage(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                            <button onClick={() => setIsAffectationModalOpen(false)} disabled={isSubmitting} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition">Annuler</button>
                            <button onClick={handleSaveAffectation} disabled={isSubmitting} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-md disabled:opacity-50">
                                {isSubmitting ? 'Enregistrement...' : 'Confirmer l\'affectation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-lg text-white font-medium z-50 animate-in slide-in-from-bottom-5 ${notification.type === 'success' ? 'bg-green-600' : notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
                    <i className={`fa-solid ${notification.type === 'success' ? 'fa-check-circle' : notification.type === 'error' ? 'fa-triangle-exclamation' : 'fa-info-circle'} mr-2`}></i>
                    {notification.message}
                </div>
            )}
        </div>
    );
}
