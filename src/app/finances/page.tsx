"use client";
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/utils/supabase';

type Finance = {
    id: string;
    numero_document: string;
    type_document: string;
    date_creation: string;
    reservation_id?: string;
    client_id?: string;
    statut: string;
    total_ht: number;
    tva: number;
    total_ttc: number;
    acompte: number;
    reste_a_payer: number;
    created_at: string;
    clients?: {
        nom: string;
        telephone?: string;
        email?: string;
    };
    reservations?: {
        numero_reference: string;
        type_prestation?: string;
        montant_total?: number;
        options?: any;
    };
};

type Client = {
    id: string;
    nom: string;
    telephone?: string;
};

type Reservation = {
    id: string;
    numero_reference: string;
    client_id: string;
    type_prestation?: string;
    montant_total?: number;
    options?: any;
    clients?: {
        nom: string;
    };
};

import { useSearchParams, useRouter } from 'next/navigation';

function FinancesContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);

    // Data
    const [finances, setFinances] = useState<Finance[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notificationModal, setNotificationModal] = useState<{isOpen: boolean, type: 'success' | 'error' | 'warning', message: string}>({isOpen: false, type: 'success', message: ''});
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
    const [editingDocId, setEditingDocId] = useState<string | null>(null);
    const [selectedDocDetails, setSelectedDocDetails] = useState<Finance | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Form
    const [docType, setDocType] = useState('Devis');
    const [dateEmission, setDateEmission] = useState('');
    const [clientId, setClientId] = useState('');
    const [reservationId, setReservationId] = useState('');
    const [packPrice, setPackPrice] = useState(0);
    const [packQty, setPackQty] = useState(1);
    const [optPrice, setOptPrice] = useState(0);
    const [optQty, setOptQty] = useState(1);
    const [acompte, setAcompte] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState<any>({});

    const totalHT = (packPrice * packQty) + (optPrice * optQty);
    const tva = 0; // 0%
    const totalTTC = totalHT + tva;
    const resteAPayer = totalTTC - acompte;

    useEffect(() => {
        fetchData();
        setDateEmission(new Date().toISOString().split('T')[0]);
    }, []);

    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'new_doc') {
            const type = searchParams.get('type');
            if (type === 'Devis' || type === 'Facture') setDocType(type);
            const client = searchParams.get('client_id');
            if (client) setClientId(client);
            const resId = searchParams.get('reservation_id');
            if (resId) setReservationId(resId);
            const packP = searchParams.get('pack_price');
            if (packP) setPackPrice(Number(packP));
            const optP = searchParams.get('opt_price');
            if (optP) setOptPrice(Number(optP));
            setIsGeneratorModalOpen(true);
            router.replace('/finances');
        }
    }, [searchParams, router]);

    // Recalculer les prix si on choisit manuellement une réservation (ou après le fetch initial)
    useEffect(() => {
        if (reservationId && reservations.length > 0) {
            const res = reservations.find(r => r.id === reservationId);
            if (res) {
                let pPrice = 0;
                const tp = res.type_prestation || '';
                const match = tp.match(/\(([\d\s]+)\s*FCFA\)/);
                if (match) {
                    pPrice = parseInt(match[1].replace(/\s/g, ''));
                } else {
                    if (tp.includes('Mariage')) pPrice = 800000;
                    else if (tp.includes('Anniversaire')) pPrice = 600000;
                    else if (tp.includes('Corporate')) pPrice = 1000000;
                }
                
                const opts = res.options || {};
                setSelectedOptions(opts);

                const oPrice = Math.max(0, (res.montant_total || 0) - pPrice);
                setPackPrice(pPrice);
                setOptPrice(oPrice);
            }
        } else {
            setSelectedOptions({});
        }
    }, [reservationId, reservations]);

    const fetchData = async () => {
        setIsLoading(true);
        const { data: finData, error: finError } = await supabase
            .from('finances')
            .select('*, clients(nom, telephone, email), reservations(numero_reference, type_prestation, montant_total, options)')
            .order('created_at', { ascending: false });
        if (finData) setFinances(finData as Finance[]);
        if (finError) console.error(finError);

        const { data: cliData } = await supabase.from('clients').select('id, nom, telephone');
        if (cliData) setClients(cliData as Client[]);

        const { data: resData } = await supabase.from('reservations').select('id, numero_reference, client_id, type_prestation, montant_total, options, clients(nom)');
        if (resData) setReservations(resData as unknown as Reservation[]);

        setIsLoading(false);
    };

    const handleSaveDocument = async () => {
        if (isSubmitting) return;
        if (!clientId) {
            setNotificationModal({ isOpen: true, type: 'warning', message: 'Veuillez sélectionner un client.' });
            return;
        }
        if (!reservationId) {
            setNotificationModal({ isOpen: true, type: 'warning', message: 'Veuillez sélectionner une réservation liée.' });
            return;
        }
        setIsSubmitting(true);

        const finalDocType = acompte > 0 ? 'Facture' : 'Devis';
        const finalStatut = acompte >= totalTTC ? 'Soldée' : (acompte > 0 ? 'Acompte payé' : 'En attente');

        let payload: any = {
            type_document: finalDocType,
            date_creation: dateEmission,
            client_id: clientId,
            reservation_id: reservationId || null,
            statut: finalStatut,
            total_ht: totalHT,
            tva: tva,
            total_ttc: totalTTC,
            acompte: acompte,
            reste_a_payer: resteAPayer
        };

        if (!editingDocId) {
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            const prefix = finalDocType === 'Facture' ? 'FACT' : 'DEV';
            payload.numero_document = `${prefix}-${randomNum}`;
        } else {
            const doc = finances.find(f => f.id === editingDocId);
            if (doc) {
                let numDoc = doc.numero_document || '';
                if (finalDocType === 'Facture') {
                    numDoc = numDoc.replace(/^DEV-/, 'FACT-');
                } else {
                    numDoc = numDoc.replace(/^FACT?-/, 'DEV-');
                }
                payload.numero_document = numDoc;
            }
        }

        let result;
        if (editingDocId) {
            result = await supabase.from('finances').update(payload).eq('id', editingDocId).select('*, clients(nom, telephone, email), reservations(numero_reference)');
        } else {
            result = await supabase.from('finances').insert([payload]).select('*, clients(nom, telephone, email), reservations(numero_reference)');
        }
        const { data, error } = result;

        if (error) {
            console.error(error);
            setNotificationModal({ isOpen: true, type: 'error', message: "Erreur lors de l'enregistrement : " + error.message });
        } else if (data) {
            // Update associated reservation
            if (reservationId) {
                let newTypePrestation = undefined;
                if (packPrice === 800000) newTypePrestation = 'Demande en mariage Premium (800 000 FCFA)';
                else if (packPrice === 600000) newTypePrestation = 'Anniversaire Premium (600 000 FCFA)';
                else if (packPrice === 1000000) newTypePrestation = 'Corporate Premium (1 000 000 FCFA)';

                const resStatus = acompte > 0 ? 'Confirmée' : 'En attente';
                const resUpdateData: any = { 
                    acompte: acompte, 
                    statut: resStatus,
                    options: selectedOptions,
                    montant_total: totalTTC
                };
                if (newTypePrestation) {
                    resUpdateData.type_prestation = newTypePrestation;
                }

                await supabase.from('reservations').update(resUpdateData).eq('id', reservationId);
            }

            if (editingDocId) {
                setFinances(finances.map(f => f.id === editingDocId ? data[0] as Finance : f));
            } else {
                setFinances([data[0] as Finance, ...finances]);
            }
            setIsGeneratorModalOpen(false);
            
            // Reset form
            setEditingDocId(null);
            setClientId('');
            setReservationId('');
            setPackPrice(0);
            setPackQty(1);
            setOptPrice(0);
            setOptQty(1);
            setAcompte(0);
            setSelectedOptions({});
            setNotificationModal({ isOpen: true, type: 'success', message: docType + " enregistré avec succès !" });
        }
        setIsSubmitting(false);
    };

    const handleEditDocument = (doc: Finance) => {
        setEditingDocId(doc.id);
        setDocType(doc.type_document);
        setClientId(doc.client_id || '');
        setReservationId(doc.reservation_id || '');
        setDateEmission(new Date(doc.date_creation).toISOString().split('T')[0]);
        setAcompte(doc.acompte || 0);
        setIsGeneratorModalOpen(true);
    };

    const handleDeleteDocument = async (id: string) => {
        const { error } = await supabase.from('finances').delete().eq('id', id);
        if (error) {
            setNotificationModal({ isOpen: true, type: 'error', message: "Erreur lors de la suppression." });
        } else {
            setFinances(finances.filter(f => f.id !== id));
            setNotificationModal({ isOpen: true, type: 'success', message: "Document supprimé avec succès !" });
        }
        setDeleteConfirmId(null);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(val);
    };

    const handleChangeStatus = async (id: string, newStatus: string) => {
        const doc = finances.find(f => f.id === id);
        if (!doc) return;

        // Vérifications de l'acompte
        if (newStatus === 'Acompte payé' && (!doc.acompte || doc.acompte <= 0)) {
            setNotificationModal({ isOpen: true, type: 'error', message: "Impossible de passer en 'Acompte payé' : aucun acompte n'est enregistré pour ce document. Veuillez le modifier pour ajouter un acompte." });
            setActiveDropdownId(null);
            return;
        }

        if (newStatus === 'Soldée' && (!doc.acompte || doc.acompte < doc.total_ht)) {
            setNotificationModal({ isOpen: true, type: 'error', message: "Impossible de solder : l'acompte enregistré (" + formatCurrency(doc.acompte || 0) + ") est inférieur au total." });
            setActiveDropdownId(null);
            return;
        }

        if (newStatus === 'En attente' && doc.acompte && doc.acompte > 0) {
            setNotificationModal({ isOpen: true, type: 'error', message: "Impossible de repasser 'En attente' : un acompte de " + formatCurrency(doc.acompte) + " est déjà enregistré." });
            setActiveDropdownId(null);
            return;
        }

        let updates: any = { statut: newStatus };

        // Convertir Devis en Facture automatiquement
        if ((newStatus === 'Acompte payé' || newStatus === 'Soldée') && doc.type_document === 'Devis') {
            updates.type_document = 'Facture';
            updates.numero_document = doc.numero_document.replace(/^DEV-/, 'FACT-');
        }

        const { error } = await supabase.from('finances').update(updates).eq('id', id);
        if (error) {
            setNotificationModal({ isOpen: true, type: 'error', message: "Erreur lors de la mise à jour du statut." });
        } else {
            // Update associated reservation
            if (doc.reservation_id) {
                let resStatus = 'En attente';
                if (newStatus === 'Acompte payé' || newStatus === 'Soldée') resStatus = 'Confirmée';
                else if (newStatus === 'Annulée') resStatus = 'Annulée';
                await supabase.from('reservations').update({ statut: resStatus }).eq('id', doc.reservation_id);
            }

            setFinances(finances.map(f => f.id === id ? { ...f, ...updates } : f));
            setNotificationModal({ isOpen: true, type: 'success', message: "Statut mis à jour avec succès !" });
        }
        setActiveDropdownId(null);
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
                    <a href="/finances" className="sidebar-item active flex items-center px-4 py-3 text-sm font-medium">
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
                        <div className="flex items-center space-x-3">
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition">
                        <i className="fa-solid fa-bars text-xl"></i>
                    </button>
                    <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-2 w-72 md:w-96 focus-within:ring-2 focus-within:ring-blue-400 transition">
                            <i className="fa-solid fa-search text-gray-400"></i>
                            <input type="text" id="searchInput"  placeholder="Rechercher (N°, Client)..." className="bg-transparent border-none outline-none ml-2 w-full text-sm" />
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
                            <h2 className="text-2xl font-bold text-gray-800">Finances & Facturation</h2>
                            <p className="text-sm text-gray-500">Gérez vos devis, factures et encaissements</p>
                        </div>
                        <button onClick={() => setIsGeneratorModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md transition transform hover:-translate-y-0.5 text-sm font-medium flex items-center">
                            <i className="fa-solid fa-plus mr-2"></i> Nouveau Document
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">CA Facturé (Mois)</p>
                                <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(finances.filter(f => f.type_document === 'Facture').reduce((sum, f) => sum + Number(f.total_ttc || 0), 0))}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-xl">
                                <i className="fa-solid fa-chart-line"></i>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Devis en attente</p>
                                <h3 className="text-2xl font-bold text-gray-800">{finances.filter(f => f.type_document === 'Devis' && f.statut === 'En attente').length}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 text-xl">
                                <i className="fa-solid fa-file-signature"></i>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Reste à recouvrer</p>
                                <h3 className="text-2xl font-bold text-red-600">{formatCurrency(finances.filter(f => f.type_document === 'Facture').reduce((sum, f) => sum + Number(f.reste_a_payer || 0), 0))}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 text-xl">
                                <i className="fa-solid fa-wallet"></i>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4 font-medium">N° Document</th>
                                        <th className="px-6 py-4 font-medium">Date Création</th>
                                        <th className="px-6 py-4 font-medium">Client</th>
                                        <th className="px-6 py-4 font-medium">Réf. Résa</th>
                                        <th className="px-6 py-4 font-medium text-right">Total</th>
                                        <th className="px-6 py-4 font-medium text-right">Reste à payer</th>
                                        <th className="px-6 py-4 font-medium">Statut</th>
                                        <th className="px-6 py-4 font-medium text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-100">
                                    {isLoading ? (
                                        <tr><td colSpan={7} className="text-center py-6 text-gray-500">Chargement...</td></tr>
                                    ) : finances.length === 0 ? (
                                        <tr><td colSpan={7} className="text-center py-6 text-gray-500">Aucun document financier.</td></tr>
                                    ) : finances.map(doc => (
                                        <tr key={doc.id} className="hover:bg-blue-50/50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className={`w-8 h-8 rounded flex items-center justify-center mr-3 font-bold text-xs ${doc.type_document === 'Facture' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                                        {doc.type_document === 'Facture' ? 'FAC' : 'DEV'}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-gray-900">{doc.numero_document}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{new Date(doc.date_creation).toLocaleDateString('fr-FR')}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-800">{doc.clients?.nom || 'Client inconnu'}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{doc.clients?.telephone || ''}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{doc.reservations?.numero_reference || '-'}</td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-800">{formatCurrency(doc.total_ttc)}</td>
                                            <td className={`px-6 py-4 text-right font-medium ${doc.reste_a_payer > 0 ? 'text-red-500' : 'text-gray-500'}`}>{formatCurrency(doc.reste_a_payer)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${doc.statut === 'Soldée' ? 'bg-green-100 text-green-700 border-green-200' : doc.statut === 'Acompte payé' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                                                        {doc.statut}
                                                    </span>
                                                    <div className="relative">
                                                        <button onClick={() => setActiveDropdownId(activeDropdownId === doc.id ? null : doc.id)} className={`p-1.5 rounded-lg transition ${activeDropdownId === doc.id ? 'text-gray-800 bg-gray-100' : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'}`} title="Changer le statut">
                                                            <i className="fa-solid fa-ellipsis-vertical px-1"></i>
                                                        </button>
                                                        
                                                        {activeDropdownId === doc.id && (
                                                            <>
                                                                <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)}></div>
                                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                                    <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Changer Statut</div>
                                                                    <button onClick={() => handleChangeStatus(doc.id, 'En attente')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition flex items-center">
                                                                        <span className="w-2 h-2 rounded-full bg-orange-400 mr-2"></span> En attente
                                                                    </button>
                                                                    <button onClick={() => handleChangeStatus(doc.id, 'Acompte payé')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 transition flex items-center">
                                                                        <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></span> Acompte payé
                                                                    </button>
                                                                    <button onClick={() => handleChangeStatus(doc.id, 'Soldée')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition flex items-center">
                                                                        <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span> Soldée
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button onClick={() => setSelectedDocDetails(doc)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Voir détails">
                                                        <i className="fa-solid fa-eye"></i>
                                                    </button>
                                                    <button onClick={() => handleEditDocument(doc)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition" title="Modifier">
                                                        <i className="fa-solid fa-pen"></i>
                                                    </button>
                                                    <button onClick={() => setDeleteConfirmId(doc.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Supprimer">
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal Nouveau Document */}
            {isGeneratorModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsGeneratorModalOpen(false)}></div>
                    <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] transform transition-all scale-100 opacity-100 duration-300 ease-in-out">
                        
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h3 className="text-lg font-bold text-gray-800">Créer un Document Financier</h3>
                            <button onClick={() => setIsGeneratorModalOpen(false)} className="text-gray-400 hover:text-red-500 transition text-xl">
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto space-y-8 flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-800 border-b pb-2">Informations Générales</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Type de Document</label>
                                            <select value={docType} onChange={e => setDocType(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                                <option value="Devis">Devis</option>
                                                <option value="Facture">Facture</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Date d'émission</label>
                                            <input type="date" value={dateEmission} onChange={e => setDateEmission(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-800 border-b pb-2">Sélection du Client & Réservation</h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Client existant *</label>
                                            <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                                <option value="">-- Choisir un client --</option>
                                                {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Réservation liée (Optionnelle)</label>
                                            <select value={reservationId} onChange={e => setReservationId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                                <option value="">-- Aucune --</option>
                                                {reservations.filter(r => r.client_id === clientId || !clientId).map(r => (
                                                    <option key={r.id} value={r.id}>{r.numero_reference} - {r.clients?.nom}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-gray-800 border-b pb-2">Prestations & Lignes de facturation</h4>
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                                            <th className="px-4 py-2 rounded-tl-lg">Type</th>
                                            <th className="px-4 py-2">Désignation</th>
                                            <th className="px-4 py-2 text-right">Prix Unitaire (FCFA)</th>
                                            <th className="px-4 py-2 text-center w-24">Quantité</th>
                                            <th className="px-4 py-2 text-right rounded-tr-lg">Total Ligne</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        <tr>
                                            <td className="px-4 py-3"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">PACK</span></td>
                                            <td className="px-4 py-3">
                                                <select value={packPrice} onChange={e => setPackPrice(Number(e.target.value))} className="w-full border-none bg-transparent font-medium text-gray-800 focus:ring-0 outline-none cursor-pointer">
                                                    <option value="0">-- Choisir un pack --</option>
                                                    <option value="800000">Demande en mariage Premium</option>
                                                    <option value="600000">Anniversaire Premium</option>
                                                    <option value="1000000">Corporate Premium</option>
                                                    {packPrice > 0 && ![800000, 600000, 1000000].includes(packPrice) && (
                                                        <option value={packPrice}>Pack lié à la réservation ({packPrice} FCFA)</option>
                                                    )}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-600">{packPrice}</td>
                                            <td className="px-4 py-3 text-center">
                                                <input type="number" value={packQty} onChange={e => setPackQty(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 border border-gray-300 rounded text-center px-1 py-1" />
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-gray-800">{packPrice * packQty}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3"><span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold">OPTION</span></td>
                                            <td className="px-4 py-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                                                    <label className="flex items-center text-sm cursor-pointer"><input type="checkbox" checked={!!selectedOptions['Décoration romantique (+50K)']} onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setSelectedOptions((prev: any) => ({...prev, 'Décoration romantique (+50K)': checked}));
                                                        const p = 50000; setOptPrice(prev => checked ? prev + p : Math.max(0, prev - p));
                                                    }} className="mr-2" /> Déco romantique (+50K)</label>
                                                    <label className="flex items-center text-sm cursor-pointer"><input type="checkbox" checked={!!selectedOptions['Déco luxe complète (+150K)']} onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setSelectedOptions((prev: any) => ({...prev, 'Déco luxe complète (+150K)': checked}));
                                                        const p = 150000; setOptPrice(prev => checked ? prev + p : Math.max(0, prev - p));
                                                    }} className="mr-2" /> Déco luxe complète (+150K)</label>
                                                    <label className="flex items-center text-sm cursor-pointer"><input type="checkbox" checked={!!selectedOptions['Photographe (+100K)']} onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setSelectedOptions((prev: any) => ({...prev, 'Photographe (+100K)': checked}));
                                                        const p = 100000; setOptPrice(prev => checked ? prev + p : Math.max(0, prev - p));
                                                    }} className="mr-2" /> Photographe (+100K)</label>
                                                    <label className="flex items-center text-sm cursor-pointer"><input type="checkbox" checked={!!selectedOptions['DJ professionnel (+200K)']} onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setSelectedOptions((prev: any) => ({...prev, 'DJ professionnel (+200K)': checked}));
                                                        const p = 200000; setOptPrice(prev => checked ? prev + p : Math.max(0, prev - p));
                                                    }} className="mr-2" /> DJ professionnel (+200K)</label>
                                                </div>
                                                <div className="mt-3">
                                                    <label className="text-xs text-gray-500 block mb-1">Montant total Options (Modifiable manuellement)</label>
                                                    <input type="number" value={optPrice} onChange={e => setOptPrice(Number(e.target.value))} className="w-full border border-gray-300 rounded text-gray-700 px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-600">{optPrice}</td>
                                            <td className="px-4 py-3 text-center">
                                                <input type="number" value={optQty} onChange={e => setOptQty(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 border border-gray-300 rounded text-center px-1 py-1" />
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-gray-800">{optPrice * optQty}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end pt-4">
                                <div className="w-full md:w-1/2 lg:w-1/3 space-y-3 bg-gray-50 p-5 rounded-xl border border-gray-100">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Total HT</span>
                                        <span className="font-medium text-gray-800">{totalHT} FCFA</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">TVA (0%)</span>
                                        <span className="font-medium text-gray-800">{tva} FCFA</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                                        <span className="text-gray-900">Total TTC</span>
                                        <span className="text-blue-600">{totalTTC} FCFA</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm pt-2">
                                        <label className="text-gray-600">Acompte versé</label>
                                        <input type="number" value={acompte} onChange={e => setAcompte(Math.max(0, parseInt(e.target.value) || 0))} className="w-32 border border-gray-300 rounded px-2 py-1 text-right" />
                                    </div>
                                    <div className="flex justify-between text-base font-bold text-red-600 pt-2">
                                        <span>Reste à Payer</span>
                                        <span>{resteAPayer} FCFA</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between space-x-3 rounded-b-2xl">
                            <button onClick={() => window.print()} className="px-5 py-2.5 rounded-lg text-sm font-bold bg-gray-800 text-white hover:bg-gray-900 transition shadow-md flex items-center">
                                <i className="fa-solid fa-print mr-2"></i> Prévisualiser & Imprimer
                            </button>
                            <div className="space-x-3">
                                <button onClick={() => setIsGeneratorModalOpen(false)} disabled={isSubmitting} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition">Annuler</button>
                                <button onClick={handleSaveDocument} disabled={isSubmitting} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-md disabled:opacity-50">
                                    {isSubmitting ? 'Enregistrement...' : "Enregistrer"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Notification Modal */}
            {notificationModal.isOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ${notificationModal.type === 'success' ? 'bg-green-100 text-green-500' : notificationModal.type === 'error' ? 'bg-red-100 text-red-500' : 'bg-orange-100 text-orange-500'}`}>
                                <i className={`fa-solid text-3xl ${notificationModal.type === 'success' ? 'fa-check' : notificationModal.type === 'error' ? 'fa-xmark' : 'fa-exclamation'}`}></i>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                {notificationModal.type === 'success' ? 'Succès !' : notificationModal.type === 'error' ? 'Erreur' : 'Attention'}
                            </h3>
                            <p className="text-gray-600 mb-8">{notificationModal.message}</p>
                            <button onClick={() => setNotificationModal({ ...notificationModal, isOpen: false })} className={`w-full py-3.5 rounded-xl text-white font-semibold shadow-lg transition transform hover:-translate-y-0.5 ${notificationModal.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' : notificationModal.type === 'error' ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700' : 'bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600'}`}>
                                {notificationModal.type === 'success' ? 'Continuer' : 'Fermer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Êtes-vous sûr ?</h3>
                        <p className="text-gray-600 mb-8">Cette action est irréversible. Voulez-vous vraiment supprimer ce document financier ?</p>
                        <div className="flex space-x-3">
                            <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition">Annuler</button>
                            <button onClick={() => handleDeleteDocument(deleteConfirmId)} className="flex-1 py-3.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold rounded-xl shadow-lg transition">Supprimer</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {selectedDocDetails && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        <div className={`p-6 text-white flex justify-between items-center ${selectedDocDetails.type_document === 'Facture' ? 'bg-gradient-to-r from-blue-600 to-cyan-500' : 'bg-gradient-to-r from-orange-500 to-amber-500'}`}>
                            <div>
                                <h3 className="text-2xl font-bold">Détails du {selectedDocDetails.type_document}</h3>
                                <p className="opacity-90 font-medium mt-1">{selectedDocDetails.numero_document}</p>
                            </div>
                            <button onClick={() => setSelectedDocDetails(null)} className="text-white/80 hover:text-white bg-white/20 hover:bg-white/30 p-2 rounded-xl transition">
                                <i className="fa-solid fa-times text-xl"></i>
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div>
                                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Client</p>
                                    <p className="font-bold text-gray-800 text-lg">{selectedDocDetails.clients?.nom || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Date</p>
                                    <p className="font-bold text-gray-800 text-lg">{new Date(selectedDocDetails.date_creation).toLocaleDateString('fr-FR')}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Statut</p>
                                    <span className={`px-3 py-1 mt-1 inline-block rounded-full text-xs font-semibold border ${selectedDocDetails.statut === 'Soldée' ? 'bg-green-100 text-green-700 border-green-200' : selectedDocDetails.statut === 'Acompte payé' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                                        {selectedDocDetails.statut}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Réservation Liée</p>
                                    <p className="font-bold text-gray-800 text-lg">{selectedDocDetails.reservations?.numero_reference || 'Aucune'}</p>
                                </div>
                            </div>
                            {selectedDocDetails.reservations && (
                                <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Prestation choisie (Pack & Options)</p>
                                    <p className="font-bold text-gray-800 mb-2">{selectedDocDetails.reservations.type_prestation || 'Pack personnalisé'}</p>
                                    
                                    {selectedDocDetails.reservations.options && Object.entries(selectedDocDetails.reservations.options).filter(([_, v]) => v).length > 0 && (
                                        <div className="mt-3 border-t border-gray-200 pt-2 space-y-1">
                                            {Object.entries(selectedDocDetails.reservations.options).filter(([_, v]) => v).map(([optName]) => {
                                                let price = 0;
                                                if (optName.includes('50K')) price = 50000;
                                                else if (optName.includes('100K')) price = 100000;
                                                else if (optName.includes('200K')) price = 200000;
                                                return (
                                                    <div key={optName} className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-600"><i className="fa-solid fa-plus text-blue-500 mr-2 text-xs"></i> {optName.split('(')[0].trim()}</span>
                                                        <span className="font-semibold text-gray-800">+{formatCurrency(price)}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100">
                                <h4 className="font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3 flex items-center">
                                    <i className="fa-solid fa-file-invoice-dollar text-blue-500 mr-2"></i> Informations Financières
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Total HT</span>
                                        <span className="font-bold text-gray-700">{formatCurrency(selectedDocDetails.total_ht)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">TVA (0%)</span>
                                        <span className="font-bold text-gray-700">{formatCurrency(selectedDocDetails.tva)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-lg font-bold border-t border-gray-200 pt-4">
                                        <span className="text-gray-800">Total TTC</span>
                                        <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{formatCurrency(selectedDocDetails.total_ttc)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-gray-500 font-medium">Acompte payé</span>
                                        <span className="font-bold text-green-600">{formatCurrency(selectedDocDetails.acompte)}</span>
                                    </div>
                                    <div className="flex justify-between items-center font-bold text-lg pt-2">
                                        <span className="text-gray-800">Reste à payer</span>
                                        <span className="text-red-500 bg-red-50 px-3 py-1 rounded-lg">{formatCurrency(selectedDocDetails.reste_a_payer)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between space-x-3 rounded-b-2xl">
                            <button onClick={() => window.print()} className="px-5 py-2.5 rounded-lg text-sm font-bold bg-gray-800 text-white hover:bg-gray-900 transition shadow-md flex items-center">
                                <i className="fa-solid fa-print mr-2"></i> Imprimer / PDF
                            </button>
                            <button onClick={() => setSelectedDocDetails(null)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition">Fermer</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Template d'impression (Caché sur l'écran, visible à l'impression) */}
            <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-10 font-sans text-black">
                {/* Header de la facture/devis */}
                <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-wider">EBRIÉ LAGOON</h1>
                        <p className="text-gray-600 mt-2 text-sm font-medium">Zone 4, Abidjan, Côte d'Ivoire</p>
                        <p className="text-gray-600 text-sm font-medium">contact@ebrielagoon.com</p>
                        <p className="text-gray-600 text-sm font-medium">+225 07 00 11 22 33</p>
                        <p className="text-gray-500 text-xs mt-1">RCCM: CI-ABJ-2023-B-12345</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-black text-gray-800 uppercase tracking-widest">{selectedDocDetails ? selectedDocDetails.type_document : docType}</h2>
                        <p className="text-gray-600 mt-2 font-bold text-lg">{selectedDocDetails ? selectedDocDetails.numero_document : 'DOCUMENT PROVISOIRE'}</p>
                        <p className="text-gray-600 mt-1">Date d'émission : {new Date().toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>

                {/* Info Client */}
                <div className="mb-10 flex justify-end">
                    <div className="bg-gray-50 p-6 rounded-lg w-1/2 border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Facturé à</h3>
                        <p className="text-xl font-bold text-gray-900 mb-1">{selectedDocDetails ? selectedDocDetails.clients?.nom : (clients.find(c => c.id === clientId)?.nom || 'Client non sélectionné')}</p>
                        <p className="text-gray-600">{selectedDocDetails ? selectedDocDetails.clients?.telephone : clients.find(c => c.id === clientId)?.telephone}</p>
                    </div>
                </div>

                {/* Table des montants */}
                <div className="mb-10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-800 text-sm uppercase tracking-wider">
                                <th className="py-3 px-4 font-bold border-b-2 border-gray-300">Désignation</th>
                                <th className="py-3 px-4 font-bold border-b-2 border-gray-300 text-right">Montant FCFA</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-800">
                            {/* In print preview for a specific doc, we only have totals. If generating, we have details. */}
                            {selectedDocDetails ? (
                                (() => {
                                    let optionsSum = 0;
                                    const renderedOptions: any[] = [];
                                    if (selectedDocDetails.reservations?.options) {
                                        Object.entries(selectedDocDetails.reservations.options).filter(([_, v]) => v).forEach(([optName]) => {
                                            let optPrice = 0;
                                            if (optName.includes('50K')) optPrice = 50000;
                                            else if (optName.includes('100K')) optPrice = 100000;
                                            else if (optName.includes('200K')) optPrice = 200000;
                                            optionsSum += optPrice;
                                            renderedOptions.push(
                                                <tr key={optName}>
                                                    <td className="py-4 px-4 border-b border-gray-200">
                                                        <p className="font-bold text-gray-600">Option : {optName.split('(')[0].trim()}</p>
                                                    </td>
                                                    <td className="py-4 px-4 border-b border-gray-200 text-right font-bold align-top">{formatCurrency(optPrice)}</td>
                                                </tr>
                                            );
                                        });
                                    }
                                    const basePackPrice = selectedDocDetails.total_ht - optionsSum;
                                    
                                    return (
                                        <>
                                            <tr>
                                                <td className="py-4 px-4 border-b border-gray-200">
                                                    <p className="font-bold text-gray-800">Pack Principal</p>
                                                    {selectedDocDetails.reservations?.type_prestation && (
                                                        <p className="text-sm text-gray-600 mt-1">Détails : {selectedDocDetails.reservations.type_prestation}</p>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 border-b border-gray-200 text-right font-bold align-top">{formatCurrency(basePackPrice)}</td>
                                            </tr>
                                            {renderedOptions}
                                        </>
                                    );
                                })()
                            ) : (
                                <>
                                    <tr>
                                        <td className="py-4 px-4 border-b border-gray-200 font-medium">Pack de Base : {packPrice} FCFA x {packQty}</td>
                                        <td className="py-4 px-4 border-b border-gray-200 text-right font-bold">{formatCurrency(packPrice * packQty)}</td>
                                    </tr>
                                    {optPrice > 0 && (
                                        <tr>
                                            <td className="py-4 px-4 border-b border-gray-200 font-medium">Option Supplémentaire : {optPrice} FCFA x {optQty}</td>
                                            <td className="py-4 px-4 border-b border-gray-200 text-right font-bold">{formatCurrency(optPrice * optQty)}</td>
                                        </tr>
                                    )}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Totaux */}
                <div className="flex justify-end">
                    <div className="w-1/2">
                        <div className="flex justify-between py-2 text-gray-600">
                            <span>Total HT</span>
                            <span className="font-bold">{selectedDocDetails ? formatCurrency(selectedDocDetails.total_ht) : formatCurrency(totalHT)}</span>
                        </div>
                        <div className="flex justify-between py-2 text-gray-600">
                            <span>TVA (0%)</span>
                            <span className="font-bold">0 FCFA</span>
                        </div>
                        <div className="flex justify-between py-3 text-lg font-black text-gray-900 border-t-2 border-gray-800 mt-2">
                            <span>Total TTC</span>
                            <span>{selectedDocDetails ? formatCurrency(selectedDocDetails.total_ttc) : formatCurrency(totalTTC)}</span>
                        </div>
                        
                        {(selectedDocDetails ? selectedDocDetails.acompte > 0 : acompte > 0) && (
                            <div className="flex justify-between py-2 text-gray-600 mt-2 border-t border-gray-200 text-sm">
                                <span>Acompte versé</span>
                                <span className="font-bold text-green-600">{selectedDocDetails ? formatCurrency(selectedDocDetails.acompte) : formatCurrency(acompte)}</span>
                            </div>
                        )}
                        <div className="flex justify-between py-2 text-base font-bold text-gray-900 bg-gray-100 px-4 rounded mt-2">
                            <span>Reste à payer</span>
                            <span>{selectedDocDetails ? formatCurrency(selectedDocDetails.reste_a_payer) : formatCurrency(resteAPayer)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer / Signature */}
                <div className="absolute bottom-10 left-10 right-10">
                    <div className="flex justify-between items-end border-t border-gray-300 pt-8">
                        <div className="text-xs text-gray-500 w-1/2">
                            <p className="font-bold mb-1">Conditions de paiement :</p>
                            <p>Le paiement doit être effectué dans un délai de 15 jours à compter de la date d'émission. En cas de retard, des pénalités pourront être appliquées conformément aux conditions générales de vente.</p>
                        </div>
                        <div className="text-center w-1/3">
                            <p className="font-bold text-gray-800 mb-12">La Direction</p>
                            <div className="border-b-2 border-gray-400 w-3/4 mx-auto"></div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default function FinancesPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-50"><p className="text-gray-500 font-medium">Chargement des finances...</p></div>}>
            <FinancesContent />
        </Suspense>
    );
}
