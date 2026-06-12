const fs = require('fs');
let content = fs.readFileSync('src/app/reservations/page.tsx', 'utf8');

// 1. Add `raw: r` in formatted data to keep original values for editing
content = content.replace(
    `soldeColor: 'text-red-500'`,
    `soldeColor: 'text-red-500',\n                raw: r`
);

// 2. Add states
const statesSearch = `    const [nbPersonnes, setNbPersonnes] = useState(1);`;
const newStates = `    const [nbPersonnes, setNbPersonnes] = useState(1);\n    \n    // Nouveaux états Édition et Statut\n    const [editingReservationId, setEditingReservationId] = useState<string | null>(null);\n    const [reservationStatus, setReservationStatus] = useState('brouillon');`;
content = content.replace(statesSearch, newStates);

// 3. Add handleEditReservation function
const handleActionSearch = `    const handleActionPlaceholder = (actionName: string) => {`;
const newFunction = `    const handleEditReservation = (res: any) => {
        setEditingReservationId(res.id);
        const r = res.raw;
        
        // Form states
        setClientId(r.client_id || '');
        setClientName(r.clients?.nom || '');
        setClientPhone(r.clients?.telephone || '');
        
        setDatePrestation(r.date_prestation || '');
        setHeureDebut(r.heure_debut ? r.heure_debut.substring(0, 5) : '');
        setNbPersonnes(r.nb_personnes || 1);
        
        setPackType(r.type_prestation || '');
        // Determine pack price from packType (basic logic based on what's in the select)
        if (r.type_prestation?.includes('Mariage')) setPackPrice(800000);
        else if (r.type_prestation?.includes('Anniversaire')) setPackPrice(600000);
        else if (r.type_prestation?.includes('Corporate')) setPackPrice(1000000);
        else setPackPrice(0);
        
        setReservationStatus(r.statut || 'brouillon');
        setOptionsList(r.options || {});
        // Calculate options price by summing values of checked options
        // For simplicity, let's just use totalMontant - packPrice
        setOptionsPrice((r.montant_total || 0) - (r.type_prestation?.includes('Mariage') ? 800000 : r.type_prestation?.includes('Anniversaire') ? 600000 : r.type_prestation?.includes('Corporate') ? 1000000 : 0));
        
        setIsReservationModalOpen(true);
    };

    const handleNewReservationClick = () => {
        setEditingReservationId(null);
        setClientName('');
        setClientId('');
        setClientPhone('');
        setDatePrestation('');
        setHeureDebut('');
        setNbPersonnes(1);
        setPackPrice(0);
        setReservationStatus('brouillon');
        setOptionsList({});
        setOptionsPrice(0);
        setIsReservationModalOpen(true);
    };

    const handleActionPlaceholder = (actionName: string) => {`;
content = content.replace(handleActionSearch, newFunction);

// 4. Update the "Nouvelle Réservation" button onClick
content = content.replace(
    `<button onClick={() => setIsReservationModalOpen(!isReservationModalOpen)} className="bg-blue-600`,
    `<button onClick={handleNewReservationClick} className="bg-blue-600`
);

// 5. Update the handleSaveReservation
const saveReservationSearch = `            const { error: resError } = await supabase
                .from('reservations')
                .insert([{
                    numero_reference: refNumber,
                    client_id: finalClientId,
                    date_prestation: datePrestation,
                    heure_debut: heureDebut,
                    heure_fin: heureDebut, // Simplification pour la maquette
                    type_prestation: packType || 'Standard',
                    nb_personnes: nbPersonnes,
                    montant_total: totalMontant,
                    options: optionsList
                }]);`;

const saveReservationReplacement = `            let resError;
            if (editingReservationId) {
                const { error } = await supabase
                    .from('reservations')
                    .update({
                        client_id: finalClientId,
                        date_prestation: datePrestation,
                        heure_debut: heureDebut,
                        heure_fin: heureDebut,
                        type_prestation: packType || 'Standard',
                        nb_personnes: nbPersonnes,
                        montant_total: totalMontant,
                        statut: reservationStatus,
                        options: optionsList
                    })
                    .eq('numero_reference', editingReservationId);
                resError = error;
            } else {
                const { error } = await supabase
                    .from('reservations')
                    .insert([{
                        numero_reference: refNumber,
                        client_id: finalClientId,
                        date_prestation: datePrestation,
                        heure_debut: heureDebut,
                        heure_fin: heureDebut,
                        type_prestation: packType || 'Standard',
                        nb_personnes: nbPersonnes,
                        montant_total: totalMontant,
                        statut: reservationStatus,
                        options: optionsList
                    }]);
                resError = error;
            }`;
content = content.replace(saveReservationSearch, saveReservationReplacement);

// 6. Update notification message for save
content = content.replace(
    `setNotification({ message: 'Réservation enregistrée avec succès !', type: 'success' });`,
    `setNotification({ message: editingReservationId ? 'Réservation modifiée avec succès !' : 'Réservation enregistrée avec succès !', type: 'success' });`
);

// 7. Update Modal Title
content = content.replace(
    `<h3 className="text-lg font-bold text-gray-800">Créer une Réservation</h3>`,
    `<h3 className="text-lg font-bold text-gray-800">{editingReservationId ? "Modifier la Réservation" : "Créer une Réservation"}</h3>`
);

// 8. Add status field in modal (inside "Détails Prestation" area)
const packSelectSearch = `<div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pack Principal *</label>`;
const packSelectReplacement = `<div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Statut *</label>
                            <select value={reservationStatus} onChange={(e) => setReservationStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-gray-800">
                                <option value="Brouillon">Brouillon</option>
                                <option value="En attente d'acompte">En attente d'acompte</option>
                                <option value="Confirmée">Confirmée</option>
                                <option value="Terminée">Terminée</option>
                                <option value="Annulée">Annulée</option>
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pack Principal *</label>`;
content = content.replace(packSelectSearch, packSelectReplacement);

// 9. Update the packType Select to have value={packType} so it reflects state when editing
content = content.replace(
    `<select id="resPack" onChange={(e) => {`,
    `<select id="resPack" value={packType} onChange={(e) => {`
);
// We need to match packType with values. The select has options with text that is captured in packType. Let's fix that.
content = content.replace(
    `<option value="mariage" data-price="800000">Demande en mariage Premium (800 000 FCFA)</option>`,
    `<option value="Demande en mariage Premium (800 000 FCFA)" data-price="800000">Demande en mariage Premium (800 000 FCFA)</option>`
);
content = content.replace(
    `<option value="anniversaire" data-price="600000">Anniversaire Premium (600 000 FCFA)</option>`,
    `<option value="Anniversaire Premium (600 000 FCFA)" data-price="600000">Anniversaire Premium (600 000 FCFA)</option>`
);
content = content.replace(
    `<option value="corporate" data-price="1000000">Corporate Premium (1 000 000 FCFA)</option>`,
    `<option value="Corporate Premium (1 000 000 FCFA)" data-price="1000000">Corporate Premium (1 000 000 FCFA)</option>`
);

// 10. Change the "Modifier" button onClick in the table
content = content.replace(
    `<button onClick={() => handleActionPlaceholder("Modifier")} className="text-gray-400 hover:text-gray-600 transition" title="Modifier"><i className="fa-solid fa-pen"></i></button>`,
    `<button onClick={() => handleEditReservation(res)} className="text-gray-400 hover:text-blue-600 transition" title="Modifier"><i className="fa-solid fa-pen"></i></button>`
);

fs.writeFileSync('src/app/reservations/page.tsx', content);
console.log('Modifications effectuées !');
