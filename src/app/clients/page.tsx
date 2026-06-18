"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { Sidebar } from '@/components/Sidebar';

export default function ClientsPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentUserName, setCurrentUserName] = useState('Chargement...');

    useEffect(() => {
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
            try {
                setCurrentUserName(JSON.parse(currentUserStr).name);
            } catch (e) {
                setCurrentUserName('Administrateur');
            }
        } else {
            setCurrentUserName('Administrateur');
        }
    }, []);
    const [activeTab, setActiveTab] = useState('all');
    const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [clientReservations, setClientReservations] = useState<any[]>([]);
    const [clientStats, setClientStats] = useState({ totalRes: 0, ca: 0 });


    // Nouveaux etats
    const [clients, setClients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [nom, setNom] = useState('');
    const [telephone, setTelephone] = useState('');
    const [telephoneSecondaire, setTelephoneSecondaire] = useState('');
    const [email, setEmail] = useState('');
    const [categorie, setCategorie] = useState('particulier');
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const [editingClientId, setEditingClientId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const handleViewClient = async (client: any) => {
        setSelectedClient(client);
        setIsHistoryModalOpen(true);
        const { data, error } = await supabase
            .from('reservations')
            .select('*')
            .eq('client_id', client.id)
            .order('date_prestation', { ascending: false });
        
        if (data) {
            setClientReservations(data);
            const totalCa = data.reduce((sum, res) => sum + (res.montant_total || 0), 0);
            setClientStats({ totalRes: data.length, ca: totalCa });
        } else {
            setClientReservations([]);
            setClientStats({ totalRes: 0, ca: 0 });
        }
    };

    const fetchClients = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setClients(data || []);
        } catch (error: any) {
            console.error('Erreur fetch clients:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleSaveClient = async () => {
        if (!nom || !telephone) {
            setNotification({ message: 'Le nom et le téléphone principal sont obligatoires', type: 'error' });
            return;
        }

        try {
            if (editingClientId) {
                const { error } = await supabase
                    .from('clients')
                    .update({ nom, telephone, email })
                    .eq('id', editingClientId);
                if (error) throw error;
                setNotification({ message: 'Client modifié avec succès !', type: 'success' });
            } else {
                const { error } = await supabase
                    .from('clients')
                    .insert([{ nom, telephone, email }]);
                if (error) throw error;
                setNotification({ message: 'Client ajouté avec succès !', type: 'success' });
            }

            setIsNewClientModalOpen(false);
            
            // Reset form
            setEditingClientId(null);
            setNom('');
            setTelephone('');
            setTelephoneSecondaire('');
            setEmail('');
            setCategorie('particulier');
            
            fetchClients();
            
            setTimeout(() => setNotification(null), 3000);
        } catch (error: any) {
            console.error('Erreur save client:', error);
            setNotification({ message: 'Erreur: ' + error.message, type: 'error' });
            setTimeout(() => setNotification(null), 5000);
        }
    };

    const handleEditClient = (client: any) => {
        setEditingClientId(client.id);
        setNom(client.nom);
        setTelephone(client.telephone || '');
        setTelephoneSecondaire(client.telephoneSecondaire || '');
        setEmail(client.email || '');
        setCategorie(client.categorie || 'particulier');
        setIsNewClientModalOpen(true);
        setIsHistoryModalOpen(false); // au cas où on l'ouvre depuis la fiche
    };

    const handleDeleteClient = async (id: string) => {
        try {
            const { error } = await supabase.from('clients').delete().eq('id', id);
            if (error) throw error;
            setNotification({ message: 'Client supprimé avec succès !', type: 'success' });
            fetchClients();
            setDeleteConfirmId(null);
            setTimeout(() => setNotification(null), 3000);
        } catch (error: any) {
            setNotification({ message: 'Erreur: ' + error.message, type: 'error' });
            setTimeout(() => setNotification(null), 5000);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden text-gray-800 bg-slate-50 font-sans">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

    <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50 relative">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-20">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-3">
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition">
                        <i className="fa-solid fa-bars text-xl"></i>
                    </button>
                    <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-2 w-72 md:w-96 focus-within:ring-2 focus-within:ring-blue-400 transition">
                        <i className="fa-solid fa-search text-gray-400"></i>
                        <input type="text" placeholder="Rechercher un client (Nom, Téléphone)..." className="bg-transparent border-none outline-none ml-2 w-full text-sm" />
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
                            <p className="font-semibold text-gray-700">{currentUserName}</p>
                            <p className="text-xs text-gray-500">Administrateur</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        {notification && (
            <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                {notification.message}
            </div>
        )}
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Répertoire Clients</h2>
                    <p className="text-sm text-gray-500">Gérez vos contacts et consultez leur historique</p>
                </div>
                <button onClick={() => {
                    setEditingClientId(null);
                    setNom('');
                    setTelephone('');
                    setTelephoneSecondaire('');
                    setEmail('');
                    setCategorie('particulier');
                    setIsNewClientModalOpen(true);
                }} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md transition transform hover:-translate-y-0.5 text-sm font-medium flex items-center">
                    <i className="fa-solid fa-user-plus mr-2"></i> Ajouter un Client
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Clients</p>
                        <h3 className="text-2xl font-bold text-gray-800">{clients.length}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xl">
                        <i className="fa-solid fa-users"></i>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Nouveaux ce mois</p>
                        <h3 className="text-2xl font-bold text-green-600">0</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-xl">
                        <i className="fa-solid fa-arrow-trend-up"></i>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Clients VIP (Corporate)</p>
                        <h3 className="text-2xl font-bold text-purple-600">0</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 text-xl">
                        <i className="fa-solid fa-crown"></i>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-700">Liste des Contacts</h3>
                    <div className="flex space-x-2">
                        <button className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-50"><i className="fa-solid fa-download mr-1"></i> Exporter</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {(() => {
                        const totalItems = clients.length;
                        const totalPages = Math.ceil(totalItems / itemsPerPage);
                        const startIndex = (currentPage - 1) * itemsPerPage;
                        const paginatedClients = clients.slice(startIndex, startIndex + itemsPerPage);
                        return (
                            <>
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                <th className="px-6 py-4 font-medium">Client</th>
                                <th className="px-6 py-4 font-medium">Contact</th>
                                <th className="px-6 py-4 font-medium text-center">Catégorie</th>
                                <th className="px-6 py-4 font-medium text-center">Réservations</th>
                                <th className="px-6 py-4 font-medium text-right">CA Total</th>
                                <th className="px-6 py-4 font-medium text-center">Dernière visite</th>
                                <th className="px-6 py-4 font-medium text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-50">
                            {paginatedClients.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        Aucun client enregistré.
                                    </td>
                                </tr>
                            ) : (
                                paginatedClients.map((client: any) => (
                                    <tr key={client.id} className="hover:bg-gray-50 transition group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold mr-3 shadow-sm">
                                                    {client.nom ? client.nom.substring(0, 2).toUpperCase() : 'C'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{client.nom}</div>
                                                    <div className="text-xs text-gray-500">Ajouté le {new Date(client.created_at).toLocaleDateString('fr-FR')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-800"><i className="fa-solid fa-phone text-gray-400 w-4"></i> {client.telephone}</div>
                                            {client.email && <div className="text-gray-500 text-xs mt-1"><i className="fa-solid fa-envelope text-gray-400 w-4"></i> {client.email}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium border border-gray-200">Particulier</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-600 font-bold">-</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-800">
                                            - FCFA
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-500">
                                            -
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button onClick={() => handleViewClient(client)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Voir détails">
                                                    <i className="fa-solid fa-eye"></i>
                                                </button>
                                                <button onClick={() => handleEditClient(client)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition" title="Modifier">
                                                    <i className="fa-solid fa-pen"></i>
                                                </button>
                                                <button onClick={() => setDeleteConfirmId(client.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Supprimer">
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                            <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 mt-2">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500">Afficher</span>
                                    <select value={itemsPerPage} onChange={(e) => {setItemsPerPage(Number(e.target.value)); setCurrentPage(1);}} className="border border-gray-200 rounded text-sm text-gray-700 py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                    <span className="text-sm text-gray-500">par page</span>
                                </div>
                                <span className="text-sm text-gray-500">Affichage {totalItems === 0 ? 0 : startIndex + 1} à {Math.min(startIndex + itemsPerPage, totalItems)} sur {totalItems} clients</span>
                                <div className="flex space-x-1">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"><i className="fa-solid fa-chevron-left text-xs"></i></button>
                                    
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                        .map((p, i, arr) => {
                                            const btn = <button key={p} onClick={() => setCurrentPage(p)} className={`px-3 py-1 rounded font-medium ${currentPage === p ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>{p}</button>;
                                            if (i > 0 && arr[i - 1] !== p - 1) {
                                                return <span key={`ellipsis-${p}`} className="flex items-center"><span className="px-2 text-gray-500">...</span>{btn}</span>;
                                            }
                                            return btn;
                                        })
                                    }

                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"><i className="fa-solid fa-chevron-right text-xs"></i></button>
                                </div>
                            </div>
                            </>
                        );
                    })()}
                </div>
            </div>

        </div>
    </main>

    
    <div id="newClientModal" className={`fixed inset-0 z-50 items-center justify-center p-4 ${isNewClientModalOpen ? 'flex' : 'hidden'}`}>
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsNewClientModalOpen(!isNewClientModalOpen)}></div>
        <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col transform transition-all scale-100 opacity-100 duration-300 ease-in-out">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">{editingClientId ? 'Modifier le Client' : 'Ajouter un Client'}</h3>
                <button onClick={() => setIsNewClientModalOpen(!isNewClientModalOpen)} className="text-gray-400 hover:text-red-500 transition text-xl"><i className="fa-solid fa-times"></i></button>
            </div>
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Nom Complet / Raison Sociale *</label>
                        <input type="text" value={nom} onChange={e => setNom(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Téléphone Principal *</label>
                        <input type="text" value={telephone} onChange={e => setTelephone(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Téléphone Secondaire</label>
                        <input type="text" value={telephoneSecondaire} onChange={e => setTelephoneSecondaire(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Catégorie</label>
                        <select value={categorie} onChange={e => setCategorie(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="particulier">Particulier</option>
                            <option value="entreprise">Entreprise / Corporate</option>
                            <option value="vip">VIP</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 rounded-b-2xl">
                <button onClick={() => setIsNewClientModalOpen(!isNewClientModalOpen)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition">Annuler</button>
                <button onClick={handleSaveClient} disabled={!nom || !telephone} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed">Enregistrer</button>
            </div>
        </div>
    </div>

    
<div id="historyModal" className={`fixed inset-0 z-50 items-center justify-center p-4 ${isHistoryModalOpen ? 'flex' : 'hidden'}`}>
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsHistoryModalOpen(false)}></div>
        <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col transform transition-all scale-100 opacity-100 duration-300 ease-in-out max-h-[90vh]">
            {selectedClient && (
                <>
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                        <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold text-lg mr-4 shadow-sm">
                                {selectedClient.nom ? selectedClient.nom.substring(0, 2).toUpperCase() : 'C'}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{selectedClient.nom}</h3>
                                <p className="text-sm text-gray-500">Particulier • {selectedClient.telephone}</p>
                            </div>
                        </div>
                        <button onClick={() => setIsHistoryModalOpen(false)} className="text-gray-400 hover:text-red-500 transition text-2xl"><i className="fa-solid fa-times"></i></button>
                    </div>
                    <div className="p-6 overflow-y-auto bg-white flex-1 space-y-6">
                        
                        <div className="flex bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <div className="flex-1 text-center border-r border-blue-200">
                                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Total Réservations</p>
                                <p className="text-2xl font-bold text-gray-800">{clientStats.totalRes}</p>
                            </div>
                            <div className="flex-1 text-center border-r border-blue-200">
                                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">CA Généré</p>
                                <p className="text-2xl font-bold text-gray-800">{clientStats.ca.toLocaleString()} FCFA</p>
                            </div>
                            <div className="flex-1 text-center">
                                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Dernière activité</p>
                                <p className="text-xl font-bold text-gray-800 mt-1">
                                    {clientReservations.length > 0 ? new Date(clientReservations[0].date_prestation).toLocaleDateString('fr-FR') : '-'}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-gray-800 mb-4 flex items-center"><i className="fa-solid fa-clock-rotate-left mr-2 text-gray-400"></i> Historique des Prestations</h4>
                            <div className="space-y-4">
                                {clientReservations.length === 0 ? (
                                    <div className="text-gray-500 text-center py-4 border border-gray-100 rounded-lg">Aucune réservation pour le moment.</div>
                                ) : (
                                    clientReservations.map((res: any) => (
                                        <div key={res.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition bg-gray-50/50">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold mr-2">{res.numero_reference}</span>
                                                    <span className="font-bold text-gray-800">{res.type_prestation}</span>
                                                </div>
                                                <span className="text-sm font-bold text-gray-800">{(res.montant_total || 0).toLocaleString()} FCFA</span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="text-sm text-gray-500">
                                                    <p><i className="fa-regular fa-calendar mr-1"></i> {new Date(res.date_prestation).toLocaleDateString('fr-FR')} à {res.heure_debut?.substring(0,5)}</p>
                                                    <p><i className="fa-solid fa-users mr-1"></i> {res.nb_personnes} personnes</p>
                                                </div>
                                                <div className="space-x-2">
                                                    <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-semibold">{res.statut || 'En attente'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-between">
                        <button onClick={() => handleEditClient(selectedClient)} className="text-blue-600 hover:text-blue-800 text-sm font-medium"><i className="fa-solid fa-pen mr-1"></i> Éditer profil</button>
                        <button onClick={() => setIsHistoryModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition">Fermer</button>
                    </div>
                </>
            )}
        </div>
    </div>

    {/* Delete Confirmation Modal */}
    {deleteConfirmId && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Êtes-vous sûr ?</h3>
                <p className="text-gray-600 mb-8">La suppression d'un client est définitive et peut affecter l'historique des réservations. Continuer ?</p>
                <div className="flex space-x-3">
                    <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition">Annuler</button>
                    <button onClick={() => handleDeleteClient(deleteConfirmId)} className="flex-1 py-3.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold rounded-xl shadow-lg transition">Supprimer</button>
                </div>
            </div>
        </div>
    )}

        </div>
    );
}
