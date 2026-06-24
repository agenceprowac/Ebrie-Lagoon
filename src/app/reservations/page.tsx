
"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { Sidebar } from '@/components/Sidebar';
import { NotificationModal } from '@/components/NotificationModal';


export default function ReservationsPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isClientSearchModalOpen, setIsClientSearchModalOpen] = useState(false);
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [showNewClientForm, setShowNewClientForm] = useState(false);

    // Supabase Data
    const [reservations, setReservations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Nouveaux états UX
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
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterBoat, setFilterBoat] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedReservation, setSelectedReservation] = useState<any>(null);
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);
    
    // États Formulaire de création
    const [clientsList, setClientsList] = useState<any[]>([]);
    const [clientId, setClientId] = useState('');
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [datePrestation, setDatePrestation] = useState('');
    const [heureDebut, setHeureDebut] = useState('');
    const [nbPersonnes, setNbPersonnes] = useState(1);
    const [clientEmail, setClientEmail] = useState('');
    const [clientOrigine, setClientOrigine] = useState('WhatsApp');
    const [navireId, setNavireId] = useState('');
    const [flotteList, setFlotteList] = useState<any[]>([]);
    
    // Nouveaux états Édition et Statut
    const [editingReservationId, setEditingReservationId] = useState<string | null>(null);
    const [reservationStatus, setReservationStatus] = useState('En attente');
    
    const [packPrice, setPackPrice] = useState(0);
    const [packType, setPackType] = useState('');
    const [createdBy, setCreatedBy] = useState('');
    const [updatedBy, setUpdatedBy] = useState('');
    const [optionsPrice, setOptionsPrice] = useState(0);
    const [optionsList, setOptionsList] = useState<any>({});
    const [totalMontant, setTotalMontant] = useState(0);
    const [acompte, setAcompte] = useState(0);
    const [modePaiement, setModePaiement] = useState('');

    const [availablePacks, setAvailablePacks] = useState<any[]>([]);
    const [availableOptions, setAvailableOptions] = useState<any[]>([]);

    useEffect(() => {
        setTotalMontant(packPrice + optionsPrice);
    }, [packPrice, optionsPrice]);

    useEffect(() => {
        if (acompte > 0) {
            setReservationStatus('Confirmée');
        } else if (reservationStatus === 'Confirmée') {
            setReservationStatus('En attente');
        }
    }, [acompte]);

    useEffect(() => {
        fetchReservations();
        fetchClients();
        fetchFlotte();

        const storedPacks = localStorage.getItem('ebrie_packs');
        if (storedPacks) {
            setAvailablePacks(JSON.parse(storedPacks));
        } else {
            setAvailablePacks([
                { id: '1', name: 'Demande en mariage Premium', price: 800000 },
                { id: '2', name: 'Anniversaire Premium', price: 600000 },
                { id: '3', name: 'Corporate Premium', price: 1000000 }
            ]);
        }

        const storedOptions = localStorage.getItem('ebrie_options');
        if (storedOptions) {
            setAvailableOptions(JSON.parse(storedOptions));
        } else {
            setAvailableOptions([
                { id: '1', name: 'Décoration romantique', price: 50000 },
                { id: '2', name: 'Photographe', price: 100000 },
                { id: '3', name: 'DJ professionnel', price: 200000 }
            ]);
        }
    }, []);

    const fetchClients = async () => {
        const { data } = await supabase.from('clients').select('id, nom, telephone, email, origine_contact');
        if (data) setClientsList(data);
    };

    const fetchFlotte = async () => {
        const { data } = await supabase.from('flotte').select('id, nom_navire');
        if (data) setFlotteList(data);
    };

    const fetchReservations = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('reservations')
                .select(`
                    *,
                    clients (nom, telephone, email, origine_contact),
                    flotte (nom_navire)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            // Format data for the table
            const formatted = data.map(r => ({
                id: r.numero_reference,
                date: new Date(r.created_at).toLocaleDateString('fr-FR'),
                client: r.clients?.nom || 'Inconnu',
                phone: r.clients?.telephone || '',
                icon: 'phone',
                iconColor: 'text-gray-400',
                email: r.clients?.email || '',
                prestDate: new Date(r.date_prestation).toLocaleDateString('fr-FR'),
                prestDetails: `${r.heure_debut?.substring(0,5) || ''} • ${r.nb_personnes} Pax`,
                bateau: r.flotte?.nom_navire || 'Non alloué',
                statut: r.statut,
                statutColor: r.statut === 'Confirmée' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200',
                total: r.montant_total?.toLocaleString() + ' FCFA',
                solde: `Solde: ${(r.montant_total - (r.acompte || 0)).toLocaleString()}`,
                soldeColor: 'text-red-500',
                raw: r
            }));
            
            setReservations(formatted);
        } catch (error: any) {
            console.error('Erreur fetch reservations:', error);
            setNotification({ message: 'Erreur lors du chargement des données', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveReservation = async () => {
        try {
            const currentUserStr = localStorage.getItem('currentUser');
            const currentUserName = currentUserStr ? JSON.parse(currentUserStr).name : 'Système';
            
            let finalClientId = clientId;
            // 1. Create Client if not exists
            if (!finalClientId) {
                const { data: clientData, error: clientError } = await supabase
                    .from('clients')
                    .insert([{ nom: clientName, telephone: clientPhone, email: clientEmail, origine_contact: clientOrigine }])
                    .select()
                    .single();
                    
                if (clientError) throw clientError;
                finalClientId = clientData.id;
            } else {
                await supabase.from('clients').update({ email: clientEmail, origine_contact: clientOrigine }).eq('id', finalClientId);
            }

            // 2. Create Reservation
            const refNumber = 'RES-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            
            let finalReservationStatus = reservationStatus;
            if (acompte > 0 && (reservationStatus === 'En attente' || reservationStatus === 'Annulée')) {
                finalReservationStatus = 'Confirmée';
            } else if (acompte === 0 && reservationStatus === 'Confirmée') {
                finalReservationStatus = 'En attente';
            }

            let resError;
            let actualResId = null;
            if (editingReservationId) {
                const { data, error } = await supabase
                    .from('reservations')
                    .update({
                        client_id: finalClientId,
                        date_prestation: datePrestation,
                        heure_debut: heureDebut,
                        heure_fin: heureDebut,
                        type_prestation: packType || 'Standard',
                        nb_personnes: nbPersonnes,
                        navire_id: navireId || null,
                        montant_total: totalMontant,
                        statut: finalReservationStatus,
                        options: optionsList,
                        acompte: acompte,
                        updated_by_name: currentUserName,
                        updated_at: new Date().toISOString()
                    })
                    .eq('numero_reference', editingReservationId)
                    .select()
                    .single();
                resError = error;
                if (data) actualResId = data.id;
            } else {
                const { data, error } = await supabase
                    .from('reservations')
                    .insert([{
                        numero_reference: refNumber,
                        client_id: finalClientId,
                        date_prestation: datePrestation,
                        heure_debut: heureDebut,
                        heure_fin: heureDebut,
                        type_prestation: packType || 'Standard',
                        nb_personnes: nbPersonnes,
                        navire_id: navireId || null,
                        montant_total: totalMontant,
                        statut: finalReservationStatus,
                        options: optionsList,
                        acompte: acompte,
                        created_by_name: currentUserName,
                        updated_by_name: currentUserName,
                        updated_at: new Date().toISOString()
                    }])
                    .select()
                    .single();
                resError = error;
                if (data) actualResId = data.id;
            }

            if (resError) throw resError;

            // 3. Finance Document Generation/Update
            if (actualResId) {
                const { data: finDataArray } = await supabase.from('finances').select('*').eq('reservation_id', actualResId).limit(1);
                const finData = finDataArray && finDataArray.length > 0 ? finDataArray[0] : null;
                
                const financePayload = {
                    type_document: acompte > 0 ? 'Facture' : 'Devis',
                    statut: acompte >= totalMontant ? 'Soldée' : (acompte > 0 ? 'Acompte payé' : 'En attente'),
                    total_ht: totalMontant,
                    total_ttc: totalMontant,
                    acompte: acompte,
                    reste_a_payer: totalMontant - acompte,
                    client_id: finalClientId,
                    reservation_id: actualResId,
                    date_creation: new Date().toISOString(),
                    updated_by_name: currentUserName,
                        updated_at: new Date().toISOString()
                };

                if (finData) {
                    let numDoc = finData.numero_document || '';
                    if (acompte > 0) {
                        numDoc = numDoc.replace(/^DEV-/, 'FACT-');
                    } else if (acompte === 0) {
                        numDoc = numDoc.replace(/^FACT?-/, 'DEV-');
                    }
                    await supabase.from('finances').update({ ...financePayload, numero_document: numDoc }).eq('id', finData.id);
                } else {
                    const numDoc = (acompte > 0 ? 'FACT-' : 'DEV-') + new Date().getFullYear() + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                    await supabase.from('finances').insert([{ ...financePayload, numero_document: numDoc, created_by_name: currentUserName }]);
                }
            }

            // Success
            setNotification({ message: editingReservationId ? 'Réservation modifiée avec succès !' : 'Réservation enregistrée avec succès !', type: 'success' });
            setIsReservationModalOpen(false);
            
            // Reset form
            setClientName('');
            setClientId('');
            setClientPhone('');
            setClientEmail('');
            setClientOrigine('WhatsApp');
            setDatePrestation('');
            setHeureDebut('');
            setNbPersonnes(1);
            setPackPrice(0);
            
            // Refresh data
            fetchReservations();
            
            setTimeout(() => setNotification(null), 3000);
        } catch (error: any) {
            console.error('Erreur save reservation:', error);
            setNotification({ message: 'Erreur lors de la sauvegarde: ' + error.message, type: 'error' });
            setTimeout(() => setNotification(null), 5000);
        }
    };

    const handleEditReservation = (res: any) => {
        setEditingReservationId(res.id);
        const r = res.raw;
        
        // Form states
        setClientId(r.client_id || '');
        setClientName(r.clients?.nom || '');
        setClientPhone(r.clients?.telephone || '');
        setClientEmail(r.clients?.email || '');
        setClientOrigine(r.clients?.origine_contact || 'WhatsApp');
        setCreatedBy(r.created_by_name || '');
        setUpdatedBy(r.updated_by_name || '');
        
        setDatePrestation(r.date_prestation || '');
        setHeureDebut(r.heure_debut ? r.heure_debut.substring(0, 5) : '');
        setNbPersonnes(r.nb_personnes || 1);
        setNavireId(r.navire_id || '');
        
        // Options saved directly as boolean map in the DB
        const rawOptions = r.options || {};
        const cleanOptions: any = {};
        Object.keys(rawOptions).forEach(k => {
            if (rawOptions[k]) cleanOptions[k] = true;
        });

        // Determine pack price from packType to visually match the select
        let exactPackType = r.type_prestation || '';
        
        // Find if this exact pack exists in available packs
        let foundPackPrice = 0;
        const tpMatch = exactPackType.match(/\(([\d\s]+)\s*FCFA\)/);
        if (tpMatch) {
            foundPackPrice = parseInt(tpMatch[1].replace(/\s/g, ''));
        } else {
            // legacy fallback
            if (exactPackType.includes('Mariage')) foundPackPrice = 800000;
            else if (exactPackType.includes('Anniversaire')) foundPackPrice = 600000;
            else if (exactPackType.includes('Corporate')) foundPackPrice = 1000000;
        }

        const calculatedPackPrice = foundPackPrice;
        const calcOptPrice = Math.max(0, (r.montant_total || 0) - calculatedPackPrice);

        setPackType(exactPackType);
        setPackPrice(calculatedPackPrice);
        
        setReservationStatus(r.statut || 'En attente');
        setOptionsList(cleanOptions);
        setOptionsPrice(calcOptPrice);
        setAcompte(r.acompte || 0);
        
        setIsReservationModalOpen(true);
    };

    const handleNewReservationClick = () => {
        setEditingReservationId(null);
        setClientName('');
        setClientId('');
        setClientPhone('');
        setClientEmail('');
        setClientOrigine('WhatsApp');
        setCreatedBy('');
        setUpdatedBy('');
        setDatePrestation('');
        setHeureDebut('');
        setNbPersonnes(1);
        setNavireId('');
        setPackPrice(0);
        setReservationStatus('En attente');
        setOptionsList({});
        setOptionsPrice(0);
        setAcompte(0);
        setModePaiement('');
        setIsReservationModalOpen(true);
    };

    const handleActionPlaceholder = (actionName: string) => {
        setNotification({ message: `Fonctionnalité "${actionName}" en cours de développement.`, type: 'info' });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleOptionChange = (e: any, optionName: string, price: number) => {
        if (e.target.checked) {
            setOptionsPrice(prev => prev + price);
            setOptionsList((prev:any) => ({...prev, [optionName]: true}));
        } else {
            setOptionsPrice(prev => Math.max(0, prev - price));
            const newList = {...optionsList};
            delete newList[optionName];
            setOptionsList(newList);
        }
    };

    const handleOpenDetails = (reservation: any) => {
        setSelectedReservation(reservation);
        setIsDetailsModalOpen(true);
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredReservations = reservations.filter(res => {
        const matchesTab = activeTab === 'all' ? true : res.statut.toLowerCase() === activeTab.toLowerCase();
        const matchesSearch = res.client.toLowerCase().includes(searchTerm.toLowerCase()) || res.id.toLowerCase().includes(searchTerm.toLowerCase()) || res.phone.includes(searchTerm) || res.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesDate = true;
        if (filterDate) {
            matchesDate = res.raw?.date_prestation === filterDate;
        }

        let matchesStatus = true;
        if (filterStatus) {
            const statusMap: any = {
                'brouillon': 'Brouillon',
                'attente': 'En attente',
                'confirmee': 'Confirmée',
                'terminee': 'Terminée',
                'annulee': 'Annulée'
            };
            matchesStatus = res.statut === statusMap[filterStatus] || (filterStatus === 'attente' && res.statut === 'En attente d\'acompte');
        }

        let matchesBoat = true;
        if (filterBoat) {
            matchesBoat = res.raw?.navire_id === filterBoat;
        }

        return matchesTab && matchesSearch && matchesDate && matchesStatus && matchesBoat;
    }).sort((a, b) => {
        if (!sortConfig) return 0;
        let valA: any = '';
        let valB: any = '';
        switch(sortConfig.key) {
            case 'id': valA = a.id; valB = b.id; break;
            case 'client': valA = a.client; valB = b.client; break;
            case 'date': valA = a.raw?.date_prestation; valB = b.raw?.date_prestation; break;
            case 'bateau': valA = a.bateau; valB = b.bateau; break;
            case 'statut': valA = a.statut; valB = b.statut; break;
            case 'montant': valA = a.raw?.montant_total || 0; valB = b.raw?.montant_total || 0; break;
        }
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const totalItems = filteredReservations.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedReservations = filteredReservations.slice(startIndex, startIndex + itemsPerPage);



    let selectedPackPrice = 0;
    const tpStr = selectedReservation?.raw?.type_prestation || '';
    const tpMatch = tpStr.match(/\(([\d\s]+)\s*FCFA\)/);
    if (tpMatch) {
        selectedPackPrice = parseInt(tpMatch[1].replace(/\s/g, ''));
    } else {
        selectedPackPrice = tpStr.includes('Mariage') ? 800000 : tpStr.includes('Anniversaire') ? 600000 : tpStr.includes('Corporate') ? 1000000 : 0;
    }
    const selectedOptPrice = Math.max(0, (selectedReservation?.raw?.montant_total || 0) - selectedPackPrice);

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
                        <input type="text" placeholder="Recherche rapide..." className="bg-transparent border-none outline-none ml-2 w-full text-sm" />
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

        
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Gestion des Réservations</h2>
                    <p className="text-sm text-gray-500">Suivi complet des prestations clients</p>
                </div>
                <button onClick={handleNewReservationClick} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg shadow-md transition transform hover:-translate-y-0.5 text-sm font-medium flex items-center">
                    <i className="fa-solid fa-plus mr-2"></i> Nouvelle Réservation
                </button>
            </div>

            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Recherche (Nom, Contact)</label>
                    <div className="relative">
                        <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} id="searchInput" placeholder="Ex: Armand, 0707..." className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Période (Date)</label>
                    <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Statut</label>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Tous les statuts</option>
                        <option value="brouillon">Brouillon</option>
                        <option value="attente">En attente d'acompte</option>
                        <option value="confirmee">Confirmée</option>
                        <option value="terminee">Terminée</option>
                        <option value="annulee">Annulée</option>
                    </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Partenaire / Bateau</label>
                    <select value={filterBoat} onChange={(e) => setFilterBoat(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Tous les bateaux</option>
                        {flotteList.map(f => (
                            <option key={f.id} value={f.id}>{f.nom_navire}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <button onClick={() => { setSearchTerm(''); setFilterDate(''); setFilterStatus(''); setFilterBoat(''); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center h-10" title="Réinitialiser">
                        <i className="fa-solid fa-times mr-2"></i> Effacer
                    </button>
                </div>
            </div>

            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th onClick={() => handleSort('id')} className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 transition group">
                                    N° Réservation
                                    <i className={`fa-solid fa-sort${sortConfig?.key === 'id' ? (sortConfig.direction === 'asc' ? '-up' : '-down') : ''} ml-1 text-gray-400 group-hover:text-blue-500`}></i>
                                </th>
                                <th onClick={() => handleSort('client')} className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 transition group">
                                    Client & Contact
                                    <i className={`fa-solid fa-sort${sortConfig?.key === 'client' ? (sortConfig.direction === 'asc' ? '-up' : '-down') : ''} ml-1 text-gray-400 group-hover:text-blue-500`}></i>
                                </th>
                                <th onClick={() => handleSort('date')} className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 transition group">
                                    Prestation (Date & Heure)
                                    <i className={`fa-solid fa-sort${sortConfig?.key === 'date' ? (sortConfig.direction === 'asc' ? '-up' : '-down') : ''} ml-1 text-gray-400 group-hover:text-blue-500`}></i>
                                </th>
                                <th onClick={() => handleSort('bateau')} className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 transition group">
                                    Partenaire / Bateau
                                    <i className={`fa-solid fa-sort${sortConfig?.key === 'bateau' ? (sortConfig.direction === 'asc' ? '-up' : '-down') : ''} ml-1 text-gray-400 group-hover:text-blue-500`}></i>
                                </th>
                                <th className="px-6 py-4 font-medium">Créé/Modifié par</th>
                                <th onClick={() => handleSort('statut')} className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 transition group">
                                    Statut
                                    <i className={`fa-solid fa-sort${sortConfig?.key === 'statut' ? (sortConfig.direction === 'asc' ? '-up' : '-down') : ''} ml-1 text-gray-400 group-hover:text-blue-500`}></i>
                                </th>
                                <th onClick={() => handleSort('montant')} className="px-6 py-4 font-medium text-right cursor-pointer hover:bg-gray-100 transition group">
                                    Montant (FCFA)
                                    <i className={`fa-solid fa-sort${sortConfig?.key === 'montant' ? (sortConfig.direction === 'asc' ? '-up' : '-down') : ''} ml-1 text-gray-400 group-hover:text-blue-500`}></i>
                                </th>
                                <th className="px-6 py-4 font-medium text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="reservationsTableBody" className="text-sm divide-y divide-gray-100">
                            {isLoading && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        <i className="fa-solid fa-spinner fa-spin mr-2"></i> Chargement des réservations...
                                    </td>
                                </tr>
                            )}
                            {!isLoading && paginatedReservations.map((res, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/50 transition">
                                <td className="px-6 py-4">
                                    <span className="font-semibold text-gray-900">{res.id}</span>
                                    {res.date && <div className="text-xs text-gray-400 mt-0.5">Créé le {res.date}</div>}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-800">{res.client}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        {res.phone && <><i className={"fa-solid fa-" + res.icon + " " + res.iconColor + " mr-1"}></i>{res.phone}</>}
                                        {res.email && <><i className={"fa-solid fa-" + res.icon + " " + res.iconColor + " mr-1"}></i>{res.email}</>}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-gray-800"><i className="fa-regular fa-calendar mr-1"></i>{res.prestDate}</div>
                                    {res.prestDetails && <div className="text-xs text-gray-500 mt-0.5"><i className="fa-regular fa-clock mr-1"></i>{res.prestDetails}</div>}
                                </td>
                                <td className="px-6 py-4 text-gray-600">{res.bateau}</td>
                                <td className="px-6 py-4 text-gray-500 text-xs">
                                    <div><div className="font-medium text-gray-700">{res.raw?.updated_by_name || res.raw?.created_by_name || 'Système'}</div><div className="text-[10px] mt-0.5">{new Date(res.raw?.updated_at || res.raw?.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</div></div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={"px-3 py-1 rounded-full text-xs font-semibold border " + res.statutColor}>{res.statut}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="font-bold text-gray-800">{res.total}</div>
                                    {res.solde && <div className={"text-xs mt-0.5 " + res.soldeColor}>{res.solde}</div>}
                                </td>
                                <td className="px-6 py-4 text-center space-x-2">
                                    <button onClick={() => handleOpenDetails(res)} className="text-blue-500 hover:text-blue-700 transition" title="Voir détails"><i className="fa-solid fa-eye"></i></button>
                                    <button onClick={() => handleEditReservation(res)} className="text-gray-400 hover:text-blue-600 transition" title="Modifier"><i className="fa-solid fa-pen"></i></button>
                                    <button onClick={() => handleActionPlaceholder("Paiement")} className="text-gray-400 hover:text-green-600 transition" title="Paiement"><i className="fa-solid fa-money-bill"></i></button>
                                </td>
                            </tr>
                            ))}
                            {!isLoading && paginatedReservations.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        Aucune réservation trouvée pour "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
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
                    <span className="text-sm text-gray-500">Affichage {totalItems === 0 ? 0 : startIndex + 1} à {Math.min(startIndex + itemsPerPage, totalItems)} sur {totalItems} réservations</span>
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
            </div>
        </div>
    </main>

    
    <div id="reservationModal" className={`fixed inset-0 z-50 items-center justify-center p-4 ${isReservationModalOpen ? 'flex' : 'hidden'}`}>
        
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsReservationModalOpen(!isReservationModalOpen)}></div>
        
        
        <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col transform transition-all scale-100 opacity-100 duration-300 ease-in-out" id="modalPanel">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                <h3 className="text-lg font-bold text-gray-800">{editingReservationId ? "Modifier la Réservation" : "Créer une Réservation"}</h3>
                <button onClick={() => setIsReservationModalOpen(!isReservationModalOpen)} className="text-gray-400 hover:text-red-500 transition text-xl">
                    <i className="fa-solid fa-times"></i>
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                <div>
                    <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 border-b pb-2 flex justify-between items-center">
                        <span><i className="fa-solid fa-user mr-2"></i>Informations Client</span>
                        {clientId && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Client existant</span>}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Client / Raison Sociale *</label>
                            <div className="flex space-x-2">
                                <input type="text" value={clientName} onDoubleClick={() => setIsClientSearchModalOpen(true)} required onChange={(e) => {setClientName(e.target.value); setClientId('');}} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Double-cliquez ou cherchez" />
                                <button type="button" onClick={() => setIsClientSearchModalOpen(true)} className="bg-gray-100 border border-gray-300 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 transition"><i className="fa-solid fa-search"></i></button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone / WhatsApp *</label>
                            <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Canal d'acquisition</label>
                            <select value={clientOrigine} onChange={e => setClientOrigine(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="WhatsApp">WhatsApp</option>
                                <option value="Site Web">Site Web</option>
                                <option value="Téléphone">Téléphone</option>
                                <option value="Partenaires">Partenaires</option>
                            </select>
                        </div>
                    </div>
                </div>

                
                <div>
                    <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 border-b pb-2"><i className="fa-solid fa-ship mr-2"></i>Détails Prestation</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Statut *</label>
                            <select value={reservationStatus} onChange={(e) => setReservationStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-gray-800">
                                <option value="En attente">En attente</option>
                                <option value="Confirmée">Confirmée</option>
                                <option value="Terminée">Terminée</option>
                                <option value="Annulée">Annulée</option>
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pack Principal *</label>
                            <select id="resPack" value={packType} onChange={(e) => {
                                const opt = e.target.options[e.target.selectedIndex];
                                setPackPrice(parseInt(opt.getAttribute('data-price') || '0'));
                                setPackType(opt.value);
                            }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50">
                                <option value="" data-price="0">-- Choisir un pack --</option>
                                {availablePacks.map(pack => (
                                    <option key={pack.id} value={`${pack.name} (${pack.price.toLocaleString()} FCFA)`} data-price={pack.price}>
                                        {pack.name} ({pack.price.toLocaleString()} FCFA)
                                    </option>
                                ))}
                                {packType && !availablePacks.some(p => `${p.name} (${p.price.toLocaleString()} FCFA)` === packType) && (
                                    <option value={packType} data-price={packPrice}>{packType}</option>
                                )}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date Prévue *</label>
                            <input type="date" value={datePrestation} onChange={e => setDatePrestation(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Heure de Départ *</label>
                            <input type="time" value={heureDebut} onChange={e => setHeureDebut(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nb Participants *</label>
                            <input type="number" min="1" value={Number.isNaN(nbPersonnes) ? '' : nbPersonnes} onChange={e => setNbPersonnes(parseInt(e.target.value))} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bateau / Partenaire Alloué</label>
                            <select value={navireId} onChange={e => setNavireId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="">-- À définir --</option>
                                {flotteList.map(f => (
                                    <option key={f.id} value={f.id}>{f.nom_navire}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                
                <div>
                    <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 border-b pb-2"><i className="fa-solid fa-coins mr-2"></i>Aspect Financier</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Montant Calculé (FCFA) *</label>
                            <input type="number" id="resMontant" value={totalMontant || 0} onChange={() => {}} step="1000" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900 bg-gray-100 cursor-not-allowed" readOnly placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Acompte Payé (FCFA)</label>
                            <input type="number" value={acompte || ''} onChange={e => setAcompte(Number(e.target.value))} step="1000" placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-green-600 font-medium" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mode de Paiement (Acompte)</label>
                            <div className="flex space-x-4 mt-2">
                                <label className="flex items-center text-sm cursor-pointer"><input type="radio" checked={modePaiement === 'Mobile Money'} onChange={() => setModePaiement('Mobile Money')} name="pay" className="mr-2" /> Wave/Orange/MTN</label>
                                <label className="flex items-center text-sm cursor-pointer"><input type="radio" checked={modePaiement === 'Virement / Chèque'} onChange={() => setModePaiement('Virement / Chèque')} name="pay" className="mr-2" /> Virement / Chèque</label>
                                <label className="flex items-center text-sm cursor-pointer"><input type="radio" checked={modePaiement === 'Espèces'} onChange={() => setModePaiement('Espèces')} name="pay" className="mr-2" /> Espèces</label>
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Options Additionnelles</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                {availableOptions.map(option => {
                                    const optLabel = `${option.name} (+${(option.price / 1000)}K)`;
                                    return (
                                        <label key={option.id} className="flex items-center text-sm cursor-pointer">
                                            <input type="checkbox" 
                                                checked={!!optionsList[optLabel]} 
                                                onChange={(e) => handleOptionChange(e, optLabel, option.price)} 
                                                data-price={option.price} className="mr-2" /> {optLabel}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="col-span-2 mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Observations spécifiques</label>
                            <textarea rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Traiteur, allergies..." defaultValue={``} />
                        </div>
                    </div>
                </div>
            </div>
            
            
            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-2xl">
                <div className="text-xs text-gray-500">
                    {editingReservationId && (createdBy || updatedBy) && (
                        <>
                            {createdBy && <div>Créé par : <span className="font-semibold text-gray-700">{createdBy}</span></div>}
                            {updatedBy && <div>Modifié par : <span className="font-semibold text-gray-700">{updatedBy}</span></div>}
                        </>
                    )}
                </div>
                <div className="flex space-x-3">
                    <button onClick={() => setIsReservationModalOpen(false)} className="px-5 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition shadow-sm">Annuler</button>
                    <button disabled={packPrice === 0 || clientName.trim() === '' || clientPhone.trim() === '' || datePrestation === '' || heureDebut === ''} onClick={handleSaveReservation} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                        <i className="fa-solid fa-save mr-2"></i> Enregistrer
                    </button>
                </div>
            </div>
        </div>
    </div>

    
    <div id="detailsModal" className={`fixed inset-0 z-50 items-center justify-center p-4 ${isDetailsModalOpen ? 'flex' : 'hidden'}`}>
        
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsDetailsModalOpen(!isDetailsModalOpen)}></div>
        
        
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col transform transition-all scale-100 opacity-100 duration-300 ease-in-out">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                <h3 className="text-lg font-bold text-gray-800">Détails de la Réservation <span className="text-blue-600">{selectedReservation?.id || 'RES-2026-068'}</span></h3>
                <button onClick={() => setIsDetailsModalOpen(!isDetailsModalOpen)} className="text-gray-400 hover:text-red-500 transition text-xl">
                    <i className="fa-solid fa-times"></i>
                </button>
            </div>
            
            <div className="p-6 space-y-6">
                
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Client</h4>
                        <p className="font-medium text-gray-800">{selectedReservation?.client || 'Koffi Armand'}</p>
                        <p className="text-sm text-gray-500"><i className={"fa-solid fa-" + (selectedReservation?.icon || 'whatsapp') + " " + (selectedReservation?.iconColor || 'text-green-500') + " mr-1"}></i>{selectedReservation?.phone || selectedReservation?.email || '07 07 12 34 56'}</p>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Prestation</h4>
                        <p className="font-medium text-gray-800">{selectedReservation?.bateau || 'Catamaran "Lagune Express"'}</p>
                        <p className="text-sm text-gray-500"><i className="fa-regular fa-clock mr-1"></i>{selectedReservation?.prestDate}, {selectedReservation?.prestDetails}</p>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Finances</h4>
                        <p className="font-medium text-gray-800">Total : {selectedReservation?.total || '150 000'} FCFA</p>
                        <p className={"text-sm font-medium " + (selectedReservation?.soldeColor || 'text-green-600')}>{selectedReservation?.solde || 'Solde restant : 0 FCFA'}</p>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Statut</h4>
                        <span className={"px-3 py-1 rounded-full text-xs font-semibold border " + (selectedReservation?.statutColor || 'bg-orange-100 text-orange-700 border-orange-200')}>{selectedReservation?.statut || 'En attente'}</span>
                    </div>
                </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between rounded-b-2xl">
                <button onClick={() => setIsDetailsModalOpen(!isDetailsModalOpen)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition">Fermer</button>
                <div className="space-x-3">
                    {selectedReservation?.statut !== 'Confirmée' && (
                        <Link href={`/finances?action=new_doc&type=Devis&client_id=${selectedReservation?.raw?.client_id || ''}&reservation_id=${selectedReservation?.raw?.id || ''}&pack_price=${selectedPackPrice}&opt_price=${selectedOptPrice}`} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition shadow-sm inline-flex items-center">
                            <i className="fa-solid fa-file-signature mr-2"></i> Générer Devis
                        </Link>
                    )}
                    {selectedReservation?.statut === 'Confirmée' && (
                        <Link href={`/finances?action=new_doc&type=Facture&client_id=${selectedReservation?.raw?.client_id || ''}&reservation_id=${selectedReservation?.raw?.id || ''}&pack_price=${selectedPackPrice}&opt_price=${selectedOptPrice}`} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-md inline-flex items-center">
                            <i className="fa-solid fa-file-invoice-dollar mr-2"></i> Générer Facture
                        </Link>
                    )}
                </div>
            </div>
        </div>
    </div>

    

        {/* Toast Notification */}
        <NotificationModal notification={notification} onClose={() => setNotification(null)} />


    {/* Client Search Modal */}
    <div className={`fixed inset-0 z-[60] items-center justify-center p-4 ${isClientSearchModalOpen ? 'flex' : 'hidden'}`}>
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsClientSearchModalOpen(false)}></div>
        <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                <h3 className="text-lg font-bold text-gray-800">Rechercher un Client</h3>
                <button onClick={() => setIsClientSearchModalOpen(false)} className="text-gray-400 hover:text-red-500 transition text-xl"><i className="fa-solid fa-times"></i></button>
            </div>
            <div className="p-4 border-b border-gray-100 flex items-center space-x-3">
                <div className="relative flex-1">
                    <i className="fa-solid fa-search absolute left-3 top-3 text-gray-400"></i>
                    <input 
                        type="text" 
                        value={clientSearchTerm}
                        onChange={(e) => setClientSearchTerm(e.target.value)}
                        placeholder="Rechercher par nom ou téléphone..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <button onClick={() => setShowNewClientForm(!showNewClientForm)} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-semibold text-sm whitespace-nowrap">
                    <i className={`fa-solid ${showNewClientForm ? 'fa-minus' : 'fa-plus'} mr-1`}></i> Nouveau
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {(showNewClientForm || clientsList.filter((c:any) => c.nom.toLowerCase().includes(clientSearchTerm.toLowerCase()) || c.telephone.includes(clientSearchTerm)).length === 0) ? (
                    <div className="p-4">
                        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-inner">
                            <p className="text-sm text-blue-800 font-semibold mb-3 text-center">
                                {showNewClientForm ? "Création d'un nouveau client" : "Ce client n'existe pas. Vous pouvez le créer rapidement :"}
                            </p>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-blue-700 mb-1">Nom du client *</label>
                                    <input type="text" id="quickClientName" defaultValue={!/^\d/.test(clientSearchTerm) ? clientSearchTerm : ''} placeholder="Ex: Jean Dupont" className="w-full border border-blue-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-blue-700 mb-1">Téléphone</label>
                                    <input type="text" id="quickClientPhone" defaultValue={/^\d/.test(clientSearchTerm) ? clientSearchTerm : ''} placeholder="Ex: 07 07..." className="w-full border border-blue-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <button 
                                    onClick={async () => {
                                        const n = (document.getElementById('quickClientName') as HTMLInputElement).value;
                                        const p = (document.getElementById('quickClientPhone') as HTMLInputElement).value;
                                        if (!n.trim()) {
                                            setNotification({ message: 'Le nom du client est requis.', type: 'error' });
                                            return;
                                        }
                                        try {
                                            const { data, error } = await supabase.from('clients').insert([{ nom: n, telephone: p, email: '', origine_contact: 'WhatsApp' }]).select().single();
                                            if (error) throw error;
                                            setClientsList(prev => [...prev, data]);
                                            setClientId(data.id);
                                            setClientName(data.nom);
                                            setClientPhone(data.telephone || '');
                                            setClientEmail(data.email || '');
                                            setClientOrigine(data.origine_contact || 'WhatsApp');
                                            setNotification({ message: 'Client ajouté et sélectionné avec succès !', type: 'success' });
                                            setIsClientSearchModalOpen(false);
                                            setClientSearchTerm('');
                                            setShowNewClientForm(false);
                                        } catch (e) {
                                            console.error(e);
                                            setNotification({ message: 'Erreur lors de la création du client.', type: 'error' });
                                        }
                                    }}
                                    className="w-full py-2 mt-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 transition shadow-md"
                                >
                                    Créer et Sélectionner
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    clientsList.filter((c:any) => c.nom.toLowerCase().includes(clientSearchTerm.toLowerCase()) || c.telephone.includes(clientSearchTerm)).map((client: any) => (
                        <div 
                            key={client.id} 
                            onClick={() => {
                                setClientId(client.id);
                                setClientName(client.nom);
                                setClientPhone(client.telephone || '');
                                setClientEmail(client.email || '');
                                setClientOrigine(client.origine_contact || 'WhatsApp');
                                setIsClientSearchModalOpen(false);
                            }}
                            className="p-3 hover:bg-blue-50 border-b border-gray-50 cursor-pointer rounded transition flex justify-between items-center"
                        >
                            <div>
                                <div className="font-bold text-gray-800">{client.nom}</div>
                                <div className="text-sm text-gray-500"><i className="fa-solid fa-phone mr-1 text-gray-400"></i>{client.telephone}</div>
                            </div>
                            <button className="text-blue-600 text-sm font-medium bg-white border border-blue-200 px-3 py-1 rounded hover:bg-blue-100">Sélectionner</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
        </div>
    );
}
