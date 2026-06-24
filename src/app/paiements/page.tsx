"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { Sidebar } from '@/components/Sidebar';
import { NotificationModal } from '@/components/NotificationModal';

type Paiement = {
    id: string;
    numero_recu: string;
    date_paiement: string;
    client_id: string;
    reservation_id: string;
    montant: number;
    mode_paiement: string;
    reference_transaction: string;
    notes: string;
    created_at: string;
    created_by_name: string;
    clients?: { nom: string };
    reservations?: { numero_reference: string };
};

type FinanceAlert = {
    id: string;
    numero_document: string;
    total_ttc: number;
    acompte: number;
    reste_a_payer: number;
    statut: string;
    reservation_id: string;
    reservations?: { numero_reference: string, clients: { nom: string } };
};

export default function PaiementsPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [paiements, setPaiements] = useState<Paiement[]>([]);
    const [financesAlerts, setFinancesAlerts] = useState<FinanceAlert[]>([]);
    const [isNewPaiementModalOpen, setIsNewPaiementModalOpen] = useState(false);
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form fields
    const [clientId, setClientId] = useState('');
    const [reservationId, setReservationId] = useState('');
    const [montant, setMontant] = useState('');
    const [modePaiement, setModePaiement] = useState('Espèce');
    const [referenceTransaction, setReferenceTransaction] = useState('');
    const [datePaiement, setDatePaiement] = useState('');
    
    const [clients, setClients] = useState<{id: string, nom: string}[]>([]);
    const [reservations, setReservations] = useState<{id: string, numero_reference: string, client_id: string}[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [paieRes, finRes, cliRes, resRes] = await Promise.all([
                supabase.from('paiements').select('*, clients(nom), reservations(numero_reference)').order('date_paiement', { ascending: false }),
                supabase.from('finances').select('id, numero_document, total_ttc, acompte, reste_a_payer, statut, reservation_id, reservations(numero_reference, clients(nom))').gt('reste_a_payer', 0).eq('type_document', 'Facture').order('date_creation', { ascending: false }),
                supabase.from('clients').select('id, nom').order('nom', { ascending: true }),
                supabase.from('reservations').select('id, numero_reference, client_id').order('numero_reference', { ascending: false })
            ]);

            if (paieRes.data) setPaiements(paieRes.data as Paiement[]);
            if (finRes.data) setFinancesAlerts(finRes.data as any);
            if (cliRes.data) setClients(cliRes.data);
            if (resRes.data) setReservations(resRes.data);
        } catch (err: any) {
            console.error("Erreur de chargement", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSavePaiement = async () => {
        if (!clientId || !reservationId || !montant || !modePaiement || !datePaiement) {
            setNotification({ message: 'Veuillez remplir les champs obligatoires.', type: 'error' });
            setTimeout(() => setNotification(null), 3000);
            return;
        }

        setIsSubmitting(true);
        const currentUserStr = localStorage.getItem('currentUser');
        const currentUserName = currentUserStr ? JSON.parse(currentUserStr).name : 'Système';

        // Get the finance document for this reservation to check reste_a_payer
        const financeAlert = financesAlerts.find(f => f.reservation_id === reservationId);
        const montantSaisi = parseFloat(montant);

        if (financeAlert && montantSaisi > financeAlert.reste_a_payer) {
            setNotification({ message: `Le montant saisi (${montantSaisi}) dépasse le reste à payer de la facture (${financeAlert.reste_a_payer}).`, type: 'error' });
            setTimeout(() => setNotification(null), 5000);
            setIsSubmitting(false);
            return;
        }

        const numeroRecu = `REC-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

        const payload = {
            numero_recu: numeroRecu,
            date_paiement: datePaiement,
            client_id: clientId,
            reservation_id: reservationId,
            montant: montantSaisi,
            mode_paiement: modePaiement,
            reference_transaction: referenceTransaction,
            created_by_name: currentUserName,
            updated_by_name: currentUserName
        };

        const { data, error } = await supabase.from('paiements').insert([payload]).select('*, clients(nom), reservations(numero_reference)');

        if (error) {
            setNotification({ message: "Erreur lors de l'enregistrement : " + error.message, type: 'error' });
            setTimeout(() => setNotification(null), 5000);
        } else if (data) {
            setPaiements([data[0] as Paiement, ...paiements]);
            
            // Auto deduct reste_a_payer in finances
            if (financeAlert) {
                const nouveauReste = financeAlert.reste_a_payer - montantSaisi;
                const nouvelAcompte = Number(financeAlert.acompte || 0) + montantSaisi;
                let updatePayload: any = { 
                    reste_a_payer: nouveauReste,
                    acompte: nouvelAcompte
                };
                if (nouveauReste <= 0) {
                    updatePayload.statut = 'Soldée';
                } else if (nouvelAcompte > 0) {
                    updatePayload.statut = 'Acompte payé';
                }
                
                await supabase.from('finances').update(updatePayload).eq('id', financeAlert.id);
                
                // Si la facture est soldée ou l'acompte payé, on met à jour le statut de la réservation aussi (Optionnel mais recommandé)
                if (updatePayload.statut === 'Soldée' || updatePayload.statut === 'Acompte payé') {
                    await supabase.from('reservations').update({ statut: 'Confirmée' }).eq('id', financeAlert.reservation_id);
                }

                setFinancesAlerts(financesAlerts.map(f => f.id === financeAlert.id ? { ...f, reste_a_payer: nouveauReste, acompte: nouvelAcompte, statut: updatePayload.statut || f.statut } : f).filter(f => f.reste_a_payer > 0));
            }

            setIsNewPaiementModalOpen(false);
            setMontant('');
            setReferenceTransaction('');
            setNotification({ message: "Paiement enregistré avec succès !", type: 'success' });
            setTimeout(() => setNotification(null), 3000);
        }
        setIsSubmitting(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
    };

    const formatDateTime = (dtStr: string) => {
        if (!dtStr) return '';
        const dt = new Date(dtStr);
        return dt.toLocaleDateString('fr-FR') + ' ' + dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const totalJournalier = paiements.filter(p => new Date(p.date_paiement).toDateString() === new Date().toDateString()).reduce((sum, p) => sum + Number(p.montant), 0);
    const totalImpayes = financesAlerts.reduce((sum, f) => sum + Number(f.reste_a_payer), 0);

    const exportToCSV = () => {
        const headers = ["N° Reçu", "Date", "Client", "Réservation", "Montant (FCFA)", "Mode de paiement", "Réf Transaction", "Encaissé par"];
        const rows = paiements.map(p => [
            p.numero_recu,
            new Date(p.date_paiement).toLocaleDateString('fr-FR'),
            p.clients?.nom || '',
            p.reservations?.numero_reference || '',
            p.montant,
            p.mode_paiement,
            p.reference_transaction || '',
            p.created_by_name || ''
        ]);

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(';')].concat(rows.map(r => r.join(';'))).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `encaissements_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex h-screen overflow-hidden text-gray-800 bg-slate-50 font-sans">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative bg-slate-50">
                <NotificationModal notification={notification} onClose={() => setNotification(null)} />
                <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-20">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center space-x-3">
                            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-500 hover:text-green-600 transition">
                                <i className="fa-solid fa-bars text-xl"></i>
                            </button>
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                <i className="fa-solid fa-wallet text-green-600 mr-3"></i> Paiements & Encaissements
                            </h2>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button onClick={exportToCSV} className="text-gray-600 hover:text-green-700 font-medium text-sm border border-gray-200 bg-white px-4 py-2 rounded-lg shadow-sm transition">
                                <i className="fa-solid fa-file-csv mr-2"></i> Exporter CSV
                            </button>
                            <button onClick={() => {
                                setDatePaiement(new Date().toISOString().slice(0, 16));
                                setIsNewPaiementModalOpen(true);
                            }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition font-medium text-sm flex items-center">
                                <i className="fa-solid fa-plus mr-2"></i> Nouvel Encaissement
                            </button>
                        </div>
                    </div>
                </header>

                <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
                    {/* Dashboard Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Encaissements du jour</p>
                                <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(totalJournalier)}</h3>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xl">
                                <i className="fa-solid fa-calendar-day"></i>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Total Impayés (Restes à payer)</p>
                                <h3 className="text-2xl font-bold text-red-600">{formatCurrency(totalImpayes)}</h3>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-xl">
                                <i className="fa-solid fa-triangle-exclamation"></i>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Factures non soldées</p>
                                <h3 className="text-2xl font-bold text-orange-600">{financesAlerts.length} factures</h3>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xl">
                                <i className="fa-solid fa-file-invoice"></i>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Table des encaissements */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-800">Registre des Paiements</h3>
                            </div>
                            <div className="overflow-x-auto flex-1">
                                <table className="w-full text-left border-collapse whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                            <th className="px-4 py-3 font-semibold">Date & Reçu</th>
                                            <th className="px-4 py-3 font-semibold">Client & Réservation</th>
                                            <th className="px-4 py-3 font-semibold text-right">Montant</th>
                                            <th className="px-4 py-3 font-semibold">Mode</th>
                                            <th className="px-4 py-3 font-semibold">Encaissé par</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {isLoading ? (
                                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Chargement...</td></tr>
                                        ) : paiements.length === 0 ? (
                                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Aucun encaissement trouvé.</td></tr>
                                        ) : paiements.map((p) => (
                                            <tr key={p.id} className="hover:bg-gray-50 transition">
                                                <td className="px-4 py-3">
                                                    <p className="font-semibold text-gray-800">{new Date(p.date_paiement).toLocaleDateString('fr-FR')}</p>
                                                    <p className="text-xs text-gray-500">{p.numero_recu}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-gray-800">{p.clients?.nom}</p>
                                                    <p className="text-xs text-blue-600 font-medium">{p.reservations?.numero_reference}</p>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="font-bold text-gray-800 bg-green-50 text-green-700 px-2 py-1 rounded-lg border border-green-100">{formatCurrency(p.montant)}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                                                        p.mode_paiement === 'Espèce' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                        p.mode_paiement === 'Mobile Money' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                        p.mode_paiement === 'Virement' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                        'bg-gray-100 text-gray-700 border-gray-200'
                                                    }`}>{p.mode_paiement}</span>
                                                    {p.reference_transaction && <p className="text-xs text-gray-500 mt-1 uppercase">Réf: {p.reference_transaction}</p>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-gray-600 font-medium">{p.created_by_name}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Sidebar d'alertes */}
                        <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden flex flex-col">
                            <div className="px-6 py-4 border-b border-red-100 flex justify-between items-center bg-red-50">
                                <h3 className="text-md font-bold text-red-700"><i className="fa-solid fa-bell mr-2"></i> Alertes Impayés</h3>
                            </div>
                            <div className="p-4 overflow-y-auto space-y-3">
                                {financesAlerts.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">Aucune facture impayée.</p>
                                ) : (
                                    financesAlerts.map(f => (
                                        <div key={f.id} className="bg-white border border-red-100 p-3 rounded-lg shadow-sm hover:shadow-md transition">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-bold text-gray-800 text-sm">{f.reservations?.clients?.nom}</p>
                                                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{f.numero_document}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-2">Réf: {f.reservations?.numero_reference}</p>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-xs text-gray-500">Reste à payer</p>
                                                    <p className="font-bold text-red-600 text-lg">{formatCurrency(f.reste_a_payer)}</p>
                                                </div>
                                                <button onClick={() => {
                                                    setClientId(f.reservations?.clients ? Object.values(clients).find(c => c.nom === f.reservations!.clients.nom)?.id || '' : '');
                                                    setReservationId(f.reservation_id);
                                                    setMontant(f.reste_a_payer.toString());
                                                    setDatePaiement(new Date().toISOString().slice(0, 16));
                                                    setIsNewPaiementModalOpen(true);
                                                }} className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded transition">
                                                    Encaisser
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal Nouvel Encaissement */}
            {isNewPaiementModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsNewPaiementModalOpen(false)}></div>
                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-gray-800"><i className="fa-solid fa-plus-circle text-green-600 mr-2"></i> Enregistrer un paiement</h3>
                            <button onClick={() => !isSubmitting && setIsNewPaiementModalOpen(false)} className="text-gray-400 hover:text-red-500 transition text-2xl"><i className="fa-solid fa-times"></i></button>
                        </div>
                        
                        <div className="p-6 bg-white space-y-4 flex-1 overflow-y-auto">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Date et Heure du paiement *</label>
                                <input type="datetime-local" value={datePaiement} onChange={e => setDatePaiement(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Client *</label>
                                <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                                    <option value="">-- Sélectionner un client --</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Réservation liée *</label>
                                <select value={reservationId} onChange={e => setReservationId(e.target.value)} disabled={!clientId} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-100 disabled:text-gray-400">
                                    <option value="">-- Sélectionner la réservation --</option>
                                    {reservations.filter(r => r.client_id === clientId).map(r => (
                                        <option key={r.id} value={r.id}>{r.numero_reference}</option>
                                    ))}
                                </select>
                                {reservationId && financesAlerts.find(f => f.reservation_id === reservationId) && (
                                    <p className="mt-1 text-xs text-orange-600 font-medium">
                                        <i className="fa-solid fa-info-circle mr-1"></i>
                                        Reste à payer sur cette réservation : {formatCurrency(financesAlerts.find(f => f.reservation_id === reservationId)!.reste_a_payer)}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Montant Encaissé (FCFA) *</label>
                                    <input type="number" min="0" value={montant} onChange={e => setMontant(e.target.value)} placeholder="Ex: 50000" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-green-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Mode de paiement *</label>
                                    <select value={modePaiement} onChange={e => setModePaiement(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                                        <option value="Espèce">Espèce</option>
                                        <option value="Mobile Money">Mobile Money (Wave, Orange, MTN...)</option>
                                        <option value="Virement">Virement bancaire</option>
                                        <option value="Carte Bancaire">Carte Bancaire</option>
                                        <option value="Chèque">Chèque</option>
                                    </select>
                                </div>
                            </div>

                            {modePaiement !== 'Espèce' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Référence Transaction / N° Chèque</label>
                                    <input type="text" value={referenceTransaction} onChange={e => setReferenceTransaction(e.target.value)} placeholder="Ex: CI-29384729" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                                </div>
                            )}
                        </div>
                        
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 rounded-b-2xl">
                            <button onClick={() => setIsNewPaiementModalOpen(false)} disabled={isSubmitting} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition">Annuler</button>
                            <button onClick={handleSavePaiement} disabled={isSubmitting} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition shadow-md disabled:opacity-50">
                                {isSubmitting ? 'Enregistrement...' : "Confirmer l'encaissement"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
