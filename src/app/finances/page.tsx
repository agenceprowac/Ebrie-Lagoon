"use client";
import Link from &apos;next/link';
import { useState, useEffect } from &apos;react';
import { supabase } from '@/utils/supabase';

type Finance = {
    id: string;
    numero_document: string;
    type_document: string;
    date_emission: string;
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
        reference: string;
    };
};

type Client = {
    id: string;
    nom: string;
};

type Reservation = {
    id: string;
    reference: string;
    client_id: string;
    clients?: {
        nom: string;
    }
};

export default function FinancesPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);

    // Data
    const [finances, setFinances] = useState<Finance[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const totalHT = (packPrice * packQty) + (optPrice * optQty);
    const tva = 0; // 0%
    const totalTTC = totalHT + tva;
    const resteAPayer = totalTTC - acompte;

    useEffect(() => {
        fetchData();
        setDateEmission(new Date().toISOString().split('T')[0]);
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const { data: finData, error: finError } = await supabase
            .from('finances')
            .select('*, clients(nom, telephone, email), reservations(reference)')
            .order('created_at', { ascending: false });
        if (finData) setFinances(finData as Finance[]);
        if (finError) console.error(finError);

        const { data: cliData } = await supabase.from('clients').select('id, nom');
        if (cliData) setClients(cliData as Client[]);

        const { data: resData } = await supabase.from('reservations').select('id, reference, client_id, clients(nom)');
        if (resData) setReservations(resData as unknown as Reservation[]);

        setIsLoading(false);
    };

    const handleSaveDocument = async () => {
        if (!clientId) return alert('Veuillez sélectionner un client.');
        setIsSubmitting(true);

        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const prefix = docType === &apos;Facture&apos; ? &apos;FAC&apos; : &apos;DEV';
        const numDoc = `${prefix}-${randomNum}`;

        const payload = {
            numero_document: numDoc,
            type_document: docType,
            date_emission: dateEmission,
            client_id: clientId,
            reservation_id: reservationId || null,
            statut: docType === &apos;Devis&apos; ? &apos;En attente&apos; : (acompte >= totalTTC ? &apos;Soldée&apos; : (acompte > 0 ? &apos;Acompte payé' : &apos;En attente')),
            total_ht: totalHT,
            tva: tva,
            total_ttc: totalTTC,
            acompte: acompte,
            reste_a_payer: resteAPayer
        };

        const { data, error } = await supabase.from('finances').insert([payload]).select('*, clients(nom, telephone, email), reservations(reference)');
        if (error) {
            console.error(error);
            alert("Erreur lors de l&apos;enregistrement : " + error.message);
        } else if (data) {
            setFinances([data[0] as Finance, ...finances]);
            setIsGeneratorModalOpen(false);
            
            // Reset form
            setClientId('');
            setReservationId('');
            setPackPrice(0);
            setPackQty(1);
            setOptPrice(0);
            setOptQty(1);
            setAcompte(0);
            alert(docType + " enregistré avec succès !");
        }
        setIsSubmitting(false);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('fr-FR', { style: &apos;currency', currency: &apos;XOF&apos; }).format(val);
    };

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
                        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-96 focus-within:ring-2 focus-within:ring-blue-400 transition">
                            <i className="fa-solid fa-search text-gray-400"></i>
                            <input type="text" id="searchInput"  placeholder="Rechercher (N°, Client)..." className="bg-transparent border-none outline-none ml-2 w-full text-sm" />
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
                                <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(finances.filter(f => f.type_document === &apos;Facture').reduce((sum, f) => sum + f.total_ttc, 0))}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-xl">
                                <i className="fa-solid fa-chart-line"></i>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Devis en attente</p>
                                <h3 className="text-2xl font-bold text-gray-800">{finances.filter(f => f.type_document === &apos;Devis').length}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 text-xl">
                                <i className="fa-solid fa-file-signature"></i>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Reste à recouvrer</p>
                                <h3 className="text-2xl font-bold text-red-600">{formatCurrency(finances.filter(f => f.type_document === &apos;Facture').reduce((sum, f) => sum + f.reste_a_payer, 0))}</h3>
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
                                                    <div className={`w-8 h-8 rounded flex items-center justify-center mr-3 font-bold text-xs ${doc.type_document === &apos;Facture&apos; ? &apos;bg-blue-100 text-blue-600' : &apos;bg-orange-100 text-orange-600'}`}>
                                                        {doc.type_document === &apos;Facture&apos; ? &apos;FAC&apos; : &apos;DEV'}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-gray-900">{doc.numero_document}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{new Date(doc.date_emission).toLocaleDateString('fr-FR')}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-800">{doc.clients?.nom || &apos;Client inconnu'}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{doc.clients?.telephone || ''}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{doc.reservations?.reference || '-'}</td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-800">{formatCurrency(doc.total_ttc)}</td>
                                            <td className={`px-6 py-4 text-right font-medium ${doc.reste_a_payer > 0 ? &apos;text-red-500' : &apos;text-gray-500'}`}>{formatCurrency(doc.reste_a_payer)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${doc.statut === &apos;Soldée&apos; ? &apos;bg-green-100 text-green-700 border-green-200' : doc.statut === &apos;Acompte payé' ? &apos;bg-yellow-100 text-yellow-700 border-yellow-200' : &apos;bg-orange-100 text-orange-700 border-orange-200'}`}>
                                                    {doc.statut}
                                                </span>
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
                                                    <option key={r.id} value={r.id}>{r.reference} - {r.clients?.nom}</option>
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
                                                <select onChange={e => setPackPrice(Number(e.target.value))} className="w-full border-none bg-transparent font-medium text-gray-800 focus:ring-0 outline-none cursor-pointer">
                                                    <option value="0">-- Choisir un pack --</option>
                                                    <option value="800000">Demande en mariage Premium</option>
                                                    <option value="600000">Anniversaire Premium</option>
                                                    <option value="1000000">Corporate Premium</option>
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
                                                <select onChange={e => setOptPrice(Number(e.target.value))} className="w-full border-none bg-transparent text-gray-700 focus:ring-0 outline-none cursor-pointer">
                                                    <option value="0">-- Ajouter une option --</option>
                                                    <option value="50000">Décoration romantique</option>
                                                    <option value="150000">Décoration luxe complète</option>
                                                    <option value="100000">Photographe</option>
                                                    <option value="200000">DJ professionnel</option>
                                                </select>
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
                        
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 rounded-b-2xl">
                            <button onClick={() => setIsGeneratorModalOpen(false)} disabled={isSubmitting} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition">Annuler</button>
                            <button onClick={handleSaveDocument} disabled={isSubmitting} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-md disabled:opacity-50">
                                {isSubmitting ? &apos;Enregistrement...' : "Enregistrer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
