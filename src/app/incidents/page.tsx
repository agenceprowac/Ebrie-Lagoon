"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { Sidebar } from '@/components/Sidebar';

type Incident = {
    id: string;
    numero_incident: string;
    date_heure: string;
    reservation_id?: string;
    lieu_exact: string;
    nature: string;
    gravite: string;
    secours_contactes: string;
    mesures_immediates: string;
    statut: string;
    type_declaration: string;
    created_at: string;
    reservations?: {
        clients?: {
            nom: string;
        }
    };
};

type Reservation = {
    id: string;
    reference: string;
    clients: {
        nom: string;
    };
};

export default function IncidentsPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('incidents');
    const [isNewIncidentModalOpen, setIsNewIncidentModalOpen] = useState(false);
    const [isNewReclamationModalOpen, setIsNewReclamationModalOpen] = useState(false);
    const [isDetailIncidentModalOpen, setIsDetailIncidentModalOpen] = useState(false);
    
    // Supabase states
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPageIncidents, setCurrentPageIncidents] = useState(1);
    const [currentPageReclamations, setCurrentPageReclamations] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Form states
    const [numeroIncident, setNumeroIncident] = useState('');
    const [dateHeure, setDateHeure] = useState('');
    const [reservationId, setReservationId] = useState('');
    const [lieuExact, setLieuExact] = useState('');
    const [nature, setNature] = useState('');
    const [gravite, setGravite] = useState('Faible');
    const [secoursContactes, setSecoursContactes] = useState('Non');
    const [mesuresImmediates, setMesuresImmediates] = useState('');

    useEffect(() => {
        fetchData();
        
        // Generate a random incident number for new entries
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        setNumeroIncident(`INC-${randomNum}`);
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        
        // Fetch incidents
        const { data: incData, error: incError } = await supabase
            .from('incidents')
            .select('*, reservations(clients(nom))')
            .order('created_at', { ascending: false });
            
        if (incData) setIncidents(incData as Incident[]);
        if (incError) console.error(incError);

        // Fetch reservations for the dropdown
        const { data: resData, error: resError } = await supabase
            .from('reservations')
            .select('id, reference, clients(nom)');
            
        if (resData) setReservations(resData as unknown as Reservation[]);
        
        setIsLoading(false);
    };

    const handleSaveIncident = async (type: 'Incident' | 'Réclamation') => {
        if (!dateHeure || !nature || !gravite) {
            return alert('Veuillez remplir les champs obligatoires.');
        }
        
        setIsSubmitting(true);
        const payload = {
            numero_incident: numeroIncident,
            date_heure: dateHeure,
            reservation_id: reservationId || null,
            lieu_exact: lieuExact,
            nature,
            gravite,
            secours_contactes: secoursContactes,
            mesures_immediates: mesuresImmediates,
            type_declaration: type,
            statut: 'En traitement'
        };

        const { data, error } = await supabase.from('incidents').insert([payload]).select('*, reservations(clients(nom))');
        
        if (error) {
            console.error(error);
            alert("Erreur lors de l'enregistrement : " + error.message);
        } else if (data) {
            setIncidents([data[0] as Incident, ...incidents]);
            setIsNewIncidentModalOpen(false);
            setIsNewReclamationModalOpen(false);
            
            // Reset form
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            setNumeroIncident(type === 'Incident' ? `INC-${randomNum}` : `REC-${randomNum}`);
            setDateHeure('');
            setReservationId('');
            setLieuExact('');
            setNature('');
            setMesuresImmediates('');
            alert(type + " enregistré avec succès !");
        }
        
        setIsSubmitting(false);
    };

    const formatDateTime = (dtStr: string) => {
        if (!dtStr) return '';
        const dt = new Date(dtStr);
        return dt.toLocaleDateString('fr-FR') + ' ' + dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const listIncidents = incidents.filter(i => i.type_declaration === 'Incident');
    const listReclamations = incidents.filter(i => i.type_declaration === 'Réclamation');

    return (
        <div className="flex h-screen overflow-hidden text-gray-800 bg-slate-50 font-sans">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative bg-slate-50">
                <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-20">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center space-x-3">
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition">
                        <i className="fa-solid fa-bars text-xl"></i>
                    </button>
                    <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-2 w-72 md:w-96 focus-within:ring-2 focus-within:ring-blue-400 transition">
                            <i className="fa-solid fa-search text-gray-400"></i>
                            <input type="text" placeholder="Rechercher un incident ou une réclamation..." className="bg-transparent border-none outline-none ml-2 w-full text-sm" />
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

                <div className="p-6 lg:p-8 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Gestion des Incidents & Réclamations</h2>
                            <p className="text-sm text-gray-500 mt-1">Registre officiel pour l'exploitation et le reporting d'assurance</p>
                        </div>
                        <div className="flex space-x-3">
                            <button onClick={() => {
                                const randomNum = Math.floor(1000 + Math.random() * 9000);
                                setNumeroIncident(`INC-${randomNum}`);
                                setIsNewIncidentModalOpen(true);
                            }} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl shadow-md transition transform hover:-translate-y-0.5 text-sm font-medium flex items-center">
                                <i className="fa-solid fa-triangle-exclamation mr-2"></i> Nouvel Incident
                            </button>
                            <button onClick={() => {
                                const randomNum = Math.floor(1000 + Math.random() * 9000);
                                setNumeroIncident(`REC-${randomNum}`);
                                setIsNewReclamationModalOpen(true);
                            }} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl shadow-md transition transform hover:-translate-y-0.5 text-sm font-medium flex items-center">
                                <i className="fa-solid fa-comment-dots mr-2"></i> Nouvelle Réclamation
                            </button>
                        </div>
                    </div>

                    <div className="flex space-x-8 border-b border-gray-200 mb-6">
                        <button onClick={() => setActiveTab('incidents')} className={`tab-btn pb-3 text-gray-600 font-medium flex items-center ${activeTab === 'incidents' ? 'active border-b-2 border-blue-600 text-blue-600' : 'border-b-2 border-transparent'}`}>
                            <i className="fa-solid fa-triangle-exclamation mr-2"></i> Incidents & Urgences
                            <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">{listIncidents.length}</span>
                        </button>
                        <button onClick={() => setActiveTab('reclamations')} className={`tab-btn pb-3 text-gray-600 font-medium flex items-center hover:text-gray-900 ${activeTab === 'reclamations' ? 'active border-b-2 border-blue-600 text-blue-600' : 'border-b-2 border-transparent'}`}>
                            <i className="fa-solid fa-user-injured mr-2"></i> Réclamations Clients
                            <span className="ml-2 bg-orange-100 text-orange-600 py-0.5 px-2 rounded-full text-xs">{listReclamations.length}</span>
                        </button>
                    </div>

                    {/* Onglet Incidents */}
                    <div className={`space-y-6 ${activeTab === 'incidents' ? 'block' : 'hidden'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">En cours</p>
                                <h3 className="text-2xl font-bold text-red-600">{listIncidents.filter(i => i.statut !== 'Clôturé').length}</h3>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-bold text-gray-700">Registre des Incidents</h3>
                                <button className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-50"><i className="fa-solid fa-file-excel mr-1"></i> Export Excel</button>
                            </div>
                            <div className="overflow-x-auto">
                                {(() => {
                                    const totalItems = listIncidents.length;
                                    const totalPages = Math.ceil(totalItems / itemsPerPage);
                                    const startIndex = (currentPageIncidents - 1) * itemsPerPage;
                                    const paginatedIncidents = listIncidents.slice(startIndex, startIndex + itemsPerPage);
                                    return (
                                        <>
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                            <th className="px-4 py-3 font-medium">N° Incident</th>
                                            <th className="px-4 py-3 font-medium">Date/Heure</th>
                                            <th className="px-4 py-3 font-medium">Client / Réservation</th>
                                            <th className="px-4 py-3 font-medium">Nature</th>
                                            <th className="px-4 py-3 font-medium text-center">Niveau</th>
                                            <th className="px-4 py-3 font-medium text-center">Statut</th>
                                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-gray-50">
                                        {isLoading ? (
                                            <tr><td colSpan={7} className="text-center py-6 text-gray-500">Chargement...</td></tr>
                                        ) : paginatedIncidents.length === 0 ? (
                                            <tr><td colSpan={7} className="text-center py-6 text-gray-500">Aucun incident enregistré.</td></tr>
                                        ) : paginatedIncidents.map(inc => (
                                            <tr key={inc.id} className="hover:bg-gray-50 transition">
                                                <td className="px-4 py-3 font-bold text-gray-800">{inc.numero_incident}</td>
                                                <td className="px-4 py-3 text-gray-500">{formatDateTime(inc.date_heure)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-blue-600">{inc.reservations?.clients?.nom || 'Non spécifié'}</div>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-700">{inc.nature}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${inc.gravite === 'Critique' ? 'bg-red-100 text-red-700' : inc.gravite === 'Moyen' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                                        {inc.gravite}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 border border-orange-200 rounded-full text-xs font-semibold">{inc.statut}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => setIsDetailIncidentModalOpen(true)} className="text-blue-600 hover:text-blue-800 text-xs font-bold border border-blue-200 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 transition">Détails</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 mt-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-500">Afficher</span>
                                        <select value={itemsPerPage} onChange={(e) => {setItemsPerPage(Number(e.target.value)); setCurrentPageIncidents(1); setCurrentPageReclamations(1);}} className="border border-gray-200 rounded text-sm text-gray-700 py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="10">10</option>
                                            <option value="25">25</option>
                                            <option value="50">50</option>
                                            <option value="100">100</option>
                                        </select>
                                        <span className="text-sm text-gray-500">par page</span>
                                    </div>
                                    <span className="text-sm text-gray-500">Affichage {totalItems === 0 ? 0 : startIndex + 1} à {Math.min(startIndex + itemsPerPage, totalItems)} sur {totalItems} incidents</span>
                                    <div className="flex space-x-1">
                                        <button onClick={() => setCurrentPageIncidents(p => Math.max(1, p - 1))} disabled={currentPageIncidents === 1} className="px-3 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"><i className="fa-solid fa-chevron-left text-xs"></i></button>
                                        
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPageIncidents) <= 1)
                                            .map((p, i, arr) => {
                                                const btn = <button key={p} onClick={() => setCurrentPageIncidents(p)} className={`px-3 py-1 rounded font-medium ${currentPageIncidents === p ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>{p}</button>;
                                                if (i > 0 && arr[i - 1] !== p - 1) {
                                                    return <span key={`ellipsis-${p}`} className="flex items-center"><span className="px-2 text-gray-500">...</span>{btn}</span>;
                                                }
                                                return btn;
                                            })
                                        }

                                        <button onClick={() => setCurrentPageIncidents(p => Math.min(totalPages, p + 1))} disabled={currentPageIncidents === totalPages || totalPages === 0} className="px-3 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"><i className="fa-solid fa-chevron-right text-xs"></i></button>
                                    </div>
                                </div>
                                </>
                            );
                        })()}
                            </div>
                        </div>
                    </div>

                    {/* Onglet Réclamations */}
                    <div className={`space-y-6 ${activeTab === 'reclamations' ? 'block' : 'hidden'}`}>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-bold text-gray-700">Registre des Réclamations</h3>
                                <button className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-50"><i className="fa-solid fa-file-excel mr-1"></i> Export Excel</button>
                            </div>
                            <div className="overflow-x-auto">
                                {(() => {
                                    const totalItems = listReclamations.length;
                                    const totalPages = Math.ceil(totalItems / itemsPerPage);
                                    const startIndex = (currentPageReclamations - 1) * itemsPerPage;
                                    const paginatedReclamations = listReclamations.slice(startIndex, startIndex + itemsPerPage);
                                    return (
                                        <>
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                            <th className="px-4 py-3 font-medium">N° Récl.</th>
                                            <th className="px-4 py-3 font-medium">Date/Heure</th>
                                            <th className="px-4 py-3 font-medium">Client</th>
                                            <th className="px-4 py-3 font-medium">Objet</th>
                                            <th className="px-4 py-3 font-medium text-center">Statut</th>
                                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-gray-50">
                                        {isLoading ? (
                                            <tr><td colSpan={6} className="text-center py-6 text-gray-500">Chargement...</td></tr>
                                        ) : paginatedReclamations.length === 0 ? (
                                            <tr><td colSpan={6} className="text-center py-6 text-gray-500">Aucune réclamation enregistrée.</td></tr>
                                        ) : paginatedReclamations.map(rec => (
                                            <tr key={rec.id} className="hover:bg-gray-50 transition">
                                                <td className="px-4 py-3 font-bold text-gray-800">{rec.numero_incident}</td>
                                                <td className="px-4 py-3 text-gray-500">{formatDateTime(rec.date_heure)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900">{rec.reservations?.clients?.nom || 'Non spécifié'}</div>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-700">{rec.nature}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-full text-xs font-semibold">{rec.statut}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button className="text-blue-600 hover:text-blue-800 text-xs font-bold border border-blue-200 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 transition">Traiter</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-500">Afficher</span>
                                        <select value={itemsPerPage} onChange={(e) => {setItemsPerPage(Number(e.target.value)); setCurrentPageIncidents(1); setCurrentPageReclamations(1);}} className="border border-gray-200 rounded text-sm text-gray-700 py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="10">10</option>
                                            <option value="25">25</option>
                                            <option value="50">50</option>
                                            <option value="100">100</option>
                                        </select>
                                        <span className="text-sm text-gray-500">par page</span>
                                    </div>
                                    <span className="text-sm text-gray-500">Affichage {totalItems === 0 ? 0 : startIndex + 1} à {Math.min(startIndex + itemsPerPage, totalItems)} sur {totalItems} réclamations</span>
                                    <div className="flex space-x-1">
                                        <button onClick={() => setCurrentPageReclamations(p => Math.max(1, p - 1))} disabled={currentPageReclamations === 1} className="px-3 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"><i className="fa-solid fa-chevron-left text-xs"></i></button>
                                        
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPageReclamations) <= 1)
                                            .map((p, i, arr) => {
                                                const btn = <button key={p} onClick={() => setCurrentPageReclamations(p)} className={`px-3 py-1 rounded font-medium ${currentPageReclamations === p ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>{p}</button>;
                                                if (i > 0 && arr[i - 1] !== p - 1) {
                                                    return <span key={`ellipsis-${p}`} className="flex items-center"><span className="px-2 text-gray-500">...</span>{btn}</span>;
                                                }
                                                return btn;
                                            })
                                        }

                                        <button onClick={() => setCurrentPageReclamations(p => Math.min(totalPages, p + 1))} disabled={currentPageReclamations === totalPages || totalPages === 0} className="px-3 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"><i className="fa-solid fa-chevron-right text-xs"></i></button>
                                    </div>
                                </div>
                                </>
                            );
                        })()}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal Nouvel Incident */}
            {isNewIncidentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsNewIncidentModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-gray-800"><i className="fa-solid fa-triangle-exclamation text-red-600 mr-2"></i> Déclarer un incident</h3>
                            <button onClick={() => setIsNewIncidentModalOpen(false)} className="text-gray-400 hover:text-red-500 transition text-2xl"><i className="fa-solid fa-times"></i></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto bg-white flex-1 space-y-6">
                            <div>
                                <h4 className="font-bold text-gray-700 mb-3 text-sm border-b pb-1">1. Contexte</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">N° Incident</label>
                                        <input type="text" value={numeroIncident} readOnly className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Date et Heure *</label>
                                        <input type="datetime-local" value={dateHeure} onChange={e => setDateHeure(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Réservation liée</label>
                                        <select value={reservationId} onChange={e => setReservationId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                            <option value="">-- Aucune / Ne sait pas --</option>
                                            {reservations.map(r => (
                                                <option key={r.id} value={r.id}>{r.reference} - {r.clients?.nom}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Lieu exact</label>
                                        <input type="text" value={lieuExact} onChange={e => setLieuExact(e.target.value)} placeholder="Coordonnées GPS ou zone" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-700 mb-3 text-sm border-b pb-1">2. Description & Gravité</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Nature de l'incident *</label>
                                        <textarea rows={3} value={nature} onChange={e => setNature(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Niveau de gravité</label>
                                        <select value={gravite} onChange={e => setGravite(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                            <option value="Faible">Faible (Aucun risque)</option>
                                            <option value="Moyen">Moyen (Perturbation opérationnelle)</option>
                                            <option value="Critique">Critique (Risque humain ou matériel)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Secours contactés ?</label>
                                        <select value={secoursContactes} onChange={e => setSecoursContactes(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                            <option value="Non">Non</option>
                                            <option value="Oui, Pompiers/Police">Oui, Pompiers/Police</option>
                                            <option value="Oui, Secours en mer">Oui, Secours en mer</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Mesures immédiates prises</label>
                                        <textarea rows={2} value={mesuresImmediates} onChange={e => setMesuresImmediates(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 rounded-b-2xl">
                            <button onClick={() => setIsNewIncidentModalOpen(false)} disabled={isSubmitting} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition">Annuler</button>
                            <button onClick={() => handleSaveIncident('Incident')} disabled={isSubmitting} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition shadow-md disabled:opacity-50">
                                {isSubmitting ? 'Enregistrement...' : "Enregistrer l'incident"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Nouvelle Réclamation */}
            {isNewReclamationModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsNewReclamationModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-gray-800"><i className="fa-solid fa-comment-dots text-orange-500 mr-2"></i> Nouvelle Réclamation</h3>
                            <button onClick={() => setIsNewReclamationModalOpen(false)} className="text-gray-400 hover:text-orange-500 transition text-2xl"><i className="fa-solid fa-times"></i></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto bg-white flex-1 space-y-6">
                            <div>
                                <h4 className="font-bold text-gray-700 mb-3 text-sm border-b pb-1">Détails de la Réclamation</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">N° Réclamation</label>
                                        <input type="text" value={numeroIncident} readOnly className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Date et Heure *</label>
                                        <input type="datetime-local" value={dateHeure} onChange={e => setDateHeure(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Client / Réservation concernée</label>
                                        <select value={reservationId} onChange={e => setReservationId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                            <option value="">-- Sélectionner un client / réservation --</option>
                                            {reservations.map(r => (
                                                <option key={r.id} value={r.id}>{r.reference} - {r.clients?.nom}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Motif de la réclamation *</label>
                                        <textarea rows={4} value={nature} onChange={e => setNature(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Décrivez le problème remonté par le client..." />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 rounded-b-2xl">
                            <button onClick={() => setIsNewReclamationModalOpen(false)} disabled={isSubmitting} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition">Annuler</button>
                            <button onClick={() => handleSaveIncident('Réclamation')} disabled={isSubmitting} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition shadow-md disabled:opacity-50">
                                {isSubmitting ? 'Enregistrement...' : "Enregistrer la réclamation"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
